import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import { TerrainMaterial } from '../../app/shared/game-core/terrain-types';

export interface SpawnPoint {
  x: number;
  y: number;
}

const CHAR_HEIGHT = 60;
const CHAR_HALF_H = CHAR_HEIGHT / 2;

/**
 * Filters spawn candidates to those where:
 * 1. The spawn y position is in EMPTY terrain (not buried inside solid).
 * 2. There is solid ground within CHAR_HEIGHT pixels below the spawn y.
 *
 * Returns up to `count` valid candidates in a random order.
 */
export function selectSpawns(
  spawnPoints: SpawnPoint[],
  count: number,
  engine?: TerrainEngine,
): SpawnPoint[] {
  let candidates = spawnPoints;

  if (engine) {
    candidates = spawnPoints.filter(spawn => {
      // Reject spawns that are literally inside solid terrain
      const mat = engine.getMaterialAt(spawn.x, spawn.y);
      if (mat !== TerrainMaterial.EMPTY) {
        console.warn(`[Spawn] (${spawn.x}, ${spawn.y}) descartado: dentro do terreno`);
        return false;
      }

      // Reject spawns with no solid ground below (character would fall off-map)
      const floor = engine.getFloorBelow(spawn.x, spawn.y);
      if (floor === null) {
        console.warn(`[Spawn] (${spawn.x}, ${spawn.y}) descartado: sem chão abaixo`);
        return false;
      }

      // Reject spawns where the floor is too far — indicates the spawn is floating
      // in a large void with no reachable platform (> 2× char height tolerance).
      if (floor - spawn.y > CHAR_HEIGHT * 2) {
        console.warn(`[Spawn] (${spawn.x}, ${spawn.y}) descartado: chão muito distante (${floor - spawn.y}px)`);
        return false;
      }

      return true;
    });
  }

  if (candidates.length === 0) return [];

  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Converts a spawn candidate to a world position with the character centre
 * snapped to the terrain surface directly below it.
 *
 * This guarantees the character spawns ON the ground, never inside it.
 */
export function spawnToWorld(
  spawn: SpawnPoint,
  _cellSize: number,
  charHeight: number,
  engine?: TerrainEngine,
): { x: number; y: number } {
  if (engine) {
    const floor = engine.getFloorBelow(spawn.x, spawn.y);
    if (floor !== null) {
      return { x: spawn.x, y: floor - charHeight / 2 };
    }
  }
  // Fallback: use the raw y with a half-height offset (original behaviour)
  return { x: spawn.x, y: spawn.y - charHeight / 2 };
}

export function moveSpeed(agility: number): number {
  return 40 + (420 - 40) * (agility / 500);
}

export function moveBudget(agility: number): number {
  return 120 + (2100 - 120) * (agility / 500);
}
