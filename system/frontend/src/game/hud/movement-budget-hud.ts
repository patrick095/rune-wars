import Phaser from 'phaser';

const BAR_WIDTH = 160;
const BAR_HEIGHT = 14;
const LABEL_OFFSET_Y = -18;

export class MovementBudgetHUD {
  private bar!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;
  private _x: number;
  private _y: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this._x = x;
    this._y = y;
    this.bar = scene.add.graphics().setDepth(16).setScrollFactor(0);
    this.label = scene.add.text(x, y + LABEL_OFFSET_Y, 'MOV', {
      fontSize: '11px',
      color: '#aaffcc',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(16).setScrollFactor(0);
    this.update(0, 1);
  }

  update(used: number, total: number): void {
    const pct = total > 0 ? Math.max(0, 1 - used / total) : 0;
    this.bar.clear();

    this.bar.fillStyle(0x222233, 0.85);
    this.bar.fillRect(this._x - BAR_WIDTH / 2, this._y - BAR_HEIGHT / 2, BAR_WIDTH, BAR_HEIGHT);

    const color = pct > 0.5 ? 0x44ff88 : pct > 0.25 ? 0xffdd44 : 0xff4444;
    this.bar.fillStyle(color, 1);
    this.bar.fillRect(this._x - BAR_WIDTH / 2, this._y - BAR_HEIGHT / 2, BAR_WIDTH * pct, BAR_HEIGHT);

    this.bar.lineStyle(1, 0x446655, 0.8);
    this.bar.strokeRect(this._x - BAR_WIDTH / 2, this._y - BAR_HEIGHT / 2, BAR_WIDTH, BAR_HEIGHT);

    this.label.setText(`MOV ${Math.round(pct * 100)}%`);
  }

  setVisible(visible: boolean): void {
    this.bar.setVisible(visible);
    this.label.setVisible(visible);
  }

  destroy(): void {
    this.bar.destroy();
    this.label.destroy();
  }
}
