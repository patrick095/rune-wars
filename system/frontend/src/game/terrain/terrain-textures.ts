import Phaser from 'phaser';
import { CELL_SIZE, TerrainMaterial } from '../../app/shared/game-core/terrain-types';

const MAP_COLORS: Record<string, { destructible: number; indestructible: number; bg: number }> = {
  plains:       { destructible: 0x6b8e3a, indestructible: 0x4a5e28, bg: 0x87ceeb },
  castle:       { destructible: 0x8a7a6a, indestructible: 0x4a4035, bg: 0x1a1a3a },
  deep_mines:   { destructible: 0x7a6a55, indestructible: 0x3a3028, bg: 0x0d0d1a },
  arcane_ruins: { destructible: 0x6a4a8a, indestructible: 0x3a2050, bg: 0x1a0a2a },
  runic_forest: { destructible: 0x4a7a3a, indestructible: 0x2a4a1a, bg: 0x0a1a0a },
  dungeon:      { destructible: 0x5a5a6a, indestructible: 0x2a2a3a, bg: 0x080808 },
};

const CONSTRUCTED_COLOR = 0x44aaff;
const CONSTRUCTED_GLOW  = 0x2266aa;

let _initialized = false;

export function initTerrainTextures(scene: Phaser.Scene): void {
  if (_initialized) return;
  _initialized = true;

  const size = CELL_SIZE;

  for (const [mapName, colors] of Object.entries(MAP_COLORS)) {
    generateTile(scene, `tile_${mapName}_destructible`, size, colors.destructible, false);
    generateTile(scene, `tile_${mapName}_indestructible`, size, colors.indestructible, true);
  }

  generateConstructedTile(scene, 'tile_constructed', size);
}

function generateTile(
  scene: Phaser.Scene,
  key: string,
  size: number,
  fillColor: number,
  hard: boolean
): void {
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(fillColor, 1);
  g.fillRect(0, 0, size, size);

  if (!hard) {
    const darker = Math.max(0, fillColor - 0x0a0a0a);
    g.fillStyle(darker, 0.4);
    g.fillRect(2, 2, size - 4, 2);
    g.fillRect(2, size - 4, size - 4, 2);
  } else {
    const border = Math.max(0, fillColor - 0x0a0a0a);
    g.lineStyle(1, border, 0.5);
    g.strokeRect(1, 1, size - 2, size - 2);
    g.lineBetween(0, size / 2, size, size / 2);
  }

  const borderColor = Math.max(0, fillColor - 0x111111);
  g.lineStyle(1, borderColor, 0.6);
  g.strokeRect(0, 0, size, size);

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

export function getBackgroundColor(mapName: string): number {
  const palette = mapName.startsWith('dungeon') ? 'dungeon' : mapName;
  return MAP_COLORS[palette]?.bg ?? 0x1a1a2e;
}
