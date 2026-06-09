import Phaser from 'phaser';
import { WindSystem } from '../../app/shared/game-core/wind-system';
import { ProjectilePhysics } from '../../app/shared/game-core/projectile-physics';
import { WeaponSystem } from '../../app/shared/game-core/weapon-system';
import { WeaponDefinition } from '../../app/shared/game-core/weapon-definition';
import { ProjectileConfig } from '../../app/shared/game-core/projectile-config';
import { TrajectoryIndicator } from '../ui/trajectory-indicator';
import { TutorialVisual } from '../tutorial/tutorial-visual';
import { AcademyTarget, FIXED_TARGETS, MOVING_TARGETS } from '../targets/academy-targets';
// [v1.5.0] novos componentes integrados
import { BattleHud, BattleHudState } from '../hud/battle-hud';
import { BattleInputController } from '../input/battle-input-controller';

type AcademyMode = 'free' | 'fixed-targets' | 'moving-targets' | 'runic-training';

const WEAPON_COLORS: Record<string, number> = {
  cannon:     0xFFAA00,
  longbow:    0x00FF88,
  tnt:        0xFF4400,
  boomerang:  0xFF88FF,
  'ice-book': 0x88CCFF,
  potion:     0x00FFCC,
};

interface LiveTarget {
  sprite: Phaser.GameObjects.Rectangle;
  data: AcademyTarget;
  originX: number;
  moveDir: number;
  alive: boolean;
}

export class AcademyScene extends Phaser.Scene {
  private windSystem = new WindSystem();
  private projectilePhysics = new ProjectilePhysics();
  private weaponSystem = new WeaponSystem();
  private trajectory = new TrajectoryIndicator();
  private tutorial!: TutorialVisual;

  private currentWeapon!: WeaponDefinition;
  private currentMode: AcademyMode = 'free';

  // Player position
  private playerX = 80;
  private playerY = 0;
  private playerSprite!: Phaser.GameObjects.Rectangle;

  // Projectile
  private projectileArc!: Phaser.GameObjects.Arc;

  // Controls
  private currentAngle = 45;
  private angleText!: Phaser.GameObjects.Text;
  private powerBarFill!: Phaser.GameObjects.Rectangle;
  private powerBarLabel!: Phaser.GameObjects.Text;
  private btnFire!: Phaser.GameObjects.Rectangle;
  private btnFireText!: Phaser.GameObjects.Text;
  private isChargingPower = false;
  private powerValue = 0;
  private powerInterval: ReturnType<typeof setInterval> | null = null;
  private isAnimating = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  // [v1.5.0] BattleHud e BattleInputController — unificação de HUD/input
  private battleHud!: BattleHud;
  private battleInputController!: BattleInputController;

  // Targets
  private liveTargets: LiveTarget[] = [];

  // Hit counter (exposed publicly for Angular polling)
  hitCount = 0;
  private hitCountText!: Phaser.GameObjects.Text;

  // Wind indicator
  private windText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'AcademyScene' });
  }

  create(): void {
    // Expose for debug/Angular
    (window as unknown as Record<string, unknown>)['academyScene'] = this; // eslint-disable-line

    this.currentWeapon = this.weaponSystem.getDefault();

    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Sky gradient effect (simple colored strips)
    this.add.rectangle(width / 2, height * 0.35, width, height * 0.7, 0x0d0d2e);

    // Ground (green strip)
    const groundY = height * 0.75;
    this.add.rectangle(width / 2, groundY + (height - groundY) / 2, width, height - groundY, 0x225522);
    this.add.rectangle(width / 2, groundY, width, 4, 0x44aa44);

    // Player Y = height * 0.65 (on ground)
    this.playerY = height * 0.65;
    this.playerSprite = this.add.rectangle(this.playerX, this.playerY, 40, 60, 0x4488ff).setDepth(2);
    this.add.text(this.playerX, this.playerY + 38, 'Jogador', {
      fontSize: '11px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(3);

    // Projectile dot
    this.projectileArc = this.add.arc(0, 0, 6, 0, 360, false, 0xffff00).setVisible(false).setDepth(10);

    // HUD: hit counter top-right
    this.hitCountText = this.add.text(width - 12, 12, 'Acertos: 0', {
      fontSize: '18px', color: '#ffdd44', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(20);

    // HUD: wind indicator top-left
    this.windText = this.add.text(12, 12, '', {
      fontSize: '14px', color: '#88ccff', fontFamily: 'monospace',
    }).setOrigin(0, 0).setDepth(20);
    this.updateWindText();

    // Controls
    this.createControls();
    this.createKeyboardControls();

    // [v1.5.0] BattleHud — unified HUD entry point
    this.battleHud = new BattleHud();
    this.battleHud.create(this);

    // [v1.5.0] BattleInputController — unified keyboard input
    this.battleInputController = new BattleInputController();
    this.battleInputController.attach(this);

    // [v1.5.0] Listen to BattleInputController events
    this.events.on('consumable:use', (data: { slotIndex: number }) => {
      // Academy não usa consumíveis — reservado para expansão futura
      void data;
    });
    this.events.on('modifier:use', (data: { slotIndex: number }) => {
      // Academy não usa modificadores — reservado para expansão futura
      void data;
    });
    this.events.on('charge:start', () => {
      if (!this.isChargingPower) this.startChargingPower(this.btnFire, this.btnFireText);
    });
    this.events.on('angle:left', () => this.adjustAngle(-5));
    this.events.on('angle:right', () => this.adjustAngle(5));

    // Tutorial on first access
    this.tutorial = new TutorialVisual(this);
    if (!TutorialVisual.hasBeenSeen()) {
      this.tutorial.show();
    }

    // Handle resize
    this.scale.on('resize', this.onResize, this);
  }

  override update(_time: number, delta: number): void {
    if (!this.isAnimating) {
      this.handleKeyboardInput(delta / 1000);
    }

    // [v1.5.0] BattleHud update — sincroniza estado com HUD unificado
    if (this.battleHud) {
      const wind = this.windSystem.getCurrent();
      const hudState: BattleHudState = {
        player: { name: 'Jogador', hp: 100, maxHp: 100, stamina: 100, maxStamina: 100 },
        enemy: { name: 'Alvo', hp: 100, maxHp: 100, stamina: 100, maxStamina: 100 },
        wind: { x: wind.direction * wind.intensity, y: 0 },
        power: this.powerValue,
        angle: this.currentAngle,
        isCharging: this.isChargingPower,
        consumables: [],
        modifiers: [],
      };
      this.battleHud.update(hudState);
    }

    const dt = delta / 1000;

    for (const target of this.liveTargets) {
      if (!target.alive || !target.data.moving) continue;

      const speed = (target.data.moveSpeed ?? 80) * target.moveDir;
      target.sprite.x += speed * dt;

      const halfRange = (target.data.moveRange ?? 150) / 2;
      if (target.sprite.x > target.originX + halfRange) {
        target.sprite.x = target.originX + halfRange;
        target.moveDir = -1;
      } else if (target.sprite.x < target.originX - halfRange) {
        target.sprite.x = target.originX - halfRange;
        target.moveDir = 1;
      }
    }
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
    const btnMinus = this.add.rectangle(40, btnY, btnW, btnH, 0x335588).setInteractive().setDepth(15);
    this.add.text(40, btnY, 'Ang -', { fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' })
      .setOrigin(0.5).setDepth(16);

    // Angle display
    this.angleText = this.add.text(120, btnY, `${this.currentAngle}°`, {
      fontSize: '16px', color: '#ffdd44', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(16);

    // Angle + button
    const btnPlus = this.add.rectangle(200, btnY, btnW, btnH, 0x335588).setInteractive().setDepth(15);
    this.add.text(200, btnY, 'Ang +', { fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' })
      .setOrigin(0.5).setDepth(16);

    // Power bar
    const barX = width / 2;
    const barY = height - 50;
    this.add.rectangle(barX, barY, 200, 24, 0x222222).setDepth(15);
    this.powerBarFill = this.add.rectangle(barX - 100, barY, 0, 20, 0xff8800)
      .setOrigin(0, 0.5).setDepth(16);
    this.powerBarLabel = this.add.text(barX, barY - 16, 'Força: 0', {
      fontSize: '12px', color: '#ffaa44', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(16);

    // Fire button
    const btnFireX = width - 70;
    this.btnFire = this.add.rectangle(btnFireX, btnY, 100, btnH, 0x884400).setInteractive().setDepth(15);
    this.btnFireText = this.add.text(btnFireX, btnY, 'ATIRAR', {
      fontSize: '15px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(16);

    // Events
    btnMinus.on('pointerdown', () => this.adjustAngle(-5));
    btnPlus.on('pointerdown', () => this.adjustAngle(5));

    this.btnFire.on('pointerover', () => this.btnFire.setFillStyle(0xaa6600));
    this.btnFire.on('pointerout', () => this.btnFire.setFillStyle(0x884400));
    this.btnFire.on('pointerdown', () => this.startChargingPower(this.btnFire, this.btnFireText));
    this.btnFire.on('pointerup', () => this.releaseFire(this.btnFire, this.btnFireText));
    this.btnFire.on('pointerupoutside', () => this.releaseFire(this.btnFire, this.btnFireText));
  }

  private createKeyboardControls(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    // [v1.5.0] SPACE, LEFT e RIGHT são tratados pelo BattleInputController
    // this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    ]);

    // [v1.5.0] SPACE agora é tratado via BattleInputController → evento 'charge:start'
    // this.spaceKey.on('down', () => {
    //   if (!this.isChargingPower) this.startChargingPower(this.btnFire, this.btnFireText);
    // });
    // this.spaceKey.on('up', () => this.releaseFire(this.btnFire, this.btnFireText));

    // Manter SPACE 'up' para soltar o tiro — BattleInputController não emite 'charge:stop'
    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('up', () => this.releaseFire(this.btnFire, this.btnFireText));
  }

  private handleKeyboardInput(dt: number): void {
    if (!this.cursors || this.isAnimating) return;

    // [v1.5.0] UP/DOWN continuam aqui (controle análogo fino de ângulo)
    // LEFT/RIGHT e SPACE são geridos pelo BattleInputController via eventos
    const ANGLE_CHANGE_SPEED = 80;
    if (this.cursors.up?.isDown) {
      this.adjustAngle(ANGLE_CHANGE_SPEED * dt);
    }
    if (this.cursors.down?.isDown) {
      this.adjustAngle(-ANGLE_CHANGE_SPEED * dt);
    }
  }

  private adjustAngle(delta: number): void {
    if (this.isAnimating) return;
    this.currentAngle = Math.max(5, Math.min(175, this.currentAngle + delta));
    this.angleText.setText(`${this.currentAngle}°`);
    this.updateTrajectoryPreview();
  }

  private startChargingPower(
    btn: Phaser.GameObjects.Rectangle,
    btnText: Phaser.GameObjects.Text
  ): void {
    if (this.isAnimating || this.isChargingPower) return;

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

    if (this.powerValue < 5) return;

    this.fireShot(this.currentAngle, this.powerValue);
    this.powerValue = 0;
    this.powerBarFill.setDisplaySize(0, 20);
    this.powerBarLabel.setText('Força: 0');
  }

  // ──────────────────────────────────────────────────────────
  // Shooting
  // ──────────────────────────────────────────────────────────

  private fireShot(angle: number, force: number): void {
    this.trajectory.clear();

    const profile = this.currentWeapon.physicsProfile;
    const config: ProjectileConfig = {
      angle,
      force,
      gravityScale: profile.gravityScale,
      windInfluence: profile.windInfluence,
      baseDamage: this.currentWeapon.baseDamage,
    };

    const wind = this.windSystem.getCurrent();
    const path = this.projectilePhysics.simulate(this.playerX, this.playerY, config, wind);
    this.animateProjectile(path);
  }

  private animateProjectile(path: Array<{ x: number; y: number }>): void {
    if (path.length === 0) return;

    this.isAnimating = true;
    const color = WEAPON_COLORS[this.currentWeapon.id] ?? 0xffff00;
    this.projectileArc.setFillStyle(color).setVisible(true);

    const { height } = this.scale;
    const groundY = height * 0.75;

    // Clip path at ground or off-screen
    let stopIndex = path.length - 1;
    for (let i = 0; i < path.length; i++) {
      if (path[i].y >= groundY || path[i].x > this.scale.width + 100) {
        stopIndex = i;
        break;
      }
    }

    const clippedPath = path.slice(0, stopIndex + 1);

    // Animate along path frame by frame using timeline approach
    let frameIndex = 0;
    const step = () => {
      if (frameIndex >= clippedPath.length) {
        this.projectileArc.setVisible(false);
        this.isAnimating = false;
        this.windSystem.generate();
        this.updateWindText();
        this.updateTrajectoryPreview();
        return;
      }

      const point = clippedPath[frameIndex];
      this.projectileArc.setPosition(point.x, point.y);

      // Check target collisions
      const hit = this.checkTargetHit(point.x, point.y);
      if (hit !== null) {
        this.projectileArc.setVisible(false);
        this.isAnimating = false;
        this.destroyTarget(hit);
        this.windSystem.generate();
        this.updateWindText();
        this.updateTrajectoryPreview();
        return;
      }

      frameIndex += 2; // step 2 frames for speed
      this.time.delayedCall(16, step);
    };

    step();
  }

  private checkTargetHit(px: number, py: number): LiveTarget | null {
    for (const target of this.liveTargets) {
      if (!target.alive) continue;
      const dx = Math.abs(px - target.sprite.x);
      const dy = Math.abs(py - target.sprite.y);
      if (dx < 25 && dy < 35) {
        return target;
      }
    }
    return null;
  }

  private destroyTarget(target: LiveTarget): void {
    target.alive = false;
    this.hitCount++;
    this.hitCountText.setText(`Acertos: ${this.hitCount}`);

    // Fade out tween
    this.tweens.add({
      targets: target.sprite,
      alpha: 0,
      scaleY: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        target.sprite.destroy();
      },
    });

    // Hit flash text
    this.add.text(target.sprite.x, target.sprite.y - 30, '+1', {
      fontSize: '20px', color: '#ffff44', fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(25)
      .setDepth(25);
  }

  // ──────────────────────────────────────────────────────────
  // Trajectory preview
  // ──────────────────────────────────────────────────────────

  private updateTrajectoryPreview(): void {
    if (this.isAnimating) {
      this.trajectory.clear();
      return;
    }

    const profile = this.currentWeapon.physicsProfile;
    const config: ProjectileConfig = {
      angle: this.currentAngle,
      force: 50,
      gravityScale: profile.gravityScale,
      windInfluence: profile.windInfluence,
      baseDamage: this.currentWeapon.baseDamage,
    };

    const wind = this.windSystem.getCurrent();
    const points = this.projectilePhysics.simulate(this.playerX, this.playerY, config, wind);
    this.trajectory.draw(this, points);
  }

  // ──────────────────────────────────────────────────────────
  // Target management
  // ──────────────────────────────────────────────────────────

  private spawnTargets(): void {
    // Clear existing
    for (const t of this.liveTargets) {
      if (t.sprite && t.sprite.active) t.sprite.destroy();
    }
    this.liveTargets = [];

    const { height } = this.scale;
    const groundY = height * 0.75;

    if (this.currentMode === 'fixed-targets' || this.currentMode === 'runic-training') {
      for (const def of FIXED_TARGETS) {
        // Place targets relative to ground
        const targetY = groundY - def.height / 2 - (300 - def.y) * 0.3;
        const sprite = this.add.rectangle(def.x, targetY, def.width, def.height, 0xff8800)
          .setDepth(3);
        this.liveTargets.push({
          sprite,
          data: def,
          originX: def.x,
          moveDir: 1,
          alive: true,
        });
      }
    } else if (this.currentMode === 'moving-targets') {
      for (const def of MOVING_TARGETS) {
        const targetY = groundY - def.height / 2 - (280 - def.y) * 0.3;
        const sprite = this.add.rectangle(def.x, targetY, def.width, def.height, 0xffdd00)
          .setDepth(3);
        this.liveTargets.push({
          sprite,
          data: def,
          originX: def.x,
          moveDir: 1,
          alive: true,
        });
      }
    }
    // 'free' mode: no targets
  }

  // ──────────────────────────────────────────────────────────
  // Wind indicator
  // ──────────────────────────────────────────────────────────

  private updateWindText(): void {
    const wind = this.windSystem.getCurrent();
    const dirLabel = wind.direction >= 0 ? '→' : '←';
    this.windText.setText(`Vento: ${dirLabel} ${Math.round(Math.abs(wind.direction * wind.intensity))} u/s`);
  }

  // ──────────────────────────────────────────────────────────
  // Public API (accessed via window['academyScene'])
  // ──────────────────────────────────────────────────────────

  setMode(mode: string): void {
    this.currentMode = mode as AcademyMode;
    this.spawnTargets();
  }

  setWeapon(id: string): void {
    const weapon = this.weaponSystem.getById(id);
    if (!weapon) return;
    this.currentWeapon = weapon;
    const color = WEAPON_COLORS[id] ?? 0xffff00;
    this.projectileArc.setFillStyle(color);
    this.updateTrajectoryPreview();
  }

  resetTargets(): void {
    this.spawnTargets();
  }

  // ──────────────────────────────────────────────────────────
  // Resize handler
  // ──────────────────────────────────────────────────────────

  private onResize(): void {
    this.updateWindText();
  }
}
