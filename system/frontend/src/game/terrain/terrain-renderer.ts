import Phaser from 'phaser';
import { TerrainEngine, GRID_COLS, GRID_ROWS } from '../../app/shared/game-core/terrain-engine';
import { CELL_SIZE, TerrainCell, TerrainMaterial } from '../../app/shared/game-core/terrain-types';
import { initTerrainTextures, getTileKey, getSurfaceTileKey, getBackgroundColor } from './terrain-textures';

const MAX_RENDER_TEXTURE_SIZE = 1024;
const TARGET_CHUNK_TEXTURE_SIZE = 256;

interface TerrainChunk {
  rt: Phaser.GameObjects.RenderTexture;
  colStart: number;
  rowStart: number;
  cols: number;
  rows: number;
}

interface WebGLRendererLike {
  gl?: WebGLRenderingContext | WebGL2RenderingContext;
}

export class TerrainRenderer {
  private chunks: TerrainChunk[] = [];
  private bg!: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  private readonly maxTextureSize: number;
  private colsPerChunk = 1;
  private rowsPerChunk = 1;

  constructor(
    private scene: Phaser.Scene,
    private engine: TerrainEngine,
    private mapName = 'plains'
  ) {
    initTerrainTextures(scene);
    this.maxTextureSize = getRendererMaxTextureSize(scene);

    const worldW = GRID_COLS * CELL_SIZE;
    const worldH = GRID_ROWS * CELL_SIZE;

    const bgKey = getBackgroundTextureKey(this.mapName);
    if (this.canUseTexture(bgKey)) {
      this.bg = scene.add.image(worldW / 2, worldH / 2, bgKey)
        .setDisplaySize(worldW, worldH)
        .setDepth(-1);
    } else {
      this.bg = scene.add.rectangle(
        worldW / 2, worldH / 2, worldW, worldH,
        getBackgroundColor(this.mapName)
      ).setDepth(0);
    }

    this.createChunks();
  }

  setMapName(name: string): void {
    this.mapName = name;
    const worldW = GRID_COLS * CELL_SIZE;
    const worldH = GRID_ROWS * CELL_SIZE;
    const bgKey = getBackgroundTextureKey(name);

    if (this.canUseTexture(bgKey)) {
      // Replace background with PNG image
      this.bg.destroy();
      this.bg = this.scene.add.image(worldW / 2, worldH / 2, bgKey)
        .setDisplaySize(worldW, worldH)
        .setDepth(-1);
    } else if (this.bg instanceof Phaser.GameObjects.Rectangle) {
      this.bg.setFillStyle(getBackgroundColor(name));
    } else {
      // bg is an image but no PNG for new map — swap to a rectangle
      this.bg.destroy();
      this.bg = this.scene.add.rectangle(
        worldW / 2, worldH / 2, worldW, worldH,
        getBackgroundColor(name)
      ).setDepth(0);
    }
  }

  renderFull(): void {
    for (const chunk of this.chunks) {
      this.renderChunk(chunk);
    }
  }

  updateCells(destroyed: TerrainCell[]): void {
    if (destroyed.length === 0) return;

    let minCol = GRID_COLS - 1;
    let maxCol = 0;
    let minRow = GRID_ROWS - 1;
    let maxRow = 0;

    for (const cell of destroyed) {
      minCol = Math.min(minCol, cell.x);
      maxCol = Math.max(maxCol, cell.x);
      minRow = Math.min(minRow, cell.y);
      maxRow = Math.max(maxRow, cell.y);
    }

    minCol = Math.max(0, minCol - 1);
    maxCol = Math.min(GRID_COLS - 1, maxCol + 1);
    minRow = Math.max(0, minRow - 1);
    maxRow = Math.min(GRID_ROWS - 1, maxRow + 1);

    const chunkColStart = Math.floor(minCol / this.colsPerChunk);
    const chunkColEnd = Math.floor(maxCol / this.colsPerChunk);
    const chunkRowStart = Math.floor(minRow / this.rowsPerChunk);
    const chunkRowEnd = Math.floor(maxRow / this.rowsPerChunk);
    const chunksPerRow = Math.ceil(GRID_COLS / this.colsPerChunk);

    const dirtyChunks = new Set<TerrainChunk>();
    for (let chunkRow = chunkRowStart; chunkRow <= chunkRowEnd; chunkRow++) {
      for (let chunkCol = chunkColStart; chunkCol <= chunkColEnd; chunkCol++) {
        const chunk = this.chunks[chunkRow * chunksPerRow + chunkCol];
        if (chunk) dirtyChunks.add(chunk);
      }
    }

    for (const chunk of dirtyChunks) {
      this.renderChunk(chunk);
    }
  }

  destroy(): void {
    for (const chunk of this.chunks) chunk.rt.destroy();
    this.chunks = [];
    this.bg?.destroy();
  }

  private createChunks(): void {
    this.colsPerChunk = Math.max(1, Math.floor(this.safeRenderTextureSize() / CELL_SIZE));
    this.rowsPerChunk = Math.max(1, Math.floor(this.safeRenderTextureSize() / CELL_SIZE));

    for (let rowStart = 0; rowStart < GRID_ROWS; rowStart += this.rowsPerChunk) {
      for (let colStart = 0; colStart < GRID_COLS; colStart += this.colsPerChunk) {
        const cols = Math.min(this.colsPerChunk, GRID_COLS - colStart);
        const rows = Math.min(this.rowsPerChunk, GRID_ROWS - rowStart);
        const x = colStart * CELL_SIZE;
        const y = rowStart * CELL_SIZE;
        const width = cols * CELL_SIZE;
        const height = rows * CELL_SIZE;

        const rt = this.scene.add.renderTexture(x, y, width, height)
          .setDepth(2)
          .setOrigin(0, 0);

        this.chunks.push({ rt, colStart, rowStart, cols, rows });
      }
    }
  }

  private renderChunk(chunk: TerrainChunk): void {
    const grid = this.engine.getGrid();

    chunk.rt.clear();

    for (let row = chunk.rowStart; row < chunk.rowStart + chunk.rows; row++) {
      for (let col = chunk.colStart; col < chunk.colStart + chunk.cols; col++) {
        const mat = grid[row][col];
        if (mat === TerrainMaterial.EMPTY) continue;

        const tileKey = getTileKey(mat, this.mapName);
        const px = (col - chunk.colStart) * CELL_SIZE;
        const py = (row - chunk.rowStart) * CELL_SIZE;
        chunk.rt.drawFrame(tileKey, 0, px, py);

        const aboveMat = row > 0 ? grid[row - 1][col] : TerrainMaterial.EMPTY;
        const surfaceKey = aboveMat === TerrainMaterial.EMPTY ? getSurfaceTileKey(mat, this.mapName) : null;
        if (surfaceKey) {
          chunk.rt.drawFrame(surfaceKey, 0, px, py);
        }
      }
    }
  }

  private safeRenderTextureSize(): number {
    const bounded = Math.min(TARGET_CHUNK_TEXTURE_SIZE, MAX_RENDER_TEXTURE_SIZE, this.maxTextureSize);
    return Math.max(CELL_SIZE, Math.floor(bounded / CELL_SIZE) * CELL_SIZE);
  }

  private canUseTexture(key: string): boolean {
    if (!this.scene.textures.exists(key)) return false;

    const source = this.scene.textures.get(key).getSourceImage() as { width?: number; height?: number } | undefined;
    const width = source?.width ?? 0;
    const height = source?.height ?? 0;

    if (width <= 0 || height <= 0) return false;
    return width <= this.maxTextureSize && height <= this.maxTextureSize;
  }
}

function getRendererMaxTextureSize(scene: Phaser.Scene): number {
  const gl = (scene.renderer as unknown as WebGLRendererLike).gl;
  const detected = gl?.getParameter(gl.MAX_TEXTURE_SIZE);

  return typeof detected === 'number' && Number.isFinite(detected)
    ? detected
    : MAX_RENDER_TEXTURE_SIZE;
}

function getBackgroundTextureKey(mapName: string): string {
  return mapName.startsWith('dungeon')
    ? 'terrain_dungeon_bg'
    : `terrain_${mapName}_bg`;
}
