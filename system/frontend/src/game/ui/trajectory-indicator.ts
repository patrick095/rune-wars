import Phaser from 'phaser';

export class TrajectoryIndicator {
  private graphics: Phaser.GameObjects.Graphics | null = null;

  draw(scene: Phaser.Scene, points: Array<{ x: number; y: number }>): void {
    this.clear();

    if (points.length < 2) return;

    if (!this.graphics) {
      this.graphics = scene.add.graphics();
    }

    this.graphics.setDepth(5);

    // Draw dotted line using the first 15 points
    const displayPoints = points.slice(0, 15);

    for (let i = 0; i < displayPoints.length; i++) {
      // Alternating dots for dashed effect
      if (i % 2 === 0) {
        this.graphics.fillStyle(0xffff88, 0.6);
        this.graphics.fillCircle(displayPoints[i].x, displayPoints[i].y, 3);
      }
    }
  }

  clear(): void {
    if (this.graphics) {
      this.graphics.clear();
    }
  }

  destroy(): void {
    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = null;
    }
  }
}
