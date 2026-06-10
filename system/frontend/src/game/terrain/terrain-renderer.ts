import Phaser from "phaser";
import {
    WORLD_WIDTH,
    WORLD_HEIGHT,
} from "../../app/shared/game-core/terrain-types";

// Drop-shadow offset in pixels (positive = right / down)
const SHADOW_X = 4;
const SHADOW_Y = 4;
const SHADOW_ALPHA = 0.7;

export class TerrainRenderer {
    private bg: Phaser.GameObjects.Image;
    private shadowRt: Phaser.GameObjects.RenderTexture;
    private rt: Phaser.GameObjects.RenderTexture;
    private eraseBrush: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, bgKey: string, terrainKey: string) {
        this.bg = scene.add
            .image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, bgKey)
            .setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT)
            .setDepth(-1)
            .setAlpha(0.6);

        // Shadow: same terrain silhouette, black-tinted, offset slightly beneath the main layer
        this.shadowRt = scene.add
            .renderTexture(SHADOW_X, SHADOW_Y, WORLD_WIDTH, WORLD_HEIGHT)
            .setDepth(-0.5)
            .setOrigin(0, 0)
            .setTint(0x000000)
            .setAlpha(SHADOW_ALPHA);
        // Draw terrain PNG scaled to fill the full world dimensions
        const scaledTerrain = scene.make.image({ key: terrainKey, add: false });
        scaledTerrain.setOrigin(0, 0).setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT);
        this.shadowRt.draw(scaledTerrain, 0, 0);
        scaledTerrain.destroy();

        this.rt = scene.add
            .renderTexture(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
            .setDepth(0)
            .setOrigin(0, 0);
        const scaledTerrain2 = scene.make.image({ key: terrainKey, add: false });
        scaledTerrain2.setOrigin(0, 0).setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT);
        this.rt.draw(scaledTerrain2, 0, 0);
        scaledTerrain2.destroy();

        this.eraseBrush = scene.make.graphics({}, false);
    }

    applyExplosion(cx: number, cy: number, radius: number): void {
        this.eraseBrush.clear();
        this.eraseBrush.fillStyle(0xffffff, 1);
        this.eraseBrush.fillCircle(radius, radius, radius);
        this.rt.erase(this.eraseBrush, cx - radius, cy - radius);
        this.shadowRt.erase(this.eraseBrush, cx - radius, cy - radius);
    }

    destroy(): void {
        this.bg.destroy();
        this.shadowRt.destroy();
        this.rt.destroy();
        this.eraseBrush.destroy();
    }
}
