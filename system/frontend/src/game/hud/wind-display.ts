import Phaser from 'phaser';

const DEPTH = 36;
// Timer cy=49, outer r=52 → bottom at y=101. Wind must start well below that.
const WIND_Y = 160;

export class WindDisplay {
  private container!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;
  private arrow!: Phaser.GameObjects.Text;
  private value!: Phaser.GameObjects.Text;
  private lastShot!: Phaser.GameObjects.Text;
  private tween?: Phaser.Tweens.Tween;

  create(scene: Phaser.Scene): void {
    this.container = scene.add.container(scene.scale.width / 2, WIND_Y)
      .setDepth(DEPTH)
      .setScrollFactor(0);

    this.bg = scene.add.graphics();

    this.label = scene.add.text(-16, -13, 'VENTO', {
      fontSize: '14px',
      color: '#d8c898',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0.5);

    this.arrow = scene.add.text(4, 8, '→', {
      fontSize: '32px',
      color: '#55d934',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.value = scene.add.text(42, 7, '0.0', {
      fontSize: '28px',
      color: '#2eff72',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#001800',
      strokeThickness: 4,
    }).setOrigin(0, 0.5);

    this.lastShot = scene.add.text(0, 32, '', {
      fontSize: '12px',
      color: '#c8b890',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0).setVisible(false);

    this.container.add([this.bg, this.label, this.arrow, this.value, this.lastShot]);
    this.drawBg();
    scene.scale.on('resize', this.handleResize, this);
  }

  update(windX: number, _windY: number): void {
    const displayWind = Phaser.Math.Clamp(windX, -10, 10);
    const dir = displayWind >= 0 ? '→' : '←';
    const abs = Math.abs(displayWind);
    const color = abs < 3 ? '#41d9ff' : abs < 7 ? '#ffdf4d' : '#ff5d42';

    this.arrow.setText(dir).setColor(color);
    this.value.setText(abs.toFixed(1)).setColor(color);
    this.animateArrow(displayWind);
  }

  setLastShot(force: number, angle: number): void {
    this.lastShot.setText(`ULTIMO ${Math.round(force)}% / ${Math.round(angle)}°`).setVisible(true);
  }

  reset(): void {
    this.lastShot.setVisible(false);
  }

  destroy(): void {
    this.container?.scene?.scale.off('resize', this.handleResize, this);
    this.tween?.stop();
    this.container?.destroy(true);
  }

  private drawBg(): void {
    this.bg.clear();

    const w = 220;
    const h = 54;
    const x = -w / 2;
    const y = -h / 2;

    // Shadow
    this.bg.fillStyle(0x000000, 0.5);
    this.bg.fillRoundedRect(x + 3, y + 3, w, h, 7);

    // Main background
    this.bg.fillStyle(0x0d0b07, 0.9);
    this.bg.fillRoundedRect(x, y, w, h, 7);

    // Subtle top highlight
    this.bg.fillStyle(0xfff0a0, 0.06);
    this.bg.fillRoundedRect(x + 4, y + 3, w - 8, h * 0.4, 6);

    // Outer gold border
    this.bg.lineStyle(2.5, 0x7a5530, 1);
    this.bg.strokeRoundedRect(x + 1.5, y + 1.5, w - 3, h - 3, 7);

    // Inner thin accent
    this.bg.lineStyle(1, 0xd8a850, 0.4);
    this.bg.strokeRoundedRect(x + 6, y + 6, w - 12, h - 12, 5);

    // Vertical divider after label
    this.bg.lineStyle(1, 0x8a6030, 0.6);
    this.bg.lineBetween(-14, y + 8, -14, y + h - 8);
  }

  private animateArrow(windX: number): void {
    this.tween?.stop();
    const offset = Math.max(4, Math.abs(windX) * 20);
    this.tween = this.container.scene.tweens.add({
      targets: this.arrow,
      x: { from: windX >= 0 ? 4 - offset * 0.4 : 4 + offset * 0.4, to: windX >= 0 ? 4 + offset * 0.4 : 4 - offset * 0.4 },
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private handleResize(): void {
    this.container.setPosition(this.container.scene.scale.width / 2, WIND_Y);
    this.drawBg();
  }
}
