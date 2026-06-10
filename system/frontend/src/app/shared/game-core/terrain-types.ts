export enum TerrainMaterial { EMPTY = 0, DESTRUCTIBLE = 1, INDESTRUCTIBLE = 2, CONSTRUCTED = 3 }

export interface ExplosionResult {
  center: { x: number; y: number };
  radius: number;
}

export const WORLD_WIDTH = 1672;
export const WORLD_HEIGHT = 941;

/** @deprecated alias mantido para compatibilidade; valor agora é 1 (bitmap pixel-based) */
export const CELL_SIZE = 1; // pixels por célula (deprecado)
