import Phaser from 'phaser';
import { TurnManager } from '../../app/shared/game-core/turn-manager';
import { WindSystem } from '../../app/shared/game-core/wind-system';
import { ProjectilePhysics } from '../../app/shared/game-core/projectile-physics';
import { DamageCalculator } from '../../app/shared/game-core/damage-calculator';
import { AiLocal, Difficulty } from '../../app/shared/game-core/ai-local';
import { PlayerStats } from '../../app/shared/game-core/player-stats';
import { ProjectileConfig } from '../../app/shared/game-core/projectile-config';
import { CombatHud } from '../hud/combat-hud';
import { TrajectoryIndicator } from '../ui/trajectory-indicator';
import { ResultOverlay } from '../ui/result-overlay';

export class BattleScene extends Phaser.Scene {
  private turnManager = new TurnManager();
  private windSystem = new WindSystem();
  private physics = new ProjectilePhysics();
  private damageCalc = new DamageCalculator();
  private ai = new AiLocal();

  private playerStats: PlayerStats = { hp: 100, maxHp: 100, x: 0, y: 0, isPlayer: true };
  private aiStats: PlayerStats = { hp: 100, maxHp: 100, x: 0, y: 0, isPlayer: false };
  private currentAngle = 45;
  private difficulty: Difficulty = 'medium';
  private baseDamage = 40;
  private isAnimating = false;

  // Phaser objects
  private playerSprite!: Phaser.GameObjects.Rectangle;
  private aiSprite!: Phaser.GameObjects.Rectangle;
  private projectile!: Phaser.GameObjects.Arc;

  // HUD & UI helpers
  private hud!: CombatHud;
  private trajectory = new TrajectoryIndicator();
  private resultOverlay = new ResultOverlay();

  // Power bar
  private powerBarBg!: Phaser.GameObjects.Rectangle;
  private powerBarFill!: Phaser.GameObjects.Rectangle;
  private powerBarLabel!: Phaser.GameObjects.Text;
  private isChargingPower = false;
  private powerValue = 0;
  private powerInterval: ReturnType<typeof setInterval> | null = null;

  // Control buttons
  private angleText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    // Register self globally for debug panel
    (window as Record<string, unknown>)['battleScene'] = this;

    const { width, height } = this.scale;

    // Positions
    this.playerStats.x = 120;
    this.playerStats.y = height * 0.65;
    this.aiStats.x = width - 120;
    this.aiStats.y = height * 0.65;

    // Background gradient feel
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Ground
    this.add.rectangle(width / 2, height * 0.75, width, 20, 0x336633).setDepth(1);

    // Player sprite (blue)
    this.playerSprite = this.add.rectangle(
      this.playerStats.x, this.playerStats.y, 40, 60, 0x4488ff
    ).setDepth(2);
    this.add.text(this.playerStats.x, this.playerStats.y + 40, 'Jogador', {
      fontSize: '11px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(3);

    // AI sprite (red)
    this.aiSprite = this.add.rectangle(
      this.aiStats.x, this.aiStats.y, 40, 60, 0xff4444
    ).setDepth(2);
    this.add.text(this.aiStats.x, this.aiStats.y + 40, 'Inimigo', {
      fontSize: '11px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(3);

    // Projectile (hidden initially)
    this.projectile = this.add.arc(0, 0, 6, 0, 360, false, 0xffff00)
      .setVisible(false).setDepth(8);

    // HUD
    this.hud = new CombatHud(this);
    this.refreshHud();

    // Controls
    this.createControls();

    // Wind generate on scene start
    this.windSystem.generate();
    this.refreshHud();

    // Handle resize
    this.scale.on('resize', this.onResize, this);
  }

  // ──────────────────────────────────────────────────────────
  // Controls
  // ──────────────────────────────────────────────────────────

  private createControls(): void {
    const { width, height } = this.scale;
    const btnY = height - 50;
    const btnH = 44;
    const btnW = 70;

    // Angle - button
    const btnAngleMinus = this.add.rectangle(40, btnY, btnW, btnH, 0x335588).setInteractive().setDepth(15);
    this.add.text(40, btnY, 'Ang -', { fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' })
      .setOrigin(0.5).setDepth(16);

    // Angle display
    this.angleText = this.add.text(120, btnY, `${this.currentAngle}°`, {
      fontSize: '16px', color: '#ffdd44', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(16);

    // Angle + button
    const btnAnglePlus = this.add.rectangle(200, btnY, btnW, btnH, 0x335588).setInteractive().setDepth(15);
    this.add.text(200, btnY, 'Ang +', { fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' })
      .setOrigin(0.5).setDepth(16);

    // Power bar background
    const barX = width / 2;
    const barY = height - 50;
    this.powerBarBg = this.add.rectangle(barX, barY, 200, 24, 0x222222).setDepth(15);
    this.powerBarFill = this.add.rectangle(barX - 100, barY, 0, 20, 0xff8800)
      .setOrigin(0, 0.5).setDepth(16);
    this.powerBarLabel = this.add.text(barX, barY - 16, 'Força: 0', {
      fontSize: '12px', color: '#ffaa44', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(16);

    // Fire button
    const btnFireX = width - 70;
    const btnFire = this.add.rectangle(btnFireX, btnY, 100, btnH, 0x884400).setInteractive().setDepth(15);
    const btnFireText = this.add.text(btnFireX, btnY, 'ATIRAR', {
      fontSize: '15px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(16);

    // Events
    btnAngleMinus.on('pointerdown', () => this.adjustAngle(-5));
    btnAnglePlus.on('pointerdown', () => this.adjustAngle(5));

    btnFire.on('pointerover', () => btnFire.setFillStyle(0xaa6600));
    btnFire.on('pointerout', () => btnFire.setFillStyle(0x884400));
    btnFire.on('pointerdown', () => this.startChargingPower(btnFire, btnFireText));
    btnFire.on('pointerup', () => this.releaseFire(btnFire, btnFireText));
    btnFire.on('pointerupoutside', () => this.releaseFire(btnFire, btnFireText));
  }

  private adjustAngle(delta: number): void {
    if (this.isAnimating || !this.turnManager.isPlayerTurn) return;
    this.currentAngle = Math.max(5, Math.min(175, this.currentAngle + delta));
    this.angleText.setText(`${this.currentAngle}°`);
    this.updateTrajectoryPreview();
  }

  private startChargingPower(
    btn: Phaser.GameObjects.Rectangle,
    btnText: Phaser.GameObjects.Text
  ): void {
    if (this.isAnimating || !this.turnManager.isPlayerTurn) return;
    if (this.isChargingPower) return;

    this.isChargingPower = true;
    this.powerValue = 0;
    btn.setFillStyle(0xcc8800);
    btnText.setText('...');

    this.powerInterval = setInterval(() => {
      this.powerValue = Math.min(100, this.powerValue + 2);
      this.powerBarFill.setDisplaySize(this.powerValue * 2, 20);
      this.powerBarLabel.setText(`Força: ${this.powerValue}`);
    }, 30);
  }

  private releaseFire(
    btn: Phaser.GameObjects.Rectangle,
    btnText: Phaser.GameObjects.Text
  ): void {
    if (!this.isChargingPower) return;
    this.isChargingPower = false;

    if (this.powerInterval) {
      clearInterval(this.powerInterval);
      this.powerInterval = null;
    }

    btn.setFillStyle(0x884400);
    btnText.setText('ATIRAR');

    if (this.powerValue < 5) return; // too low, ignore

    this.firePlayerShot(this.currentAngle, this.powerValue);
    this.powerValue = 0;
    this.powerBarFill.setDisplaySize(0, 20);
    this.powerBarLabel.setText('Força: 0');
  }

  // ──────────────────────────────────────────────────────────
  // Trajectory preview
  // ──────────────────────────────────────────────────────────

  private updateTrajectoryPreview(): void {
    if (!this.turnManager.isPlayerTurn || this.isAnimating) {
      this.trajectory.clear();
      return;
    }

    const config: ProjectileConfig = {
      angle: this.currentAngle,
      force: 50, // preview with medium force
      gravityScale: 1,
      windInfluence: 0.01,
      baseDamage: this.baseDamage,
    };

    const wind = this.windSystem.getCurrent();
    const points = this.physics.simulate(this.playerStats.x, this.playerStats.y, config, wind);
    this.trajectory.draw(this, points);
  }

  // ──────────────────────────────────────────────────────────
  // Shooting
  // ──────────────────────────────────────────────────────────

  private firePlayerShot(angle: number, force: number): void {
    this.trajectory.clear();
    const config: ProjectileConfig = {
      angle,
      force,
      gravityScale: 1,
      windInfluence: 0.01,
      baseDamage: this.baseDamage,
    };

    const wind = this.windSystem.getCurrent();
    const path = this.physics.simulate(this.playerStats.x, this.playerStats.y, config, wind);
    this.animateProjectile(path, true);
  }

  private fireAiShot(): void {
    const wind = this.windSystem.getCurrent();
    const shot = this.ai.calculateShot(
      { x: this.aiStats.x, y: this.aiStats.y },
      { x: this.playerStats.x, y: this.playerStats.y },
      wind,
      this.difficulty
    );

    // AI shoots left (mirror angle)
    const mirroredAngle = 180 - shot.angle;
    const config: ProjectileConfig = {
      angle: mirroredAngle,
      force: shot.force,
      gravityScale: 1,
      windInfluence: 0.01,
      baseDamage: this.baseDamage,
    };

    const path = this.physics.simulate(this.aiStats.x, this.aiStats.y, config, wind);
    this.animateProjectile(path, false);
  }

  private animateProjectile(
    path: Array<{ x: number; y: number }>,
    isPlayerShot: boolean
  ): void {
    if (path.length === 0) return;

    this.isAnimating = true;
    this.projectile.setVisible(true);
    this.projectile.setFillStyle(isPlayerShot ? 0xffff00 : 0xff8800);

    let index = 0;

    const groundY = this.scale.height * 0.75;

    const event = this.time.addEvent({
      delay: 16,
      repeat: path.length - 1,
      callback: () => {
        const point = path[index];
        this.projectile.setPosition(point.x, point.y);
        index++;

        const isLast = index >= path.length;
        const hitGround = point.y >= groundY;

        // Check if projectile hit a target
        const targetStats = isPlayerShot ? this.aiStats : this.playerStats;
        const dx = Math.abs(point.x - targetStats.x);
        const dy = Math.abs(point.y - targetStats.y);
        const hitTarget = dx < 30 && dy < 40;

        if (isLast || hitGround || hitTarget) {
          event.remove();
          this.projectile.setVisible(false);
          this.isAnimating = false;

          if (hitTarget) {
            this.onProjectileImpact(point.x, point.y, isPlayerShot, targetStats);
          } else {
            // Miss — just change turn
            this.endTurn(isPlayerShot);
          }
        }
      },
    });
  }

  private onProjectileImpact(
    impactX: number,
    impactY: number,
    isPlayerShot: boolean,
    targetStats: PlayerStats
  ): void {
    const damage = this.damageCalc.calculate(
      impactX, impactY,
      targetStats.x, targetStats.y,
      this.baseDamage
    );

    if (isPlayerShot) {
      this.aiStats.hp = Math.max(0, this.aiStats.hp - damage);
      this.showDamageText(this.aiStats.x, this.aiStats.y, damage, '#ff4444');
    } else {
      this.playerStats.hp = Math.max(0, this.playerStats.hp - damage);
      this.showDamageText(this.playerStats.x, this.playerStats.y, damage, '#44aaff');
    }

    this.refreshHud();

    // Check game over
    if (this.aiStats.hp <= 0) {
      this.resultOverlay.show(this, true);
      return;
    }
    if (this.playerStats.hp <= 0) {
      this.resultOverlay.show(this, false);
      return;
    }

    this.endTurn(isPlayerShot);
  }

  private endTurn(wasPlayerShot: boolean): void {
    this.turnManager.nextTurn();
    this.windSystem.generate();
    this.refreshHud();

    if (!this.turnManager.isPlayerTurn) {
      // AI turn with 1s delay
      this.time.delayedCall(1000, () => {
        this.fireAiShot();
      });
    } else {
      // Back to player — show trajectory preview
      this.updateTrajectoryPreview();
    }
  }

  private showDamageText(x: number, y: number, damage: number, color: string): void {
    const text = this.add.text(x, y - 30, `-${damage}`, {
      fontSize: '22px',
      color,
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      duration: 900,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  // ──────────────────────────────────────────────────────────
  // HUD refresh
  // ──────────────────────────────────────────────────────────

  private refreshHud(): void {
    this.hud.update(
      this.playerStats.hp,
      this.playerStats.maxHp,
      this.aiStats.hp,
      this.aiStats.maxHp,
      this.windSystem.getCurrent(),
      this.turnManager.isPlayerTurn
    );
  }

  private onResize(): void {
    this.refreshHud();
  }

  // ──────────────────────────────────────────────────────────
  // Debug API (accessed via window['battleScene'])
  // ──────────────────────────────────────────────────────────

  setWindOverride(directionIntensity: number): void {
    const wind = this.windSystem.getCurrent();
    const direction = directionIntensity >= 0 ? 1 : -1;
    const intensity = Math.abs(directionIntensity);
    // Override via internal property access — wind system stores current
    (this.windSystem as unknown as { current: { direction: number; intensity: number } })
      .current = { direction: direction * (intensity / 100), intensity };
    this.refreshHud();
  }

  setPlayerHp(hp: number): void {
    this.playerStats.hp = Math.max(0, Math.min(this.playerStats.maxHp, hp));
    this.refreshHud();
  }

  setAiHp(hp: number): void {
    this.aiStats.hp = Math.max(0, Math.min(this.aiStats.maxHp, hp));
    this.refreshHud();
  }

  setBaseDamage(damage: number): void {
    this.baseDamage = Math.max(1, damage);
  }

  setDifficulty(d: Difficulty): void {
    this.difficulty = d;
  }

  resetBattle(): void {
    this.scene.restart();
  }
}
