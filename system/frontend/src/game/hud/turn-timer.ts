import Phaser from 'phaser';

const TURN_DURATION = 20; // seconds
const RING_RADIUS = 28;
const RING_THICKNESS = 5;
const DEPTH = 20;

type TimerState = 'idle' | 'running' | 'charging' | 'done';

export class TurnTimer {
  private scene: Phaser.Scene | null = null;
  private graphics: Phaser.GameObjects.Graphics | null = null;
  private label: Phaser.GameObjects.Text | null = null;
  private timerEvent: Phaser.Time.TimerEvent | null = null;
  private pulseTween: Phaser.Tweens.Tween | null = null;

  private elapsed = 0; // seconds elapsed
  private state: TimerState = 'idle';
  private cx = 0;
  private cy = 0;

  // ─────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────

  /** Initialise and start the 20-second countdown. */
  start(scene: Phaser.Scene): void {
    this.stop(); // clean up any previous run

    this.scene = scene;
    this.elapsed = 0;
    this.state = 'running';

    this.cx = scene.scale.width / 2;
    this.cy = 54; // centre-top, above WindDisplay

    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH);
    this.label = scene.add
      .text(this.cx, this.cy, '', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setOrigin(0.5, 0.5)
      .setDepth(DEPTH + 1);

    // Tick every 100 ms for smooth ring redraw
    this.timerEvent = scene.time.addEvent({
      delay: 100,
      loop: true,
      callback: this.onTick,
      callbackScope: this,
    });

    this.redraw();
  }

  /** Freeze the ring in blue while the player is charging a shot. */
  pauseForCharge(): void {
    if (!this.scene || this.state === 'idle' || this.state === 'done') return;
    this.state = 'charging';
    this.stopPulseTween();
    this.redraw();
  }

  /** Resume countdown after charge is cancelled / released. */
  resumeFromCharge(): void {
    if (!this.scene || this.state !== 'charging') return;
    this.state = 'running';
    this.redraw();
  }

  /** Called when the player's shot reaches 100% power → emit auto-fire. */
  onPowerMax(): void {
    if (!this.scene) return;
    this.scene.events.emit('charge:autofire');
    this.stopTimer();
  }

  /** Remove all game objects and cancel events. */
  stop(): void {
    this.stopTimer();
    this.stopPulseTween();
    this.graphics?.destroy();
    this.label?.destroy();
    this.graphics = null;
    this.label = null;
    this.scene = null;
    this.state = 'idle';
    this.elapsed = 0;
  }

  // ─────────────────────────────────────────────────────────
  // Internal helpers
  // ─────────────────────────────────────────────────────────

  private onTick(): void {
    if (this.state !== 'running') return;

    this.elapsed += 0.1; // 100 ms per tick

    if (this.elapsed >= TURN_DURATION) {
      this.elapsed = TURN_DURATION;
      this.state = 'done';
      this.redraw();
      this.stopTimer();
      this.scene?.events.emit('turn:expired');
      return;
    }

    this.redraw();
  }

  private redraw(): void {
    if (!this.graphics || !this.label || !this.scene) return;

    const remaining = TURN_DURATION - this.elapsed;
    const progress = this.elapsed / TURN_DURATION; // 0 → 1

    this.graphics.clear();

    if (this.state === 'done') {
      this.label.setVisible(false);
      return;
    }

    // ── Determine colour & urgency based on state ──────────
    let ringColor: number;
    let urgency: 'none' | 'slow' | 'fast' = 'none';
    let labelText = `${Math.ceil(remaining)}s`;

    if (this.state === 'charging') {
      ringColor = 0x4488ff;
      urgency = 'none';
      labelText = 'Carregando...';
    } else if (remaining > 10) {
      ringColor = 0xffffff;
      urgency = 'none';
    } else if (remaining > 5) {
      ringColor = 0xffdd00;
      urgency = 'slow';
    } else {
      ringColor = 0xff3333;
      urgency = 'fast';
    }

    // ── Draw background track ──────────────────────────────
    this.graphics.lineStyle(RING_THICKNESS, 0x333333, 0.5);
    this.graphics.beginPath();
    this.graphics.arc(this.cx, this.cy, RING_RADIUS, 0, Math.PI * 2, false);
    this.graphics.strokePath();

    // ── Draw foreground arc (counter-clockwise depletion) ──
    const startAngle = -Math.PI / 2; // 12 o'clock
    const endAngle = startAngle + (1 - progress) * Math.PI * 2;

    this.graphics.lineStyle(RING_THICKNESS, ringColor, 1);
    this.graphics.beginPath();
    this.graphics.arc(this.cx, this.cy, RING_RADIUS, startAngle, endAngle, false);
    this.graphics.strokePath();

    // ── Label ──────────────────────────────────────────────
    this.label.setText(labelText);
    this.label.setPosition(this.cx, this.cy);
    const hexStr = '#' + ringColor.toString(16).padStart(6, '0');
    this.label.setColor(hexStr);
    this.label.setVisible(true);

    // ── Pulse tweens ───────────────────────────────────────
    this.updatePulseTween(urgency);
  }

  private currentUrgency: 'none' | 'slow' | 'fast' = 'none';

  private updatePulseTween(urgency: 'none' | 'slow' | 'fast'): void {
    if (urgency === this.currentUrgency) return;
    this.currentUrgency = urgency;
    this.stopPulseTween();

    if (!this.scene || !this.label) return;

    if (urgency === 'none') {
      this.label.setScale(1).setAlpha(1);
      return;
    }

    const duration = urgency === 'slow' ? 600 : 250;

    this.pulseTween = this.scene.tweens.add({
      targets: this.label,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: { from: 1, to: 0.6 },
      duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private stopPulseTween(): void {
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
      this.currentUrgency = 'none';
      if (this.label) {
        this.label.setScale(1).setAlpha(1);
      }
    }
  }

  private stopTimer(): void {
    if (this.timerEvent) {
      this.timerEvent.remove(false);
      this.timerEvent = null;
    }
  }
}
