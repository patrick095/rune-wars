import Phaser from 'phaser';
import { TurnManager } from '../../app/shared/game-core/turn-manager';
import { WindSystem } from '../../app/shared/game-core/wind-system';
import { ProjectilePhysics } from '../../app/shared/game-core/projectile-physics';
import { DamageCalculator } from '../../app/shared/game-core/damage-calculator';
import { AiLocal, Difficulty } from '../../app/shared/game-core/ai-local';
import { ProjectileConfig } from '../../app/shared/game-core/projectile-config';

interface BattleCharacterState {
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  isPlayer: boolean;
}
import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import { TerrainMaterial } from '../../app/shared/game-core/terrain-types';
import { TerrainRenderer } from '../terrain/terrain-renderer';
import { CharacterFall } from '../terrain/character-fall';
import { CombatHud } from '../hud/combat-hud';
import { TrajectoryIndicator } from '../ui/trajectory-indicator';
import { ResultOverlay } from '../ui/result-overlay';
import { WeaponSystem } from '../../app/shared/game-core/weapon-system';
import { WeaponDefinition } from '../../app/shared/game-core/weapon-definition';
import { ProjectileRenderer } from '../projectiles/projectile-renderer';
import { StatusEffectManager } from '../../app/shared/game-core/status-effect-manager';
import { RunicEffect, RunicEffectType, rollRunicEffect, getWeaponRunicEffect } from '../../app/shared/game-core/runic-effect-system';
import { EffectsHud } from '../hud/effects-hud';
import mapPlains from '../../app/shared/game-core/maps/map-plains.json';
import mapCastle from '../../app/shared/game-core/maps/map-castle.json';

const WEAPON_COLORS: Record<string, number> = {
  cannon:     0xFFAA00,
  longbow:    0x00FF88,
  tnt:        0xFF4400,
  boomerang:  0xFF88FF,
  'ice-book': 0x88CCFF,
  potion:     0x00FFCC,
};

type MapName = 'plains' | 'castle';

export class BattleScene extends Phaser.Scene {
  private turnManager = new TurnManager();
  private windSystem = new WindSystem();
  private projectilePhysics = new ProjectilePhysics();
  private damageCalc = new DamageCalculator();
  private ai = new AiLocal();
  private weaponSystem = new WeaponSystem();
  private statusEffects = new StatusEffectManager();

  // v0.6.0 runic effects
  private playerLuck = 10;
  private lastImpactPoint: { x: number; y: number } | null = null;

  // Control buttons references for FREEZE lock
  private _btnAngleMinus!: Phaser.GameObjects.Rectangle;
  private _btnAnglePlus!: Phaser.GameObjects.Rectangle;

  private playerStats: BattleCharacterState = { hp: 100, maxHp: 100, x: 0, y: 0, isPlayer: true };
  private aiStats: BattleCharacterState = { hp: 100, maxHp: 100, x: 0, y: 0, isPlayer: false };
  private currentAngle = 45;
  private difficulty: Difficulty = 'medium';
  private isAnimating = false;
  private currentMap: MapName = 'plains';

  // Weapon state
  private playerWeapon!: WeaponDefinition;
  private aiWeapon!: WeaponDefinition;
  private projRenderer!: ProjectileRenderer;

  // Terrain
  private terrainEngine!: TerrainEngine;
  private terrainRenderer!: TerrainRenderer;
  private playerFall = new CharacterFall();
  private aiFall = new CharacterFall();

  // Phaser objects
  private playerSprite!: Phaser.GameObjects.Rectangle;
  private aiSprite!: Phaser.GameObjects.Rectangle;
  private projectileArc!: Phaser.GameObjects.Arc;

  // HUD & UI helpers
  private hud!: CombatHud;
  private effectsHud!: EffectsHud;
  private trajectory = new TrajectoryIndicator();
  private resultOverlay = new ResultOverlay();

  // Power bar
  private _powerBarBg!: Phaser.GameObjects.Rectangle;
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
    (window as unknown as Record<string, unknown>)['battleScene'] = this; // eslint-disable-line

    // Initialize weapons
    this.playerWeapon = this.weaponSystem.getDefault();
    this.aiWeapon = this.weaponSystem.getDefault();
    this.projRenderer = new ProjectileRenderer(this);

    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Initialize terrain engine with plains map
    this.terrainEngine = new TerrainEngine(mapPlains.grid);
    this.terrainRenderer = new TerrainRenderer(this, this.terrainEngine);
    this.terrainRenderer.renderFull();

    // Position characters on terrain floor
    const playerX = 120;
    const aiX = width - 120;
    const playerFloor = this.terrainEngine.getFloorBelow(playerX, 0);
    const aiFloor = this.terrainEngine.getFloorBelow(aiX, 0);
    const fallbackY = height * 0.65;

    this.playerStats.x = playerX;
    this.playerStats.y = playerFloor !== null ? playerFloor - 30 : fallbackY;
    this.aiStats.x = aiX;
    this.aiStats.y = aiFloor !== null ? aiFloor - 30 : fallbackY;

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

    // Projectile arc managed by ProjectileRenderer
    this.projectileArc = this.projRenderer.createProjectile(
      WEAPON_COLORS[this.playerWeapon.id] ?? 0xffff00
    );

    // HUD
    this.hud = new CombatHud(this);
    this.effectsHud = new EffectsHud(this);
    this.refreshHud();

    // Controls
    this.createControls();

    // Wind generate on scene start
    this.windSystem.generate();
    this.refreshHud();

    // Handle resize
    this.scale.on('resize', this.onResize, this);
  }

  override update(_time: number, delta: number): void {
    if (!this.isAnimating) {
      // Apply fall physics to both characters each frame
      this.playerFall.update(this.playerSprite, this.terrainEngine, delta);
      this.aiFall.update(this.aiSprite, this.terrainEngine, delta);

      // Sync logical stats positions with sprites
      this.playerStats.x = this.playerSprite.x;
      this.playerStats.y = this.playerSprite.y;
      this.aiStats.x = this.aiSprite.x;
      this.aiStats.y = this.aiSprite.y;
    }

    // Update effects HUD every frame
    if (this.effectsHud) {
      this.effectsHud.update(
        this.statusEffects.getEffects('player'),
        this.statusEffects.getEffects('ai')
      );
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
    this._btnAngleMinus = this.add.rectangle(40, btnY, btnW, btnH, 0x335588).setInteractive().setDepth(15);
    this.add.text(40, btnY, 'Ang -', { fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' })
      .setOrigin(0.5).setDepth(16);

    // Angle display
    this.angleText = this.add.text(120, btnY, `${this.currentAngle}°`, {
      fontSize: '16px', color: '#ffdd44', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(16);

    // Angle + button
    this._btnAnglePlus = this.add.rectangle(200, btnY, btnW, btnH, 0x335588).setInteractive().setDepth(15);
    this.add.text(200, btnY, 'Ang +', { fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' })
      .setOrigin(0.5).setDepth(16);

    // Power bar background
    const barX = width / 2;
    const barY = height - 50;
    this._powerBarBg = this.add.rectangle(barX, barY, 200, 24, 0x222222).setDepth(15);
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
    this._btnAngleMinus.on('pointerdown', () => this.adjustAngle(-5));
    this._btnAnglePlus.on('pointerdown', () => this.adjustAngle(5));

    btnFire.on('pointerover', () => btnFire.setFillStyle(0xaa6600));
    btnFire.on('pointerout', () => btnFire.setFillStyle(0x884400));
    btnFire.on('pointerdown', () => this.startChargingPower(btnFire, btnFireText));
    btnFire.on('pointerup', () => this.releaseFire(btnFire, btnFireText));
    btnFire.on('pointerupoutside', () => this.releaseFire(btnFire, btnFireText));
  }

  private adjustAngle(delta: number): void {
    if (this.isAnimating || !this.turnManager.isPlayerTurn) return;
    // FREEZE blocks angle/force controls
    if (this.statusEffects.hasEffect('player', 'FREEZE')) return;
    this.currentAngle = Math.max(5, Math.min(175, this.currentAngle + delta));
    this.angleText.setText(`${this.currentAngle}°`);
    this.updateTrajectoryPreview();
  }

  private startChargingPower(
    btn: Phaser.GameObjects.Rectangle,
    btnText: Phaser.GameObjects.Text
  ): void {
    if (this.isAnimating || !this.turnManager.isPlayerTurn) return;
    // FREEZE blocks power charging
    if (this.statusEffects.hasEffect('player', 'FREEZE')) return;
    if (this.isChargingPower) return;

    this.isChargingPower = true;
    this.powerValue = 0;
    btn.setFillStyle(0xcc8800);
    btnText.setText('...');

    // WEAK_SHOT limits max force to 40
    const maxForce = this.statusEffects.hasEffect('player', 'WEAK_SHOT') ? 40 : 100;

    this.powerInterval = setInterval(() => {
      this.powerValue = Math.min(maxForce, this.powerValue + 2);
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

    const profile = this.playerWeapon.physicsProfile;
    const config: ProjectileConfig = {
      angle: this.currentAngle,
      force: 50, // preview with medium force
      gravityScale: profile.gravityScale,
      windInfluence: profile.windInfluence,
      baseDamage: this.playerWeapon.baseDamage,
    };

    const wind = this.windSystem.getCurrent();
    const points = this.projectilePhysics.simulate(this.playerStats.x, this.playerStats.y, config, wind);
    this.trajectory.draw(this, points);
  }

  // ──────────────────────────────────────────────────────────
  // Shooting
  // ──────────────────────────────────────────────────────────

  private firePlayerShot(angle: number, force: number): void {
    this.trajectory.clear();
    const profile = this.playerWeapon.physicsProfile;
    const config: ProjectileConfig = {
      angle,
      force,
      gravityScale: profile.gravityScale,
      windInfluence: profile.windInfluence,
      baseDamage: this.playerWeapon.baseDamage,
    };

    const wind = this.windSystem.getCurrent();
    const path = this.projectilePhysics.simulate(this.playerStats.x, this.playerStats.y, config, wind);
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

    const profile = this.aiWeapon.physicsProfile;
    const config: ProjectileConfig = {
      angle: shot.angle,
      force: shot.force,
      gravityScale: profile.gravityScale,
      windInfluence: profile.windInfluence,
      baseDamage: this.aiWeapon.baseDamage,
    };

    const path = this.projectilePhysics.simulate(this.aiStats.x, this.aiStats.y, config, wind);
    this.animateProjectile(path, false);
  }

  private animateProjectile(
    path: Array<{ x: number; y: number }>,
    isPlayerShot: boolean
  ): void {
    if (path.length === 0) return;

    this.isAnimating = true;

    const weapon = isPlayerShot ? this.playerWeapon : this.aiWeapon;
    const color = WEAPON_COLORS[weapon.id] ?? 0xffff00;
    this.projectileArc.setFillStyle(color);

    const { height } = this.scale;
    const groundY = height * 0.75;
    const excavationRadius = weapon.excavationRadius;
    const baseDamage = weapon.baseDamage;

    // Build a filtered path with early-exit detection for terrain/target/ground
    let stopIndex = path.length - 1;
    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      const terrainMat = this.terrainEngine.getMaterialAt(point.x, point.y);
      const hitTerrain = terrainMat !== TerrainMaterial.EMPTY;
      const targetStats = isPlayerShot ? this.aiStats : this.playerStats;
      const dx = Math.abs(point.x - targetStats.x);
      const dy = Math.abs(point.y - targetStats.y);
      const hitTarget = dx < 30 && dy < 40;
      const hitGround = point.y >= groundY;
      if (hitTerrain || hitTarget || hitGround) {
        stopIndex = i;
        break;
      }
    }

    const clippedPath = path.slice(0, stopIndex + 1);

    this.projRenderer.animateAlongPath(this.projectileArc, clippedPath, () => {
      this.projectileArc.setVisible(false);
      this.isAnimating = false;

      const impactPoint = clippedPath[clippedPath.length - 1];

      // Explode terrain using weapon's excavation radius
      const explodeResult = this.terrainEngine.explode(
        impactPoint.x, impactPoint.y, excavationRadius
      );
      this.terrainRenderer.updateCells(explodeResult.cellsDestroyed);

      // Check if the last point was a target hit
      const targetStats = isPlayerShot ? this.aiStats : this.playerStats;
      const dx = Math.abs(impactPoint.x - targetStats.x);
      const dy = Math.abs(impactPoint.y - targetStats.y);
      const hitTarget = dx < 30 && dy < 40;

      if (hitTarget) {
        this.onProjectileImpact(impactPoint.x, impactPoint.y, isPlayerShot, targetStats, baseDamage);
      } else {
        this.endTurn(isPlayerShot);
      }
    });
  }

  private onProjectileImpact(
    impactX: number,
    impactY: number,
    isPlayerShot: boolean,
    targetStats: BattleCharacterState,
    baseDamage: number
  ): void {
    // Track last impact point (for teleport consumable)
    this.lastImpactPoint = { x: impactX, y: impactY };

    let damage = this.damageCalc.calculate(
      impactX, impactY,
      targetStats.x, targetStats.y,
      baseDamage
    );

    const shooterId = isPlayerShot ? 'player' : 'ai';
    const targetId = isPlayerShot ? 'ai' : 'player';

    // VULNERABILITY multiplies damage received by 1.5
    if (this.statusEffects.hasEffect(targetId, 'VULNERABILITY')) {
      damage = Math.round(damage * 1.5);
    }

    if (isPlayerShot) {
      this.aiStats.hp = Math.max(0, this.aiStats.hp - damage);
      this.showDamageText(this.aiStats.x, this.aiStats.y, damage, '#ff4444');
    } else {
      this.playerStats.hp = Math.max(0, this.playerStats.hp - damage);
      this.showDamageText(this.playerStats.x, this.playerStats.y, damage, '#44aaff');
    }

    // Roll runic effect from shooter's weapon
    const shooterWeapon = isPlayerShot ? this.playerWeapon : this.aiWeapon;
    const luck = isPlayerShot ? this.playerLuck : 10;
    if (rollRunicEffect(luck)) {
      const runicEffect = getWeaponRunicEffect(shooterWeapon.id);
      if (runicEffect) {
        this.statusEffects.apply(targetId, runicEffect);
        this.showEffectFloatingText(
          isPlayerShot ? this.aiStats.x : this.playerStats.x,
          isPlayerShot ? this.aiStats.y : this.playerStats.y,
          runicEffect.type
        );

        // RANDOM_TELEPORT: move target sprite to random X position
        if (runicEffect.type === 'RANDOM_TELEPORT') {
          const { width } = this.scale;
          const newX = Phaser.Math.Between(60, width - 60);
          const targetSprite = isPlayerShot ? this.aiSprite : this.playerSprite;
          const floorY = this.terrainEngine.getFloorBelow(newX, 0);
          const newY = floorY !== null ? floorY - 30 : targetSprite.y;
          targetSprite.setPosition(newX, newY);
          if (isPlayerShot) {
            this.aiStats.x = newX;
            this.aiStats.y = newY;
          } else {
            this.playerStats.x = newX;
            this.playerStats.y = newY;
          }
        }
      }
    }

    // BLIND: hide angle display for the affected player (next turn it kicks in)
    this.updateBlindState();

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

  private endTurn(_wasPlayerShot: boolean): void {
    this.turnManager.nextTurn();
    this.windSystem.generate();

    // Tick status effects for the player whose turn is starting
    const activePlayerId = this.turnManager.isPlayerTurn ? 'player' : 'ai';
    const activeStats = this.turnManager.isPlayerTurn ? this.playerStats : this.aiStats;
    const tickResult = this.statusEffects.tick(activePlayerId, activeStats.hp, activeStats.maxHp);

    if (activeStats.hp !== tickResult.newHp) {
      const bleedDamage = activeStats.hp - tickResult.newHp;
      activeStats.hp = tickResult.newHp;
      if (bleedDamage > 0) {
        this.showDamageText(activeStats.x, activeStats.y, bleedDamage, '#ff4444');
      }
    }

    // Update BLIND state for current turn
    this.updateBlindState();
    // Update FREEZE lock state
    this.updateFreezeState();

    this.refreshHud();

    // Check game over from BLEED
    if (this.aiStats.hp <= 0) {
      this.resultOverlay.show(this, true);
      return;
    }
    if (this.playerStats.hp <= 0) {
      this.resultOverlay.show(this, false);
      return;
    }

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

  // ──────────────────────────────────────────────────────────
  // Runic effect helpers
  // ──────────────────────────────────────────────────────────

  private showEffectFloatingText(x: number, y: number, effectType: RunicEffectType): void {
    const labels: Record<RunicEffectType, string> = {
      BLEED: '💀 BLEED!',
      FREEZE: '❄ FREEZE!',
      BLIND: '🌫 BLIND!',
      WEAK_SHOT: '↓ WEAK SHOT!',
      ITEM_BLOCK: '🚫 ITEM BLOCK!',
      RANDOM_TELEPORT: '⚡ TELEPORT!',
      VULNERABILITY: '💢 VULNERABILITY!',
    };
    const colors: Record<RunicEffectType, string> = {
      BLEED: '#ff4444',
      FREEZE: '#44aaff',
      BLIND: '#ffdd44',
      WEAK_SHOT: '#ff8800',
      ITEM_BLOCK: '#888888',
      RANDOM_TELEPORT: '#cc44ff',
      VULNERABILITY: '#ff88cc',
    };
    const text = this.add.text(x, y - 50, labels[effectType] ?? effectType, {
      fontSize: '16px',
      color: colors[effectType] ?? '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(22);

    this.tweens.add({
      targets: text,
      y: y - 100,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * Hides or shows the angle text based on BLIND effect on player.
   * Called after each hit and at turn start.
   */
  private updateBlindState(): void {
    if (this.turnManager.isPlayerTurn && this.statusEffects.hasEffect('player', 'BLIND')) {
      this.angleText.setVisible(false);
    } else {
      this.angleText.setVisible(true);
    }
  }

  /**
   * Updates FREEZE lock visual state on angle buttons.
   */
  private updateFreezeState(): void {
    if (this.turnManager.isPlayerTurn && this.statusEffects.hasEffect('player', 'FREEZE')) {
      this._btnAngleMinus.setFillStyle(0x223355);
      this._btnAnglePlus.setFillStyle(0x223355);
    } else {
      this._btnAngleMinus.setFillStyle(0x335588);
      this._btnAnglePlus.setFillStyle(0x335588);
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
    const currentWeaponName = this.turnManager.isPlayerTurn
      ? this.playerWeapon?.name
      : this.aiWeapon?.name;

    this.hud.update(
      this.playerStats.hp,
      this.playerStats.maxHp,
      this.aiStats.hp,
      this.aiStats.maxHp,
      this.windSystem.getCurrent(),
      this.turnManager.isPlayerTurn,
      currentWeaponName
    );
  }

  private onResize(): void {
    this.refreshHud();
  }

  // ──────────────────────────────────────────────────────────
  // Debug API (accessed via window['battleScene'])
  // ──────────────────────────────────────────────────────────

  setWindOverride(directionIntensity: number): void {
    const direction = directionIntensity >= 0 ? 1 : -1;
    const intensity = Math.abs(directionIntensity);
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
    // Legacy API kept for compatibility — sets both weapons' base damage indirectly
    // by overriding at the weapon level would mutate shared definitions.
    // For backward compat we keep a local override applied at shoot time via
    // a stored override value.
    const override = Math.max(1, damage);
    this.playerWeapon = { ...this.playerWeapon, baseDamage: override };
    this.aiWeapon = { ...this.aiWeapon, baseDamage: override };
  }

  setDifficulty(d: Difficulty): void {
    this.difficulty = d;
  }

  // v0.4.0 weapon API
  setPlayerWeapon(id: string): void {
    const weapon = this.weaponSystem.getById(id);
    if (!weapon) return;
    this.playerWeapon = weapon;
    this.projectileArc.setFillStyle(WEAPON_COLORS[id] ?? 0xffff00);
    this.refreshHud();
  }

  setAiWeapon(id: string): void {
    const weapon = this.weaponSystem.getById(id);
    if (!weapon) return;
    this.aiWeapon = weapon;
    this.refreshHud();
  }

  resetBattle(): void {
    this.scene.restart();
  }

  // v0.3.0 terrain debug API
  debugExplode(radius = 40): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const result = this.terrainEngine.explode(centerX, centerY, radius);
    this.terrainRenderer.updateCells(result.cellsDestroyed);
  }

  resetTerrain(): void {
    const gridData = this.currentMap === 'castle' ? mapCastle.grid : mapPlains.grid;
    this.terrainEngine.loadMap(gridData);
    this.terrainRenderer.renderFull();
  }

  switchMap(mapName: MapName): void {
    this.currentMap = mapName;
    const gridData = mapName === 'castle' ? mapCastle.grid : mapPlains.grid;
    this.terrainEngine.loadMap(gridData);
    this.terrainRenderer.renderFull();

    // Re-position characters on new terrain
    const playerFloor = this.terrainEngine.getFloorBelow(this.playerSprite.x, 0);
    const aiFloor = this.terrainEngine.getFloorBelow(this.aiSprite.x, 0);
    if (playerFloor !== null) this.playerSprite.setY(playerFloor - this.playerSprite.height / 2);
    if (aiFloor !== null) this.aiSprite.setY(aiFloor - this.aiSprite.height / 2);
  }

  paintCell(worldX: number, worldY: number, material: number): void {
    this.terrainEngine.setMaterialAt(worldX, worldY, material as TerrainMaterial);
    this.terrainRenderer.renderFull();
  }

  // ──────────────────────────────────────────────────────────
  // v0.6.0 Debug API
  // ──────────────────────────────────────────────────────────

  applyDebugEffect(target: 'player' | 'ai', type: string): void {
    const validTypes: RunicEffectType[] = [
      'BLEED', 'FREEZE', 'BLIND', 'WEAK_SHOT', 'ITEM_BLOCK', 'RANDOM_TELEPORT', 'VULNERABILITY',
    ];
    if (!validTypes.includes(type as RunicEffectType)) return;
    const effect: RunicEffect = {
      type: type as RunicEffectType,
      duration: type === 'RANDOM_TELEPORT' ? 0 : 2,
      value: type === 'BLEED' ? 0.05 : undefined,
    };
    this.statusEffects.apply(target, effect);

    // If RANDOM_TELEPORT applied via debug, move sprite immediately
    if (type === 'RANDOM_TELEPORT') {
      const { width } = this.scale;
      const newX = Phaser.Math.Between(60, width - 60);
      const targetSprite = target === 'player' ? this.playerSprite : this.aiSprite;
      const floorY = this.terrainEngine.getFloorBelow(newX, 0);
      const newY = floorY !== null ? floorY - 30 : targetSprite.y;
      targetSprite.setPosition(newX, newY);
      if (target === 'player') {
        this.playerStats.x = newX; this.playerStats.y = newY;
      } else {
        this.aiStats.x = newX; this.aiStats.y = newY;
      }
    }
  }

  setPlayerLuck(luck: number): void {
    this.playerLuck = Math.max(0, Math.min(100, luck));
  }

  getActiveEffects(): { player: RunicEffect[]; ai: RunicEffect[] } {
    return {
      player: this.statusEffects.getEffects('player'),
      ai: this.statusEffects.getEffects('ai'),
    };
  }
}
