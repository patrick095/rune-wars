import {
    CELL_SIZE,
    ExplosionResult,
    TerrainCell,
    TerrainMaterial,
} from "./terrain-types";

export const GRID_COLS = 450;
export const GRID_ROWS = 160;

export interface MapMeta {
    name?: string;
    cols?: number;
    rows?: number;
    spawnPoints?: Array<{ col: number; row: number }>;
}

const MAX_CONSTRUCTED_PER_PLAYER = 20;

export class TerrainEngine {
    private grid: TerrainMaterial[][];
    private _constructedByPlayer = new Map<string, number>();

    constructor(gridData: number[][]) {
        this.grid = this.buildGrid(gridData);
    }

    private buildGrid(gridData: number[][]): TerrainMaterial[][] {
        const result: TerrainMaterial[][] = [];
        for (let row = 0; row < GRID_ROWS; row++) {
            result[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                const value = gridData[row]?.[col] ?? 0;
                result[row][col] = value as TerrainMaterial;
            }
        }
        return result;
    }

    loadMap(gridData: number[][]): void {
        this.grid = this.buildGrid(gridData);
    }

    private worldToCell(
        worldX: number,
        worldY: number,
    ): { col: number; row: number } {
        return {
            col: Math.floor(worldX / CELL_SIZE),
            row: Math.floor(worldY / CELL_SIZE),
        };
    }

    private isInBounds(col: number, row: number): boolean {
        return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
    }

    getMaterialAt(worldX: number, worldY: number): TerrainMaterial {
        const { col, row } = this.worldToCell(worldX, worldY);
        if (!this.isInBounds(col, row)) return TerrainMaterial.EMPTY;
        return this.grid[row][col];
    }

    setMaterialAt(
        worldX: number,
        worldY: number,
        material: TerrainMaterial,
    ): void {
        const { col, row } = this.worldToCell(worldX, worldY);
        if (!this.isInBounds(col, row)) return;
        this.grid[row][col] = material;
    }

    explode(
        centerWorldX: number,
        centerWorldY: number,
        radius: number,
    ): ExplosionResult {
        const cellsDestroyed: TerrainCell[] = [];

        const centerCol = centerWorldX / CELL_SIZE;
        const centerRow = centerWorldY / CELL_SIZE;

        const radiusInCells = radius / CELL_SIZE;

        const colMin = Math.max(0, Math.floor(centerCol - radiusInCells));
        const colMax = Math.min(
            GRID_COLS - 1,
            Math.ceil(centerCol + radiusInCells),
        );
        const rowMin = Math.max(0, Math.floor(centerRow - radiusInCells));
        const rowMax = Math.min(
            GRID_ROWS - 1,
            Math.ceil(centerRow + radiusInCells),
        );

        for (let row = rowMin; row <= rowMax; row++) {
            for (let col = colMin; col <= colMax; col++) {
                const cellMat = this.grid[row][col];
                if (
                    cellMat !== TerrainMaterial.DESTRUCTIBLE &&
                    cellMat !== TerrainMaterial.CONSTRUCTED
                )
                    continue;

                // Cell center in world coordinates
                const cellCenterX = (col + 0.5) * CELL_SIZE;
                const cellCenterY = (row + 0.5) * CELL_SIZE;

                const dx = cellCenterX - centerWorldX;
                const dy = cellCenterY - centerWorldY;

                if (Math.sqrt(dx * dx + dy * dy) <= radius) {
                    cellsDestroyed.push({ x: col, y: row, material: cellMat });
                    this.grid[row][col] = TerrainMaterial.EMPTY;
                }
            }
        }

        return {
            cellsDestroyed,
            center: { x: centerWorldX, y: centerWorldY },
            radius,
        };
    }

    getFloorBelow(worldX: number, worldY: number): number | null {
        const { col, row: startRow } = this.worldToCell(worldX, worldY);
        if (col < 0 || col >= GRID_COLS) return null;

        for (let row = startRow; row < GRID_ROWS; row++) {
            if (this.grid[row][col] !== TerrainMaterial.EMPTY) {
                // Return the world Y coordinate of the top of this cell
                return row * CELL_SIZE;
            }
        }

        return null;
    }

    drawRunicLine(
        path: Array<{ x: number; y: number }>,
        playerId: string,
    ): number {
        let created = 0;
        const visited = new Set<string>();

        for (const point of path) {
            const col = Math.floor(point.x / CELL_SIZE);
            const row = Math.floor(point.y / CELL_SIZE);
            const key = `${col},${row}`;

            if (visited.has(key)) continue;
            visited.add(key);

            if (!this.isInBounds(col, row)) continue;
            if (this.grid[row][col] !== TerrainMaterial.EMPTY) continue;

            const current = this._constructedByPlayer.get(playerId) ?? 0;
            if (current >= MAX_CONSTRUCTED_PER_PLAYER) break;

            this.grid[row][col] = TerrainMaterial.CONSTRUCTED;
            this._constructedByPlayer.set(playerId, current + 1);
            created++;
        }

        return created;
    }

    placeRunicBlock(
        cx: number,
        cy: number,
        size: number,
        playerId: string,
    ): number {
        const centerCol = Math.floor(cx / CELL_SIZE);
        const centerRow = Math.floor(cy / CELL_SIZE);
        const half = Math.floor(size / 2);
        let created = 0;

        for (let row = centerRow - half; row <= centerRow + half; row++) {
            for (let col = centerCol - half; col <= centerCol + half; col++) {
                if (!this.isInBounds(col, row)) continue;
                if (this.grid[row][col] !== TerrainMaterial.EMPTY) continue;

                const current = this._constructedByPlayer.get(playerId) ?? 0;
                if (current >= MAX_CONSTRUCTED_PER_PLAYER) return created;

                this.grid[row][col] = TerrainMaterial.CONSTRUCTED;
                this._constructedByPlayer.set(playerId, current + 1);
                created++;
            }
        }

        return created;
    }

    getConstructedCount(playerId: string): number {
        return this._constructedByPlayer.get(playerId) ?? 0;
    }

    resetConstructedCount(playerId: string): void {
        this._constructedByPlayer.delete(playerId);
    }

    get worldWidth(): number {
        return GRID_COLS * CELL_SIZE;
    }
    get worldHeight(): number {
        return GRID_ROWS * CELL_SIZE;
    }

    getSpawnPoints(meta?: {
        spawnPoints?: Array<{ col: number; row: number }>;
    }): Array<{ col: number; row: number }> {
        return meta?.spawnPoints ?? [];
    }

    getGrid(): TerrainMaterial[][] {
        return this.grid.map((row) => [...row]);
    }
}
