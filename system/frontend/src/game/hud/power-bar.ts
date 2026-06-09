import Phaser from 'phaser';

const MAX_POWER = 100;

/**
 * PowerBar — responsive HUD component occupying the bottom-center of the screen.
 *
 * Layout:
 *   [ ÂNGULO ] [████████████████░░░░░░░░] [ ATIRAR ]
 *       75°           Força: 65%            (ESPAÇO)
 *
 * Usage:
 *   const pb = new PowerBar();
 *   pb.create(scene);
 *   // in update loop:
 *   pb.update(power, angle);
 *   // react to charging state:
 *   pb.setCharging(true);
 *   // register fire callback:
 *   pb.onFire(() => doFire());
 */
export class PowerBar {
  // ── Container ──────────────────────────────────────────────────────────────
  private container!: Phaser.GameObjects.Container;

  // ── Angle display ──────────────────────────────────────────────────────────
  private angleText!: Phaser.GameObjects.Text;

  // ── Power bar ──────────────────────────────────────────────────────────────
  private barBg!: Phaser.GameObjects.Rectangle;
  private barGfx!: Phaser.GameObjects.Graphics;
  private tickGfx!: Phaser.GameObjects.Graphics;
  private powerLabel!: Phaser.GameObjects.Text;

  // ── Fire button ────────────────────────────────────────────────────────────
  private fireBtn!: Phaser.GameObjects.Rectangle;
  private fireBtnText!: Phaser.GameObjects.Text;

  // ── State ──────────────────────────────────────────────────────────────────
  private currentPower = 0;
  private currentAngle = 0;
  private isCharging = false;
  private fireCallback: (() => void) | null = null;

  // ── Cached dimensions (recalculated on create / resize) ────────────────────
  private W = 0;
  private H = 0;
  private barW = 0;
  private barH = 0;
  private barOriginX = 0; // left edge of bar, in scene coordinates
  private barOriginY = 0; // center of bar, in scene coordinates

  // ──────────────────────────────────────────────────────────────────────────
  // Public API
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Build all game objects and attach them to the scene.
   * Call once (typically from a HUD scene's `create`).
   */
  create(scene: Phaser.Scene): void {
    this.W = scene.scale.width;
    this.H = scene.scale.height;
    this._computeDimensions();

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(20);

    this._buildAngleDisplay(scene);
    this._buildBar(scene);
    this._buildFireButton(scene);

    this._drawBar();
    this._drawTicks();
    this._updateTexts();

    // Re-layout when the canvas is resized
    scene.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.W = gameSize.width;
      this.H = gameSize.height;
      this._computeDimensions();
      this._relayout();
      this._drawBar();
      this._drawTicks();
      this._updateTexts();
    });
  }

  /**
   * Refresh the visual state.
   * @param power  0–100
   * @param angle  degrees (e.g. 75)
   */
  update(power: number, angle: number): void {
    this.currentPower = Phaser.Math.Clamp(power, 0, MAX_POWER);
    this.currentAngle = angle;
    this._drawBar();
    this._updateTexts();
  }

  /**
   * Switch the fire button label between "ATIRAR" and "CARREGANDO… XX%".
   */
  setCharging(isCharging: boolean): void {
    this.isCharging = isCharging;
    this._updateTexts();
  }

  /**
   * Register a callback invoked when the ATIRAR button is pressed.
   * Only one callback is stored; subsequent calls replace the previous one.
   */
  onFire(callback: () => void): void {
    this.fireCallback = callback;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private — dimension helpers
  // ──────────────────────────────────────────────────────────────────────────

  private _computeDimensions(): void {
    this.barW = this.W * 0.40;
    this.barH = this.H * 0.04;

    // Horizontal center of bar = center of screen
    this.barOriginX = this.W / 2 - this.barW / 2;
    // Vertical center: sit ~3 bar-heights from the bottom
    this.barOriginY = this.H - this.barH * 2.5;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private — object construction
  // ──────────────────────────────────────────────────────────────────────────

  private _buildAngleDisplay(scene: Phaser.Scene): void {
    const btnW = this.barW * 0.28;
    const btnH = this.barH;
    const bx = this.barOriginX - btnW / 2 - 8;
    const by = this.barOriginY;

    // Background panel
    const angleBg = scene.add
      .rectangle(bx, by, btnW, btnH, 0x1a1a2e)
      .setStrokeStyle(1, 0x4444aa)
      .setOrigin(0.5, 0.5);
    this.container.add(angleBg);

    // Angle text
    this.angleText = scene.add
      .text(bx, by, '0°', {
        fontSize: `${Math.round(this.barH * 0.5)}px`,
        color: '#aaddff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);
    this.container.add(this.angleText);
  }

  private _buildBar(scene: Phaser.Scene): void {
    const cx = this.barOriginX + this.barW / 2;
    const cy = this.barOriginY;

    // Background track
    this.barBg = scene.add
      .rectangle(cx, cy, this.barW, this.barH, 0x111122)
      .setStrokeStyle(1, 0x334466)
      .setOrigin(0.5, 0.5);
    this.container.add(this.barBg);

    // Gradient fill (drawn via Graphics)
    this.barGfx = scene.add.graphics();
    this.container.add(this.barGfx);

    // Tick marks (drawn via Graphics, on top of fill)
    this.tickGfx = scene.add.graphics();
    this.container.add(this.tickGfx);

    // Label below the bar
    this.powerLabel = scene.add
      .text(cx, cy + this.barH / 2 + 4, 'Força: 0%', {
        fontSize: `${Math.round(this.barH * 0.38)}px`,
        color: '#cccccc',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5, 0);
    this.container.add(this.powerLabel);
  }

  private _buildFireButton(scene: Phaser.Scene): void {
    const btnW = this.barW * 0.28;
    const btnH = this.barH;
    const bx = this.barOriginX + this.barW + btnW / 2 + 8;
    const by = this.barOriginY;

    this.fireBtn = scene.add
      .rectangle(bx, by, btnW, btnH, 0x331111)
      .setStrokeStyle(1, 0xaa2222)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });
    this.container.add(this.fireBtn);

    this.fireBtnText = scene.add
      .text(bx, by, 'ATIRAR', {
        fontSize: `${Math.round(this.barH * 0.45)}px`,
        color: '#ff6666',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);
    this.container.add(this.fireBtnText);

    this.fireBtn.on('pointerdown', () => {
      if (this.fireCallback) {
        this.fireCallback();
      }
      // Emit scene-level event so listeners using EventEmitter can also react
      this.fireBtn.scene.events.emit('power:fire');
    });

    this.fireBtn.on('pointerover', () => {
      this.fireBtn.setFillStyle(0x551111);
    });

    this.fireBtn.on('pointerout', () => {
      this.fireBtn.setFillStyle(0x331111);
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private — drawing
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Draw the gradient fill using multiple vertical slices so we get a smooth
   * green → yellow → red transition proportional to the current power value.
   */
  private _drawBar(): void {
    this.barGfx.clear();

    const fillW = (this.currentPower / MAX_POWER) * this.barW;
    if (fillW <= 0) return;

    const left = this.barOriginX;
    const top = this.barOriginY - this.barH / 2 + 2;
    const segH = this.barH - 4;

    // Number of slices — more = smoother gradient; 40 is plenty
    const slices = 40;
    const sliceW = this.barW / slices;

    for (let i = 0; i < slices; i++) {
      const t = i / (slices - 1); // 0 (left=green) → 1 (right=red)
      const segX = left + i * sliceW;

      // Only render slices within the filled portion
      if (segX >= left + fillW) break;

      const color = this._gradientColor(t);
      this.barGfx.fillStyle(color, 1);
      // Clamp the last slice to the fill boundary
      const actualW = Math.min(sliceW, left + fillW - segX);
      this.barGfx.fillRect(segX, top, actualW, segH);
    }
  }

  /**
   * Return a hex color for a 0→1 gradient: green(0x00ff44) → yellow(0xffff00) → red(0xff2222).
   */
  private _gradientColor(t: number): number {
    let r: number, g: number, b: number;

    if (t <= 0.5) {
      // green → yellow: r 0→255, g 255→255, b 0→0
      const s = t / 0.5;
      r = Math.round(s * 255);
      g = 220;
      b = 0;
    } else {
      // yellow → red: r 255→255, g 255→0, b 0→0
      const s = (t - 0.5) / 0.5;
      r = 255;
      g = Math.round((1 - s) * 220);
      b = 0;
    }

    return (r << 16) | (g << 8) | b;
  }

  /**
   * Draw tick marks every 10% on the bar.
   */
  private _drawTicks(): void {
    this.tickGfx.clear();

    const left = this.barOriginX;
    const top = this.barOriginY - this.barH / 2;

    for (let v = 10; v <= MAX_POWER; v += 10) {
      const px = left + (v / MAX_POWER) * this.barW;
      const isMajor = v % 20 === 0;
      const tickH = isMajor ? this.barH * 0.7 : this.barH * 0.45;
      const alpha = isMajor ? 0.9 : 0.55;

      this.tickGfx.lineStyle(1, 0xffffff, alpha);
      this.tickGfx.beginPath();
      this.tickGfx.moveTo(px, top);
      this.tickGfx.lineTo(px, top + tickH);
      this.tickGfx.strokePath();
    }
  }

  /**
   * Sync all text objects to current state.
   */
  private _updateTexts(): void {
    // Angle display
    if (this.angleText) {
      this.angleText.setText(`${Math.round(this.currentAngle)}°`);
    }

    // Power label
    if (this.powerLabel) {
      this.powerLabel.setText(`Força: ${Math.round(this.currentPower)}%`);
    }

    // Fire button
    if (this.fireBtnText) {
      if (this.isCharging) {
        this.fireBtnText.setText(`CARREGANDO...\n${Math.round(this.currentPower)}%`);
        this.fireBtnText.setColor('#ffaa44');
      } else {
        this.fireBtnText.setText('ATIRAR\n(ESPAÇO)');
        this.fireBtnText.setColor('#ff6666');
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private — responsive re-layout
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Re-position all objects after a resize event.
   * Destroys and recreates objects that can't simply be repositioned.
   */
  private _relayout(): void {
    const cx = this.barOriginX + this.barW / 2;
    const cy = this.barOriginY;
    const btnW = this.barW * 0.28;

    // ── Bar background ─────────────────────────────────────────────────────
    this.barBg
      .setPosition(cx, cy)
      .setSize(this.barW, this.barH);

    // ── Angle display ──────────────────────────────────────────────────────
    const abx = this.barOriginX - btnW / 2 - 8;
    this.angleText.setPosition(abx, cy);
    this.angleText.setFontSize(Math.round(this.barH * 0.5));

    // ── Power label ────────────────────────────────────────────────────────
    this.powerLabel
      .setPosition(cx, cy + this.barH / 2 + 4)
      .setFontSize(Math.round(this.barH * 0.38));

    // ── Fire button ────────────────────────────────────────────────────────
    const fbx = this.barOriginX + this.barW + btnW / 2 + 8;
    this.fireBtn.setPosition(fbx, cy).setSize(btnW, this.barH);
    this.fireBtnText
      .setPosition(fbx, cy)
      .setFontSize(Math.round(this.barH * 0.45));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Public — lifecycle helpers
  // ──────────────────────────────────────────────────────────────────────────

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
