import { TerrainEngine } from './terrain-engine';
import { TerrainMaterial } from './terrain-types';

// ─── Result types ─────────────────────────────────────────────────────────────

export interface TerrainSupportInfo {
  /** Fraction of probe columns below the character that have solid ground (0–1) */
  supportRatio: number;
  /** True when at least one column has no floor below (cliff edge) */
  nearEdge: boolean;
  /** y of the floor directly below character centre, or null if off-map */
  floorY: number | null;
}

export interface TerrainFallRisk {
  /** The excavation would collapse enough support for the target to fall */
  willFall: boolean;
  /** Approximate vertical drop distance in pixels */
  estimatedFallHeight: number;
  /**
   * Estimated damage from the fall.
   * Off-map falls are reported as the target's maxHp (instant death).
   */
  estimatedFallDamage: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHAR_HALF_H = 30;            // half character height in pixels
const SUPPORT_WIDTH = 20;          // horizontal probe range each side of centre
const SUPPORT_PROBES = 5;          // number of columns to probe
const SUPPORT_DEPTH = 8;           // pixels to scan below feet for immediate floor
const FALL_DMG_PER_PX = 0.30;     // damage per pixel of estimated fall
const SELF_HIT_RADIUS_MULT = 1.5; // multiplier on weapon impactRadius for self-hit check

// ─── AiTerrainAnalyzer ────────────────────────────────────────────────────────

export class AiTerrainAnalyzer {
  /**
   * Returns how well-supported a character is.
   * A low supportRatio (< 0.4) or nearEdge=true flags a thin platform—
   * ideal excavation target.
   */
  analyzeSupport(terrain: TerrainEngine, charX: number, charY: number): TerrainSupportInfo {
    const feetY = charY + CHAR_HALF_H;
    const step = (SUPPORT_WIDTH * 2) / (SUPPORT_PROBES - 1);
    let solidColumns = 0;
    let nearEdge = false;

    for (let i = 0; i < SUPPORT_PROBES; i++) {
      const px = charX - SUPPORT_WIDTH + i * step;
      let foundFloor = false;
      for (let dy = 0; dy <= SUPPORT_DEPTH; dy++) {
        const mat = terrain.getMaterialAt(px, feetY + dy);
        if (mat !== TerrainMaterial.EMPTY) {
          foundFloor = true;
          break;
        }
      }
      if (foundFloor) {
        solidColumns++;
      } else {
        nearEdge = true;
      }
    }

    return {
      supportRatio: solidColumns / SUPPORT_PROBES,
      nearEdge,
      floorY: terrain.getFloorBelow(charX, feetY),
    };
  }

  /**
   * Estimates whether an explosion at (impactX, impactY) with the given radius
   * would collapse enough terrain to cause the target to fall.
   *
   * Uses a lightweight pixel-scan instead of a full bitmap clone to keep
   * simulation cost O(excavRadius) rather than O(worldWidth × worldHeight).
   */
  estimateFallRisk(
    terrain: TerrainEngine,
    impactX: number,
    impactY: number,
    excavRadius: number,
    targetX: number,
    targetY: number,
    targetMaxHp: number,
  ): TerrainFallRisk {
    const feetY = targetY + CHAR_HALF_H;

    // Scan pixels directly below the target's feet to measure current support
    // and determine how many of those pixels fall within the excavation radius.
    let supportTotal = 0;
    let supportDestroyed = 0;
    const scanW = SUPPORT_WIDTH;
    const scanDepth = Math.max(excavRadius, 40);
    const r2 = excavRadius * excavRadius;

    for (let dx = -scanW; dx <= scanW; dx++) {
      const px = Math.round(targetX + dx);
      for (let dy = 0; dy <= scanDepth; dy++) {
        const py = Math.round(feetY + dy);
        const mat = terrain.getMaterialAt(px, py);
        if (mat === TerrainMaterial.DESTRUCTIBLE || mat === TerrainMaterial.CONSTRUCTED) {
          supportTotal++;
          const ddx = px - impactX;
          const ddy = py - impactY;
          if (ddx * ddx + ddy * ddy <= r2) {
            supportDestroyed++;
          }
        }
      }
    }

    // No support to destroy → no fall risk from excavation
    if (supportTotal === 0) {
      return { willFall: false, estimatedFallHeight: 0, estimatedFallDamage: 0 };
    }

    const destructionRatio = supportDestroyed / supportTotal;

    // If ≥ 70% of immediate support is excavated, treat as a fall
    if (destructionRatio < 0.70) {
      return { willFall: false, estimatedFallHeight: 0, estimatedFallDamage: 0 };
    }

    // Estimate where the target would land after the floor collapses
    // by scanning below the excavation boundary for the next solid surface.
    const searchStartY = feetY + excavRadius + 1;
    const nextFloorY = terrain.getFloorBelow(targetX, searchStartY);

    if (nextFloorY === null) {
      // Falls off-map → instant death
      return {
        willFall: true,
        estimatedFallHeight: terrain.worldHeight,
        estimatedFallDamage: targetMaxHp,
      };
    }

    const fallHeight = Math.max(0, nextFloorY - feetY);
    const estimatedFallDamage = Math.min(targetMaxHp, Math.round(fallHeight * FALL_DMG_PER_PX));

    return {
      willFall: fallHeight > 30,
      estimatedFallHeight: fallHeight,
      estimatedFallDamage,
    };
  }

  /**
   * Crude line-of-sight cover value: fraction of interpolated pixels between
   * the two characters that contain non-empty terrain (0 = open field, 1 = wall).
   */
  estimateCoverValue(
    terrain: TerrainEngine,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): number {
    const steps = 24;
    let blocked = 0;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const px = fromX + (toX - fromX) * t;
      const py = fromY + (toY - fromY) * t;
      if (terrain.getMaterialAt(px, py) !== TerrainMaterial.EMPTY) blocked++;
    }
    return blocked / steps;
  }

  /**
   * Estimates whether a shot aimed at (impactX, impactY) could hit the shooter
   * at (selfX, selfY) given the weapon's impact radius.
   */
  estimateSelfHitRisk(
    impactX: number,
    impactY: number,
    selfX: number,
    selfY: number,
    impactRadius: number,
  ): number {
    const dx = impactX - selfX;
    const dy = impactY - selfY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dangerZone = impactRadius * SELF_HIT_RADIUS_MULT;
    if (dist >= dangerZone) return 0;
    return 1 - dist / dangerZone;
  }

  /**
   * Convenience: returns true when the character is on a thin platform
   * (supportRatio < 0.4 or near an edge).
   */
  isOnThinPlatform(terrain: TerrainEngine, charX: number, charY: number): boolean {
    const info = this.analyzeSupport(terrain, charX, charY);
    return info.supportRatio < 0.40 || info.nearEdge;
  }
}
