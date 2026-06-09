import Phaser from 'phaser';
import { CELL_SIZE, TerrainMaterial } from '../../app/shared/game-core/terrain-types';

const MAP_COLORS: Record<string, { earth: number; earthDark: number; grass: number; indestructible: number; glow: number; bg: number }> = {
  plains:       { earth: 0x7a542f, earthDark: 0x50351f, grass: 0x79a83a, indestructible: 0x336a82, glow: 0x79d7ff, bg: 0x87ceeb },
  castle:       { earth: 0x857565, earthDark: 0x55483d, grass: 0x7e8d48, indestructible: 0x59616f, glow: 0xd4b56a, bg: 0x1a1a3a },
  deep_mines:   { earth: 0x765b42, earthDark: 0x453222, grass: 0x5f7550, indestructible: 0x2e5d7a, glow: 0x6fd7ff, bg: 0x0d0d1a },
  arcane_ruins: { earth: 0x69507d, earthDark: 0x3c284e, grass: 0x6f8d4e, indestructible: 0x563080, glow: 0xc084fc, bg: 0x1a0a2a },
  runic_forest: { earth: 0x5b4b2d, earthDark: 0x352b1c, grass: 0x4f9a3f, indestructible: 0x245b52, glow: 0x6ee7b7, bg: 0x0a1a0a },
  dungeon:      { earth: 0x565160, earthDark: 0x302d38, grass: 0x4e675b, indestructible: 0x26334f, glow: 0x93c5fd, bg: 0x080808 },
};

const CONSTRUCTED_COLOR = 0x44aaff;
const CONSTRUCTED_GLOW  = 0x2266aa;

export function initTerrainTextures(scene: Phaser.Scene): void {
  const size = CELL_SIZE;

  for (const [mapName, colors] of Object.entries(MAP_COLORS)) {
    aliasLoadedTile(scene, 'terrain_destructible', `tile_${mapName}_destructible`);
    aliasLoadedTile(scene, 'terrain_indestructible', `tile_${mapName}_indestructible`);

    // Skip programmatic generation if PNG texture was preloaded
    if (!scene.textures.exists(`tile_${mapName}_destructible`)) {
      generateDestructibleTile(scene, `tile_${mapName}_destructible`, size, colors);
    }
    if (!scene.textures.exists(`tile_${mapName}_indestructible`)) {
      generateIndestructibleTile(scene, `tile_${mapName}_indestructible`, size, colors);
    }
    if (!scene.textures.exists(`tile_${mapName}_surface`)) {
      generateSurfaceTile(scene, `tile_${mapName}_surface`, size, colors);
    }
    if (!scene.textures.exists(`tile_${mapName}_hard_surface`)) {
      generateHardSurfaceTile(scene, `tile_${mapName}_hard_surface`, size, colors);
    }
  }

  if (!scene.textures.exists('tile_constructed')) {
    generateConstructedTile(scene, 'tile_constructed', size);
  }
}

function aliasLoadedTile(scene: Phaser.Scene, sourceKey: string, targetKey: string): void {
  if (!scene.textures.exists(sourceKey) || scene.textures.exists(targetKey)) return;

  const source = scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement | undefined;
  if (!source) return;

  scene.textures.addImage(targetKey, source);
}

function generateDestructibleTile(
  scene: Phaser.Scene,
  key: string,
  size: number,
  colors: { earth: number; earthDark: number; grass: number; indestructible: number; glow: number; bg: number }
): void {
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(colors.earth, 1);
  g.fillRect(0, 0, size, size);

  g.fillStyle(colors.earthDark, 0.28);
  g.fillCircle(size * 0.25, size * 0.35, 1.5);
  g.fillCircle(size * 0.75, size * 0.68, 1.2);
  g.fillStyle(0xb58955, 0.18);
  g.fillCircle(size * 0.55, size * 0.42, 1.3);

  g.generateTexture(key, size, size);
  g.destroy();
}

function generateIndestructibleTile(
  scene: Phaser.Scene,
  key: string,
  size: number,
  colors: { earth: number; earthDark: number; grass: number; indestructible: number; glow: number; bg: number }
): void {
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(colors.indestructible, 1);
  g.fillRect(0, 0, size, size);
  g.fillStyle(colors.glow, 0.18);
  g.fillTriangle(1, size, size * 0.52, 1, size - 1, size);
  g.lineStyle(1, colors.glow, 0.28);
  g.lineBetween(size * 0.5, 1, size * 0.5, size - 1);
  g.generateTexture(key, size, size);
  g.destroy();
}

function generateSurfaceTile(
  scene: Phaser.Scene,
  key: string,
  size: number,
  colors: { earth: number; earthDark: number; grass: number; indestructible: number; glow: number; bg: number }
): void {
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(colors.grass, 1);
  g.fillRect(0, 0, size, 4);
  g.fillStyle(0xd9f99d, 0.24);
  g.fillRect(1, 1, size - 2, 1);
  g.fillStyle(colors.earthDark, 0.65);
  for (let x = 0; x < size; x += 3) {
    g.fillRect(x, 4, 1, 2 + ((x / 3) % 2));
  }
  g.generateTexture(key, size, size);
  g.destroy();
}

function generateHardSurfaceTile(
  scene: Phaser.Scene,
  key: string,
  size: number,
  colors: { earth: number; earthDark: number; grass: number; indestructible: number; glow: number; bg: number }
): void {
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(colors.indestructible, 1);
  g.fillRect(0, 2, size, size - 2);
  g.fillStyle(colors.glow, 0.5);
  g.fillTriangle(1, 2, size * 0.5, 0, size - 1, 2);
  g.lineStyle(1, colors.glow, 0.45);
  g.lineBetween(0, 3, size, 3);
  g.generateTexture(key, size, size);
  g.destroy();
}

function generateConstructedTile(scene: Phaser.Scene, key: string, size: number): void {
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(CONSTRUCTED_COLOR, 0.8);
  g.fillRect(0, 0, size, size);
  g.lineStyle(1, CONSTRUCTED_GLOW, 1);
  g.strokeRect(0, 0, size, size);
  g.lineStyle(1, 0x88ddff, 0.3);
  g.lineBetween(0, 0, size, size);
  g.lineBetween(size, 0, 0, size);
  g.generateTexture(key, size, size);
  g.destroy();
}

export function getTileKey(material: TerrainMaterial, mapName: string): string {
  if (material === TerrainMaterial.CONSTRUCTED) return 'tile_constructed';

  const palette = mapName.startsWith('dungeon') ? 'dungeon' : mapName;
  const suffix = material === TerrainMaterial.INDESTRUCTIBLE ? 'indestructible' : 'destructible';
  const key = `tile_${palette}_${suffix}`;

  return MAP_COLORS[palette] ? key : `tile_plains_${suffix}`;
}

export function getSurfaceTileKey(material: TerrainMaterial, mapName: string): string | null {
  if (material === TerrainMaterial.CONSTRUCTED) return null;
  if (material !== TerrainMaterial.DESTRUCTIBLE && material !== TerrainMaterial.INDESTRUCTIBLE) return null;

  const palette = mapName.startsWith('dungeon') ? 'dungeon' : mapName;
  const suffix = material === TerrainMaterial.INDESTRUCTIBLE ? 'hard_surface' : 'surface';
  return MAP_COLORS[palette] ? `tile_${palette}_${suffix}` : `tile_plains_${suffix}`;
}

export function getBackgroundColor(mapName: string): number {
  const palette = mapName.startsWith('dungeon') ? 'dungeon' : mapName;
  return MAP_COLORS[palette]?.bg ?? 0x1a1a2e;
}
