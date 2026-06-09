import Phaser from 'phaser';
import { TerrainEngine, GRID_COLS, GRID_ROWS } from '../../app/shared/game-core/terrain-engine';
import { CELL_SIZE, TerrainCell, TerrainMaterial } from '../../app/shared/game-core/terrain-types';
import { initTerrainTextures, getTileKey, getBackgroundColor } from './terrain-textures';

export class TerrainRenderer {
  private rt!: Phaser.GameObjects.RenderTexture;
  private bg!: Phaser.GameObjects.Rectangle;
  private mapName = 'plains';

  constructor(
    private scene: Phaser.Scene,
    private engine: TerrainEngine
  ) {
    initTerrainTextures(scene);

    const worldW = GRID_COLS * CELL_SIZE;
    const worldH = GRID_ROWS * CELL_SIZE;

    this.bg = scene.add.rectangle(
      worldW / 2, worldH / 2, worldW, worldH,
      getBackgroundColor(this.mapName)
    ).setDepth(0);

    this.rt = scene.add.renderTexture(0, 0, worldW, worldH).setDepth(2).setOrigin(0, 0);
  }

  setMapName(name: string): void {
    this.mapName = name;
    this.bg.setFillStyle(getBackgroundColor(name));
  }

  renderFull(): void {
    this.rt.clear();
    const grid = this.engine.getGrid();

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const mat = grid[row][col];
        if (mat === TerrainMaterial.EMPTY) continue;

        const tileKey = getTileKey(mat, this.mapName);
        const px = col * CELL_SIZE;
        const py = row * CELL_SIZE;
        this.rt.drawFrame(tileKey, 0, px, py);
      }
    }
  }

  updateCells(destroyed: TerrainCell[]): void {
    if (destroyed.length === 0) return;
    // Re-render all from engine state (most reliable erase method)
    this.renderFull();
  }

  destroy(): void {
    this.rt?.destroy();
    this.bg?.destroy();
  }
}
