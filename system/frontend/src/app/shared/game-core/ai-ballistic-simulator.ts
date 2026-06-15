import { ProjectilePhysics } from './projectile-physics';
import { ProjectileConfig } from './projectile-config';
import { WeaponDefinition } from './weapon-definition';
import { WindState } from './wind-system';
import { TerrainEngine } from './terrain-engine';
import { TerrainMaterial } from './terrain-types';
import { DamageCalculator } from './damage-calculator';
import { BallisticHit } from './ai-battle-types';
import { AiTerrainAnalyzer } from './ai-terrain-analyzer';

const damageCalc = new DamageCalculator();
const terrainAnalyzer = new AiTerrainAnalyzer();

// Max path length — keep short for fast simulation (real render uses 1200)
const SIM_MAX_POINTS = 600;

// Pixels around target centre considered a "definite hit"
const DIRECT_HIT_RADIUS = 8;

/**
 * Pure ballistic simulator for AI decision-making.
 * Uses the same ProjectilePhysics engine as the real game but
 * never modifies game state.
 */
export class AiBallisticSimulator {
  private readonly physics = new ProjectilePhysics();

  /**
   * Simulate a single shot and return detailed hit information.
   *
   * @param startX  - shooter X position
   * @param startY  - shooter Y position
   * @param angle   - launch angle in degrees
   * @param force   - launch force (0–100)
   * @param weapon  - weapon being fired
   * @param wind    - current wind state
   * @param terrain - current terrain (read-only reference)
   * @param baseDamage   - effective base damage after modifier scaling
   * @param excavRadius  - effective excavation radius after modifier scaling
   * @param targetX - enemy X
   * @param targetY - enemy Y
   * @param selfX   - shooter X (for self-hit risk)
   * @param selfY   - shooter Y
   * @param targetShield - enemy shield damage reduction (0–1)
   * @param targetStrength - shooter strength (for damage scaling, +5% per point)
   * @param targetVulnerable - enemy has VULNERABILITY (+50% damage received)
   */
  simulate(params: {
    startX: number;
    startY: number;
    angle: number;
    force: number;
    weapon: WeaponDefinition;
    wind: WindState;
    terrain: TerrainEngine;
    baseDamage: number;
    excavRadius: number;
    targetX: number;
    targetY: number;
    selfX: number;
    selfY: number;
    targetShield: number;
    shooterStrength: number;
    targetVulnerable: boolean;
  }): BallisticHit {
    const {
      startX, startY, angle, force, weapon, wind, terrain,
      baseDamage, excavRadius, targetX, targetY, selfX, selfY,
      targetShield, shooterStrength, targetVulnerable,
    } = params;

    const config: ProjectileConfig = {
      angle,
      force,
      gravityScale: weapon.physicsProfile.gravityScale,
      windInfluence: weapon.physicsProfile.windInfluence,
      baseDamage,
    };

    const terrainCallback = (x: number, y: number): boolean =>
      terrain.getMaterialAt(x, y) !== TerrainMaterial.EMPTY;

    const hasBounces = (weapon.physicsProfile.bounces ?? 0) > 0 || weapon.detonationDelay;
    const path = this.physics.simulate(
      startX,
      startY,
      config,
      wind,
      weapon.physicsProfile,
      {
        terrainAt: hasBounces ? terrainCallback : undefined,
        maxPoints: SIM_MAX_POINTS,
      },
    );

    let impactX = startX;
    let impactY = startY;
    let minDistToEnemy = Number.POSITIVE_INFINITY;
    let minDistToSelf = Number.POSITIVE_INFINITY;

    for (const pt of path) {
      const dxE = pt.x - targetX;
      const dyE = pt.y - targetY;
      const distE = Math.sqrt(dxE * dxE + dyE * dyE);
      if (distE < minDistToEnemy) {
        minDistToEnemy = distE;
        impactX = pt.x;
        impactY = pt.y;
      }

      const dxS = pt.x - selfX;
      const dyS = pt.y - selfY;
      minDistToSelf = Math.min(minDistToSelf, Math.sqrt(dxS * dxS + dyS * dyS));

      const hitTerrain = terrain.getMaterialAt(pt.x, pt.y) !== TerrainMaterial.EMPTY;
      if (hitTerrain) break;
    }

    // Use impactRadius (visual blast radius) for damage scoring — it reflects the
    // full area of effect that damages characters (not just terrain excavation).
    // This is an intentional overestimate that leads to appropriately aggressive AI.
    const blastRadius = Math.max(weapon.impactRadius, excavRadius);

    // hitChance: 1.0 within blast radius, linear falloff to 0 at 3× blast radius
    const hitChance = minDistToEnemy <= blastRadius
      ? 1.0
      : Math.max(0, 1 - (minDistToEnemy - blastRadius) / (blastRadius * 2));

    // Raw damage at closest point — use blastRadius (impactRadius) for falloff
    let dmg = damageCalc.calculate(impactX, impactY, targetX, targetY, baseDamage, blastRadius);

    // Strength bonus
    if (shooterStrength > 0) dmg = Math.round(dmg * (1 + shooterStrength * 0.05));
    // Vulnerability multiplier
    if (targetVulnerable) dmg = Math.round(dmg * 1.5);
    // Shield reduction
    dmg = Math.round(dmg * (1 - targetShield));

    // Self-damage risk: whether the impact zone is dangerously close to the shooter
    const selfHitRisk = terrainAnalyzer.estimateSelfHitRisk(
      impactX, impactY, selfX, selfY, weapon.impactRadius,
    );

    const killsTarget = false;   // caller enriches this after knowing enemy hp
    return {
      impactX,
      impactY,
      minDistToEnemy,
      minDistToSelf,
      expectedDamage: dmg,
      hitChance,
      killsTarget,
    };
  }

  /**
   * Convenience: run the simulation and mark killsTarget given the enemy's
   * current HP.
   */
  simulateWithKillCheck(params: Parameters<AiBallisticSimulator['simulate']>[0] & {
    enemyCurrentHp: number;
  }): BallisticHit {
    const hit = this.simulate(params);
    return {
      ...hit,
      killsTarget: hit.expectedDamage >= params.enemyCurrentHp && hit.hitChance > 0,
    };
  }
}
