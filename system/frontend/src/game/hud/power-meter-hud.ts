import Phaser from 'phaser';

const BAR_WIDTH = 200;
const BAR_HEIGHT = 24;
const MAX_POWER = 100;

export class PowerMeterHUD {
  private bg: Phaser.GameObjects.Rectangle;
  private fill: Phaser.GameObjects.Rectangle;
  private ruler: Phaser.GameObjects.Graphics;
  private rulerLabels: Phaser.GameObjects.Text[] = [];
  private ghostLine: Phaser.GameObjects.Graphics;

  private barX: number;
  private barY: number;
  private lastShotPower = 0;
  private currentForce = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.barX = x;
    this.barY = y;

    // Background
    this.bg = scene.add
      .rectangle(x, y, BAR_WIDTH, BAR_HEIGHT, 0x111111)
      .setStrokeStyle(1, 0x444444)
      .setScrollFactor(0)
      .setDepth(15);

    // Fill bar (origin left-center)
    this.fill = scene.add
      .rectangle(x - BAR_WIDTH / 2, y, 0, BAR_HEIGHT - 4, 0x00ff88)
      .setScrollFactor(0)
      .setOrigin(0, 0.5)
      .setDepth(16);

    // Ruler Graphics layer (on top of fill)
    this.ruler = scene.add.graphics()
      .setScrollFactor(0)
      .setDepth(18);

    // Ghost line Graphics layer
    this.ghostLine = scene.add.graphics()
      .setScrollFactor(0)
      .setDepth(17);

    // Pre-create ruler labels for multiples of 10 (10, 20, ..., 100)
    // Only show them when bar is wide enough (>= 200px)
    for (let v = 10; v <= MAX_POWER; v += 10) {
      const lx = (x - BAR_WIDTH / 2) + (v / MAX_POWER) * BAR_WIDTH;
      const label = scene.add.text(lx, y - BAR_HEIGHT / 2 - 10, `${v}`, {
        fontSize: '9px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
        .setScrollFactor(0)
        .setOrigin(0.5, 1)
        .setDepth(19)
        .setAlpha(0.8);
      this.rulerLabels.push(label);
    }

    this.drawRuler();
  }

  /** Update the power bar. force: 0–100 */
  update(force: number): void {
    this.currentForce = force;
    const fillW = (force / MAX_POWER) * BAR_WIDTH;
    this.fill.setSize(fillW, BAR_HEIGHT - 4);
    this.fill.setVisible(force > 0);
    this.fill.setFillStyle(
      force > 70 ? 0xff4444 : force > 40 ? 0xffaa00 : 0x00ff88
    );
    this.drawRuler();
    this.drawGhost();
  }

  /**
   * Record the power used in the last shot.
   * The ghost persists until the next call.
   */
  recordShot(power: number): void {
    this.lastShotPower = power;
    this.drawGhost();
  }

  // ──────────────────────────────────────────────────────────
  // Internal draw helpers
  // ──────────────────────────────────────────────────────────

  private drawRuler(): void {
    this.ruler.clear();

    const originX = this.barX - BAR_WIDTH / 2;
    const barTop = this.barY - BAR_HEIGHT / 2;

    const showLabels = BAR_WIDTH >= 200;

    for (let v = 1; v <= MAX_POWER; v++) {
      const px = originX + (v / MAX_POWER) * BAR_WIDTH;

      if (v % 10 === 0) {
        // Major tick — 12px tall, alpha 0.8
        this.ruler.lineStyle(1, 0xffffff, 0.8);
        this.ruler.beginPath();
        this.ruler.moveTo(px, barTop);
        this.ruler.lineTo(px, barTop + 12);
        this.ruler.strokePath();
      } else if (v % 5 === 0) {
        // Minor tick — 8px tall, alpha 0.5
        this.ruler.lineStyle(1, 0xffffff, 0.5);
        this.ruler.beginPath();
        this.ruler.moveTo(px, barTop);
        this.ruler.lineTo(px, barTop + 8);
        this.ruler.strokePath();
      } else {
        // Unit tick — 4px tall, alpha 0.3
        this.ruler.lineStyle(1, 0xffffff, 0.3);
        this.ruler.beginPath();
        this.ruler.moveTo(px, barTop);
        this.ruler.lineTo(px, barTop + 4);
        this.ruler.strokePath();
      }
    }

    // Show/hide labels for multiples of 10
    this.rulerLabels.forEach((lbl, i) => {
      lbl.setVisible(showLabels);
      // Update position in case barX/barY was changed (resize)
      const v = (i + 1) * 10;
      const lx = (this.barX - BAR_WIDTH / 2) + (v / MAX_POWER) * BAR_WIDTH;
      lbl.setPosition(lx, this.barY - BAR_HEIGHT / 2 - 10);
    });
  }

  private drawGhost(): void {
    this.ghostLine.clear();
    if (this.lastShotPower <= 0) return;

    const originX = this.barX - BAR_WIDTH / 2;
    const ghostX = originX + (this.lastShotPower / MAX_POWER) * BAR_WIDTH;
    const barTop = this.barY - BAR_HEIGHT / 2;
    const barBottom = this.barY + BAR_HEIGHT / 2;

    // Ghost color matches current fill color at the ghost position
    const gp = this.lastShotPower;
    const ghostColor = gp > 70 ? 0xff4444 : gp > 40 ? 0xffaa00 : 0x00ff88;

    this.ghostLine.lineStyle(2, ghostColor, 0.4);
    this.ghostLine.beginPath();
    this.ghostLine.moveTo(ghostX, barTop);
    this.ghostLine.lineTo(ghostX, barBottom);
    this.ghostLine.strokePath();
  }

  setVisible(visible: boolean): void {
    this.bg.setVisible(visible);
    this.fill.setVisible(visible && this.currentForce > 0);
    this.ruler.setVisible(visible);
    this.ghostLine.setVisible(visible);
    this.rulerLabels.forEach(l => l.setVisible(visible && BAR_WIDTH >= 200));
  }

  destroy(): void {
    this.bg.destroy();
    this.fill.destroy();
    this.ruler.destroy();
    this.ghostLine.destroy();
    this.rulerLabels.forEach(l => l.destroy());
    this.rulerLabels = [];
  }
}
