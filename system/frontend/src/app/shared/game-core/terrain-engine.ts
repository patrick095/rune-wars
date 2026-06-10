import {
    ExplosionResult,
    TerrainMaterial,
    WORLD_WIDTH,
    WORLD_HEIGHT,
} from "./terrain-types";

export interface MapMeta {
    name?: string;
    width?: number;
    height?: number;
    /** @deprecated use {x, y} pixel coords instead of col/row */
    cols?: number;
    /** @deprecated use {x, y} pixel coords instead of col/row */
    rows?: number;
    spawnPoints?: Array<{ x: number; y: number }>;
}

/** @deprecated Grid dimensions are no longer relevant in pixel-perfect bitmap mode */
export const GRID_COLS = WORLD_WIDTH;
/** @deprecated Grid dimensions are no longer relevant in pixel-perfect bitmap mode */
export const GRID_ROWS = WORLD_HEIGHT;

const MAX_CONSTRUCTED_PER_PLAYER = 20;

export class TerrainEngine {
    private bitmap: Uint8Array;
    private width: number;
    private height: number;
    private _constructedByPlayer = new Map<string, number>();

    /**
     * Legacy constructor: accepts a 2D number grid (number[][]) or creates an empty bitmap.
     * For new code, prefer TerrainEngine.fromImageData() or TerrainEngine.empty().
     */
    constructor(gridData?: number[][], width = WORLD_WIDTH, height = WORLD_HEIGHT) {
        this.width = width;
        this.height = height;
        this.bitmap = new Uint8Array(width * height);
        if (gridData) {
            this._loadGridData(gridData);
        }
    }

    private _loadGridData(gridData: number[][]): void {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const value = gridData[row]?.[col] ?? 0;
                this.bitmap[row * this.width + col] = value as TerrainMaterial;
            }
        }
    }

    /** Load a new map from a 2D grid (legacy support). Resets constructed counts. */
    loadMap(gridData: number[][]): void {
        this._constructedByPlayer.clear();
        this._loadGridData(gridData);
    }

    static fromImageData(data: ImageData): TerrainEngine {
        const w = data.width;
        const h = data.height;
        const engine = new TerrainEngine(undefined, w, h);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                const r = data.data[idx];
                const g = data.data[idx + 1];
                const b = data.data[idx + 2];
                const a = data.data[idx + 3];

                if (a < 128) {
                    engine.bitmap[y * w + x] = TerrainMaterial.EMPTY;
                } else if (r > 200 && g > 200 && b > 200) {
                    // Near white => indestructible
                    engine.bitmap[y * w + x] = TerrainMaterial.INDESTRUCTIBLE;
                } else {
                    // Any other opaque pixel => destructible solid
                    engine.bitmap[y * w + x] = TerrainMaterial.DESTRUCTIBLE;
                }
            }
        }

        return engine;
    }

    static empty(width: number, height: number): TerrainEngine {
        return new TerrainEngine(undefined, width, height);
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    getMaterialAt(wx: number, wy: number): TerrainMaterial {
        const px = Math.floor(wx);
        const py = Math.floor(wy);
        if (px < 0 || px >= this.width || py < 0 || py >= this.height) {
            return TerrainMaterial.EMPTY;
        }
        return this.bitmap[py * this.width + px] as TerrainMaterial;
    }

    setMaterialAt(wx: number, wy: number, material: TerrainMaterial): void {
        const px = Math.floor(wx);
        const py = Math.floor(wy);
        if (px < 0 || px >= this.width || py < 0 || py >= this.height) return;
        this.bitmap[py * this.width + px] = material;
    }

    explode(cx: number, cy: number, radius: number): ExplosionResult {
        const r2 = radius * radius;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx * dx + dy * dy <= r2) {
                    const px = Math.floor(cx + dx);
                    const py = Math.floor(cy + dy);
                    if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
                        const idx = py * this.width + px;
                        const mat = this.bitmap[idx] as TerrainMaterial;
                        // Only destroy destructible and constructed pixels
                        if (
                            mat === TerrainMaterial.DESTRUCTIBLE ||
                            mat === TerrainMaterial.CONSTRUCTED
                        ) {
                            this.bitmap[idx] = TerrainMaterial.EMPTY;
                        }
                    }
                }
            }
        }
        return { center: { x: cx, y: cy }, radius };
    }

    getFloorBelow(wx: number, wy: number): number | null {
        const px = Math.floor(wx);
        const startY = Math.floor(wy);

        if (px < 0 || px >= this.width) return null;

        for (let py = startY; py < this.height; py++) {
            if (this.bitmap[py * this.width + px] !== TerrainMaterial.EMPTY) {
                return py;
            }
        }

        return null;
    }

    drawRunicLine(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        playerId: string,
    ): number {
        let created = 0;
        const visited = new Set<number>();

        // Bresenham line algorithm in pixel space
        let px0 = Math.floor(x1);
        let py0 = Math.floor(y1);
        const px1 = Math.floor(x2);
        const py1 = Math.floor(y2);

        const dx = Math.abs(px1 - px0);
        const dy = Math.abs(py1 - py0);
        const sx = px0 < px1 ? 1 : -1;
        const sy = py0 < py1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            const key = py0 * this.width + px0;

            if (!visited.has(key)) {
                visited.add(key);

                if (px0 >= 0 && px0 < this.width && py0 >= 0 && py0 < this.height) {
                    if (this.bitmap[key] === TerrainMaterial.EMPTY) {
                        const current = this._constructedByPlayer.get(playerId) ?? 0;
                        if (current >= MAX_CONSTRUCTED_PER_PLAYER) break;

                        this.bitmap[key] = TerrainMaterial.CONSTRUCTED;
                        this._constructedByPlayer.set(playerId, current + 1);
                        created++;
                    }
                }
            }

            if (px0 === px1 && py0 === py1) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                px0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                py0 += sy;
            }
        }

        return created;
    }

    placeRunicBlock(wx: number, wy: number, playerId: string): boolean {
        const px = Math.floor(wx);
        const py = Math.floor(wy);

        if (px < 0 || px >= this.width || py < 0 || py >= this.height) {
            return false;
        }

        const idx = py * this.width + px;
        if (this.bitmap[idx] !== TerrainMaterial.EMPTY) return false;

        const current = this._constructedByPlayer.get(playerId) ?? 0;
        if (current >= MAX_CONSTRUCTED_PER_PLAYER) return false;

        this.bitmap[idx] = TerrainMaterial.CONSTRUCTED;
        this._constructedByPlayer.set(playerId, current + 1);
        return true;
    }

    getConstructedCount(playerId: string): number {
        return this._constructedByPlayer.get(playerId) ?? 0;
    }

    resetConstructedCount(playerId: string): void {
        this._constructedByPlayer.delete(playerId);
    }

    getSpawnPoints(meta?: MapMeta): Array<{ x: number; y: number }> {
        return meta?.spawnPoints ?? [];
    }

    get worldWidth(): number {
        return this.width;
    }

    get worldHeight(): number {
        return this.height;
    }

    getBitmap(): Uint8Array {
        return this.bitmap;
    }

    getBitmapDimensions(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }
}

// Re-export world dimensions for convenience
export { WORLD_WIDTH, WORLD_HEIGHT };
