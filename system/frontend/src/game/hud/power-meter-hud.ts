import Phaser from 'phaser';

export class PowerMeterHUD {
  private bg: Phaser.GameObjects.Rectangle;
  private fill: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.bg = scene.add
      .rectangle(x, y, 200, 24, 0x222222)
      .setScrollFactor(0)
      .setDepth(15);

    this.fill = scene.add
      .rectangle(x - 100, y, 0, 20, 0x00ff88)
      .setScrollFactor(0)
      .setOrigin(0, 0.5)
      .setDepth(16);

    this.label = scene.add
      .text(x, y - 16, 'Força: 0', {
        fontSize: '12px',
        color: '#ffaa44',
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(16);
  }

  /** Update the power bar. force: 0–100 */
  update(force: number): void {
    this.fill.setDisplaySize(force * 2, 20);
    this.fill.setFillStyle(
      force > 70 ? 0xff4444 : force > 40 ? 0xffaa00 : 0x00ff88
    );
    this.label.setText(`Força: ${Math.round(force)}`);
  }

  setVisible(visible: boolean): void {
    this.bg.setVisible(visible);
    this.fill.setVisible(visible);
    this.label.setVisible(visible);
  }

  destroy(): void {
    this.bg.destroy();
    this.fill.destroy();
    this.label.destroy();
  }
}
