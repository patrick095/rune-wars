export interface SpawnPoint {
  col: number;
  row: number;
}

export function selectSpawns(spawnPoints: SpawnPoint[], count: number): SpawnPoint[] {
  const shuffled = [...spawnPoints];
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
