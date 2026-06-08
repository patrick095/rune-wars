export enum TerrainMaterial { EMPTY = 0, DESTRUCTIBLE = 1, INDESTRUCTIBLE = 2 }

export interface TerrainCell { x: number; y: number; material: TerrainMaterial; }

export interface ExplosionResult {
  cellsDestroyed: TerrainCell[];
  center: { x: number; y: number };
  radius: number;
}

export interface TerrainMaterialConfig {
  type: TerrainMaterial;
  color: number;
  destructible: boolean;
}

export const TERRAIN_MATERIAL_CONFIGS: Record<TerrainMaterial, TerrainMaterialConfig> = {
  [TerrainMaterial.EMPTY]:          { type: TerrainMaterial.EMPTY,          color: 0x000000, destructible: false },
  [TerrainMaterial.DESTRUCTIBLE]:   { type: TerrainMaterial.DESTRUCTIBLE,   color: 0x8B4513, destructible: true  },
  [TerrainMaterial.INDESTRUCTIBLE]: { type: TerrainMaterial.INDESTRUCTIBLE, color: 0x444444, destructible: false },
};

export const CELL_SIZE = 8; // pixels por célula
