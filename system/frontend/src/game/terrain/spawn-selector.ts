import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import { CELL_SIZE } from '../../app/shared/game-core/terrain-types';

export interface SpawnPoint {
  col: number;
  row: number;
}

export function selectSpawns(spawnPoints: SpawnPoint[], count: number, engine?: TerrainEngine): SpawnPoint[] {
  let candidates = spawnPoints;

  if (engine) {
    candidates = spawnPoints.filter(spawn => {
      const worldX = (spawn.col + 0.5) * CELL_SIZE;
      const worldY = spawn.row * CELL_SIZE + 3 * CELL_SIZE;
      const floor = engine.getFloorBelow(worldX, worldY);
      if (floor === null) {
        console.warn(`[Spawn] Ponto (${spawn.col}, ${spawn.row}) descartado: sem chão próximo`);
        return false;
      }
      return true;
    });
  }

  if (candidates.length === 0) {
    return [];
  }

  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function spawnToWorld(
  spawn: SpawnPoint,
  cellSize: number,
  charHeight: number
): { x: number; y: number } {
  return {
    x: (spawn.col + 0.5) * cellSize,
    y: spawn.row * cellSize - charHeight / 2,
  };
}

export function moveSpeed(agility: number): number {
  return 40 + (420 - 40) * (agility / 500);
}

export function moveBudget(agility: number): number {
  return 120 + (2100 - 120) * (agility / 500);
}
