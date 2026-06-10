import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';

export interface SpawnPoint {
  x: number;
  y: number;
}

export function selectSpawns(spawnPoints: SpawnPoint[], count: number, engine?: TerrainEngine): SpawnPoint[] {
  let candidates = spawnPoints;

  if (engine) {
    candidates = spawnPoints.filter(spawn => {
      const floor = engine.getFloorBelow(spawn.x, spawn.y);
      if (floor === null) {
        console.warn(`[Spawn] Ponto (${spawn.x}, ${spawn.y}) descartado: sem chão próximo`);
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
  _cellSize: number,
  charHeight: number
): { x: number; y: number } {
  return {
    x: spawn.x,
    y: spawn.y - charHeight / 2,
  };
}

export function moveSpeed(agility: number): number {
  return 40 + (420 - 40) * (agility / 500);
}

export function moveBudget(agility: number): number {
  return 120 + (2100 - 120) * (agility / 500);
}
