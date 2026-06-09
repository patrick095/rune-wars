import Phaser from 'phaser';

const BOX_W = 200;
const BOX_H = 40;
const BAR_W = 180;
const BAR_H = 10;
const DEPTH = 20;

export class WindDisplay {
  private container!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Graphics;
  private barBg!: Phaser.GameObjects.Graphics;
  private barFill!: Phaser.GameObjects.Graphics;
  private arrowText!: Phaser.GameObjects.Text;
  private valueText!: Phaser.GameObjects.Text;
  private labelText!: Phaser.GameObjects.Text;
  private lastShotText!: Phaser.GameObjects.Text;
  private arrowTween?: Phaser.Tweens.Tween;

  create(scene: Phaser.Scene): void {
    const cx = scene.scale.width / 2;
    const cy = 8;

    this.container = scene.add.container(cx, cy);
    this.container.setDepth(DEPTH).setScrollFactor(0);

    // Label "VENTO" acima da caixa
    this.labelText = scene.add.text(0, -14, 'VENTO', {
      fontSize: '10px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 1);

    // Fundo semitransparente
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x000000, 0.6);
    this.bg.fillRoundedRect(-BOX_W / 2, 0, BOX_W, BOX_H, 6);
    this.bg.lineStyle(1, 0x444444, 0.8);
    this.bg.strokeRoundedRect(-BOX_W / 2, 0, BOX_W, BOX_H, 6);

    // Fundo da barra
    this.barBg = scene.add.graphics();
    this.barBg.fillStyle(0x222222, 1);
    this.barBg.fillRect(-BAR_W / 2, 6, BAR_W, BAR_H);

    // Preenchimento da barra (será redesenhado no update)
    this.barFill = scene.add.graphics();

    // Linha central da barra
    const centerMark = scene.add.graphics();
    centerMark.lineStyle(2, 0xffffff, 0.5);
    centerMark.lineBetween(0, 5, 0, 17);

    // Seta de direção (texto animado)
    this.arrowText = scene.add.text(0, 18, '→', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0);

    // Valor numérico (ex: "→ 42")
    this.valueText = scene.add.text(0, 22, '', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0);

    // Último tiro (abaixo da caixa)
    this.lastShotText = scene.add.text(0, BOX_H + 4, '', {
      fontSize: '10px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0).setVisible(false);

    this.container.add([
      this.labelText,
      this.bg,
      this.barBg,
      this.barFill,
      centerMark,
      this.arrowText,
      this.valueText,
      this.lastShotText,
    ]);

    // Renderização inicial com vento zero
    this._renderBar(0);
    this._updateArrow(scene, 0);
  }

  update(windX: number, _windY: number): void {
    // windX: -1.0 (esquerda) a 1.0 (direita)
    const clamped = Math.max(-1, Math.min(1, windX));
    const intensity = Math.abs(clamped);
    const intVal = Math.round(intensity * 100);
    const dir = clamped >= 0 ? '→' : '←';

    this.valueText.setText(`${dir} ${intVal}`);

    this._renderBar(clamped);
    this._animateArrow(clamped);
  }

  setLastShot(force: number, angle: number): void {
    this.lastShotText.setText(`Força: ${force} | Ângulo: ${angle.toFixed(1)}°`);
    this.lastShotText.setVisible(true);
  }

  // ──────────────────────────────────────────────
  // Internals
  // ──────────────────────────────────────────────

  private _renderBar(windX: number): void {
    this.barFill.clear();

    if (windX === 0) return;

    const intensity = Math.abs(windX); // 0–1
    const halfBar = (BAR_W / 2) * intensity;

    // Cor baseada na intensidade
    let color: number;
    if (intensity < 0.3) {
      color = 0x4488ff; // azul
    } else if (intensity < 0.7) {
      color = 0xffdd44; // amarelo
    } else {
      color = 0xff4444; // vermelho
    }

    this.barFill.fillStyle(color, 1);

    if (windX > 0) {
      // Vento para a direita: preenche do centro para a direita
      this.barFill.fillRect(0, 6, halfBar, BAR_H);
    } else {
      // Vento para a esquerda: preenche do centro para a esquerda
      this.barFill.fillRect(-halfBar, 6, halfBar, BAR_H);
    }
  }

  private _animateArrow(windX: number): void {
    const scene = this.container.scene;
    if (!scene) return;

    const intensity = Math.abs(windX);
    const dir = windX >= 0 ? '→' : '←';
    const maxOffset = 20 * intensity;
    const targetX = windX >= 0 ? maxOffset : -maxOffset;

    this.arrowText.setText(dir);

    if (this.arrowTween) {
      this.arrowTween.stop();
    }

    this.arrowTween = scene.tweens.add({
      targets: this.arrowText,
      x: { from: -targetX, to: targetX },
      duration: Math.max(300, 800 - intensity * 500),
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private _updateArrow(scene: Phaser.Scene, windX: number): void {
    this.arrowText.setText(windX >= 0 ? '→' : '←');
    this.arrowText.setX(0);

    if (this.arrowTween) {
      this.arrowTween.stop();
    }

    if (windX === 0) return;

    const intensity = Math.abs(windX);
    const maxOffset = 20 * intensity;
    const targetX = windX >= 0 ? maxOffset : -maxOffset;

    this.arrowTween = scene.tweens.add({
      targets: this.arrowText,
      x: { from: -targetX, to: targetX },
      duration: Math.max(300, 800 - intensity * 500),
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }
}
