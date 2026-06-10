import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../../app/shared/game-core/terrain-types';

export class TerrainRenderer {
  private bg: Phaser.GameObjects.Image;
  private rt: Phaser.GameObjects.RenderTexture;
  private eraseBrush: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, bgKey: string, terrainKey: string) {
    this.bg = scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, bgKey)
      .setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT)
      .setDepth(-1);

    this.rt = scene.add.renderTexture(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
      .setDepth(0)
      .setOrigin(0, 0);
    this.rt.draw(terrainKey, 0, 0);

    this.eraseBrush = scene.make.graphics({}, false);
  }

  applyExplosion(cx: number, cy: number, radius: number): void {
    this.eraseBrush.clear();
    this.eraseBrush.fillStyle(0xffffff, 1);
    this.eraseBrush.fillCircle(radius, radius, radius);
    this.rt.erase(this.eraseBrush, cx - radius, cy - radius);
  }

  destroy(): void {
    this.bg.destroy();
    this.rt.destroy();
    this.eraseBrush.destroy();
  }
}
