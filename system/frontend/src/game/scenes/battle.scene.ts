import Phaser from 'phaser';
import { TurnManager } from '../../app/shared/game-core/turn-manager';
import { WindSystem } from '../../app/shared/game-core/wind-system';
import { ProjectilePhysics } from '../../app/shared/game-core/projectile-physics';
import { DamageCalculator } from '../../app/shared/game-core/damage-calculator';
import { Difficulty } from '../../app/shared/game-core/ai-local';
import { ProjectileConfig } from '../../app/shared/game-core/projectile-config';

interface BattleCharacterState {
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  isPlayer: boolean;
  facing: 'left' | 'right';
}
import { GRID_COLS, TerrainEngine, MapMeta } from '../../app/shared/game-core/terrain-engine';
import { CELL_SIZE, TerrainMaterial } from '../../app/shared/game-core/terrain-types';
import { tryHorizontalMove } from '../terrain/terrain-collision';
import { selectSpawns, spawnToWorld, moveSpeed, moveBudget } from '../terrain/spawn-selector';
import { MovementBudgetHUD } from '../hud/movement-budget-hud';
import { TerrainRenderer } from '../terrain/terrain-renderer';
import { CharacterFall } from '../terrain/character-fall';
import { CombatHud, LastShotInfo } from '../hud/combat-hud';
import { TrajectoryIndicator } from '../ui/trajectory-indicator';
import { ResultOverlay } from '../ui/result-overlay';
import { WeaponSystem } from '../../app/shared/game-core/weapon-system';
import { WeaponDefinition, getWeaponAngleLimits } from '../../app/shared/game-core/weapon-definition';
import { Consumable, ConsumableSystem } from '../../app/shared/game-core/consumable-system';
import { SecondaryItem, SecondaryItemSystem } from '../../app/shared/game-core/secondary-item-system';
import { ShotConfig, ShotModifierSystem } from '../../app/shared/game-core/shot-modifier-system';
import { ProjectileRenderer } from '../projectiles/projectile-renderer';
import { StatusEffectManager } from '../../app/shared/game-core/status-effect-manager';
import { RunicEffect, RunicEffectType, rollRunicEffect, getWeaponRunicEffect } from '../../app/shared/game-core/runic-effect-system';
import { EffectsHud } from '../hud/effects-hud';
import { PowerMeterHUD } from '../hud/power-meter-hud';
import { GhostTrace } from '../hud/ghost-trace';
import { ItemDock, DockItem } from '../hud/item-dock';
import mapPlains from '../../app/shared/game-core/maps/map-plains.json';
import mapCastle from '../../app/shared/game-core/maps/map-castle.json';
import mapDeepMines from '../../app/shared/game-core/maps/map-deep-mines.json';
import mapArcaneRuins from '../../app/shared/game-core/maps/map-arcane-ruins.json';
import mapRunicForest from '../../app/shared/game-core/maps/map-runic-forest.json';
import mapDungeonCaveEntrance from '../../app/shared/game-core/maps/dungeon-cave-entrance.json';
import mapDungeonCaveHall from '../../app/shared/game-core/maps/dungeon-cave-hall.json';
import mapDungeonCaveBoss from '../../app/shared/game-core/maps/dungeon-cave-boss.json';

const WEAPON_COLORS: Record<string, number> = {
  cannon:     0xFFAA00,
  longbow:    0x00FF88,
  tnt:        0xFF4400,
  boomerang:  0xFF88FF,
  'ice-book': 0x88CCFF,
  potion:     0x00FFCC,
};

export type BattleMode = 'pvp' | 'dungeon';
export type MapName =
  | 'plains'
  | 'castle'
  | 'deep_mines'
  | 'arcane_ruins'
  | 'runic_forest'
  | 'dungeon_cave_entrance'
  | 'dungeon_cave_hall'
  | 'dungeon_cave_boss';

export interface BattleMapOption {
  id: MapName;
  label: string;
  mode: BattleMode;
  grid: number[][];
}

export const BATTLE_MAPS: BattleMapOption[] = [
  { id: 'plains', label: 'Planícies', mode: 'pvp', grid: mapPlains.grid },
  { id: 'castle', label: 'Castelo', mode: 'pvp', grid: mapCastle.grid },
  { id: 'deep_mines', label: 'Minas Profundas', mode: 'pvp', grid: mapDeepMines.grid },
  { id: 'arcane_ruins', label: 'Ruínas Arcanas', mode: 'pvp', grid: mapArcaneRuins.grid },
  { id: 'runic_forest', label: 'Floresta Rúnica', mode: 'pvp', grid: mapRunicForest.grid },
  { id: 'dungeon_cave_entrance', label: 'Dungeon: Entrada da Caverna', mode: 'dungeon', grid: mapDungeonCaveEntrance.grid },
  { id: 'dungeon_cave_hall', label: 'Dungeon: Salão da Caverna', mode: 'dungeon', grid: mapDungeonCaveHall.grid },
  { id: 'dungeon_cave_boss', label: 'Dungeon: Covil do Golem', mode: 'dungeon', grid: mapDungeonCaveBoss.grid },
];

const MAP_OPTIONS_BY_ID = new Map<MapName, BattleMapOption>(BATTLE_MAPS.map(map => [map.id, map]));
const MAP_WORLD_WIDTH = GRID_COLS * CELL_SIZE;
const MIN_SHOT_POWER = 5;
const POWER_STEP = 2;
const POWER_TICK_MS = 30;
const PROJECTILE_COLLISION_RADIUS = 7;
const PLAYER_MOVE_SPEED = 180;
const ANGLE_CHANGE_SPEED = 80;
const AI_SEARCH_BY_DIFFICULTY: Record<Difficulty, { angleStep: number; forceStep: number; angleError: number; forceError: number }> = {
  easy: { angleStep: 8, forceStep: 12, angleError: 14, forceError: 14 },
  medium: { angleStep: 5, forceStep: 8, angleError: 7, forceError: 8 },
  hard: { angleStep: 3, forceStep: 5, angleError: 3, forceError: 4 },
};
const AI_REPOSITION_THRESHOLD = 70;

interface ProjectileAnimationOptions {
  projectile?: Phaser.GameObjects.Arc;
  destroyProjectileOnComplete?: boolean;
  endTurnOnComplete?: boolean;
  applyDamage?: boolean;
  explodeOnImpact?: boolean;
  turnToken?: number;
  onComplete?: (gameEnded: boolean) => void;
}

export class BattleScene extends Phaser.Scene {
  private turnManager = new TurnManager();
  private windSystem = new WindSystem();
  private projectilePhysics = new ProjectilePhysics();
  private damageCalc = new DamageCalculator();
  private weaponSystem = new WeaponSystem();
  private consumableSystem = new ConsumableSystem();
  private secondaryItemSystem = new SecondaryItemSystem();
  private shotModifierSystem = new ShotModifierSystem();
  private statusEffects = new StatusEffectManager();

  // v0.6.0 runic effects
  private playerLuck = 10;
  private lastImpactPoint: { x: number; y: number } | null = null;
  private teleportShotArmed = false;

  // v1.4.0 last-shot info for HUD display
  private lastPlayerShot: LastShotInfo | null = null;
  private lastAiShot: LastShotInfo | null = null;

  // Control buttons references for FREEZE lock
  private _btnAngleMinus!: Phaser.GameObjects.Rectangle;
  private _btnAnglePlus!: Phaser.GameObjects.Rectangle;

  // Mobile detection
  private isMobile = window.matchMedia('(pointer: coarse)').matches;

  // Hold-to-repeat timers for angle buttons
  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  private holdInterval: ReturnType<typeof setInterval> | null = null;

  // Throttle for keyboard angle keys
  private lastAngleKeyTime = 0;

  private playerStats: BattleCharacterState = { hp: 100, maxHp: 100, x: 0, y: 0, isPlayer: true, facing: 'right' };
  private aiStats: BattleCharacterState = { hp: 100, maxHp: 100, x: 0, y: 0, isPlayer: false, facing: 'left' };

  // v1.2.0 movement budget
  private playerAgility = 50;
  private moveBudgetTotal = 0;
  private moveBudgetUsed = 0;
  private movementBudgetHUD!: MovementBudgetHUD;
  private currentAngle = 45;
  private difficulty: Difficulty = 'medium';
  private isAnimating = false;
  private currentMap: MapName = 'plains';
  private battleMode: BattleMode = 'pvp';
  private playerShieldReduction = 0;
  private aiShieldReduction = 0;
  private playerInvisibleTurns = 0;
  private calibrationShotActive = false;
  private constructedByPlayer = 0;
  private playerSecondaryItemId: string | null = null;
  private aiSecondaryItemId: string | null = null;
  private activeVolleyId = 0;
  private lastEndedTurnNumber = 0;
  private scheduledTurnEvents: Phaser.Time.TimerEvent[] = [];

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
  private playerAvatar?: Phaser.GameObjects.Image;
  private aiAvatar?: Phaser.GameObjects.Image;
  private playerWeaponIcon?: Phaser.GameObjects.Image;
  private aiWeaponIcon?: Phaser.GameObjects.Image;

  // HUD & UI helpers
  private hud!: CombatHud;
  private effectsHud!: EffectsHud;
  private trajectory = new TrajectoryIndicator();
  private resultOverlay = new ResultOverlay();
  private battleMenuButton?: Phaser.GameObjects.Rectangle;
  private battleMenuButtonText?: Phaser.GameObjects.Text;
  private battleMenuPanel?: Phaser.GameObjects.Container;
  private battleMenuOpen = false;

  // Item docks (consumables + shot modifiers)
  private consumableDock!: ItemDock;
  private modifierDock!: ItemDock;

  // Power bar
  private powerMeterHUD!: PowerMeterHUD;
  private ghostTrace: GhostTrace | undefined;
  private btnFire!: Phaser.GameObjects.Rectangle;
  private btnFireText!: Phaser.GameObjects.Text;
  private isChargingPower = false;
  private powerValue = 0;
  private powerChargeStartedAt = 0;
  private powerInterval: ReturnType<typeof setInterval> | null = null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private previewRefreshMs = 0;

  // Control buttons
  private angleText!: Phaser.GameObjects.Text;

  // Map drag (pan)
  private isDraggingMap = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cameraStartScrollX = 0;
  private cameraStartScrollY = 0;
  private wasFollowing = false;

  // Set to true when started from playground (BootScene) — disables ghost trace
  private isPlayground = false;

  constructor() {
    super({ key: 'BattleScene' });
  }

  private playerRace: string = 'human';

  init(data?: { isPlayground?: boolean; mode?: BattleMode; mapName?: MapName; agility?: number; playerRace?: string }): void {
    this.isPlayground = data?.isPlayground ?? false;
    this.battleMode = data?.mode ?? 'pvp';
    this.currentMap = data?.mapName ?? (this.battleMode === 'dungeon' ? 'dungeon_cave_entrance' : 'plains');
    this.playerAgility = data?.agility ?? 50;
    this.playerRace = data?.playerRace ?? 'human';
  }

  preload(): void {
    // Terrain PNG background: only load the selected map. Each full background is several MB.
    this.preloadCurrentMapBackground();
    // Terrain tile textures (override programmatic generation when present)
    this.load.image('terrain_destructible',     'assets/terrain/destructible.png');
    this.load.image('terrain_indestructible',   'assets/terrain/indestructible.png');

    this.load.image('human_idle', 'assets/characters/human_idle.png');
    this.load.image('human_battle', 'assets/characters/human_battle.png');
    this.load.image('dwarf_idle', 'assets/characters/dwarf_idle.png');
    this.load.image('dwarf_battle', 'assets/characters/dwarf_battle.png');
    this.load.image('elf_idle', 'assets/characters/elf_idle.png');
    this.load.image('elf_battle', 'assets/characters/elf_battle.png');

    // Itens secundários
    this.load.image('secondary_shield', 'assets/items/secondary/shield.png');
    this.load.image('secondary_healing-book', 'assets/items/secondary/healing-book.png');
    this.load.image('secondary_camouflage-orb', 'assets/items/secondary/camouflage-orb.png');
    this.load.image('secondary_protection-totem', 'assets/items/secondary/protection-totem.png');
    this.load.image('secondary_runic-builder', 'assets/items/secondary/runic-builder.png');

    // Consumíveis
    this.load.image('consumable_teleport', 'assets/items/consumables/teleport.png');
    this.load.image('consumable_heal', 'assets/items/consumables/heal.png');
    this.load.image('consumable_ice-throw', 'assets/items/consumables/ice-throw.png');
    this.load.image('consumable_invisibility', 'assets/items/consumables/invisibility.png');
    this.load.image('consumable_calibration-shot', 'assets/items/consumables/calibration-shot.png');

    // Ícones de arma (inventário 48x48)
    this.load.image('weapon_cannon',    'assets/items/weapons/cannon.png');
    this.load.image('weapon_longbow',   'assets/items/weapons/longbow.png');
    this.load.image('weapon_tnt',       'assets/items/weapons/tnt.png');
    this.load.image('weapon_boomerang', 'assets/items/weapons/boomerang.png');
    this.load.image('weapon_icebook',   'assets/items/weapons/ice-book.png');
    this.load.image('weapon_potion',    'assets/items/weapons/potion.png');

    // Sprites de batalha de armas (64x64)
    this.load.image('weapon_cannon_sprite',    'assets/items/weapons/cannon_sprite.png');
    this.load.image('weapon_longbow_sprite',   'assets/items/weapons/longbow_sprite.png');
    this.load.image('weapon_tnt_sprite',       'assets/items/weapons/tnt_sprite.png');
    this.load.image('weapon_boomerang_sprite', 'assets/items/weapons/boomerang_sprite.png');
    this.load.image('weapon_icebook_sprite',   'assets/items/weapons/ice-book_sprite.png');
    this.load.image('weapon_potion_sprite',    'assets/items/weapons/potion_sprite.png');

  }

  private preloadCurrentMapBackground(): void {
    const key = this.currentMap.startsWith('dungeon') ? 'terrain_dungeon_bg' : `terrain_${this.currentMap}_bg`;
    const file = this.currentMap.startsWith('dungeon') ? 'dungeon_bg' : `${this.currentMap}_bg`;
    this.load.image(key, `assets/terrain/${file}.png`);
  }

  private resetRuntimeState(): void {
    if (this.powerInterval) {
      clearInterval(this.powerInterval);
      this.powerInterval = null;
    }
    // Clean up hold-to-repeat timers if any
    if (this.holdTimer) { clearTimeout(this.holdTimer); this.holdTimer = null; }
    if (this.holdInterval) { clearInterval(this.holdInterval); this.holdInterval = null; }

    this.turnManager = new TurnManager();
    this.windSystem = new WindSystem();
    this.projectilePhysics = new ProjectilePhysics();
    this.damageCalc = new DamageCalculator();
    this.statusEffects = new StatusEffectManager();
    this.consumableSystem = new ConsumableSystem();
    this.secondaryItemSystem = new SecondaryItemSystem();
    this.shotModifierSystem = new ShotModifierSystem();
    this.playerStats = { hp: 100, maxHp: 100, x: 0, y: 0, isPlayer: true, facing: 'right' };
    this.aiStats = { hp: 100, maxHp: 100, x: 0, y: 0, isPlayer: false, facing: 'left' };
    this.moveBudgetTotal = moveBudget(this.playerAgility);
    this.moveBudgetUsed = 0;
    this.currentAngle = 45;
    this.isAnimating = false;
    this.isChargingPower = false;
    this.powerValue = 0;
    this.lastImpactPoint = null;
    this.lastPlayerShot = null;
    this.lastAiShot = null;
    this.playerFall = new CharacterFall();
    this.aiFall = new CharacterFall();
    this.trajectory.destroy();
    this.trajectory = new TrajectoryIndicator();
    this.resultOverlay.hide();
    this.previewRefreshMs = 0;
    this.playerShieldReduction = 0;
    this.aiShieldReduction = 0;
    this.playerInvisibleTurns = 0;
    this.calibrationShotActive = false;
    this.constructedByPlayer = 0;
    this.playerSecondaryItemId = null;
    this.aiSecondaryItemId = null;
    this.activeVolleyId = 0;
    this.lastEndedTurnNumber = 0;
    this.clearScheduledTurnEvents();
  }

  create(): void {
    this.resetRuntimeState();

    // Register self globally for debug panel
    (window as unknown as Record<string, unknown>)['battleScene'] = this; // eslint-disable-line

    // Initialize weapons
    this.playerWeapon = this.weaponSystem.getDefault();
    this.aiWeapon = this.weaponSystem.getDefault();
    this.projRenderer = new ProjectileRenderer(this);

    const { width, height } = this.scale;

    const initialMap = this.getMapOption(this.currentMap);
    this.battleMode = initialMap.mode;
    this.terrainEngine = new TerrainEngine(initialMap.grid);

    // World-sized fallback behind the painted map background.
    this.add.rectangle(
      this.terrainEngine.worldWidth / 2,
      this.terrainEngine.worldHeight / 2,
      this.terrainEngine.worldWidth,
      this.terrainEngine.worldHeight,
      0x1a1a2e
    ).setDepth(-20);

    this.terrainRenderer = new TerrainRenderer(this, this.terrainEngine, this.currentMap);
    this.terrainRenderer.renderFull();

    // Camera bounds
    const worldW = this.terrainEngine.worldWidth;
    const worldH = this.terrainEngine.worldHeight;
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setZoom(0.7);

    // Position characters using spawn points from map meta if available
    const mapJson = this.getMapJsonById(this.currentMap);
    const mapMeta = mapJson?.meta as MapMeta | undefined;
    const rawSpawns = mapMeta?.spawnPoints ?? [];
    const charHeight = 60;
    const spawns = rawSpawns.length >= 2
      ? selectSpawns(rawSpawns, 2, this.terrainEngine)
      : [];

    const worldCenterY = worldH / 2;
    const fallbackPlayerX = worldW * 0.1;
    const fallbackAiX = worldW * 0.9;

    if (spawns[0]) {
      const p = spawnToWorld(spawns[0], CELL_SIZE, charHeight);
      this.playerStats.x = p.x;
      this.playerStats.y = p.y;
    } else {
      const playerFloor = this.terrainEngine.getFloorBelow(fallbackPlayerX, worldCenterY);
      this.playerStats.x = fallbackPlayerX;
      this.playerStats.y = playerFloor !== null ? playerFloor - 30 : worldCenterY;
    }

    if (spawns[1]) {
      const a = spawnToWorld(spawns[1], CELL_SIZE, charHeight);
      this.aiStats.x = a.x;
      this.aiStats.y = a.y;
    } else {
      const aiFloor = this.terrainEngine.getFloorBelow(fallbackAiX, worldCenterY);
      this.aiStats.x = fallbackAiX;
      this.aiStats.y = aiFloor !== null ? aiFloor - 30 : worldCenterY;
    }

    this.playerStats.facing = 'right';
    this.aiStats.facing = 'left';

    // Player sprite (blue)
    this.playerSprite = this.add.rectangle(
      this.playerStats.x, this.playerStats.y, 40, 60, 0x4488ff
    ).setDepth(2).setAlpha(0.18);
    this.playerAvatar = this.add.image(this.playerStats.x, this.playerStats.y, `${this.playerRace}_battle`)
      .setDisplaySize(58, 72)
      .setDepth(3);
    this.playerWeaponIcon = this.add.image(this.playerStats.x + 34, this.playerStats.y + 2, this.weaponSpriteKey(this.playerWeapon.id))
      .setDisplaySize(34, 34)
      .setDepth(4);
    this.add.text(this.playerStats.x, this.playerStats.y + 40, 'Jogador', {
      fontSize: '11px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(5);

    // AI sprite (red)
    this.aiSprite = this.add.rectangle(
      this.aiStats.x, this.aiStats.y, 40, 60, 0xff4444
    ).setDepth(2).setAlpha(0.18);
    this.aiAvatar = this.add.image(this.aiStats.x, this.aiStats.y, this.battleMode === 'dungeon' ? 'dwarf_battle' : 'elf_battle')
      .setDisplaySize(58, 72)
      .setFlipX(true)
      .setTint(this.battleMode === 'dungeon' ? 0xffcc88 : 0xffffff)
      .setDepth(3);
    this.aiWeaponIcon = this.add.image(this.aiStats.x - 34, this.aiStats.y + 2, this.weaponSpriteKey(this.aiWeapon.id))
      .setDisplaySize(34, 34)
      .setDepth(4);
    this.add.text(this.aiStats.x, this.aiStats.y + 40, 'Inimigo', {
      fontSize: '11px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(5);

    // Projectile arc managed by ProjectileRenderer
    this.projectileArc = this.projRenderer.createProjectile(
      WEAPON_COLORS[this.playerWeapon.id] ?? 0xffff00
    );

    // HUD
    this.hud = new CombatHud(this);
    this.effectsHud = new EffectsHud(this);
    this.refreshHud();

    // Ghost trace: only in real battles (not playground)
    if (!this.isPlayground) {
      this.ghostTrace = new GhostTrace(this);
    }

    // Camera follows player
    this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);

    // Movement budget HUD
    this.movementBudgetHUD = new MovementBudgetHUD(this, width / 2, height - 80);
    this.moveBudgetTotal = moveBudget(this.playerAgility);
    this.moveBudgetUsed = 0;
    this.movementBudgetHUD.update(0, this.moveBudgetTotal);

    // Controls
    this.createControls();
    this.createKeyboardControls();

    // Item docks (fixed in bottom bar, player turn only)
    this.createItemDocks();
    this.createBattleMenu();

    // Wind generate on scene start
    this.windSystem.generate();
    this.refreshHud();
    this.updateTrajectoryPreview();

    // Map drag (pan with mouse/touch)
    this.setupMapDrag();

    // Handle resize
    this.scale.on('resize', this.onResize, this);
  }

  override update(_time: number, delta: number): void {
    if (!this.isAnimating) {
      this.handleKeyboardInput(delta);

      const playerFallState = this.playerFall.update(this.playerSprite, this.terrainEngine, delta);
      const aiFallState = this.aiFall.update(this.aiSprite, this.terrainEngine, delta);

      if (playerFallState === 'dead' && this.playerStats.hp > 0) {
        this.playerStats.hp = 0;
        this.finishBattle(false);
        return;
      }
      if (aiFallState === 'dead' && this.aiStats.hp > 0) {
        this.aiStats.hp = 0;
        this.finishBattle(true);
        return;
      }

      this.playerStats.x = this.playerSprite.x;
      this.playerStats.y = this.playerSprite.y;
      this.aiStats.x = this.aiSprite.x;
      this.aiStats.y = this.aiSprite.y;
      this.syncActorAssets();
    }

    this.previewRefreshMs += delta;
    if (this.turnManager.isPlayerTurn && !this.isAnimating && this.previewRefreshMs >= 120) {
      this.previewRefreshMs = 0;
      this.updateTrajectoryPreview();
    }

    // Update effects HUD every frame
    if (this.effectsHud) {
      this.effectsHud.update(
        this.statusEffects.getEffects('player'),
        this.statusEffects.getEffects('ai')
      );
    }
  }

  private syncActorAssets(): void {
    this.playerAvatar?.setPosition(this.playerSprite.x, this.playerSprite.y);
    this.aiAvatar?.setPosition(this.aiSprite.x, this.aiSprite.y);
    this.playerWeaponIcon?.setPosition(this.playerSprite.x + 34, this.playerSprite.y + 2);
    this.aiWeaponIcon?.setPosition(this.aiSprite.x - 34, this.aiSprite.y + 2);
    this.playerAvatar?.setAlpha(this.playerInvisibleTurns > 0 ? 0.38 : 1);
  }

  private weaponSpriteKey(id: string): string {
    if (id === 'ice-book') return 'weapon_icebook_sprite';
    return `weapon_${id}_sprite`;
  }

  // ──────────────────────────────────────────────────────────
  // Controls
  // ──────────────────────────────────────────────────────────

  private createControls(): void {
    const { width, height } = this.scale;
    const btnY = height - 50;
    const btnH = 44;

    if (this.isMobile) {
      // Mobile: larger ergonomic angle buttons (72×72) in bottom-left area
      const mobileBtnSize = 72;
      const mobileBtnMinusX = 44;
      const mobileBtnPlusX = 126;
      const mobileBtnY = height - 50;

      // Angle - button (mobile)
      this._btnAngleMinus = this.add.rectangle(mobileBtnMinusX, mobileBtnY, mobileBtnSize, mobileBtnSize, 0x335588)
        .setInteractive().setDepth(20).setScrollFactor(0);
      this.add.text(mobileBtnMinusX, mobileBtnY, '◀', { fontSize: '26px', color: '#ffffff', fontFamily: 'monospace' })
        .setOrigin(0.5).setDepth(21).setScrollFactor(0);

      // Angle display (centered between the two buttons, above them)
      const angleDisplayX = (mobileBtnMinusX + mobileBtnPlusX) / 2;
      this.angleText = this.add.text(angleDisplayX, mobileBtnY - mobileBtnSize / 2 - 12, `${this.currentAngle}°`, {
        fontSize: '16px', color: '#ffdd44', fontFamily: 'monospace',
      }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

      // Angle + button (mobile)
      this._btnAnglePlus = this.add.rectangle(mobileBtnPlusX, mobileBtnY, mobileBtnSize, mobileBtnSize, 0x335588)
        .setInteractive().setDepth(20).setScrollFactor(0);
      this.add.text(mobileBtnPlusX, mobileBtnY, '▶', { fontSize: '26px', color: '#ffffff', fontFamily: 'monospace' })
        .setOrigin(0.5).setDepth(21).setScrollFactor(0);

      // Mobile angle button events with hold-to-repeat and visual feedback
      this._btnAngleMinus.on('pointerdown', () => {
        this._btnAngleMinus.setAlpha(0.7);
        this.onAngleButtonDown(-1);
      });
      this._btnAngleMinus.on('pointerup', () => {
        this._btnAngleMinus.setAlpha(1.0);
        this.onAngleButtonUp();
      });
      this._btnAngleMinus.on('pointerout', () => {
        this._btnAngleMinus.setAlpha(1.0);
        this.onAngleButtonUp();
      });

      this._btnAnglePlus.on('pointerdown', () => {
        this._btnAnglePlus.setAlpha(0.7);
        this.onAngleButtonDown(1);
      });
      this._btnAnglePlus.on('pointerup', () => {
        this._btnAnglePlus.setAlpha(1.0);
        this.onAngleButtonUp();
      });
      this._btnAnglePlus.on('pointerout', () => {
        this._btnAnglePlus.setAlpha(1.0);
        this.onAngleButtonUp();
      });
    } else {
      // Desktop: original compact angle buttons
      const btnW = 70;

      // Angle - button
      this._btnAngleMinus = this.add.rectangle(40, btnY, btnW, btnH, 0x335588).setInteractive().setDepth(15).setScrollFactor(0);
      this.add.text(40, btnY, 'Ang -', { fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' })
        .setOrigin(0.5).setDepth(16).setScrollFactor(0);

      // Angle display
      this.angleText = this.add.text(120, btnY, `${this.currentAngle}°`, {
        fontSize: '16px', color: '#ffdd44', fontFamily: 'monospace',
      }).setOrigin(0.5).setDepth(16).setScrollFactor(0);

      // Angle + button
      this._btnAnglePlus = this.add.rectangle(200, btnY, btnW, btnH, 0x335588).setInteractive().setDepth(15).setScrollFactor(0);
      this.add.text(200, btnY, 'Ang +', { fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' })
        .setOrigin(0.5).setDepth(16).setScrollFactor(0);

      // Desktop angle button events (simple click)
      this._btnAngleMinus.on('pointerdown', () => this.changeAngle(-5));
      this._btnAnglePlus.on('pointerdown', () => this.changeAngle(5));
    }

    // Power bar (Phaser-native, updates in real time during mousedown)
    const barX = width / 2;
    const barY = height - 50;
    this.powerMeterHUD = new PowerMeterHUD(this, barX, barY);

    // Fire button
    const btnFireX = width - 70;
    this.btnFire = this.add.rectangle(btnFireX, btnY, 100, btnH, 0x884400).setInteractive().setDepth(15).setScrollFactor(0);
    this.btnFireText = this.add.text(btnFireX, btnY, 'ATIRAR', {
      fontSize: '15px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(16).setScrollFactor(0);

    this.btnFire.on('pointerover', () => this.btnFire.setFillStyle(0xaa6600));
    this.btnFire.on('pointerout', () => this.btnFire.setFillStyle(0x884400));
    this.btnFire.on('pointerdown', () => this.startChargingPower(this.btnFire, this.btnFireText));
    this.btnFire.on('pointerup', () => this.releaseFire(this.btnFire, this.btnFireText));
    this.btnFire.on('pointerupoutside', () => this.releaseFire(this.btnFire, this.btnFireText));
  }

  private createBattleMenu(): void {
    const { width } = this.scale;
    const x = width - 32;
    const y = 40;

    this.battleMenuButton = this.add.rectangle(x, y, 42, 34, 0x1f2937, 0.92)
      .setStrokeStyle(1, 0x7dd3fc, 0.8)
      .setInteractive()
      .setDepth(30)
      .setScrollFactor(0);
    this.battleMenuButtonText = this.add.text(x, y - 1, 'Menu', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(31).setScrollFactor(0);

    this.battleMenuButton.on('pointerover', () => this.battleMenuButton?.setFillStyle(0x334155, 0.96));
    this.battleMenuButton.on('pointerout', () => this.battleMenuButton?.setFillStyle(0x1f2937, 0.92));
    this.battleMenuButton.on('pointerdown', () => this.toggleBattleMenu());

    this.layoutBattleMenuButton();
  }

  private toggleBattleMenu(force?: boolean): void {
    const nextOpen = force ?? !this.battleMenuOpen;
    this.battleMenuOpen = nextOpen;

    if (!nextOpen) {
      this.battleMenuPanel?.destroy(true);
      this.battleMenuPanel = undefined;
      return;
    }

    this.battleMenuPanel?.destroy(true);

    const { width } = this.scale;
    const panelWidth = 156;
    const panelX = width - panelWidth - 16;
    const panelY = 64;

    const bg = this.add.rectangle(0, 0, panelWidth, 112, 0x111827, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x7dd3fc, 0.75);
    const surrenderBtn = this.add.rectangle(12, 14, panelWidth - 24, 36, 0x7f1d1d, 0.95)
      .setOrigin(0, 0)
      .setInteractive();
    const surrenderText = this.add.text(panelWidth / 2, 32, 'Desistir', {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const exitBtn = this.add.rectangle(12, 62, panelWidth - 24, 36, 0x334155, 0.95)
      .setOrigin(0, 0)
      .setInteractive();
    const exitText = this.add.text(panelWidth / 2, 80, 'Sair', {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    surrenderBtn.on('pointerover', () => surrenderBtn.setFillStyle(0x991b1b, 0.98));
    surrenderBtn.on('pointerout', () => surrenderBtn.setFillStyle(0x7f1d1d, 0.95));
    surrenderBtn.on('pointerdown', () => this.surrenderBattle());
    exitBtn.on('pointerover', () => exitBtn.setFillStyle(0x475569, 0.98));
    exitBtn.on('pointerout', () => exitBtn.setFillStyle(0x334155, 0.95));
    exitBtn.on('pointerdown', () => this.exitBattle());

    this.battleMenuPanel = this.add.container(panelX, panelY, [
      bg,
      surrenderBtn,
      surrenderText,
      exitBtn,
      exitText,
    ]).setDepth(30).setScrollFactor(0);
  }

  private layoutBattleMenuButton(): void {
    const { width } = this.scale;
    const x = width - 32;
    this.battleMenuButton?.setPosition(x, 40);
    this.battleMenuButtonText?.setPosition(x, 39);
    if (this.battleMenuOpen) {
      this.toggleBattleMenu(true);
    }
  }

  private surrenderBattle(): void {
    this.toggleBattleMenu(false);
    this.isChargingPower = false;
    if (this.powerInterval) {
      clearInterval(this.powerInterval);
      this.powerInterval = null;
    }
    this.isAnimating = true;
    this.finishBattle(false);
  }

  private exitBattle(): void {
    window.dispatchEvent(new CustomEvent('rune-wars:battle-exit'));
  }

  private finishBattle(victory: boolean): void {
    this.toggleBattleMenu(false);
    this.isAnimating = true;
    this.resultOverlay.show(this, victory, {
      showRestartButton: this.isPlayground,
      subtitle: this.isPlayground ? undefined : 'Voltando para a sala...',
    });

    if (!this.isPlayground) {
      this.time.delayedCall(1600, () => {
        window.dispatchEvent(new CustomEvent('rune-wars:battle-finished', { detail: { victory } }));
      });
    }
  }

  private changeAngle(delta: number): void {
    if (this.isAnimating || !this.turnManager.isPlayerTurn) return;
    if (this.statusEffects.hasEffect('player', 'FREEZE')) return;
    const limits = getWeaponAngleLimits(this.playerWeapon?.id ?? 'default');
    this.currentAngle = Math.round(Math.max(limits.minAngle, Math.min(limits.maxAngle, this.currentAngle + delta)));
    this.updateAngleDisplay();
    this.updateTrajectoryPreview();
  }

  private onAngleButtonDown(delta: 1 | -1): void {
    this.changeAngle(delta);
    this.holdTimer = setTimeout(() => {
      this.holdInterval = setInterval(() => this.changeAngle(delta), 80);
    }, 400);
  }

  private onAngleButtonUp(): void {
    if (this.holdTimer) { clearTimeout(this.holdTimer); this.holdTimer = null; }
    if (this.holdInterval) { clearInterval(this.holdInterval); this.holdInterval = null; }
  }

  private handleAngleKey(delta: 1 | -1): void {
    const now = Date.now();
    if (now - this.lastAngleKeyTime < 100) return;
    this.lastAngleKeyTime = now;
    this.changeAngle(delta);
  }

  private createKeyboardControls(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    ]);

    this.spaceKey.on('down', () => {
      if (!this.isChargingPower) this.startChargingPower(this.btnFire, this.btnFireText);
    });
    this.spaceKey.on('up', () => this.releaseFire(this.btnFire, this.btnFireText));
  }

  private createItemDocks(): void {
    const { width, height } = this.scale;

    // Consumable dock — bottom-left area (below movement bar, above edge)
    const consumableItems = this.buildConsumableDockItems();
    const consumableDockX = 80;
    const consumableDockY = height - 110;
    this.consumableDock = new ItemDock(
      this,
      consumableDockX,
      consumableDockY,
      consumableItems,
      (id) => this.onConsumableDockSelect(id)
    );

    // Shot modifier dock — bottom-right area
    const modifierItems = this.buildModifierDockItems();
    const modifierDockX = width - 180;
    const modifierDockY = height - 110;
    this.modifierDock = new ItemDock(
      this,
      modifierDockX,
      modifierDockY,
      modifierItems,
      (id) => this.onModifierDockSelect(id)
    );
  }

  private buildConsumableDockItems(): DockItem[] {
    return this.consumableSystem.getAll().map((c) => ({
      id: c.id,
      label: c.name,
      iconKey: this.textures.exists(`consumable_${c.id}`) ? `consumable_${c.id}` : undefined,
    }));
  }

  private buildModifierDockItems(): DockItem[] {
    const modifierDefs: Array<{ id: string; label: string }> = [
      { id: 'shot_plus1',      label: '+1 Tiro' },
      { id: 'shot_x3',         label: 'x3 Tiros' },
      { id: 'shot_damage_2x',  label: 'Dano x2' },
      { id: 'shot_dig_2x',     label: 'Escav x2' },
    ];
    const activeId = this.shotModifierSystem.getActive();
    return modifierDefs.map((m) => ({
      id: m.id,
      label: m.label,
      active: m.id === activeId,
    }));
  }

  private onConsumableDockSelect(id: string): void {
    if (!this.turnManager.isPlayerTurn || this.isAnimating) return;
    if (this.statusEffects.hasEffect('player', 'ITEM_BLOCK')) return;
    this.useDebugConsumable('player', id);
  }

  private onModifierDockSelect(id: string): void {
    if (!this.turnManager.isPlayerTurn || this.isAnimating) return;
    if (this.statusEffects.hasEffect('player', 'ITEM_BLOCK')) return;
    this.shotModifierSystem.activate(id as import('../../app/shared/game-core/shot-modifier-system').ShotModifierType);
    // Refresh dock to reflect new active state
    this.modifierDock.refresh(this.buildModifierDockItems());
  }

  private setupMapDrag(): void {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.button === 0 || p.wasTouch) {
        this.isDraggingMap = true;
        this.dragStartX = p.x;
        this.dragStartY = p.y;
        this.cameraStartScrollX = this.cameras.main.scrollX;
        this.cameraStartScrollY = this.cameras.main.scrollY;
        // Suspender follow se estiver ativo
        if ((this.cameras.main as any)._follow) { // eslint-disable-line @typescript-eslint/no-explicit-any
          this.wasFollowing = true;
          this.cameras.main.stopFollow();
        }
      }
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.isDraggingMap || !p.isDown) return;
      const dx = this.dragStartX - p.x;
      const dy = this.dragStartY - p.y;
      this.cameras.main.setScroll(
        this.cameraStartScrollX + dx,
        this.cameraStartScrollY + dy
      );
    });
    this.input.on('pointerup', () => {
      if (this.isDraggingMap && this.wasFollowing) {
        // Retomar follow no sprite correto baseado no turno atual
        const followTarget = this.turnManager.isPlayerTurn ? this.playerSprite : this.aiSprite;
        this.cameras.main.startFollow(followTarget, true, 0.08, 0.08);
      }
      this.isDraggingMap = false;
      this.wasFollowing = false;
    });
  }

  private handleKeyboardInput(delta: number): void {
    if (!this.cursors || !this.turnManager.isPlayerTurn || this.isAnimating) return;
    const dt = delta / 1000;
    const speed = moveSpeed(this.playerAgility);
    let changed = false;

    if (this.cursors.left?.isDown) {
      this.movePlayer(-speed * dt);
      changed = true;
    }
    if (this.cursors.right?.isDown) {
      this.movePlayer(speed * dt);
      changed = true;
    }
    if (this.cursors.up?.isDown) {
      this.handleAngleKey(1);
      changed = true;
    }
    if (this.cursors.down?.isDown) {
      this.handleAngleKey(-1);
      changed = true;
    }

    if (changed) this.updateTrajectoryPreview();
  }

  private getWorldAngle(angle: number): number {
    return this.playerStats.facing === 'right' ? angle : 180 - angle;
  }

  private updateAngleDisplay(): void {
    if (!this.angleText) return;
    const prefix = this.playerStats.facing === 'left' ? '← ' : '';
    const suffix = this.playerStats.facing === 'right' ? ' →' : '';
    this.angleText.setText(`${prefix}${this.currentAngle}°${suffix}`);
  }

  private adjustAngle(delta: number): void {
    this.changeAngle(delta);
  }

  private clampCurrentAngleForWeapon(): void {
    const limits = getWeaponAngleLimits(this.playerWeapon?.id ?? 'default');
    const nextAngle = Math.round(Math.max(limits.minAngle, Math.min(limits.maxAngle, this.currentAngle)));
    if (nextAngle === this.currentAngle) return;
    this.currentAngle = nextAngle;
    this.updateAngleDisplay();
    this.updateTrajectoryPreview();
  }

  private movePlayer(deltaX: number): void {
    if (this.statusEffects.hasEffect('player', 'FREEZE')) return;

    const remaining = this.moveBudgetTotal - this.moveBudgetUsed;
    if (remaining <= 0) return;

    const cappedDelta = Math.sign(deltaX) * Math.min(Math.abs(deltaX), remaining);
    const result = tryHorizontalMove(
      this.playerSprite.x,
      this.playerSprite.y,
      cappedDelta,
      this.terrainEngine
    );

    if (!result.canMove) return;

    const newFacing: 'left' | 'right' = deltaX > 0 ? 'right' : 'left';
    if (newFacing !== this.playerStats.facing) {
      this.playerStats.facing = newFacing;
      this.playerAvatar?.setFlipX(newFacing === 'left');
      this.updateAngleDisplay();
    }

    this.playerSprite.setPosition(result.newX, result.newY);
    this.moveBudgetUsed += Math.abs(cappedDelta);
    this.movementBudgetHUD.update(this.moveBudgetUsed, this.moveBudgetTotal);

    this.playerStats.x = result.newX;
    this.playerStats.y = result.newY;
    this.syncActorAssets();
  }

  private clampInitialX(mapX: number, viewportWidth: number): number {
    const minX = 72;
    const maxMapX = MAP_WORLD_WIDTH - 72;
    const maxVisibleX = Math.max(minX, viewportWidth - 72);
    return Math.max(minX, Math.min(mapX, maxMapX, maxVisibleX));
  }

  private startChargingPower(
    btn: Phaser.GameObjects.Rectangle,
    btnText: Phaser.GameObjects.Text
  ): void {
    if (this.playerFall.isFalling) return;
    if (this.isAnimating || !this.turnManager.isPlayerTurn) return;
    // FREEZE blocks power charging
    if (this.statusEffects.hasEffect('player', 'FREEZE')) return;
    if (this.isChargingPower) return;

    this.isChargingPower = true;
    this.powerChargeStartedAt = this.time.now;
    this.powerValue = MIN_SHOT_POWER;
    this.powerMeterHUD.update(this.powerValue);
    btn.setFillStyle(0xcc8800);
    btnText.setText('...');

    // WEAK_SHOT limits max force to 40
    const maxForce = this.statusEffects.hasEffect('player', 'WEAK_SHOT') ? 40 : 100;

    this.powerInterval = setInterval(() => {
      const elapsedTicks = Math.max(0, Math.floor((this.time.now - this.powerChargeStartedAt) / POWER_TICK_MS));
      this.powerValue = Math.min(maxForce, MIN_SHOT_POWER + elapsedTicks * POWER_STEP);
      this.powerMeterHUD.update(this.powerValue);
    }, POWER_TICK_MS);
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

    // Pointer/touch release can happen before the first interval tick.
    const maxForce = this.statusEffects.hasEffect('player', 'WEAK_SHOT') ? 40 : 100;
    const elapsedTicks = Math.max(0, Math.floor((this.time.now - this.powerChargeStartedAt) / POWER_TICK_MS));
    this.powerValue = Math.min(maxForce, Math.max(this.powerValue, MIN_SHOT_POWER + elapsedTicks * POWER_STEP));

    if (this.powerValue < MIN_SHOT_POWER) return; // too low, ignore

    const shotPower = this.powerValue;
    this.firePlayerShot(this.currentAngle, shotPower);
    this.powerMeterHUD.recordShot(shotPower);
    this.powerValue = 0;
    this.powerMeterHUD.update(0);
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
      angle: this.getWorldAngle(this.currentAngle),
      force: this.calibrationShotActive ? 75 : 50,
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

  private buildWindStr(): string {
    const wind = this.windSystem.getCurrent();
    const windDir = wind.direction >= 0 ? '→' : '←';
    const windIntensity = Math.round(Math.abs(wind.direction * wind.intensity));
    return `${windDir}${windIntensity}`;
  }

  private firePlayerShot(angle: number, force: number): void {
    this.trajectory.clear();
    const profile = this.playerWeapon.physicsProfile;
    const wind = this.windSystem.getCurrent();

    this.lastPlayerShot = { playerLabel: 'Jogador', force, windStr: this.buildWindStr() };

    const { shots, delayedShots } = this.shotModifierSystem.resolve(
      this.getWorldAngle(angle),
      force,
      this.playerWeapon
    );
    this.shotModifierSystem.consumeAll();

    this.firePlayerShotVolley([...shots, ...delayedShots], profile, wind);
  }

  private firePlayerShotVolley(
    shots: ShotConfig[],
    profile: WeaponDefinition['physicsProfile'],
    wind: ReturnType<WindSystem['getCurrent']>
  ): void {
    if (shots.length === 0) return;

    const volleyId = ++this.activeVolleyId;
    const turnToken = this.turnManager.turnNumber;
    let pending = shots.length;
    let gameEnded = false;

    const completeShot = (ended: boolean): void => {
      if (volleyId !== this.activeVolleyId || this.turnManager.turnNumber !== turnToken) return;
      gameEnded = gameEnded || ended;
      pending -= 1;
      if (pending > 0) {
        this.isAnimating = true;
        return;
      }
      if (gameEnded) return;
      this.endTurn(true);
    };

    for (const shotCfg of shots) {
      const launch = () => {
        if (volleyId !== this.activeVolleyId || this.turnManager.turnNumber !== turnToken || !this.turnManager.isPlayerTurn) {
          completeShot(true);
          return;
        }
        this.launchPlayerVolleyProjectile(shotCfg, shots.length, profile, wind, turnToken, completeShot);
      };
      if (shotCfg.delayMs && shotCfg.delayMs > 0) {
        this.scheduleTurnEvent(shotCfg.delayMs, launch);
      } else {
        launch();
      }
    }
  }

  private launchPlayerVolleyProjectile(
    shotCfg: ShotConfig,
    volleySize: number,
    profile: WeaponDefinition['physicsProfile'],
    wind: ReturnType<WindSystem['getCurrent']>,
    turnToken: number,
    completeShot: (gameEnded: boolean) => void
  ): void {
      const config: ProjectileConfig = {
        angle: shotCfg.angle,
        force: shotCfg.force,
        gravityScale: profile.gravityScale,
        windInfluence: profile.windInfluence,
        baseDamage: shotCfg.baseDamage ?? this.playerWeapon.baseDamage,
      };
      const path = this.projectilePhysics.simulate(this.playerStats.x, this.playerStats.y, config, wind);
      this.maybeBuildRunicTerrain(path, 'player');

      const projectile = volleySize === 1
        ? this.projectileArc
        : this.projRenderer.createProjectile(WEAPON_COLORS[this.playerWeapon.id] ?? 0xffff00);

      this.animateProjectileWithOverrides(path, true, shotCfg.baseDamage, shotCfg.excavationRadius, {
        projectile,
        destroyProjectileOnComplete: volleySize > 1,
        endTurnOnComplete: false,
        turnToken,
        onComplete: completeShot,
      });
  }

  private fireAiShot(turnToken = this.turnManager.turnNumber): void {
    if (this.turnManager.isPlayerTurn || this.turnManager.turnNumber !== turnToken) return;

    const wind = this.windSystem.getCurrent();
    const shot = this.calculateAiShot();
    if (this.playerInvisibleTurns > 0) {
      this.scheduleTurnEvent(350, () => {
        if (!this.turnManager.isPlayerTurn && this.turnManager.turnNumber === turnToken) {
          this.endTurn(false);
        }
      });
      return;
    }
    if (shot.score > AI_REPOSITION_THRESHOLD && this.tryRepositionAi()) {
      this.scheduleTurnEvent(350, () => {
        if (!this.turnManager.isPlayerTurn && this.turnManager.turnNumber === turnToken) {
          this.endTurn(false);
        }
      });
      return;
    }

    const profile = this.aiWeapon.physicsProfile;
    const config: ProjectileConfig = {
      angle: shot.angle,
      force: shot.force,
      gravityScale: profile.gravityScale,
      windInfluence: profile.windInfluence,
      baseDamage: this.aiWeapon.baseDamage,
    };

    this.lastAiShot = { playerLabel: 'IA', force: shot.force, windStr: this.buildWindStr() };

    const path = this.projectilePhysics.simulate(this.aiStats.x, this.aiStats.y, config, wind);
    this.maybeBuildRunicTerrain(path, 'ai');
    this.animateProjectileResolved(path, false, this.aiWeapon.baseDamage, this.aiWeapon.excavationRadius, { turnToken });
  }

  private maybeBuildRunicTerrain(path: Array<{ x: number; y: number }>, playerId: 'player' | 'ai'): void {
    if (!this.secondaryItemSystem.isRunicBuilderActive(playerId)) return;
    const created = this.terrainEngine.drawRunicLine(path.slice(0, 18), playerId);
    this.secondaryItemSystem.consumeRunicBuilder(playerId);
    this.constructedByPlayer = this.terrainEngine.getConstructedCount('player');
    if (created > 0) this.terrainRenderer.renderFull();
  }

  private animateProjectile(
    path: Array<{ x: number; y: number }>,
    isPlayerShot: boolean
  ): void {
    const weapon = isPlayerShot ? this.playerWeapon : this.aiWeapon;
    this.animateProjectileResolved(path, isPlayerShot, weapon.baseDamage, weapon.excavationRadius);
  }

  /**
   * Fires a projectile with optional baseDamage and excavationRadius overrides
   * (used by ShotModifierSystem for modifiers like shot_damage_2x and shot_dig_2x).
   * Falls back to the weapon's own values when overrides are undefined.
   */
  private animateProjectileWithOverrides(
    path: Array<{ x: number; y: number }>,
    isPlayerShot: boolean,
    baseDamageOverride?: number,
    excavationRadiusOverride?: number,
    options: ProjectileAnimationOptions = {}
  ): void {
    if (path.length === 0) return;

    const weapon = isPlayerShot ? this.playerWeapon : this.aiWeapon;
    this.animateProjectileResolved(
      path,
      isPlayerShot,
      baseDamageOverride ?? weapon.baseDamage,
      excavationRadiusOverride ?? weapon.excavationRadius,
      options
    );
  }

  private animateProjectileResolved(
    path: Array<{ x: number; y: number }>,
    isPlayerShot: boolean,
    baseDamage: number,
    excavationRadius: number,
    options: ProjectileAnimationOptions = {}
  ): void {
    if (path.length === 0) return;

    this.isAnimating = true;

    const weapon = isPlayerShot ? this.playerWeapon : this.aiWeapon;
    const color = WEAPON_COLORS[weapon.id] ?? 0xffff00;
    const projectile = options.projectile ?? this.projectileArc;
    const turnToken = options.turnToken ?? this.turnManager.turnNumber;
    const clipped = this.clipPathToFirstImpact(path, isPlayerShot);
    const animationPath = clipped.path;
    projectile.setFillStyle(color);

    this.projRenderer.animateAlongPath(projectile, animationPath, impactPoint => {
      projectile.setVisible(false);
      if (options.destroyProjectileOnComplete) {
        projectile.destroy();
      }

      if (this.turnManager.turnNumber !== turnToken) {
        options.onComplete?.(true);
        return;
      }

      this.isAnimating = false;

      const resolvedImpact = clipped.impactPoint ?? impactPoint ?? animationPath[animationPath.length - 1];
      const traveledPath = animationPath;

      if (isPlayerShot) {
        this.ghostTrace?.recordShot(traveledPath);
      }

      const impact = this.getProjectileImpact(resolvedImpact, isPlayerShot);
      const teleportUtilityShot = isPlayerShot && this.teleportShotArmed;
      const explodeOnImpact = options.explodeOnImpact ?? !teleportUtilityShot;
      const applyDamage = options.applyDamage ?? !teleportUtilityShot;

      if (explodeOnImpact && (impact.hitTerrain || impact.hitTarget)) {
        const explodeResult = this.terrainEngine.explode(
          resolvedImpact.x, resolvedImpact.y, excavationRadius
        );
        this.terrainRenderer.updateCells(explodeResult.cellsDestroyed);
      }

      this.resolveTeleportShot(isPlayerShot, resolvedImpact, impact.hitTerrain);

      const tdx = resolvedImpact.x - impact.targetStats.x;
      const tdy = resolvedImpact.y - impact.targetStats.y;
      const distToTarget = Math.sqrt(tdx * tdx + tdy * tdy);
      const effectiveRadius = Math.max(excavationRadius, 30);
      const inSplashZone = distToTarget <= effectiveRadius;

      let gameEnded = false;
      if (applyDamage && inSplashZone) {
        gameEnded = this.onProjectileImpact(
          resolvedImpact.x,
          resolvedImpact.y,
          isPlayerShot,
          impact.targetStats,
          baseDamage,
          effectiveRadius,
          options.endTurnOnComplete ?? true
        );
      } else if (options.endTurnOnComplete ?? true) {
        this.endTurn(isPlayerShot);
      }

      options.onComplete?.(gameEnded);
    });
  }

  private clipPathToFirstImpact(
    path: Array<{ x: number; y: number }>,
    isPlayerShot: boolean
  ): { path: Array<{ x: number; y: number }>; impactPoint: { x: number; y: number } | null } {
    if (path.length <= 1) return { path, impactPoint: null };

    const clippedPath: Array<{ x: number; y: number }> = [path[0]];

    for (let i = 1; i < path.length; i++) {
      const previous = path[i - 1];
      const current = path[i];
      const impactPoint = this.findImpactOnSegment(previous, current, isPlayerShot);

      if (impactPoint) {
        clippedPath.push(impactPoint);
        return { path: clippedPath, impactPoint };
      }

      clippedPath.push(current);
    }

    return { path: clippedPath, impactPoint: null };
  }

  private findImpactOnSegment(
    start: { x: number; y: number },
    end: { x: number; y: number },
    isPlayerShot: boolean
  ): { x: number; y: number } | null {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(distance / 2));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = {
        x: start.x + dx * t,
        y: start.y + dy * t,
      };
      const impact = this.getProjectileImpact(point, isPlayerShot);
      if (impact.hitTerrain || impact.hitTarget) return point;
    }

    return null;
  }

  private getProjectileImpact(point: { x: number; y: number }, isPlayerShot: boolean): {
    hitTerrain: boolean;
    hitTarget: boolean;
    targetStats: BattleCharacterState;
  } {
    const targetStats = isPlayerShot ? this.aiStats : this.playerStats;
    const dx = Math.abs(point.x - targetStats.x);
    const dy = Math.abs(point.y - targetStats.y);

    return {
      hitTerrain: this.hasTerrainNearProjectile(point.x, point.y),
      hitTarget: dx < 30 && dy < 40,
      targetStats,
    };
  }

  private hasTerrainNearProjectile(x: number, y: number): boolean {
    const samples = [
      { x, y },
      { x: x + PROJECTILE_COLLISION_RADIUS, y },
      { x: x - PROJECTILE_COLLISION_RADIUS, y },
      { x, y: y + PROJECTILE_COLLISION_RADIUS },
      { x, y: y - PROJECTILE_COLLISION_RADIUS },
      { x: x + PROJECTILE_COLLISION_RADIUS * 0.7, y: y + PROJECTILE_COLLISION_RADIUS * 0.7 },
      { x: x - PROJECTILE_COLLISION_RADIUS * 0.7, y: y + PROJECTILE_COLLISION_RADIUS * 0.7 },
      { x: x + PROJECTILE_COLLISION_RADIUS * 0.7, y: y - PROJECTILE_COLLISION_RADIUS * 0.7 },
      { x: x - PROJECTILE_COLLISION_RADIUS * 0.7, y: y - PROJECTILE_COLLISION_RADIUS * 0.7 },
    ];

    return samples.some(point => this.terrainEngine.getMaterialAt(point.x, point.y) !== TerrainMaterial.EMPTY);
  }

  private calculateAiShot(): { angle: number; force: number; score: number } {
    const profile = this.aiWeapon.physicsProfile;
    const wind = this.windSystem.getCurrent();
    const search = AI_SEARCH_BY_DIFFICULTY[this.difficulty];

    // Dynamic angle range based on player position relative to AI
    const playerIsLeft = this.playerStats.x < this.aiStats.x;
    const angleMin = playerIsLeft ? 95 : 5;
    const angleMax = playerIsLeft ? 175 : 85;
    const defaultAngle = playerIsLeft ? 135 : 45;

    let best = { angle: defaultAngle, force: 60, score: Number.POSITIVE_INFINITY };

    for (let angle = angleMin; angle <= angleMax; angle += search.angleStep) {
      for (let force = 20; force <= 100; force += search.forceStep) {
        const config: ProjectileConfig = {
          angle,
          force,
          gravityScale: profile.gravityScale,
          windInfluence: profile.windInfluence,
          baseDamage: this.aiWeapon.baseDamage,
        };
        const path = this.projectilePhysics.simulate(this.aiStats.x, this.aiStats.y, config, wind);
        const score = this.scoreAiPath(path);
        if (score < best.score) best = { angle, force, score };
      }
    }

    return {
      angle: Math.max(angleMin, Math.min(angleMax, best.angle + Phaser.Math.FloatBetween(-search.angleError, search.angleError))),
      force: Math.max(20, Math.min(100, Math.round(best.force + Phaser.Math.FloatBetween(-search.forceError, search.forceError)))),
      score: best.score,
    };
  }

  private tryRepositionAi(): boolean {
    const currentX = this.aiSprite.x;
    const candidates = [-96, -64, -32, 32, 64, 96]
      .map(offset => this.clampInitialX(currentX + offset, this.scale.width))
      .filter((x, index, values) => Math.abs(x - currentX) > 4 && values.indexOf(x) === index);

    let best = { x: currentX, y: this.aiSprite.y, score: Number.POSITIVE_INFINITY };

    for (const x of candidates) {
      const floorY = this.terrainEngine.getFloorBelow(x, this.aiSprite.y + this.aiSprite.height / 2);
      if (floorY === null) continue;
      const original = { x: this.aiStats.x, y: this.aiStats.y };
      this.aiStats.x = x;
      this.aiStats.y = floorY - this.aiSprite.height / 2;
      const shot = this.calculateAiShot();
      if (shot.score < best.score) best = { x: this.aiStats.x, y: this.aiStats.y, score: shot.score };
      this.aiStats.x = original.x;
      this.aiStats.y = original.y;
    }

    if (best.score >= AI_REPOSITION_THRESHOLD) return false;

    this.aiSprite.setPosition(best.x, best.y);
    this.aiStats.x = best.x;
    this.aiStats.y = best.y;
    const label = this.add.text(best.x, best.y - 48, 'Reposicionando', {
      fontSize: '12px',
      color: '#ffdd66',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20).setAlpha(0.95);
    this.tweens.add({
      targets: label,
      y: best.y - 78,
      alpha: 0,
      duration: 700,
      onComplete: () => label.destroy(),
    });
    return true;
  }

  private scoreAiPath(path: Array<{ x: number; y: number }>): number {
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const point of path) {
      const dx = point.x - this.playerStats.x;
      const dy = point.y - this.playerStats.y;
      bestDistance = Math.min(bestDistance, Math.sqrt(dx * dx + dy * dy));

      const hitTerrain = this.terrainEngine.getMaterialAt(point.x, point.y) !== TerrainMaterial.EMPTY;
      if (hitTerrain) break;
    }

    return bestDistance;
  }

  private onProjectileImpact(
    impactX: number,
    impactY: number,
    isPlayerShot: boolean,
    targetStats: BattleCharacterState,
    baseDamage: number,
    excavationRadius: number,
    shouldEndTurn = true
  ): boolean {
    // Track last impact point (for teleport consumable)
    this.lastImpactPoint = { x: impactX, y: impactY };

    let damage = this.damageCalc.calculate(
      impactX, impactY,
      targetStats.x, targetStats.y,
      baseDamage,
      excavationRadius
    );

    const shooterId = isPlayerShot ? 'player' : 'ai';
    const targetId = isPlayerShot ? 'ai' : 'player';

    // VULNERABILITY multiplies damage received by 1.5
    if (this.statusEffects.hasEffect(targetId, 'VULNERABILITY')) {
      damage = Math.round(damage * 1.5);
    }

    if (isPlayerShot) {
      damage = this.applyShieldReduction('ai', damage);
      this.aiStats.hp = Math.max(0, this.aiStats.hp - damage);
      this.showDamageText(this.aiStats.x, this.aiStats.y, damage, '#ff4444');
    } else {
      damage = this.applyShieldReduction('player', damage);
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
          this.syncActorAssets();
        }
      }
    }

    // BLIND: hide angle display for the affected player (next turn it kicks in)
    this.updateBlindState();

    this.refreshHud();

    // Check game over
    if (this.aiStats.hp <= 0) {
      this.finishBattle(true);
      return true;
    }
    if (this.playerStats.hp <= 0) {
      this.finishBattle(false);
      return true;
    }

    if (shouldEndTurn) {
      this.endTurn(isPlayerShot);
    }
    return false;
  }

  private endTurn(_wasPlayerShot: boolean): void {
    const endingTurnNumber = this.turnManager.turnNumber;
    if (this.lastEndedTurnNumber === endingTurnNumber) return;

    this.lastEndedTurnNumber = endingTurnNumber;
    this.activeVolleyId++;
    this.clearScheduledTurnEvents();
    this.onAngleButtonUp(); // clean up hold-to-repeat timers
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
      this.finishBattle(true);
      return;
    }
    if (this.playerStats.hp <= 0) {
      this.finishBattle(false);
      return;
    }

    if (!this.turnManager.isPlayerTurn) {
      this.cameras.main.startFollow(this.aiSprite, true, 0.08, 0.08);
      this.movementBudgetHUD?.setVisible(false);
      // Hide docks during AI turn
      this.consumableDock?.setVisible(false);
      this.modifierDock?.setVisible(false);
      const aiTurnToken = this.turnManager.turnNumber;
      this.scheduleTurnEvent(1000, () => {
        this.fireAiShot(aiTurnToken);
      });
    } else {
      this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);
      this.moveBudgetTotal = moveBudget(this.playerAgility);
      this.moveBudgetUsed = 0;
      this.movementBudgetHUD?.update(0, this.moveBudgetTotal);
      this.movementBudgetHUD?.setVisible(true);
      if (this.playerInvisibleTurns > 0) this.playerInvisibleTurns -= 1;
      this.ghostTrace?.clear();
      // Consume any unused shot modifier at the start of each player turn
      this.shotModifierSystem.consumeAll();
      // Refresh and show docks on player turn start
      this.consumableDock?.refresh(this.buildConsumableDockItems());
      this.consumableDock?.setVisible(true);
      this.modifierDock?.refresh(this.buildModifierDockItems());
      this.modifierDock?.setVisible(true);
      this.updateTrajectoryPreview();
    }
    this.syncActorAssets();
  }

  private scheduleTurnEvent(delayMs: number, callback: () => void): Phaser.Time.TimerEvent {
    const event = this.time.delayedCall(delayMs, () => {
      this.scheduledTurnEvents = this.scheduledTurnEvents.filter(item => item !== event);
      callback();
    });
    this.scheduledTurnEvents.push(event);
    return event;
  }

  private clearScheduledTurnEvents(): void {
    for (const event of this.scheduledTurnEvents) {
      event.remove(false);
    }
    this.scheduledTurnEvents = [];
  }

  private applyShieldReduction(target: 'player' | 'ai', damage: number): number {
    const reduction = target === 'player' ? this.playerShieldReduction : this.aiShieldReduction;
    if (reduction <= 0) return damage;
    if (target === 'player') this.playerShieldReduction = 0;
    else this.aiShieldReduction = 0;
    return Math.max(0, Math.round(damage * (1 - reduction)));
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
      this.angleText?.setVisible(false);
    } else {
      this.angleText?.setVisible(true);
      this.updateAngleDisplay();
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

  private showItemFloatingText(x: number, y: number, label: string, color = '#66ffcc'): void {
    const text = this.add.text(x, y - 48, label, {
      fontSize: '15px',
      color,
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(22);

    this.tweens.add({
      targets: text,
      y: y - 88,
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

    const lastShotInfo = this.turnManager.isPlayerTurn
      ? this.lastPlayerShot ?? undefined
      : this.lastAiShot ?? undefined;

    this.hud.update(
      this.playerStats.hp,
      this.playerStats.maxHp,
      this.aiStats.hp,
      this.aiStats.maxHp,
      this.windSystem.getCurrent(),
      this.turnManager.isPlayerTurn,
      currentWeaponName,
      lastShotInfo
    );
  }

  private onResize(): void {
    this.refreshHud();
    this.layoutBattleMenuButton();
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
    this.playerWeaponIcon?.setTexture(this.weaponSpriteKey(id));
    this.clampCurrentAngleForWeapon();
    this.refreshHud();
  }

  setAiWeapon(id: string): void {
    const weapon = this.weaponSystem.getById(id);
    if (!weapon) return;
    this.aiWeapon = weapon;
    this.aiWeaponIcon?.setTexture(this.weaponSpriteKey(id));
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

  private getMapOption(mapName: MapName): BattleMapOption {
    return MAP_OPTIONS_BY_ID.get(mapName) ?? MAP_OPTIONS_BY_ID.get('plains')!;
  }

  setBattleMode(mode: BattleMode): void {
    const fallbackMap = mode === 'dungeon' ? 'dungeon_cave_entrance' : 'plains';
    this.switchMap(fallbackMap);
  }

  resetTerrain(): void {
    const map = this.getMapOption(this.currentMap);
    this.terrainEngine.loadMap(map.grid);
    this.terrainRenderer.renderFull();
  }

  switchMap(mapName: MapName): void {
    this.currentMap = mapName;
    const map = this.getMapOption(mapName);
    this.battleMode = map.mode;
    this.terrainEngine.loadMap(map.grid);

    // Notify renderer of new map for texture palette
    const renderer = this.terrainRenderer as TerrainRenderer & { setMapName?(n: string): void };
    renderer.setMapName?.(mapName);
    this.terrainRenderer.renderFull();

    this.aiAvatar?.setTexture(this.battleMode === 'dungeon' ? 'dwarf_battle' : 'elf_battle');
    this.aiAvatar?.setTint(this.battleMode === 'dungeon' ? 0xffcc88 : 0xffffff);

    // Camera bounds
    this.cameras.main.setBounds(0, 0, this.terrainEngine.worldWidth, this.terrainEngine.worldHeight);

    // Re-spawn using meta spawn points if available
    const mapJson = this.getMapJsonById(mapName);
    const mapMeta = mapJson?.meta as MapMeta | undefined;
    const rawSpawns = mapMeta?.spawnPoints ?? [];
    const charHeight = 60;

    const spawns = rawSpawns.length >= 2
      ? selectSpawns(rawSpawns, 2, this.terrainEngine)
      : [];

    const worldW = this.terrainEngine.worldWidth;
    const worldCenterY = this.terrainEngine.worldHeight / 2;

    if (spawns[0]) {
      const p = spawnToWorld(spawns[0], CELL_SIZE, charHeight);
      this.playerSprite.setPosition(p.x, p.y);
    } else {
      const fallbackX = worldW * 0.1;
      const playerFloor = this.terrainEngine.getFloorBelow(fallbackX, worldCenterY);
      this.playerSprite.setPosition(fallbackX, playerFloor !== null ? playerFloor - this.playerSprite.height / 2 : worldCenterY);
    }

    if (spawns[1]) {
      const a = spawnToWorld(spawns[1], CELL_SIZE, charHeight);
      this.aiSprite.setPosition(a.x, a.y);
    } else {
      const fallbackX = worldW * 0.9;
      const aiFloor = this.terrainEngine.getFloorBelow(fallbackX, worldCenterY);
      this.aiSprite.setPosition(fallbackX, aiFloor !== null ? aiFloor - this.aiSprite.height / 2 : worldCenterY);
    }
    this.syncActorAssets();
  }

  private getMapJsonById(mapName: MapName): { meta?: unknown; grid: number[][] } | null {
    switch (mapName) {
      case 'plains': return mapPlains as unknown as { meta?: unknown; grid: number[][] };
      case 'castle': return mapCastle as unknown as { meta?: unknown; grid: number[][] };
      case 'deep_mines': return mapDeepMines as unknown as { meta?: unknown; grid: number[][] };
      case 'arcane_ruins': return mapArcaneRuins as unknown as { meta?: unknown; grid: number[][] };
      case 'runic_forest': return mapRunicForest as unknown as { meta?: unknown; grid: number[][] };
      case 'dungeon_cave_entrance': return mapDungeonCaveEntrance as unknown as { meta?: unknown; grid: number[][] };
      case 'dungeon_cave_hall': return mapDungeonCaveHall as unknown as { meta?: unknown; grid: number[][] };
      case 'dungeon_cave_boss': return mapDungeonCaveBoss as unknown as { meta?: unknown; grid: number[][] };
      default: return null;
    }
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

  setPlayerAgility(agility: number): void {
    this.playerAgility = Math.max(0, Math.min(500, agility));
    this.moveBudgetTotal = moveBudget(this.playerAgility);
    this.moveBudgetUsed = 0;
    this.movementBudgetHUD?.update(0, this.moveBudgetTotal);
  }

  setPlayerLuck(luck: number): void {
    this.playerLuck = Math.max(0, Math.min(100, luck));
  }

  getConsumables(): Consumable[] {
    return this.consumableSystem.getAll();
  }

  getSecondaryItems(): SecondaryItem[] {
    return this.secondaryItemSystem.getAll();
  }

  useDebugConsumable(target: 'player' | 'ai', id: string): void {
    const item = this.consumableSystem.getById(id);
    if (!item) return;

    if (id === 'heal') {
      const stats = target === 'player' ? this.playerStats : this.aiStats;
      stats.hp = Math.min(stats.maxHp, stats.hp + Math.round(stats.maxHp * 0.25));
      this.showItemFloatingText(stats.x, stats.y, '+Cura', '#66ff88');
    } else if (id === 'teleport') {
      if (target !== 'player') return;
      this.teleportShotArmed = true;
      this.showItemFloatingText(this.playerStats.x, this.playerStats.y, 'Teleporte armado', '#88ccff');
      this.refreshHud();
      return;
    } else if (id === 'ice-throw') {
      const effectTarget = target === 'player' ? 'ai' : 'player';
      this.applyDebugEffect(effectTarget, 'FREEZE');
    } else if (id === 'invisibility') {
      if (target === 'player') this.playerInvisibleTurns = 1;
      this.syncActorAssets();
    } else if (id === 'calibration-shot') {
      this.calibrationShotActive = true;
      this.showItemFloatingText(this.playerStats.x, this.playerStats.y, 'Calibrado', '#ffdd66');
      this.updateTrajectoryPreview();
    }

    this.refreshHud();
    if (item.usesTurn) this.endTurn(target === 'player');
  }

  useDebugSecondaryItem(target: 'player' | 'ai', id: string): void {
    const item = this.secondaryItemSystem.getById(id);
    if (!item) return;
    if (target === 'player') this.playerSecondaryItemId = id;
    else this.aiSecondaryItemId = id;

    if (id === 'shield') {
      if (target === 'player') this.playerShieldReduction = 0.4;
      else this.aiShieldReduction = 0.4;
    } else if (id === 'healing-book') {
      const stats = target === 'player' ? this.playerStats : this.aiStats;
      stats.hp = Math.min(stats.maxHp, stats.hp + Math.round(stats.maxHp * 0.15));
      this.showItemFloatingText(stats.x, stats.y, '+Livro', '#66ff88');
    } else if (id === 'camouflage-orb') {
      if (target === 'player') this.playerInvisibleTurns = 1;
    } else if (id === 'protection-totem') {
      if (target === 'player') this.playerShieldReduction = 0.6;
      else this.aiShieldReduction = 0.6;
    } else if (id === 'runic-builder') {
      this.secondaryItemSystem.activateRunicBuilder(target, this.terrainEngine.getConstructedCount(target));
    }

    this.refreshHud();
    this.syncActorAssets();
    if (item.usesTurn) this.endTurn(target === 'player');
  }

  private resolveTeleportShot(
    isPlayerShot: boolean,
    impactPoint: { x: number; y: number },
    hitTerrain: boolean
  ): void {
    if (!isPlayerShot || !this.teleportShotArmed) return;

    this.teleportShotArmed = false;

    if (!hitTerrain) {
      this.showItemFloatingText(this.playerStats.x, this.playerStats.y, 'Teleporte falhou', '#bbbbbb');
      return;
    }

    const teleported = this.teleportActor('player', impactPoint.x, Math.max(0, impactPoint.y - 80));
    if (teleported) {
      this.showItemFloatingText(this.playerStats.x, this.playerStats.y, 'Teleporte', '#88ccff');
      this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);
    } else {
      this.showItemFloatingText(this.playerStats.x, this.playerStats.y, 'Teleporte falhou', '#bbbbbb');
    }
  }

  private teleportActor(target: 'player' | 'ai', x: number, floorSearchY = 0): boolean {
    const sprite = target === 'player' ? this.playerSprite : this.aiSprite;
    const newX = Math.max(72, Math.min(x, MAP_WORLD_WIDTH - 72));
    const floorY = this.terrainEngine.getFloorBelow(newX, floorSearchY);
    if (floorY === null) return false;

    sprite.setPosition(newX, floorY !== null ? floorY - sprite.height / 2 : sprite.y);
    if (target === 'player') {
      this.playerStats.x = sprite.x;
      this.playerStats.y = sprite.y;
    } else {
      this.aiStats.x = sprite.x;
      this.aiStats.y = sprite.y;
    }
    this.syncActorAssets();
    return true;
  }

  getActiveEffects(): { player: RunicEffect[]; ai: RunicEffect[] } {
    return {
      player: this.statusEffects.getEffects('player'),
      ai: this.statusEffects.getEffects('ai'),
    };
  }
}
