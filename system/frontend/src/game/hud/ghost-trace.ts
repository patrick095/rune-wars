import Phaser from 'phaser';

export class GhostTrace {
  private graphics: Phaser.GameObjects.Graphics;
  private lastPoints: { x: number; y: number }[] = [];

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(50);
  }

  recordShot(points: { x: number; y: number }[]): void {
    this.lastPoints = points;
    this.redraw();
  }

  private redraw(): void {
    this.graphics.clear();
    if (this.lastPoints.length < 2) return;
    this.graphics.lineStyle(2, 0xffffff, 0.4);
    for (let i = 0; i < this.lastPoints.length - 1; i += 2) {
      this.graphics.strokeLineShape(
        new Phaser.Geom.Line(
          this.lastPoints[i].x,
          this.lastPoints[i].y,
          this.lastPoints[i + 1].x,
          this.lastPoints[i + 1].y
        )
      );
    }
  }

  clear(): void {
    this.graphics.clear();
    this.lastPoints = [];
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
