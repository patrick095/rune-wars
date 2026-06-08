import Phaser from 'phaser';
import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import { TerrainMaterial, TerrainCell, CELL_SIZE } from '../../app/shared/game-core/terrain-types';

const COLOR_DESTRUCTIBLE      = 0x8B4513;
const COLOR_DESTRUCTIBLE_DARK = 0x5C2E0A;
const COLOR_INDESTRUCTIBLE      = 0x444444;
const COLOR_INDESTRUCTIBLE_LIGHT = 0x666666;
const COLOR_CONSTRUCTED       = 0x44AA44;
const COLOR_CONSTRUCTED_LIGHT = 0x66CC66;

export class TerrainRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private engine: TerrainEngine;

  constructor(scene: Phaser.Scene, engine: TerrainEngine) {
    this.engine = engine;
    this.graphics = scene.add.graphics().setDepth(0);
  }

  renderFull(): void {
    this.graphics.clear();
    const grid = this.engine.getGrid();

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const material = grid[row][col];
        if (material === TerrainMaterial.EMPTY) continue;
        this.drawCell(col, row, material);
      }
    }
  }

  updateCells(cells: TerrainCell[]): void {
    // After explosion, cells passed here are destroyed cells (now EMPTY in engine).
    // We need to re-render the affected region from the engine's current state.
    // Collect unique rows/cols bounding box and redraw fully for simplicity & correctness.
    if (cells.length === 0) return;

    // Clear the entire graphics and re-render from the engine state to stay in sync.
    this.renderFull();
  }

  private drawCell(col: number, row: number, material: TerrainMaterial): void {
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;

    if (material === TerrainMaterial.DESTRUCTIBLE) {
      // Main fill
      this.graphics.fillStyle(COLOR_DESTRUCTIBLE, 1);
      this.graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      // Darker border (1px inset)
      this.graphics.fillStyle(COLOR_DESTRUCTIBLE_DARK, 1);
      this.graphics.fillRect(x, y, CELL_SIZE, 1);         // top
      this.graphics.fillRect(x, y, 1, CELL_SIZE);         // left
      this.graphics.fillRect(x, y + CELL_SIZE - 1, CELL_SIZE, 1); // bottom
      this.graphics.fillRect(x + CELL_SIZE - 1, y, 1, CELL_SIZE); // right
    } else if (material === TerrainMaterial.INDESTRUCTIBLE) {
      // Main fill
      this.graphics.fillStyle(COLOR_INDESTRUCTIBLE, 1);
      this.graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      // Lighter inner highlight (texture feel)
      this.graphics.fillStyle(COLOR_INDESTRUCTIBLE_LIGHT, 1);
      this.graphics.fillRect(x + 2, y + 1, CELL_SIZE - 4, 2);
    } else if (material === TerrainMaterial.CONSTRUCTED) {
      // Main fill (runic green)
      this.graphics.fillStyle(COLOR_CONSTRUCTED, 1);
      this.graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      // Brighter inner highlight (runic glow effect)
      this.graphics.fillStyle(COLOR_CONSTRUCTED_LIGHT, 1);
      this.graphics.fillRect(x + 2, y + 1, CELL_SIZE - 4, 2);
    }
  }
}
