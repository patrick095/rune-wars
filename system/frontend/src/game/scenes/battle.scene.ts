import Phaser from "phaser";
import { TurnManager } from "../../app/shared/game-core/turn-manager";
import { WindSystem } from "../../app/shared/game-core/wind-system";
import type { WindState } from "../../app/shared/game-core/wind-system";
import { ProjectilePhysics } from "../../app/shared/game-core/projectile-physics";
import { DamageCalculator } from "../../app/shared/game-core/damage-calculator";
import { Difficulty } from "../../app/shared/game-core/ai-local";
import {
    AiStrategyEngine,
    AiStrategyType,
} from "../../app/shared/game-core/ai-strategy";
import { ProjectileConfig } from "../../app/shared/game-core/projectile-config";
import {
    AiDecisionMaker,
    aiLogger,
} from "../../app/shared/game-core/ai-decision-maker";
import { BattleSnapshot } from "../../app/shared/game-core/ai-battle-types";

interface BattleCharacterState {
    hp: number;
    maxHp: number;
    x: number;
    y: number;
    isPlayer: boolean;
    facing: "left" | "right";
}

interface BattleLaunchData {
    isPlayground?: boolean;
    mode?: BattleMode;
    mapName?: MapName;
    agility?: number;
    playerRace?: string;
    playerName?: string;
    opponentName?: string;
    opponentRace?: string;
    roomName?: string;
    vsAI?: boolean;
    playerMaxHp?: number;
    aiMaxHp?: number;
    aiAgility?: number;
    playerWeaponId?: string;
    playerWeaponUpgradeLevel?: number;
    playerWeaponRarity?: string;
    aiWeaponId?: string;
    aiWeaponUpgradeLevel?: number;
    aiWeaponRarity?: string;
    playerConsumables?: string[];
    playerStrength?: number;
    playerDefense?: number;
    playerLuck?: number;
    aiStrength?: number;
    aiDefense?: number;
    aiLuck?: number;
    dungeonFloor?: number;
    dungeonStage?: number;
    /** If set, overrides random difficulty selection for this battle. */
    difficulty?: Difficulty;
    /** Player level used to redistribute AI stats according to the chosen strategy. */
    playerLevel?: number;
}

type BattleFinishReason = "victory" | "defeat" | "surrender";
import {
    TerrainEngine,
    MapMeta,
    WORLD_WIDTH,
    WORLD_HEIGHT,
} from "../../app/shared/game-core/terrain-engine";
import { TerrainMaterial } from "../../app/shared/game-core/terrain-types";
import { tryHorizontalMove } from "../terrain/terrain-collision";
import {
    selectSpawns,
    spawnToWorld,
    moveSpeed,
    moveBudget,
    normalizeSpawns,
    WorldSpawnPoint,
} from "../terrain/spawn-selector";
import type { SpawnNormalizationContext } from "../terrain/spawn-selector";
import {
    CHARACTER_BODY_HALF_WIDTH,
    CHARACTER_BODY_HEIGHT,
    characterBodyOverlapsTerrain,
    findSafeGroundedPosition,
    resolveCharacterTerrainOverlap,
} from "../terrain/character-placement";
import { MovementBudgetHUD } from "../hud/movement-budget-hud";
import { TerrainRenderer } from "../terrain/terrain-renderer";
import { CharacterFall } from "../terrain/character-fall";
import { TrajectoryIndicator } from "../ui/trajectory-indicator";
import { ResultOverlay } from "../ui/result-overlay";
import { WeaponSystem } from "../../app/shared/game-core/weapon-system";
import type { ProjectilePhysicsProfile } from "../../app/shared/game-core/weapon-definition";
import {
    WeaponDefinition,
    getWeaponAngleLimits,
} from "../../app/shared/game-core/weapon-definition";
import {
    Consumable,
    ConsumableSystem,
} from "../../app/shared/game-core/consumable-system";
import {
    SecondaryItem,
    SecondaryItemSystem,
} from "../../app/shared/game-core/secondary-item-system";
import {
    MODIFIER_STAMINA_COST,
    ShotConfig,
    ShotModifierSystem,
    ShotModifierType,
} from "../../app/shared/game-core/shot-modifier-system";
import {
    ProjectileObject,
    ProjectileRenderer,
} from "../projectiles/projectile-renderer";
import { StatusEffectManager } from "../../app/shared/game-core/status-effect-manager";
import {
    RunicEffect,
    RunicEffectType,
    rollRunicEffect,
    getWeaponRunicEffect,
} from "../../app/shared/game-core/runic-effect-system";
import { EffectsHud } from "../hud/effects-hud";
import { GhostTrace } from "../hud/ghost-trace";
// [v1.5.0] novos componentes integrados
import { BattleHud, BattleHudState } from "../hud/battle-hud";
import { BattleInputController } from "../input/battle-input-controller";
import { MapModifierManager } from "../map/map-modifier-manager";
import { ModularCharacterRenderer } from "../character/modular-character-renderer";
import { RuneWarsRaceId } from "../character/asset-manifest.types";
import {
    preloadRuneWarsAssets,
    runeWarsItemIconKey,
    runeWarsItemLayerKey,
    runeWarsProjectileKey,
} from "../assets/rune-wars-assets";
import mapPlains from "../../app/shared/game-core/maps/map-plains.json";
import mapMysticCastle from "../../app/shared/game-core/maps/map-mystic-castle.json";
import mapDeepMines from "../../app/shared/game-core/maps/map-deep-mines.json";
import mapArcaneRuins from "../../app/shared/game-core/maps/map-arcane-ruins.json";
import mapRunicForest from "../../app/shared/game-core/maps/map-runic-forest.json";
import mapDungeonCaveEntrance from "../../app/shared/game-core/maps/dungeon-cave-entrance.json";
import mapDungeonCaveHall from "../../app/shared/game-core/maps/dungeon-cave-hall.json";
import mapDungeonCaveBoss from "../../app/shared/game-core/maps/dungeon-cave-boss.json";
import mapDungeonF1S1 from "../../app/shared/game-core/maps/dungeon-f1-s1.json";
import mapDungeonF1S2 from "../../app/shared/game-core/maps/dungeon-f1-s2.json";
import {
    DungeonBattleStageConfig,
    DungeonMonsterBehavior,
    DungeonMonsterDefinition,
    dungeonMonsterAssetPath,
    dungeonMonsterFrameKey,
    getDungeonBattleStage,
    scaleDungeonDamage,
    scaleDungeonHp,
} from "../dungeon/dungeon-battle-config";

const WEAPON_COLORS: Record<string, number> = {
    cannon: 0xffaa00,
    longbow: 0x00ff88,
    tnt: 0xff4400,
    boomerang: 0xff88ff,
    "ice-book": 0x88ccff,
    potion: 0x00ffcc,
    "magic-grenade": 0xaa44ff,
};

export type BattleMode = "pvp" | "dungeon";
export type MapName =
    | "plains"
    | "mystic_castle"
    | "deep_mines"
    | "arcane_ruins"
    | "runic_forest"
    | "dungeon_f1_s1"
    | "dungeon_f1_s2"
    | "dungeon_cave_entrance"
    | "dungeon_cave_hall"
    | "dungeon_cave_boss";

export interface BattleMapOption {
    id: MapName;
    label: string;
    mode: BattleMode;
}

export const BATTLE_MAPS: BattleMapOption[] = [
    { id: "plains", label: "Planícies", mode: "pvp" },
    { id: "mystic_castle", label: "Castelo Místico", mode: "pvp" },
    { id: "deep_mines", label: "Minas Profundas", mode: "pvp" },
    { id: "arcane_ruins", label: "Ruínas Arcanas", mode: "pvp" },
    { id: "runic_forest", label: "Floresta Rúnica", mode: "pvp" },
    {
        id: "dungeon_f1_s1",
        label: "Dungeon: Andar 1 - Estágio 1",
        mode: "dungeon",
    },
    {
        id: "dungeon_f1_s2",
        label: "Dungeon: Andar 1 - Estágio 2",
        mode: "dungeon",
    },
    {
        id: "dungeon_cave_entrance",
        label: "Dungeon: Entrada da Caverna",
        mode: "dungeon",
    },
    {
        id: "dungeon_cave_hall",
        label: "Dungeon: Salão da Caverna",
        mode: "dungeon",
    },
    {
        id: "dungeon_cave_boss",
        label: "Dungeon: Covil do Golem",
        mode: "dungeon",
    },
];

const MAP_OPTIONS_BY_ID = new Map<MapName, BattleMapOption>(
    BATTLE_MAPS.map((map) => [map.id, map]),
);

const MAP_ASSET_FOLDER: Record<string, string> = {
    plains: "plains",
    mystic_castle: "mystic-castle",
    deep_mines: "deep-mines",
    arcane_ruins: "arcane-ruins",
    runic_forest: "runic-forest",
};

const DUNGEON_MAP_ASSETS: Partial<Record<MapName, string>> = {
    dungeon_f1_s1: "assets/dungeon/floor1/stage1/map",
    dungeon_f1_s2: "assets/dungeon/floor1/stage2/map",
};

const MAP_WORLD_WIDTH = WORLD_WIDTH;
const MIN_SHOT_POWER = 5;
const POWER_STEP = 2;
const POWER_TICK_MS = 50;
const PROJECTILE_COLLISION_RADIUS = 7;
const POST_SHOT_TURN_ADVANCE_DELAY_MS = 1000;
const MAX_TURN_FALL_WAIT_MS = 3600;
const CONSUMABLE_STAMINA_COST_FRACTION = 0.5;
const AI_SEARCH_BY_DIFFICULTY: Record<
    Difficulty,
    {
        angleStep: number;
        forceStep: number;
        angleError: number;
        forceError: number;
    }
> = {
    easy: { angleStep: 8, forceStep: 12, angleError: 14, forceError: 14 },
    medium: { angleStep: 5, forceStep: 8, angleError: 7, forceError: 8 },
    hard: { angleStep: 3, forceStep: 5, angleError: 3, forceError: 4 },
    heroic: { angleStep: 2, forceStep: 3, angleError: 1, forceError: 2 },
};
const AI_REPOSITION_THRESHOLD = 70;

interface ProjectileAnimationOptions {
    projectile?: ProjectileObject;
    destroyProjectileOnComplete?: boolean;
    endTurnOnComplete?: boolean;
    applyDamage?: boolean;
    explodeOnImpact?: boolean;
    turnToken?: number;
    onComplete?: (gameEnded: boolean) => void;
    /** Skip pre-clipping; check terrain per-frame so concurrent shots see live terrain state. */
    realtimeCollision?: boolean;
}

interface ProjectileImpactResult {
    hitTerrain: boolean;
    hitTarget: boolean;
    targetStats: BattleCharacterState;
    dungeonMonster?: DungeonMonsterRuntime;
}

interface TargetDamageBounds {
    halfWidth: number;
    halfHeight: number;
}

interface OpeningFocusTarget {
    x: number;
    y: number;
    label: string;
}

interface DungeonMonsterRuntime {
    id: string;
    type: DungeonMonsterDefinition["type"];
    name: string;
    behavior: DungeonMonsterBehavior;
    stats: BattleCharacterState;
    baseDamage: number;
    patrolMinX: number;
    patrolMaxX: number;
    patrolDirection: -1 | 1;
    width: number;
    height: number;
    container: Phaser.GameObjects.Container;
    body: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    hpText: Phaser.GameObjects.Text;
    animationTimer?: Phaser.Time.TimerEvent;
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
    private playerStrength = 0;
    private playerDefense = 0;
    private aiStrength = 0;
    private aiDefense = 0;
    private aiLuck = 10;
    // v1.7.0 AI strategy engine
    private readonly aiStrategyEngine = new AiStrategyEngine();
    // v1.7.0 tactical AI decision maker
    private readonly aiDecisionMaker = new AiDecisionMaker();
    private aiStrategy: AiStrategyType = "mixed";
    private aiExcavScore = 0;
    private aiLastImpactX: number | null = null;
    private teleportShotArmed = false;
    private iceShotArmed = false;
    private aiIceShotArmed = false;
    private calibrationTargetZone: { min: number; max: number } | null = null;
    private usedConsumableSlots = new Set<number>();
    private aiUsedConsumableIds = new Set<string>();
    private aiShotModifierSystem = new ShotModifierSystem();
    private playerConsumables: string[] = [];
    private battleEnded = false;

    // v1.4.0 last-shot info for HUD display
    private lastPlayerShot: { force: number; angle: number } | null = null;
    private lastAiShot: { force: number; angle: number } | null = null;

    // Control buttons references for FREEZE lock
    private _btnAngleMinus!: Phaser.GameObjects.Rectangle;
    private _btnAnglePlus!: Phaser.GameObjects.Rectangle;

    // Mobile detection
    private isMobile = window.matchMedia("(pointer: coarse)").matches;

    // Hold-to-repeat timers for angle buttons
    private holdTimer: ReturnType<typeof setTimeout> | null = null;
    private holdInterval: ReturnType<typeof setInterval> | null = null;

    // Throttle for keyboard angle keys
    private lastAngleKeyTime = 0;

    private playerStats: BattleCharacterState = {
        hp: 100,
        maxHp: 100,
        x: 0,
        y: 0,
        isPlayer: true,
        facing: "right",
    };
    private aiStats: BattleCharacterState = {
        hp: 100,
        maxHp: 100,
        x: 0,
        y: 0,
        isPlayer: false,
        facing: "left",
    };

    // v1.2.0 movement budget
    private playerAgility = 50;
    private aiAgility = 50;
    private playerInitialMaxHp = 100;
    private aiInitialMaxHp = 100;
    private playerWeaponId: string | null = null;
    private playerWeaponUpgradeLevel = 0;
    private playerWeaponRarity = "common";
    private aiWeaponId: string | null = null;
    private aiWeaponUpgradeLevel = 0;
    private aiWeaponRarity = "common";
    private opponentRace = "human";
    private moveBudgetTotal = 0;
    private moveBudgetUsed = 0;
    private movementBudgetHUD!: MovementBudgetHUD;
    private currentAngle = 45;
    private difficulty: Difficulty = "medium";
    private isAnimating = false;
    private currentMap: MapName = "plains";
    private battleMode: BattleMode = "pvp";
    private dungeonFloor = 1;
    private dungeonStage = 1;
    private dungeonStageConfig: DungeonBattleStageConfig | null = null;
    private dungeonMonsters: DungeonMonsterRuntime[] = [];
    private dungeonPortal?: Phaser.GameObjects.Container;
    private playerName = "Jogador";
    private opponentName = "Inimigo";
    private roomName = "";
    private vsAI = true;
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
    private projectileArc!: ProjectileObject;
    private playerAvatar?: Phaser.GameObjects.Image;
    private aiAvatar?: Phaser.GameObjects.Image;
    private playerWeaponIcon?: Phaser.GameObjects.Image;
    private aiWeaponIcon?: Phaser.GameObjects.Image;
    private playerNameLabel?: Phaser.GameObjects.Text;
    private aiNameLabel?: Phaser.GameObjects.Text;

    // HUD & UI helpers
    private battleHud!: BattleHud; // [v1.5.0]
    private battleInputController!: BattleInputController; // [v1.5.0]
    private mapModifierManager!: MapModifierManager; // [v1.5.0]
    // [v1.9.0] Modular character renderers for synced layers and anchors.
    private playerCharacterSprite!: ModularCharacterRenderer;
    private aiCharacterSprite!: ModularCharacterRenderer;
    private effectsHud!: EffectsHud;
    private trajectory = new TrajectoryIndicator();
    private resultOverlay = new ResultOverlay();
    private battleMenuButton?: Phaser.GameObjects.Rectangle;
    private battleMenuButtonText?: Phaser.GameObjects.Text;
    private surrenderButton?: Phaser.GameObjects.Rectangle;
    private surrenderButtonText?: Phaser.GameObjects.Text;
    private battleMenuPanel?: Phaser.GameObjects.Container;
    private battleMenuOpen = false;

    // Modifier defs used for index→id mapping in dock events
    private readonly modifierDefs = [
        { id: "shot_plus1", label: "+1 Tiro" },
        { id: "shot_x3", label: "Triplo" },
        { id: "shot_damage_2x", label: "+Dano" },
        { id: "shot_dig_2x", label: "+Escav" },
    ] as const;

    // Power bar
    private ghostTrace: GhostTrace | undefined;
    private isChargingPower = false;
    private chargePerformanceMode = false;
    private powerValue = 0;
    private powerChargeStartedAt = 0;
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

    // Set to true when started from playground (BootScene) — disables ghost trace
    private isPlayground = false;

    constructor() {
        super({ key: "BattleScene" });
    }

    private playerRace: string = "human";

    private pickRandomDifficulty(): Difficulty {
        const r = Math.random();
        if (r < 0.33) return "easy";
        if (r < 0.67) return "medium";
        return "hard";
    }

    init(data?: BattleLaunchData): void {
        this.isPlayground = data?.isPlayground ?? false;
        this.battleMode = data?.mode ?? "pvp";
        this.currentMap =
            data?.mapName ??
            (this.battleMode === "dungeon" ? "dungeon_f1_s1" : "plains");
        this.dungeonFloor = data?.dungeonFloor ?? 1;
        this.dungeonStage = data?.dungeonStage ?? 1;
        this.dungeonStageConfig =
            this.battleMode === "dungeon"
                ? getDungeonBattleStage(
                      this.currentMap,
                      this.dungeonFloor,
                      this.dungeonStage,
                  )
                : null;
        this.playerAgility = data?.agility ?? 50;
        this.aiAgility = data?.aiAgility ?? 50;
        this.playerInitialMaxHp = data?.playerMaxHp ?? 100;
        this.aiInitialMaxHp = data?.aiMaxHp ?? 100;
        this.playerWeaponId = data?.playerWeaponId ?? null;
        this.playerWeaponUpgradeLevel = data?.playerWeaponUpgradeLevel ?? 0;
        this.playerWeaponRarity = data?.playerWeaponRarity ?? "common";
        this.aiWeaponId = data?.aiWeaponId ?? null;
        this.aiWeaponUpgradeLevel = data?.aiWeaponUpgradeLevel ?? 0;
        this.aiWeaponRarity = data?.aiWeaponRarity ?? "common";
        this.playerConsumables = data?.playerConsumables ?? [];
        this.playerStrength = data?.playerStrength ?? 0;
        this.playerDefense = Phaser.Math.Clamp(
            data?.playerDefense ?? 0,
            0,
            0.6,
        );
        this.playerLuck = data?.playerLuck ?? 10;
        this.aiStrength = data?.aiStrength ?? 0;
        this.aiDefense = Phaser.Math.Clamp(data?.aiDefense ?? 0, 0, 0.6);
        this.aiLuck = data?.aiLuck ?? 10;
        this.playerRace = data?.playerRace ?? "human";
        this.opponentRace = data?.opponentRace ?? "human";
        this.playerName = data?.playerName?.trim() || "Jogador";
        this.vsAI = data?.vsAI ?? true;
        // Pick difficulty randomly each match unless explicitly provided
        this.difficulty = data?.difficulty ?? this.pickRandomDifficulty();
        this.opponentName =
            data?.opponentName?.trim() || (this.vsAI ? "Inimigo" : "Oponente");
        if (this.dungeonStageConfig?.monsters[0]) {
            this.aiInitialMaxHp = scaleDungeonHp(
                this.dungeonStageConfig.monsters[0].baseHp,
                this.difficulty,
            );
            this.opponentName = this.dungeonStageConfig.monsters[0].name;
        }
        this.roomName = data?.roomName?.trim() || "";

        // Pick AI strategy for this battle based on difficulty
        this.aiStrategy = this.aiStrategyEngine.pickStrategy(this.difficulty);

        // Redistribute AI stats according to strategy when player level is known
        const playerLevel = data?.playerLevel;
        if (
            playerLevel &&
            (this.vsAI ?? true) &&
            this.battleMode !== "dungeon"
        ) {
            const stats = this.aiStrategyEngine.computeAiStats(
                playerLevel,
                this.aiStrategy,
            );
            this.aiInitialMaxHp = stats.maxHp;
            this.aiStrength = stats.strength;
            this.aiAgility = stats.agility;
            this.aiLuck = stats.luck;
        }
    }

    preload(): void {
        // Terrain PNG background: only load the selected map. Each full background is several MB.
        this.preloadCurrentMapBackground();
        this.preloadDungeonMonsters();
        // Terrain tile textures (override programmatic generation when present)
        this.load.image(
            "terrain_destructible",
            "assets/terrain/destructible.png",
        );
        this.load.image(
            "terrain_indestructible",
            "assets/terrain/indestructible.png",
        );

        this.load.image("human_idle", "assets/characters/human_idle.png");
        this.load.image("human_battle", "assets/characters/human_battle.png");
        this.load.image("dwarf_idle", "assets/characters/dwarf_idle.png");
        this.load.image("dwarf_battle", "assets/characters/dwarf_battle.png");
        this.load.image("elf_idle", "assets/characters/elf_idle.png");
        this.load.image("elf_battle", "assets/characters/elf_battle.png");

        // Itens secundários
        this.load.image(
            "secondary_shield",
            "assets/items/secondary/shield.png",
        );
        this.load.image(
            "secondary_healing-book",
            "assets/items/secondary/healing-book.png",
        );
        this.load.image(
            "secondary_camouflage-orb",
            "assets/items/secondary/camouflage-orb.png",
        );
        this.load.image(
            "secondary_protection-totem",
            "assets/items/secondary/protection-totem.png",
        );
        this.load.image(
            "secondary_runic-builder",
            "assets/items/secondary/runic-builder.png",
        );

        // Consumíveis
        this.load.image(
            "consumable_teleport",
            "assets/items/consumables/teleport.png",
        );
        this.load.image("consumable_heal", "assets/items/consumables/heal.png");
        this.load.image(
            "consumable_ice-throw",
            "assets/items/consumables/ice-throw.png",
        );
        this.load.image(
            "consumable_invisibility",
            "assets/items/consumables/invisibility.png",
        );
        this.load.image(
            "consumable_calibration-shot",
            "assets/items/consumables/calibration-shot.png",
        );

        // Ícones de arma (inventário 48x48)
        this.load.image("weapon_cannon", "assets/items/weapons/cannon.png");
        this.load.image("weapon_longbow", "assets/items/weapons/longbow.png");
        this.load.image("weapon_tnt", "assets/items/weapons/tnt.png");
        this.load.image(
            "weapon_boomerang",
            "assets/items/weapons/boomerang.png",
        );
        this.load.image("weapon_icebook", "assets/items/weapons/ice-book.png");
        this.load.image("weapon_potion", "assets/items/weapons/potion.png");
        this.load.image(
            "weapon_magic-grenade",
            "assets/items/weapons/magic-grenade.png",
        );

        // Sprites de batalha de armas (64x64)
        this.load.image(
            "weapon_cannon_sprite",
            "assets/items/weapons/cannon_sprite.png",
        );
        this.load.image(
            "weapon_longbow_sprite",
            "assets/items/weapons/longbow_sprite.png",
        );
        this.load.image(
            "weapon_tnt_sprite",
            "assets/items/weapons/tnt_sprite.png",
        );
        this.load.image(
            "weapon_boomerang_sprite",
            "assets/items/weapons/boomerang_sprite.png",
        );
        this.load.image(
            "weapon_icebook_sprite",
            "assets/items/weapons/ice-book_sprite.png",
        );
        this.load.image(
            "weapon_potion_sprite",
            "assets/items/weapons/potion_sprite.png",
        );
        this.load.image(
            "weapon_magic-grenade_sprite",
            "assets/items/weapons/magic-grenade_sprite.png",
        );

        preloadRuneWarsAssets(this);
    }

    private preloadCurrentMapBackground(): void {
        const dungeonAssetPath = DUNGEON_MAP_ASSETS[this.currentMap];
        if (dungeonAssetPath) {
            this.load.image(
                `map_${this.currentMap}_bg`,
                `${dungeonAssetPath}/background.png`,
            );
            this.load.image(
                `map_${this.currentMap}_terrain`,
                `${dungeonAssetPath}/terrain.png`,
            );
            return;
        }
        if (this.currentMap.startsWith("dungeon")) {
            this.load.image(
                "terrain_dungeon_bg",
                "assets/terrain/dungeon_bg.png",
            );
            return;
        }
        const folder = MAP_ASSET_FOLDER[this.currentMap] ?? this.currentMap;
        this.load.image(
            `map_${this.currentMap}_bg`,
            `assets/maps/${folder}/background.png`,
        );
        this.load.image(
            `map_${this.currentMap}_terrain`,
            `assets/maps/${folder}/terrain.png`,
        );
    }

    private preloadDungeonMonsters(): void {
        if (!this.dungeonStageConfig) return;
        const monsterTypes = new Set(
            this.dungeonStageConfig.monsters.map((monster) => monster.type),
        );
        for (const type of monsterTypes) {
            for (let frame = 0; frame < 4; frame += 1) {
                const key = dungeonMonsterFrameKey(type, frame);
                if (this.textures.exists(key)) continue;
                const path = dungeonMonsterAssetPath(
                    this.currentMap,
                    type,
                    frame,
                );
                if (path) this.load.image(key, path);
            }
        }
    }

    private resetRuntimeState(): void {
        this.leaveChargePerformanceMode();
        // Clean up hold-to-repeat timers if any
        if (this.holdTimer) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
        }
        if (this.holdInterval) {
            clearInterval(this.holdInterval);
            this.holdInterval = null;
        }

        this.turnManager = new TurnManager();
        this.windSystem = new WindSystem();
        this.projectilePhysics = new ProjectilePhysics();
        this.damageCalc = new DamageCalculator();
        this.statusEffects = new StatusEffectManager();
        this.consumableSystem = new ConsumableSystem();
        this.secondaryItemSystem = new SecondaryItemSystem();
        this.shotModifierSystem = new ShotModifierSystem();
        this.playerStats = {
            hp: this.playerInitialMaxHp,
            maxHp: this.playerInitialMaxHp,
            x: 0,
            y: 0,
            isPlayer: true,
            facing: "right",
        };
        this.aiStats = {
            hp: this.aiInitialMaxHp,
            maxHp: this.aiInitialMaxHp,
            x: 0,
            y: 0,
            isPlayer: false,
            facing: "left",
        };
        this.moveBudgetTotal = moveBudget(this.playerAgility);
        this.moveBudgetUsed = 0;
        this.currentAngle = 45;
        this.isAnimating = false;
        this.isChargingPower = false;
        this.powerValue = 0;
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
        this.calibrationTargetZone = null;
        this.iceShotArmed = false;
        this.aiIceShotArmed = false;
        this.usedConsumableSlots = new Set<number>();
        this.constructedByPlayer = 0;
        this.playerSecondaryItemId = null;
        this.aiSecondaryItemId = null;
        this.activeVolleyId = 0;
        this.lastEndedTurnNumber = 0;
        this.clearScheduledTurnEvents();
        this.aiUsedConsumableIds = new Set<string>();
        this.aiShotModifierSystem = new ShotModifierSystem();
        this.battleEnded = false;
        this.aiExcavScore = 0;
        this.aiLastImpactX = null;
        this.dungeonMonsters = [];
        this.dungeonPortal = undefined;
    }

    create(): void {
        this.resetRuntimeState();

        // Register self globally for debug panel
        (window as unknown as Record<string, unknown>)["battleScene"] = this; // eslint-disable-line

        // Equip consumables selected in the PVP room
        for (const id of this.playerConsumables) {
            this.consumableSystem.equip(id);
        }

        // Initialize weapons — use configured IDs if provided, else default
        const playerWeaponBase = this.playerWeaponId
            ? (this.weaponSystem.getById(this.playerWeaponId) ??
              this.weaponSystem.getDefault())
            : this.weaponSystem.getDefault();
        this.playerWeapon = {
            ...playerWeaponBase,
            baseDamage: this.applyWeaponUpgrade(
                playerWeaponBase.baseDamage,
                this.playerWeaponRarity,
                this.playerWeaponUpgradeLevel,
            ),
        };
        const aiWeaponBase = this.aiWeaponId
            ? (this.weaponSystem.getById(this.aiWeaponId) ??
              this.weaponSystem.getDefault())
            : this.weaponSystem.getDefault();
        this.aiWeapon = {
            ...aiWeaponBase,
            baseDamage: this.applyWeaponUpgrade(
                aiWeaponBase.baseDamage,
                this.aiWeaponRarity,
                this.aiWeaponUpgradeLevel,
            ),
        };
        this.projRenderer = new ProjectileRenderer(this);

        const { width, height } = this.scale;

        const initialMap = this.getMapOption(this.currentMap);
        this.battleMode = initialMap.mode;

        const currentTerrainKey = `map_${this.currentMap}_terrain`;
        if (this.textures.exists(currentTerrainKey)) {
            const imgData = this.getTerrainImageData(currentTerrainKey);
            this.terrainEngine = TerrainEngine.fromImageData(imgData);
        } else if (this.currentMap.startsWith("dungeon")) {
            this.terrainEngine = new TerrainEngine();
        } else {
            const imgData = this.getTerrainImageData(currentTerrainKey);
            this.terrainEngine = TerrainEngine.fromImageData(imgData);
        }

        // World-sized fallback behind the painted map background.
        this.add
            .rectangle(
                WORLD_WIDTH / 2,
                WORLD_HEIGHT / 2,
                WORLD_WIDTH,
                WORLD_HEIGHT,
                0x1a1a2e,
            )
            .setDepth(-20);

        const currentBgKey = `map_${this.currentMap}_bg`;
        if (
            this.textures.exists(currentBgKey) &&
            this.textures.exists(currentTerrainKey)
        ) {
            this.terrainRenderer = new TerrainRenderer(
                this,
                currentBgKey,
                currentTerrainKey,
            );
        } else if (this.currentMap.startsWith("dungeon")) {
            this.terrainRenderer = new TerrainRenderer(
                this,
                "terrain_dungeon_bg",
                "terrain_dungeon_bg",
            );
        } else {
            const bgKey = `map_${this.currentMap}_bg`;
            const terrainKey = `map_${this.currentMap}_terrain`;
            this.terrainRenderer = new TerrainRenderer(this, bgKey, terrainKey);
        }

        // Camera bounds
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.applyCameraLayout();

        // Position characters using spawn points from map meta if available
        const mapJson = this.getMapJsonById(this.currentMap);
        const mapMeta = mapJson?.meta as MapMeta | undefined;
        const rawSpawns = mapMeta?.spawnPoints ?? [];
        const spawnContext = this.getSpawnNormalizationContext(
            this.currentMap,
            mapMeta,
        );
        const charHeight = 60;
        const spawns =
            rawSpawns.length >= 2
                ? selectSpawns(rawSpawns, 2, this.terrainEngine, spawnContext)
                : [];

        const worldCenterY = WORLD_HEIGHT / 2;
        const fallbackPlayerX = WORLD_WIDTH * 0.1;
        const fallbackAiX = WORLD_WIDTH * 0.9;

        if (spawns[0]) {
            const p = spawnToWorld(
                spawns[0],
                1,
                charHeight,
                this.terrainEngine,
            );
            this.playerStats.x = p.x;
            this.playerStats.y = p.y;
        } else {
            const safe = this.findSafeCharacterPosition(
                fallbackPlayerX,
                worldCenterY,
            );
            this.playerStats.x = safe?.x ?? fallbackPlayerX;
            this.playerStats.y = safe?.y ?? worldCenterY;
        }

        if (spawns[1]) {
            const a = spawnToWorld(
                spawns[1],
                1,
                charHeight,
                this.terrainEngine,
            );
            this.aiStats.x = a.x;
            this.aiStats.y = a.y;
        } else {
            const safe = this.findSafeCharacterPosition(
                fallbackAiX,
                worldCenterY,
            );
            this.aiStats.x = safe?.x ?? fallbackAiX;
            this.aiStats.y = safe?.y ?? worldCenterY;
        }

        this.playerStats.facing = "right";
        this.aiStats.facing = "left";

        // Player sprite (blue)
        this.playerSprite = this.add
            .rectangle(this.playerStats.x, this.playerStats.y, 40, 60, 0x4488ff)
            .setDepth(2)
            .setAlpha(0.18);
        this.playerAvatar = this.add
            .image(
                this.playerStats.x,
                this.playerStats.y,
                `${this.playerRace}_battle`,
            )
            .setDisplaySize(58, 72)
            .setDepth(3)
            .setVisible(false);
        this.playerWeaponIcon = this.add
            .image(
                this.playerStats.x + 34,
                this.playerStats.y + 2,
                this.weaponSpriteKey(this.playerWeapon.id),
            )
            .setDisplaySize(34, 34)
            .setDepth(4)
            .setVisible(false);
        this.playerNameLabel = this.add
            .text(
                this.playerStats.x,
                this.playerStats.y + 40,
                this.playerName,
                {
                    fontSize: "11px",
                    color: "#ffffff",
                    fontFamily: "monospace",
                },
            )
            .setOrigin(0.5)
            .setDepth(5);

        // AI sprite (red)
        this.aiSprite = this.add
            .rectangle(this.aiStats.x, this.aiStats.y, 40, 60, 0xff4444)
            .setDepth(2)
            .setAlpha(0.18);
        this.aiAvatar = this.add
            .image(
                this.aiStats.x,
                this.aiStats.y,
                this.battleMode === "dungeon" ? "dwarf_battle" : "elf_battle",
            )
            .setDisplaySize(58, 72)
            .setFlipX(true)
            .setTint(this.battleMode === "dungeon" ? 0xffcc88 : 0xffffff)
            .setDepth(3)
            .setVisible(false);
        this.aiWeaponIcon = this.add
            .image(
                this.aiStats.x - 34,
                this.aiStats.y + 2,
                this.weaponSpriteKey(this.aiWeapon.id),
            )
            .setDisplaySize(34, 34)
            .setDepth(4)
            .setVisible(false);
        this.aiNameLabel = this.add
            .text(this.aiStats.x, this.aiStats.y + 40, this.opponentName, {
                fontSize: "11px",
                color: "#ffffff",
                fontFamily: "monospace",
            })
            .setOrigin(0.5)
            .setDepth(5);

        // Projectile arc managed by ProjectileRenderer
        this.projectileArc = this.projRenderer.createProjectile(
            WEAPON_COLORS[this.playerWeapon.id] ?? 0xffff00,
            runeWarsProjectileKey(this.playerWeapon.id, "projectile"),
        );

        // HUD
        this.effectsHud = new EffectsHud(this);

        // [v1.5.0] BattleHud — unified HUD entry point
        this.battleHud = new BattleHud();
        this.battleHud.create(this);

        // [v1.5.0] BattleInputController — unified keyboard input
        this.battleInputController = new BattleInputController();
        this.battleInputController.attach(this);

        // [v1.5.0] MapModifierManager — power-up orbs on the map
        this.mapModifierManager = new MapModifierManager();

        // [v1.9.0] Modular renderer for player visual layers.
        this.playerCharacterSprite = new ModularCharacterRenderer(this, {
            race: this.resolvePlayableRace(this.playerRace),
            x: this.playerStats.x,
            y: this.characterVisualY(this.playerStats.y),
            facing: "right",
            weaponId: this.playerWeapon.id,
        });
        this.playerCharacterSprite.setDepth(10);

        // [v1.9.0] Modular renderer for enemy visual layers.
        const aiRace: RuneWarsRaceId =
            this.battleMode === "dungeon"
                ? "dwarf"
                : this.resolvePlayableRace(this.opponentRace, "elf");
        this.aiCharacterSprite = new ModularCharacterRenderer(this, {
            race: aiRace,
            x: this.aiStats.x,
            y: this.characterVisualY(this.aiStats.y),
            facing: "left",
            weaponId: this.aiWeapon.id,
        });
        this.aiCharacterSprite.setDepth(10);

        if (this.dungeonStageConfig) {
            this.createDungeonStageObjects(mapMeta, spawnContext);
        }

        // Ghost trace: only in real battles (not playground)
        if (!this.isPlayground) {
            this.ghostTrace = new GhostTrace(this);
        }

        // Camera follows player
        this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);

        // Movement budget HUD
        this.movementBudgetHUD = new MovementBudgetHUD(
            this,
            width / 2,
            height - 80,
        );
        this.moveBudgetTotal = moveBudget(this.playerAgility);
        this.moveBudgetUsed = 0;
        this.movementBudgetHUD.update(0, this.moveBudgetTotal);

        // Controls
        this.createControls();
        this.createKeyboardControls();

        // Wire BattleHud dock events to game logic
        this.events.on("consumable:use", (index: number) => {
            const items = this.consumableSystem.getEquipped();
            if (index < items.length)
                this.onConsumableDockSelect(index, items[index].id);
        });
        this.events.on("modifier:use", (index: number) => {
            if (index < this.modifierDefs.length)
                this.onModifierDockSelect(this.modifierDefs[index].id);
        });

        // Auto-pass player's turn when the timer expires
        this.events.on("turn:expired", () => {
            if (
                this.turnManager.isPlayerTurn &&
                !this.isAnimating &&
                !this.isChargingPower
            ) {
                this.passTurn();
            }
        });

        this.createBattleMenu();

        // Snap both characters to ground immediately — no fall animation on start
        this.snapCharactersToGround();

        // Wind generate on scene start
        this.windSystem.generate();
        this.refreshHud();
        this.updateTrajectoryPreview();

        // Map drag (pan with mouse/touch)
        this.setupMapDrag();

        // Handle resize
        this.scale.on("resize", this.onResize, this);

        this.startOpeningBattleIntro();
    }

    private startOpeningBattleIntro(): void {
        const targets = this.getOpeningFocusTargets();
        if (targets.length === 0) {
            this.finishOpeningBattleIntro();
            return;
        }

        this.isAnimating = true;
        this.movementBudgetHUD?.setVisible(false);
        this.cameras.main.stopFollow();

        let index = 0;
        const focusNext = (): void => {
            if (this.battleEnded) return;
            const target = targets[index];
            if (!target) {
                this.showDungeonObjectiveIntro(() =>
                    this.finishOpeningBattleIntro(),
                );
                return;
            }

            index += 1;
            this.focusCameraOnOpeningTarget(target);
            this.showOpeningFocusLabel(target);
            this.scheduleTurnEvent(500, focusNext);
        };

        focusNext();
    }

    private getOpeningFocusTargets(): OpeningFocusTarget[] {
        const targets: OpeningFocusTarget[] = [
            {
                x: this.playerStats.x,
                y: this.playerStats.y,
                label: this.playerName,
            },
        ];

        if (this.dungeonStageConfig) {
            for (const monster of this.getAliveDungeonMonsters()) {
                targets.push({
                    x: monster.stats.x,
                    y: monster.stats.y,
                    label: monster.name,
                });
            }
            return targets;
        }

        targets.push({
            x: this.aiStats.x,
            y: this.aiStats.y,
            label: this.opponentName,
        });
        return targets;
    }

    private focusCameraOnOpeningTarget(target: OpeningFocusTarget): void {
        const camera = this.cameras.main;
        const halfWidth = camera.width / 2;
        const halfHeight = camera.height / 2;
        const x = Phaser.Math.Clamp(
            target.x,
            halfWidth,
            WORLD_WIDTH - halfWidth,
        );
        const y = Phaser.Math.Clamp(
            target.y - 20,
            halfHeight,
            WORLD_HEIGHT - halfHeight,
        );
        camera.pan(x, y, 450, "Sine.easeInOut", true);
    }

    private showOpeningFocusLabel(target: OpeningFocusTarget): void {
        const text = this.add
            .text(this.scale.width / 2, 92, target.label, {
                fontSize: "18px",
                color: "#f9e7b0",
                fontFamily: "Georgia, serif",
                fontStyle: "bold",
                stroke: "#101827",
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(80)
            .setAlpha(0);

        this.tweens.add({
            targets: text,
            alpha: 1,
            y: 82,
            duration: 220,
            ease: "Sine.easeOut",
            yoyo: true,
            hold: 1200,
            onComplete: () => text.destroy(),
        });
    }

    private showDungeonObjectiveIntro(onComplete: () => void): void {
        if (!this.dungeonStageConfig) {
            onComplete();
            return;
        }

        const message = this.getDungeonObjectiveMessage();
        const panelWidth = Math.min(this.scale.width - 48, 560);
        const panelHeight = 138;
        const panel = this.add
            .rectangle(0, 0, panelWidth, panelHeight, 0x101827, 0.94)
            .setStrokeStyle(2, 0xd9a441, 0.95);
        const accent = this.add.rectangle(
            0,
            -panelHeight / 2 + 8,
            panelWidth - 28,
            3,
            0x47d5ff,
            0.85,
        );
        const title = this.add
            .text(0, -38, "Objetivo da dungeon", {
                fontSize: "18px",
                color: "#f7d77f",
                fontFamily: "Georgia, serif",
                fontStyle: "bold",
                stroke: "#05070c",
                strokeThickness: 3,
            })
            .setOrigin(0.5);
        const body = this.add
            .text(0, 20, message, {
                fontSize: "16px",
                color: "#f7fbff",
                fontFamily: "Georgia, serif",
                align: "center",
                wordWrap: { width: panelWidth - 56 },
                lineSpacing: 6,
            })
            .setOrigin(0.5);
        const container = this.add
            .container(this.scale.width / 2, this.scale.height / 2, [
                panel,
                accent,
                title,
                body,
            ])
            .setScrollFactor(0)
            .setDepth(90)
            .setAlpha(0);

        this.tweens.add({
            targets: container,
            alpha: 1,
            y: this.scale.height / 2 - 8,
            duration: 260,
            ease: "Sine.easeOut",
        });
        this.scheduleTurnEvent(3200, () => {
            this.tweens.add({
                targets: container,
                alpha: 0,
                y: this.scale.height / 2 - 22,
                duration: 220,
                ease: "Sine.easeIn",
                onComplete: () => {
                    container.destroy(true);
                    onComplete();
                },
            });
        });
    }

    private getDungeonObjectiveMessage(): string {
        if (!this.dungeonStageConfig) return "";
        if (this.dungeonStageConfig.objective === "TRAVERSE") {
            return "Seu objetivo é atravessar a caverna e alcançar o portal para vencer este estágio.";
        }
        if (this.dungeonStageConfig.objective === "DEFEAT_BOSS") {
            return "Derrote o chefe para conquistar este andar e liberar as recompensas.";
        }
        return "Elimine todos os monstros da sala para vencer este estágio.";
    }

    private finishOpeningBattleIntro(): void {
        if (this.battleEnded) return;
        this.isAnimating = false;
        this.cameras.main.startFollow(
            this.turnManager.isPlayerTurn ? this.playerSprite : this.aiSprite,
            true,
            0.08,
            0.08,
        );
        this.movementBudgetHUD?.setVisible(this.turnManager.isPlayerTurn);
        this.refreshHud();
        this.updateTrajectoryPreview();
    }

    override update(time: number, delta: number): void {
        if (this.isChargingPower) {
            this.updateChargePowerFrame(time);
            return;
        }

        // Fall physics run unconditionally so characters fall during fall-wait even
        // when isAnimating=true (locked between shot landing and turn processing).
        if (!this.battleEnded) {
            const playerFallState = this.playerFall.update(
                this.playerSprite,
                this.terrainEngine,
                delta,
            );
            const aiFallState = this.dungeonStageConfig
                ? null
                : this.aiFall.update(this.aiSprite, this.terrainEngine, delta);

            if (playerFallState === "dead" && this.playerStats.hp > 0) {
                this.playerStats.hp = 0;
                this.finishBattle(false);
                return;
            }
            if (aiFallState === "dead" && this.aiStats.hp > 0) {
                this.aiStats.hp = 0;
                this.finishBattle(true);
                return;
            }

            this.playerStats.x = this.playerSprite.x;
            this.playerStats.y = this.playerSprite.y;
            if (this.dungeonStageConfig) {
                this.syncPrimaryDungeonMonster();
            } else {
                this.aiStats.x = this.aiSprite.x;
                this.aiStats.y = this.aiSprite.y;
            }
            this.syncActorAssets();
        }

        if (!this.isAnimating) {
            this.handleKeyboardInput(delta);
        }

        this.previewRefreshMs += delta;
        if (
            this.turnManager.isPlayerTurn &&
            !this.isAnimating &&
            this.previewRefreshMs >= 120
        ) {
            this.previewRefreshMs = 0;
            this.updateTrajectoryPreview();
        }

        // Update effects HUD every frame
        if (this.effectsHud) {
            this.effectsHud.update(
                this.statusEffects.getEffects("player"),
                this.statusEffects.getEffects("ai"),
            );
        }

        // [v1.5.0] BattleHud update every frame
        if (this.battleHud) {
            const wind = this.windSystem.getCurrent();
            const angleLimits = getWeaponAngleLimits(
                this.playerWeapon?.id ?? "default",
            );
            const dungeonEnemyTeam = this.buildDungeonEnemyTeam();
            const enemyHud = dungeonEnemyTeam[0] ?? {
                name: this.opponentName,
                hp: this.aiStats.hp,
                maxHp: this.aiStats.maxHp,
                active: !this.turnManager.isPlayerTurn,
            };
            const hudState: BattleHudState = {
                player: {
                    name: this.playerName,
                    hp: this.playerStats.hp,
                    maxHp: this.playerStats.maxHp,
                    stamina: this.moveBudgetTotal - this.moveBudgetUsed,
                    maxStamina: this.moveBudgetTotal,
                },
                enemy: {
                    name: enemyHud.name,
                    hp: enemyHud.hp,
                    maxHp: enemyHud.maxHp,
                    stamina: 100,
                    maxStamina: 100,
                },
                teams: {
                    left: [
                        {
                            name: this.playerName,
                            hp: this.playerStats.hp,
                            maxHp: this.playerStats.maxHp,
                            active: this.turnManager.isPlayerTurn,
                        },
                    ],
                    right: this.dungeonStageConfig
                        ? dungeonEnemyTeam
                        : [
                              {
                                  name: this.opponentName,
                                  hp: this.aiStats.hp,
                                  maxHp: this.aiStats.maxHp,
                                  active: !this.turnManager.isPlayerTurn,
                              },
                          ],
                },
                roomName: this.roomName,
                mapName: this.getMapOption(this.currentMap).label,
                mode: this.battleMode === "dungeon" ? "DUNGEON" : "PVP",
                turnNumber: this.turnManager.turnNumber,
                wind: { x: wind.direction * (wind.intensity / 10), y: 0 },
                power: this.powerValue,
                angle: this.currentAngle,
                facing: this.playerStats.facing,
                angleLimits,
                isPlayerTurn: this.turnManager.isPlayerTurn,
                isCharging: this.isChargingPower,
                consumables: this.buildConsumableSlots(),
                modifiers: this.buildModifierSlots(),
            };
            this.battleHud.update(hudState);
        }

        // [v1.9.0] Sync modular visual renderers with gameplay proxy sprites.
        if (this.playerCharacterSprite) {
            this.playerCharacterSprite.setPosition(
                this.playerSprite.x,
                this.characterVisualY(this.playerSprite.y),
            );
            this.playerCharacterSprite.setAimAngle(
                this.visualAimAngle(this.currentAngle, this.playerStats.facing),
            );
            this.playerCharacterSprite.update(delta);
        }
        if (this.aiCharacterSprite) {
            this.aiCharacterSprite.setPosition(
                this.aiSprite.x,
                this.characterVisualY(this.aiSprite.y),
            );
            this.aiCharacterSprite.setAimAngle(
                this.visualAimAngle(this.currentAngle, "left"),
            );
            this.aiCharacterSprite.update(delta);
        }
    }

    private snapCharactersToGround(): void {
        this.playerFall.snapToGround(this.playerSprite, this.terrainEngine);
        if (!this.dungeonStageConfig) {
            this.aiFall.snapToGround(this.aiSprite, this.terrainEngine);
        }
        this.ensureCharactersOutsideTerrain();
        this.playerStats.x = this.playerSprite.x;
        this.playerStats.y = this.playerSprite.y;
        if (this.dungeonStageConfig) {
            this.syncPrimaryDungeonMonster();
        } else {
            this.aiStats.x = this.aiSprite.x;
            this.aiStats.y = this.aiSprite.y;
        }
        this.syncActorAssets();
    }

    private getSpawnNormalizationContext(
        mapName: MapName,
        mapMeta?: MapMeta,
    ): SpawnNormalizationContext {
        const sourceSize = this.getMapTerrainSourceSize(mapName);
        return {
            cols: mapMeta?.cols,
            rows: mapMeta?.rows,
            sourceWidth: sourceSize?.width ?? mapMeta?.width,
            sourceHeight: sourceSize?.height ?? mapMeta?.height,
        };
    }

    private getMapTerrainSourceSize(
        mapName: MapName,
    ): { width: number; height: number } | undefined {
        const terrainKey = `map_${mapName}_terrain`;
        if (!this.textures.exists(terrainKey)) return undefined;

        const texture = this.textures.get(terrainKey);
        const source = texture?.getSourceImage() as
            | { width?: number; height?: number }
            | undefined;
        const width = source?.width;
        const height = source?.height;

        if (
            typeof width === "number" &&
            Number.isFinite(width) &&
            typeof height === "number" &&
            Number.isFinite(height) &&
            width > 0 &&
            height > 0
        ) {
            return { width, height };
        }

        return undefined;
    }

    private findSafeCharacterPosition(
        desiredX: number,
        startY: number,
        options?: {
            halfWidth?: number;
            height?: number;
            searchUp?: number;
            searchDown?: number;
            searchRadiusX?: number;
        },
    ): { x: number; y: number } | null {
        return findSafeGroundedPosition(this.terrainEngine, desiredX, startY, {
            halfWidth: options?.halfWidth ?? CHARACTER_BODY_HALF_WIDTH,
            height: options?.height ?? CHARACTER_BODY_HEIGHT,
            minX: 72,
            maxX: MAP_WORLD_WIDTH - 72,
            searchUp: options?.searchUp ?? WORLD_HEIGHT,
            searchDown: options?.searchDown ?? WORLD_HEIGHT,
            searchRadiusX: options?.searchRadiusX ?? 240,
        });
    }

    private createDungeonStageObjects(
        mapMeta: MapMeta | undefined,
        spawnContext: SpawnNormalizationContext,
    ): void {
        if (!this.dungeonStageConfig) return;

        this.aiAvatar?.setVisible(false);
        this.aiWeaponIcon?.setVisible(false);
        this.aiNameLabel?.setVisible(false);
        this.aiCharacterSprite?.container.setVisible(false);

        const spawnPoints = normalizeSpawns(
            mapMeta?.spawnPoints ?? [],
            spawnContext,
        );
        const playerSpawn = spawnPoints[0];
        const monsterSpawnPoints =
            spawnPoints.length > 1 ? spawnPoints.slice(1) : spawnPoints;
        const searchY = playerSpawn?.y ?? WORLD_HEIGHT * 0.68;
        const playerSafe = this.findSafeCharacterPosition(
            playerSpawn?.x ?? this.dungeonStageConfig.playerStartX,
            searchY,
            {
                searchUp: 520,
                searchDown: 620,
                searchRadiusX: 220,
            },
        );
        if (playerSafe) {
            this.playerSprite.setPosition(playerSafe.x, playerSafe.y);
            this.playerStats.x = playerSafe.x;
            this.playerStats.y = playerSafe.y;
        }

        if (this.dungeonStageConfig.objective === "TRAVERSE") {
            this.createDungeonPortal(searchY);
        }

        let monsterIndex = 0;
        for (const monsterDef of this.dungeonStageConfig.monsters) {
            for (let i = 0; i < monsterDef.count; i += 1) {
                this.dungeonMonsters.push(
                    this.createDungeonMonster(
                        monsterDef,
                        monsterIndex,
                        monsterSpawnPoints,
                        searchY,
                    ),
                );
                monsterIndex += 1;
            }
        }

        this.syncPrimaryDungeonMonster();
        this.syncActorAssets();
    }

    private createDungeonPortal(searchY: number): void {
        if (!this.dungeonStageConfig?.portalX) return;
        const safe = this.findSafeCharacterPosition(
            this.dungeonStageConfig.portalX,
            searchY,
            {
                searchUp: 520,
                searchDown: 620,
                searchRadiusX: 180,
            },
        );
        const x = safe?.x ?? this.dungeonStageConfig.portalX;
        const y = (safe?.y ?? searchY) - 16;
        const portal = this.add
            .circle(0, 0, 42, 0x5fd9ff, 0.34)
            .setStrokeStyle(4, 0xb8fbff)
            .setDepth(8);
        const label = this.add
            .text(0, 56, "Portal", {
                fontSize: "12px",
                color: "#d8fbff",
                fontFamily: "monospace",
                stroke: "#082332",
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(9);
        this.dungeonPortal = this.add
            .container(x, y, [portal, label])
            .setDepth(8);
    }

    private createDungeonMonster(
        monsterDef: DungeonMonsterDefinition,
        index: number,
        spawnPoints: WorldSpawnPoint[],
        searchY: number,
    ): DungeonMonsterRuntime {
        const preferred = spawnPoints[index % Math.max(1, spawnPoints.length)];
        const spawnCycleOffset =
            spawnPoints.length > 0
                ? Math.floor(index / spawnPoints.length) * 74
                : 0;
        const desiredX =
            (preferred?.x ?? MAP_WORLD_WIDTH - 420 - index * 90) +
            spawnCycleOffset;
        const floorSafe = this.findSafeCharacterPosition(
            desiredX,
            preferred?.y ?? searchY,
            {
                searchUp: 560,
                searchDown: 620,
                searchRadiusX: 140,
            },
        );
        const floorY = floorSafe?.y ?? preferred?.y ?? searchY;
        const isFlyer =
            monsterDef.behavior === "HORIZONTAL_FLYER" ||
            monsterDef.behavior === "BOSS_FLYER";
        const x = floorSafe?.x ?? desiredX;
        const y = isFlyer
            ? Math.max(
                  120,
                  floorY - monsterDef.height * 1.35 - (index % 3) * 36,
              )
            : floorY;
        const maxHp = scaleDungeonHp(monsterDef.baseHp, this.difficulty);
        const textureKey = dungeonMonsterFrameKey(monsterDef.type, 0);
        const body = this.textures.exists(textureKey)
            ? this.add
                  .image(0, 0, textureKey)
                  .setDisplaySize(monsterDef.width, monsterDef.height)
            : this.add
                  .rectangle(
                      0,
                      0,
                      monsterDef.width,
                      monsterDef.height,
                      0x9a5cff,
                  )
                  .setStrokeStyle(2, 0x1a1028);
        const hpText = this.add
            .text(0, -monsterDef.height / 2 - 14, `${maxHp}/${maxHp}`, {
                fontSize: "11px",
                color: "#f6d26f",
                fontFamily: "monospace",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);
        const nameText = this.add
            .text(0, monsterDef.height / 2 + 14, monsterDef.name, {
                fontSize: "10px",
                color: "#ffffff",
                fontFamily: "monospace",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);
        const container = this.add
            .container(x, y, [body, hpText, nameText])
            .setDepth(11);
        const runtime: DungeonMonsterRuntime = {
            id: `${monsterDef.type.toLowerCase()}-${index + 1}`,
            type: monsterDef.type,
            name: monsterDef.name,
            behavior: monsterDef.behavior,
            stats: {
                hp: maxHp,
                maxHp,
                x,
                y,
                isPlayer: false,
                facing: "left",
            },
            baseDamage: monsterDef.baseDamage,
            patrolMinX: Math.max(72, x - monsterDef.patrolRange),
            patrolMaxX: Math.min(
                MAP_WORLD_WIDTH - 72,
                x + monsterDef.patrolRange,
            ),
            patrolDirection: index % 2 === 0 ? 1 : -1,
            width: monsterDef.width,
            height: monsterDef.height,
            container,
            body,
            hpText,
        };
        this.attachDungeonMonsterAnimation(runtime);
        return runtime;
    }

    private attachDungeonMonsterAnimation(
        monster: DungeonMonsterRuntime,
    ): void {
        if (!(monster.body instanceof Phaser.GameObjects.Image)) return;
        const frames = [0, 1, 2, 3]
            .map((frame) => dungeonMonsterFrameKey(monster.type, frame))
            .filter((key) => this.textures.exists(key));
        if (frames.length < 2) return;

        let frameIndex = 0;
        monster.animationTimer = this.time.addEvent({
            delay: monster.behavior === "BOSS_FLYER" ? 160 : 110,
            loop: true,
            callback: () => {
                frameIndex = (frameIndex + 1) % frames.length;
                if (monster.body instanceof Phaser.GameObjects.Image) {
                    monster.body.setTexture(frames[frameIndex]);
                }
            },
        });
        monster.container.once("destroy", () =>
            monster.animationTimer?.remove(false),
        );
    }

    private syncPrimaryDungeonMonster(): void {
        if (!this.dungeonStageConfig) return;
        const firstAlive = this.dungeonMonsters.find(
            (monster) => monster.stats.hp > 0,
        );
        const primary = firstAlive ?? this.dungeonMonsters[0];
        if (!primary) return;
        this.aiStats = primary.stats;
        this.aiSprite.setPosition(primary.stats.x, primary.stats.y);
        this.aiSprite.setSize(primary.width, primary.height);
        this.aiSprite.setAlpha(0.001);
        this.opponentName = primary.name;
    }

    private updateDungeonMonsterVisual(monster: DungeonMonsterRuntime): void {
        monster.stats.x = monster.container.x;
        monster.stats.y = monster.container.y;
        monster.hpText.setText(`${monster.stats.hp}/${monster.stats.maxHp}`);
        monster.container.setVisible(monster.stats.hp > 0);
        if (monster.stats.hp <= 0) {
            monster.animationTimer?.remove(false);
        }
    }

    private getAliveDungeonMonsters(): DungeonMonsterRuntime[] {
        return this.dungeonMonsters.filter((monster) => monster.stats.hp > 0);
    }

    private buildDungeonEnemyTeam(): Array<{
        name: string;
        hp: number;
        maxHp: number;
        active: boolean;
    }> {
        if (!this.dungeonStageConfig) return [];
        const alive = this.getAliveDungeonMonsters();
        const source = alive.length > 0 ? alive : this.dungeonMonsters;
        return source.slice(0, 6).map((monster, index) => ({
            name:
                source.length > 1
                    ? `${monster.name} ${index + 1}`
                    : monster.name,
            hp: monster.stats.hp,
            maxHp: monster.stats.maxHp,
            active:
                !this.turnManager.isPlayerTurn &&
                monster.stats.hp > 0 &&
                index === 0,
        }));
    }

    private getDungeonTargetAt(point: {
        x: number;
        y: number;
    }): DungeonMonsterRuntime | undefined {
        return this.getAliveDungeonMonsters().find((monster) => {
            const dx = Math.abs(point.x - monster.stats.x);
            const dy = Math.abs(point.y - monster.stats.y);
            return (
                dx <= Math.max(30, monster.width * 0.45) &&
                dy <= Math.max(36, monster.height * 0.45)
            );
        });
    }

    private getNearestDungeonTarget(point: {
        x: number;
        y: number;
    }): DungeonMonsterRuntime | undefined {
        let best: { monster: DungeonMonsterRuntime; distance: number } | null =
            null;
        for (const monster of this.getAliveDungeonMonsters()) {
            const dx = point.x - monster.stats.x;
            const dy = point.y - monster.stats.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (!best || distance < best.distance) best = { monster, distance };
        }
        return best?.monster;
    }

    private checkDungeonPortalReached(): void {
        if (
            this.battleEnded ||
            this.dungeonStageConfig?.objective !== "TRAVERSE" ||
            !this.dungeonPortal
        ) {
            return;
        }
        const distance = Phaser.Math.Distance.Between(
            this.playerStats.x,
            this.playerStats.y,
            this.dungeonPortal.x,
            this.dungeonPortal.y,
        );
        if (distance <= 82) this.finishBattle(true);
    }

    private ensureCharactersOutsideTerrain(): void {
        const playerSafe = resolveCharacterTerrainOverlap(
            this.terrainEngine,
            this.playerSprite.x,
            this.playerSprite.y,
            {
                halfWidth: this.playerSprite.width / 2,
                height: this.playerSprite.height,
                minX: 72,
                maxX: MAP_WORLD_WIDTH - 72,
            },
        );
        if (playerSafe)
            this.playerSprite.setPosition(playerSafe.x, playerSafe.y);

        if (this.dungeonStageConfig) return;

        const aiSafe = resolveCharacterTerrainOverlap(
            this.terrainEngine,
            this.aiSprite.x,
            this.aiSprite.y,
            {
                halfWidth: this.aiSprite.width / 2,
                height: this.aiSprite.height,
                minX: 72,
                maxX: MAP_WORLD_WIDTH - 72,
            },
        );
        if (aiSafe) this.aiSprite.setPosition(aiSafe.x, aiSafe.y);
    }

    private syncActorAssets(): void {
        this.playerAvatar?.setPosition(
            this.playerSprite.x,
            this.playerSprite.y,
        );
        this.aiAvatar?.setPosition(this.aiSprite.x, this.aiSprite.y);
        this.playerWeaponIcon?.setPosition(
            this.playerSprite.x + 34,
            this.playerSprite.y + 2,
        );
        this.aiWeaponIcon?.setPosition(
            this.aiSprite.x - 34,
            this.aiSprite.y + 2,
        );
        this.playerNameLabel?.setPosition(
            this.playerSprite.x,
            this.playerSprite.y + 40,
        );
        this.aiNameLabel?.setPosition(this.aiSprite.x, this.aiSprite.y + 40);
        this.playerAvatar?.setAlpha(this.playerInvisibleTurns > 0 ? 0.38 : 1);
        this.playerCharacterSprite?.setAlpha(
            this.playerInvisibleTurns > 0 ? 0.38 : 1,
        );
    }

    private weaponSpriteKey(id: string): string {
        if (id === "ice-book") return "weapon_icebook_sprite";
        return `weapon_${id}_sprite`; // handles "magic-grenade" → "weapon_magic-grenade_sprite"
    }

    private resolvePlayableRace(
        race: string | undefined,
        fallback: RuneWarsRaceId = "human",
    ): RuneWarsRaceId {
        if (
            race === "human" ||
            race === "elf" ||
            race === "celestial" ||
            race === "demonoid" ||
            race === "beast" ||
            race === "dwarf"
        ) {
            return race;
        }
        return fallback;
    }

    private characterVisualY(spriteY: number): number {
        return spriteY + 32;
    }

    private visualAimAngle(angle: number, facing: "left" | "right"): number {
        const localAngle = facing === "left" ? 180 - angle : -angle;
        return Phaser.Math.Clamp(localAngle, -85, 85);
    }

    private applyProjectileVisual(
        projectile: ProjectileObject,
        weaponId: string,
    ): void {
        const color = WEAPON_COLORS[weaponId] ?? 0xffff00;
        const textureKey = runeWarsProjectileKey(weaponId, "projectile");

        if (projectile instanceof Phaser.GameObjects.Arc) {
            projectile.setFillStyle(color);
            return;
        }

        if (this.textures.exists(textureKey)) {
            projectile.setTexture(textureKey).setDisplaySize(28, 28);
        }
    }

    private applySecondaryVisual(
        target: "player" | "ai",
        itemId: string,
    ): void {
        const character =
            target === "player"
                ? this.playerCharacterSprite
                : this.aiCharacterSprite;
        if (!character) return;

        if (itemId === "shield") {
            character.equip(
                "back",
                runeWarsItemLayerKey("secondary", "shield"),
            );
            return;
        }

        character.unequip("back");
    }

    private showProjectileTrailFx(
        weaponId: string,
        path: Array<{ x: number; y: number }>,
    ): void {
        const textureKey = runeWarsProjectileKey(weaponId, "trail");
        if (!this.textures.exists(textureKey) || path.length < 2) return;

        const start = path[Math.min(4, path.length - 1)];
        const end = path[Math.min(18, path.length - 1)];
        const trail = this.add
            .image(start.x, start.y, textureKey)
            .setDisplaySize(54, 54)
            .setRotation(
                Phaser.Math.Angle.Between(start.x, start.y, end.x, end.y),
            )
            .setAlpha(0.58)
            .setDepth(7);

        this.tweens.add({
            targets: trail,
            alpha: 0,
            scaleX: 0.7,
            scaleY: 0.7,
            duration: 280,
            ease: "Quad.easeOut",
            onComplete: () => trail.destroy(),
        });
    }

    private showProjectileImpactFx(
        weaponId: string,
        x: number,
        y: number,
    ): void {
        const textureKey = runeWarsProjectileKey(weaponId, "impact");
        if (!this.textures.exists(textureKey)) return;

        const impact = this.add
            .image(x, y, textureKey)
            .setDisplaySize(72, 72)
            .setAlpha(0.9)
            .setDepth(9);

        this.tweens.add({
            targets: impact,
            alpha: 0,
            scaleX: 1.25,
            scaleY: 1.25,
            duration: 360,
            ease: "Quad.easeOut",
            onComplete: () => impact.destroy(),
        });
    }

    // ──────────────────────────────────────────────────────────
    // Controls
    // ──────────────────────────────────────────────────────────

    private createControls(): void {
        const { height } = this.scale;
        const angleY = height - 53;

        this.angleText = this.add
            .text(0, 0, `${this.currentAngle}°`, {
                fontSize: "1px",
                color: "#ffffff",
                fontFamily: "monospace",
            })
            .setVisible(false)
            .setScrollFactor(0);

        const dialR = Math.round(
            Math.min(this.scale.height * 0.085, this.scale.width * 0.052),
        );
        const angleX = dialR + 2;
        const hitW = Math.max(56, Math.round(dialR * 0.9));
        const hitH = Math.max(96, Math.round(dialR * 1.55));

        this._btnAngleMinus = this.add
            .rectangle(angleX - hitW / 2, angleY, hitW, hitH, 0x000000, 0.001)
            .setInteractive({ useHandCursor: true })
            .setDepth(41)
            .setScrollFactor(0);
        this._btnAnglePlus = this.add
            .rectangle(angleX + hitW / 2, angleY, hitW, hitH, 0x000000, 0.001)
            .setInteractive({ useHandCursor: true })
            .setDepth(41)
            .setScrollFactor(0);

        this._btnAngleMinus.on("pointerdown", () => this.onAngleButtonDown(-1));
        this._btnAngleMinus.on("pointerup", () => this.onAngleButtonUp());
        this._btnAngleMinus.on("pointerout", () => this.onAngleButtonUp());
        this._btnAnglePlus.on("pointerdown", () => this.onAngleButtonDown(1));
        this._btnAnglePlus.on("pointerup", () => this.onAngleButtonUp());
        this._btnAnglePlus.on("pointerout", () => this.onAngleButtonUp());

        // Fire events from BattleHud PowerBar
        this.battleHud.onFireDown(() => this.startChargingPower());
        this.battleHud.onFireUp(() => this.releaseFire());
        this.layoutAngleControls();
    }

    private createBattleMenu(): void {
        const x = this.getPassButtonX();
        const y = 26;

        this.battleMenuButton = this.add
            .rectangle(x, y, 118, 48, 0x1b140c, 0.94)
            .setStrokeStyle(3, 0x7b5a31, 1)
            .setInteractive()
            .setDepth(36)
            .setScrollFactor(0);
        this.battleMenuButtonText = this.add
            .text(x, y, "PASSAR ▶", {
                fontSize: "17px",
                color: "#f6d69a",
                fontFamily: "Georgia, serif",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setDepth(37)
            .setScrollFactor(0);

        this.battleMenuButton.on("pointerover", () =>
            this.battleMenuButton?.setFillStyle(0x2b1e10, 0.98),
        );
        this.battleMenuButton.on("pointerout", () =>
            this.battleMenuButton?.setFillStyle(0x1b140c, 0.94),
        );
        this.battleMenuButton.on("pointerdown", () => this.passTurn());

        const surrenderX = x + 128;
        this.surrenderButton = this.add
            .rectangle(surrenderX, y, 118, 48, 0x4e1414, 0.94)
            .setStrokeStyle(3, 0x9d4a2e, 1)
            .setInteractive({ useHandCursor: true })
            .setDepth(36)
            .setScrollFactor(0);
        this.surrenderButtonText = this.add
            .text(surrenderX, y, "DESISTIR", {
                fontSize: "16px",
                color: "#ffd6c6",
                fontFamily: "Georgia, serif",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setDepth(37)
            .setScrollFactor(0);

        this.surrenderButton.on("pointerover", () =>
            this.surrenderButton?.setFillStyle(0x6b1e16, 0.98),
        );
        this.surrenderButton.on("pointerout", () =>
            this.surrenderButton?.setFillStyle(0x4e1414, 0.94),
        );
        this.surrenderButton.on("pointerdown", () =>
            this.confirmSurrenderBattle(),
        );

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
        const showExitButton = this.battleMode !== "dungeon";

        const bg = this.add
            .rectangle(
                0,
                0,
                panelWidth,
                showExitButton ? 112 : 64,
                0x111827,
                0.95,
            )
            .setOrigin(0, 0)
            .setStrokeStyle(1, 0x7dd3fc, 0.75);
        const surrenderBtn = this.add
            .rectangle(12, 14, panelWidth - 24, 36, 0x7f1d1d, 0.95)
            .setOrigin(0, 0)
            .setInteractive();
        const surrenderText = this.add
            .text(panelWidth / 2, 32, "Desistir", {
                fontSize: "13px",
                color: "#ffffff",
                fontFamily: "monospace",
                fontStyle: "bold",
            })
            .setOrigin(0.5);
        const exitBtn = this.add
            .rectangle(12, 62, panelWidth - 24, 36, 0x334155, 0.95)
            .setOrigin(0, 0)
            .setInteractive();
        const exitText = this.add
            .text(panelWidth / 2, 80, "Sair", {
                fontSize: "13px",
                color: "#ffffff",
                fontFamily: "monospace",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        surrenderBtn.on("pointerover", () =>
            surrenderBtn.setFillStyle(0x991b1b, 0.98),
        );
        surrenderBtn.on("pointerout", () =>
            surrenderBtn.setFillStyle(0x7f1d1d, 0.95),
        );
        surrenderBtn.on("pointerdown", () => this.surrenderBattle());

        const menuItems: Phaser.GameObjects.GameObject[] = [
            bg,
            surrenderBtn,
            surrenderText,
        ];
        if (showExitButton) {
            exitBtn.on("pointerover", () =>
                exitBtn.setFillStyle(0x475569, 0.98),
            );
            exitBtn.on("pointerout", () =>
                exitBtn.setFillStyle(0x334155, 0.95),
            );
            exitBtn.on("pointerdown", () => this.exitBattle());
            menuItems.push(exitBtn, exitText);
        } else {
            exitBtn.destroy();
            exitText.destroy();
        }

        this.battleMenuPanel = this.add
            .container(panelX, panelY, menuItems)
            .setDepth(30)
            .setScrollFactor(0);
    }

    private layoutBattleMenuButton(): void {
        const x = this.getPassButtonX();
        this.battleMenuButton?.setPosition(x, 26);
        this.battleMenuButtonText?.setPosition(x, 26);
        this.surrenderButton?.setPosition(x + 128, 26);
        this.surrenderButtonText?.setPosition(x + 128, 26);
        if (this.battleMenuOpen) {
            this.toggleBattleMenu(true);
        }
    }

    private passTurn(): void {
        if (!this.turnManager.isPlayerTurn || this.isAnimating) return;
        this.isChargingPower = false;
        this.leaveChargePerformanceMode();
        this.battleHud?.setCharging(false);
        this.powerValue = 0;
        this.battleHud?.updatePower(0);
        this.endTurn(true, false);
    }

    private confirmSurrenderBattle(): void {
        if (this.battleEnded) return;
        const confirmed = window.confirm(
            "Deseja realmente desistir da partida?",
        );
        if (!confirmed) return;
        this.surrenderBattle();
    }

    private surrenderBattle(): void {
        this.toggleBattleMenu(false);
        this.isChargingPower = false;
        this.leaveChargePerformanceMode();
        this.battleHud?.setCharging(false);
        this.isAnimating = true;
        this.finishBattle(false, "surrender");
    }

    private exitBattle(): void {
        if (this.battleMode === "dungeon") {
            this.surrenderBattle();
            return;
        }
        window.dispatchEvent(new CustomEvent("rune-wars:battle-exit"));
    }

    private finishBattle(
        victory: boolean,
        reason: BattleFinishReason = victory ? "victory" : "defeat",
    ): void {
        this.toggleBattleMenu(false);
        this.isAnimating = true;
        this.battleEnded = true;
        this.resultOverlay.show(this, victory, {
            showRestartButton: this.isPlayground,
            subtitle: this.isPlayground
                ? undefined
                : this.battleMode === "dungeon" && !victory
                  ? "Voltando para a sala..."
                  : "Voltando para a sala...",
        });

        if (!this.isPlayground) {
            this.time.delayedCall(1600, () => {
                window.dispatchEvent(
                    new CustomEvent("rune-wars:battle-finished", {
                        detail: { victory, reason },
                    }),
                );
            });
        }
    }

    private changeAngle(delta: number): void {
        if (this.isAnimating || !this.turnManager.isPlayerTurn) return;
        if (this.statusEffects.hasEffect("player", "FREEZE")) return;
        const limits = getWeaponAngleLimits(this.playerWeapon?.id ?? "default");
        this.currentAngle = Math.round(
            Math.max(
                limits.minAngle,
                Math.min(limits.maxAngle, this.currentAngle + delta),
            ),
        );
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
        if (this.holdTimer) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
        }
        if (this.holdInterval) {
            clearInterval(this.holdInterval);
            this.holdInterval = null;
        }
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
        this.spaceKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
        );
        this.input.keyboard.addCapture([
            Phaser.Input.Keyboard.KeyCodes.LEFT,
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
            Phaser.Input.Keyboard.KeyCodes.UP,
            Phaser.Input.Keyboard.KeyCodes.DOWN,
            Phaser.Input.Keyboard.KeyCodes.SPACE,
        ]);

        this.spaceKey.on("down", () => {
            if (!this.isChargingPower) this.startChargingPower();
        });
        this.spaceKey.on("up", () => this.releaseFire());
    }

    private buildConsumableSlots(): Array<{
        iconKey: string;
        quantity?: number;
    } | null> {
        const equipped = this.consumableSystem.getEquipped();
        // Pad to 5 slots with nulls so the dock maintains consistent slot count
        const slots: Array<{ iconKey: string } | null> = Array(5).fill(null);
        equipped.forEach((c, i) => {
            if (this.usedConsumableSlots.has(i)) {
                slots[i] = null;
            } else {
                slots[i] = { iconKey: runeWarsItemIconKey("consumable", c.id) };
            }
        });
        return slots;
    }

    private buildModifierSlots(): Array<{
        iconKey?: string;
        label?: string;
        active?: boolean;
    } | null> {
        return this.modifierDefs.map((m) => {
            const count = this.shotModifierSystem.countOf(
                m.id as ShotModifierType,
            );
            return {
                label: count > 0 ? `${m.label} ×${count}` : m.label,
                active: count > 0,
            };
        });
    }

    private onConsumableDockSelect(slotIndex: number, id: string): void {
        if (!this.turnManager.isPlayerTurn || this.isAnimating) return;
        if (this.statusEffects.hasEffect("player", "ITEM_BLOCK")) return;
        if (this.usedConsumableSlots.has(slotIndex)) return;
        const cost = CONSUMABLE_STAMINA_COST_FRACTION * this.moveBudgetTotal;
        const remaining = this.moveBudgetTotal - this.moveBudgetUsed;

        if (remaining < cost) {
            this.showItemFloatingText(
                this.playerStats.x,
                this.playerStats.y,
                "Estamina insuficiente!",
                "#ff8844",
            );
            return;
        }

        this.moveBudgetUsed += cost;
        this.movementBudgetHUD?.update(
            this.moveBudgetUsed,
            this.moveBudgetTotal,
        );
        this.usedConsumableSlots.add(slotIndex);
        this.useDebugConsumable("player", id);
    }

    private onModifierDockSelect(id: string): void {
        if (!this.turnManager.isPlayerTurn || this.isAnimating) return;
        if (this.statusEffects.hasEffect("player", "ITEM_BLOCK")) return;

        const modType = id as ShotModifierType;
        const costFraction = MODIFIER_STAMINA_COST[modType] ?? 0.5;
        const cost = costFraction * this.moveBudgetTotal;
        const remaining = this.moveBudgetTotal - this.moveBudgetUsed;

        if (remaining < cost) {
            this.showItemFloatingText(
                this.playerStats.x,
                this.playerStats.y,
                "Estamina insuficiente!",
                "#ff8844",
            );
            return;
        }

        this.moveBudgetUsed += cost;
        this.movementBudgetHUD?.update(
            this.moveBudgetUsed,
            this.moveBudgetTotal,
        );
        this.shotModifierSystem.add(modType);
    }

    private setupMapDrag(): void {
        this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
            if (p.button === 0 || p.wasTouch) {
                this.isDraggingMap = false; // confirmed only after movement
                this.dragStartX = p.x;
                this.dragStartY = p.y;
                this.cameraStartScrollX = this.cameras.main.scrollX;
                this.cameraStartScrollY = this.cameras.main.scrollY;
            }
        });
        this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
            if (!p.isDown) return;
            const dx = this.dragStartX - p.x;
            const dy = this.dragStartY - p.y;
            if (!this.isDraggingMap && Math.sqrt(dx * dx + dy * dy) > 6) {
                this.isDraggingMap = true;
                // Stop follow only when user actually starts dragging
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((this.cameras.main as any)._follow) {
                    this.cameras.main.stopFollow();
                }
            }
            if (!this.isDraggingMap) return;
            this.cameras.main.setScroll(
                this.cameraStartScrollX + dx,
                this.cameraStartScrollY + dy,
            );
        });
        this.input.on("pointerup", () => {
            // Camera stays where it was panned — no follow resume here.
            // processEndTurn re-attaches follow on the next turn.
            this.isDraggingMap = false;
        });
    }

    private setPlayerFacing(facing: "left" | "right"): void {
        if (this.playerStats.facing === facing) return;
        this.playerStats.facing = facing;
        this.playerAvatar?.setFlipX(facing === "left");
        this.playerCharacterSprite?.setFlipX(facing === "left");
        this.updateAngleDisplay();
    }

    private handleKeyboardInput(delta: number): void {
        if (!this.cursors) return;

        // Facing flips are always allowed, even off-turn.
        if (this.cursors.left?.isDown) this.setPlayerFacing("left");
        else if (this.cursors.right?.isDown) this.setPlayerFacing("right");

        if (!this.turnManager.isPlayerTurn || this.isAnimating) return;

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
        return this.playerStats.facing === "right" ? angle : 180 - angle;
    }

    private updateAngleDisplay(): void {
        if (!this.angleText) return;
        const prefix = this.playerStats.facing === "left" ? "← " : "";
        const suffix = this.playerStats.facing === "right" ? " →" : "";
        this.angleText.setText(`${prefix}${this.currentAngle}°${suffix}`);
    }

    private adjustAngle(delta: number): void {
        this.changeAngle(delta);
    }

    private clampCurrentAngleForWeapon(): void {
        const limits = getWeaponAngleLimits(this.playerWeapon?.id ?? "default");
        const nextAngle = Math.round(
            Math.max(
                limits.minAngle,
                Math.min(limits.maxAngle, this.currentAngle),
            ),
        );
        if (nextAngle === this.currentAngle) return;
        this.currentAngle = nextAngle;
        this.updateAngleDisplay();
        this.updateTrajectoryPreview();
    }

    private movePlayer(deltaX: number): void {
        if (this.statusEffects.hasEffect("player", "FREEZE")) return;

        const remaining = this.moveBudgetTotal - this.moveBudgetUsed;
        if (remaining <= 0) return;

        const cappedDelta =
            Math.sign(deltaX) * Math.min(Math.abs(deltaX), remaining);
        const result = tryHorizontalMove(
            this.playerSprite.x,
            this.playerSprite.y,
            cappedDelta,
            this.terrainEngine,
        );

        if (!result.canMove) return;

        this.setPlayerFacing(deltaX > 0 ? "right" : "left");

        this.playerSprite.setPosition(result.newX, result.newY);
        this.moveBudgetUsed += Math.abs(cappedDelta);
        this.movementBudgetHUD.update(
            this.moveBudgetUsed,
            this.moveBudgetTotal,
        );

        this.playerStats.x = result.newX;
        this.playerStats.y = result.newY;
        this.syncActorAssets();
        this.checkDungeonPortalReached();
    }

    private clampInitialX(mapX: number, viewportWidth: number): number {
        const minX = 72;
        const maxMapX = MAP_WORLD_WIDTH - 72;
        const maxVisibleX = Math.max(minX, viewportWidth - 72);
        return Math.max(minX, Math.min(mapX, maxMapX, maxVisibleX));
    }

    private startChargingPower(): void {
        if (this.isAnimating || !this.turnManager.isPlayerTurn) return;
        // FREEZE blocks power charging
        if (this.statusEffects.hasEffect("player", "FREEZE")) {
            this.showItemFloatingText(
                this.playerStats.x,
                this.playerStats.y,
                "❄ Congelado!",
                "#44aaff",
            );
            return;
        }
        if (this.isChargingPower) return;

        this.isChargingPower = true;
        this.powerChargeStartedAt = this.time.now;
        this.powerValue = MIN_SHOT_POWER;
        this.enterChargePerformanceMode();
        this.battleHud.setCharging(true);
        this.battleHud.updatePower(this.powerValue);
    }

    private updateChargePowerFrame(time: number): void {
        if (
            this.battleEnded ||
            this.isAnimating ||
            !this.turnManager.isPlayerTurn
        ) {
            this.isChargingPower = false;
            this.leaveChargePerformanceMode();
            this.battleHud?.setCharging(false);
            return;
        }

        this.powerValue = this.calculateChargePower(time);
        this.battleHud.updatePower(this.powerValue);
    }

    private calculateChargePower(time: number): number {
        const maxForce = this.statusEffects.hasEffect("player", "WEAK_SHOT")
            ? 40
            : 100;
        const elapsedMs = Math.max(0, time - this.powerChargeStartedAt);
        return Math.min(
            maxForce,
            MIN_SHOT_POWER + (elapsedMs / POWER_TICK_MS) * POWER_STEP,
        );
    }

    private releaseFire(): void {
        if (!this.isChargingPower) return;
        this.isChargingPower = false;
        this.leaveChargePerformanceMode();
        this.battleHud.setCharging(false);

        // Pointer/touch release can happen before the first interval tick.
        this.powerValue = Math.max(
            this.powerValue,
            this.calculateChargePower(this.time.now),
        );

        if (this.powerValue < MIN_SHOT_POWER) return; // too low, ignore

        const shotPower = this.powerValue;
        this.firePlayerShot(this.currentAngle, shotPower);
        this.battleHud.recordShot(shotPower);
        this.powerValue = 0;
        this.battleHud.updatePower(0);
    }

    private enterChargePerformanceMode(): void {
        if (this.chargePerformanceMode) return;
        this.chargePerformanceMode = true;
        this.tweens.pauseAll();
    }

    private leaveChargePerformanceMode(): void {
        if (!this.chargePerformanceMode) return;
        this.chargePerformanceMode = false;
        this.tweens.resumeAll();
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
        const points = this.projectilePhysics.simulate(
            this.playerStats.x,
            this.playerStats.y,
            config,
            wind,
            this.playerWeapon.physicsProfile,
        );
        this.trajectory.draw(this, points);
    }

    // ──────────────────────────────────────────────────────────
    // Shooting
    // ──────────────────────────────────────────────────────────

    private firePlayerShot(angle: number, force: number): void {
        this.trajectory.clear();
        const profile = this.playerWeapon.physicsProfile;
        const wind = this.windSystem.getCurrent();

        this.lastPlayerShot = { force, angle };

        // [v1.9.0] Visual-only modular attack animation.
        this.playerCharacterSprite?.play("shoot", true);

        const { shots, delayedShots } = this.shotModifierSystem.resolve(
            this.getWorldAngle(angle),
            force,
            this.playerWeapon,
        );
        this.shotModifierSystem.consumeAll();

        this.firePlayerShotVolley([...shots, ...delayedShots], profile, wind);
    }

    private firePlayerShotVolley(
        shots: ShotConfig[],
        profile: WeaponDefinition["physicsProfile"],
        wind: ReturnType<WindSystem["getCurrent"]>,
    ): void {
        if (shots.length === 0) return;

        const volleyId = ++this.activeVolleyId;
        const turnToken = this.turnManager.turnNumber;

        const immediateShots = shots.filter(
            (s) => !(s.delayMs && s.delayMs > 0),
        );
        const delayedShots = shots
            .filter((s) => s.delayMs && s.delayMs > 0)
            .sort((a, b) => (a.delayMs ?? 0) - (b.delayMs ?? 0));

        let pending = shots.length;
        let gameEnded = false;

        const isStale = () =>
            volleyId !== this.activeVolleyId ||
            this.turnManager.turnNumber !== turnToken;

        const completeShot = (ended: boolean): void => {
            if (isStale()) return;
            gameEnded = gameEnded || ended;
            pending -= 1;
            if (pending > 0) {
                this.isAnimating = true;
                return;
            }
            if (gameEnded) return;
            this.endTurn(true, true);
        };

        // Fire delayed shots one-by-one, each 700 ms after the previous one lands.
        const fireDelayedChain = (idx: number): void => {
            if (idx >= delayedShots.length || gameEnded || isStale()) return;
            this.scheduleTurnEvent(700, () => {
                if (isStale() || !this.turnManager.isPlayerTurn) return;
                const wrappedComplete = (ended: boolean): void => {
                    completeShot(ended);
                    if (!gameEnded && !ended) fireDelayedChain(idx + 1);
                };
                this.launchPlayerVolleyProjectile(
                    delayedShots[idx],
                    1, // sequential — never concurrent
                    profile,
                    wind,
                    turnToken,
                    wrappedComplete,
                );
            });
        };

        // Track when all immediate shots land so we can start the delayed chain.
        let immediatePending = immediateShots.length;

        const completeImmediate = (ended: boolean): void => {
            completeShot(ended);
            immediatePending -= 1;
            if (
                immediatePending <= 0 &&
                !gameEnded &&
                !ended &&
                !isStale() &&
                delayedShots.length > 0
            ) {
                fireDelayedChain(0);
            }
        };

        if (immediateShots.length > 0) {
            for (const shotCfg of immediateShots) {
                this.launchPlayerVolleyProjectile(
                    shotCfg,
                    immediateShots.length, // concurrency = fan-shot group size
                    profile,
                    wind,
                    turnToken,
                    completeImmediate,
                );
            }
        } else {
            // All shots carry a delay — start the chain (first fires in 700 ms)
            fireDelayedChain(0);
        }
    }

    private launchPlayerVolleyProjectile(
        shotCfg: ShotConfig,
        concurrentGroupSize: number,
        profile: WeaponDefinition["physicsProfile"],
        wind: ReturnType<WindSystem["getCurrent"]>,
        turnToken: number,
        completeShot: (gameEnded: boolean) => void,
    ): void {
        const config: ProjectileConfig = {
            angle: shotCfg.angle,
            force: shotCfg.force,
            gravityScale: profile.gravityScale,
            windInfluence: profile.windInfluence,
            baseDamage: shotCfg.baseDamage ?? this.playerWeapon.baseDamage,
        };
        const path = this.computeProjectilePath(
            this.playerStats.x,
            this.playerStats.y,
            config,
            wind,
            this.playerWeapon,
        );
        this.maybeBuildRunicTerrain(path, "player");

        // Fan shots (concurrent group > 1) each get their own projectile object;
        // solo or sequential shots reuse the shared arc object.
        const isConcurrent = concurrentGroupSize > 1;
        const projectile = isConcurrent
            ? this.projRenderer.createProjectile(
                  WEAPON_COLORS[this.playerWeapon.id] ?? 0xffff00,
                  runeWarsProjectileKey(this.playerWeapon.id, "projectile"),
              )
            : this.projectileArc;

        this.animateProjectileWithOverrides(
            path,
            true,
            shotCfg.baseDamage,
            shotCfg.excavationRadius,
            {
                projectile,
                destroyProjectileOnComplete: isConcurrent,
                endTurnOnComplete: false,
                turnToken,
                onComplete: completeShot,
                realtimeCollision: isConcurrent,
            },
        );
    }

    /** Returns true if a turn-consuming item was used (turn will end itself). */
    private aiDecideItemsBeforeTurn(turnToken: number): boolean {
        // Heal when below 40% HP (heal does not consume the turn)
        if (
            !this.aiUsedConsumableIds.has("heal") &&
            this.aiStats.hp < this.aiStats.maxHp * 0.4 &&
            this.consumableSystem.getById("heal")
        ) {
            this.aiUsedConsumableIds.add("heal");
            this.useDebugConsumable("ai", "heal");
        }

        // Shield when below 55% HP — favoured by excavation/mixed (need to survive to keep digging)
        if (
            !this.aiUsedConsumableIds.has("__shield") &&
            this.aiShieldReduction === 0 &&
            this.aiStats.hp < this.aiStats.maxHp * 0.55 &&
            (this.aiStrategy === "excavation" ||
                this.aiStrategy === "mixed" ||
                (this.aiStrategy === "damage" &&
                    this.aiStats.hp < this.aiStats.maxHp * 0.35))
        ) {
            this.aiUsedConsumableIds.add("__shield");
            this.useDebugSecondaryItem("ai", "shield");
        }

        // Arm ice-throw to freeze player before a high-damage volley (damage strategy prefers this)
        // Uses the shot, so fire normally this turn
        const iceChance = this.aiStrategy === "damage" ? 0.35 : 0.15;
        if (
            !this.aiUsedConsumableIds.has("ice-throw") &&
            !this.statusEffects.hasEffect("player", "FREEZE") &&
            this.consumableSystem.getById("ice-throw") &&
            Math.random() < iceChance
        ) {
            this.aiUsedConsumableIds.add("ice-throw");
            this.useDebugConsumable("ai", "ice-throw");
        }

        void turnToken;
        return false;
    }

    private aiDecideModifiers(): void {
        const aiHpRatio = this.aiStats.hp / this.aiStats.maxHp;
        const enemyHpRatio = this.playerStats.hp / this.playerStats.maxHp;
        const distance = Math.abs(this.aiStats.x - this.playerStats.x);

        const mods = this.aiStrategyEngine.decideModifiers(
            this.aiStrategy,
            this.aiExcavScore,
            aiHpRatio,
            enemyHpRatio,
            distance,
        );
        for (const mod of mods) {
            this.aiShotModifierSystem.add(mod);
        }
    }

    private fireAiShotVolley(
        shots: ShotConfig[],
        profile: WeaponDefinition["physicsProfile"],
        wind: ReturnType<WindSystem["getCurrent"]>,
        turnToken: number,
    ): void {
        if (shots.length === 0) return;

        const volleyId = ++this.activeVolleyId;
        let pending = shots.length;
        let gameEnded = false;

        const completeShot = (ended: boolean): void => {
            if (
                volleyId !== this.activeVolleyId ||
                this.turnManager.turnNumber !== turnToken
            )
                return;
            gameEnded = gameEnded || ended;
            pending -= 1;
            if (pending > 0) {
                this.isAnimating = true;
                return;
            }
            if (gameEnded) return;
            this.endTurn(false, true);
        };

        for (const shotCfg of shots) {
            const launch = () => {
                if (
                    volleyId !== this.activeVolleyId ||
                    this.turnManager.turnNumber !== turnToken ||
                    this.turnManager.isPlayerTurn
                ) {
                    completeShot(true);
                    return;
                }
                const config: ProjectileConfig = {
                    angle: shotCfg.angle,
                    force: shotCfg.force,
                    gravityScale: profile.gravityScale,
                    windInfluence: profile.windInfluence,
                    baseDamage: shotCfg.baseDamage ?? this.aiWeapon.baseDamage,
                };
                const path = this.computeProjectilePath(
                    this.aiStats.x,
                    this.aiStats.y,
                    config,
                    wind,
                    this.aiWeapon,
                );
                this.maybeBuildRunicTerrain(path, "ai");
                const projectile =
                    shots.length === 1
                        ? this.projectileArc
                        : this.projRenderer.createProjectile(
                              WEAPON_COLORS[this.aiWeapon.id] ?? 0xffff00,
                              runeWarsProjectileKey(
                                  this.aiWeapon.id,
                                  "projectile",
                              ),
                          );
                this.animateProjectileWithOverrides(
                    path,
                    false,
                    shotCfg.baseDamage,
                    shotCfg.excavationRadius,
                    {
                        projectile,
                        destroyProjectileOnComplete: shots.length > 1,
                        endTurnOnComplete: false,
                        turnToken,
                        onComplete: completeShot,
                        realtimeCollision: shots.length > 1,
                    },
                );
            };

            if (shotCfg.delayMs && shotCfg.delayMs > 0) {
                this.scheduleTurnEvent(shotCfg.delayMs, launch);
            } else {
                launch();
            }
        }
    }

    private fireAiShot(turnToken = this.turnManager.turnNumber): void {
        if (
            this.turnManager.isPlayerTurn ||
            this.turnManager.turnNumber !== turnToken
        )
            return;

        // Decide consumable items first (some may end the turn)
        if (this.aiDecideItemsBeforeTurn(turnToken)) return;

        // Refresh excavation viability score (terrain changes each turn)
        this.aiExcavScore = this.aiStrategyEngine.scoreExcavationTarget(
            this.terrainEngine,
            this.playerStats.x,
            this.playerStats.y,
        );

        // [v1.9.0] Visual-only modular attack animation.
        this.aiCharacterSprite?.play("shoot", true);

        const wind = this.windSystem.getCurrent();

        // ── Tactical AI decision ──────────────────────────────────────────────
        const aiSnapshot = this.buildAiBattleSnapshot();
        const aiDecision = this.aiDecisionMaker.decide(
            aiSnapshot,
            this.difficulty,
        );
        const decidedAction = aiDecision.action;

        // If the decision is a non-shot item that was NOT already handled by
        // aiDecideItemsBeforeTurn, apply it now.
        if (
            decidedAction.type === "use_heal" &&
            !this.aiUsedConsumableIds.has("heal")
        ) {
            this.aiUsedConsumableIds.add("heal");
            this.useDebugConsumable("ai", "heal");
        }
        if (
            decidedAction.type === "use_shield" &&
            this.aiShieldReduction === 0 &&
            !this.aiUsedConsumableIds.has("__shield")
        ) {
            this.aiUsedConsumableIds.add("__shield");
            this.useDebugSecondaryItem("ai", "shield");
        }
        if (
            decidedAction.type === "use_ice_throw" &&
            !this.aiUsedConsumableIds.has("ice-throw")
        ) {
            this.aiUsedConsumableIds.add("ice-throw");
            this.useDebugConsumable("ai", "ice-throw");
        }

        // Extract fire params from decision (direct fire or heal+fire combo)
        const fireAction =
            decidedAction.type === "fire"
                ? decidedAction
                : (decidedAction.type === "use_heal" ||
                        decidedAction.type === "use_shield" ||
                        decidedAction.type === "use_ice_throw") &&
                    decidedAction.thenFire
                  ? decidedAction.thenFire
                  : null;

        // Fall back to calculateAiShot if decision didn't yield a fire action
        const legacyShot = fireAction ? null : this.calculateAiShot();
        const shotAngle = fireAction?.angle ?? legacyShot!.angle;
        const shotForce = fireAction?.force ?? legacyShot!.force;
        const legacyScore = legacyShot?.score ?? 0;

        // Shot quality: prefer tactical hitChance when new AI chose a fire action,
        // fall back to legacyScore (high = bad in that scale) when using legacy AI.
        const shotIsWeak = fireAction
            ? aiDecision.evaluation.hitChance < 0.08
            : legacyScore > AI_REPOSITION_THRESHOLD;

        if (this.playerInvisibleTurns > 0) {
            this.scheduleTurnEvent(350, () => {
                if (
                    !this.turnManager.isPlayerTurn &&
                    this.turnManager.turnNumber === turnToken
                ) {
                    this.endTurn(false, false);
                }
            });
            return;
        }

        // Reposition if shot quality is poor
        if (shotIsWeak && this.tryRepositionAi()) {
            this.scheduleTurnEvent(350, () => {
                if (
                    !this.turnManager.isPlayerTurn &&
                    this.turnManager.turnNumber === turnToken
                ) {
                    this.endTurn(false, false);
                }
            });
            return;
        }

        // Apply modifiers from decision; fall back to strategy-engine modifiers
        this.aiShotModifierSystem.consumeAll();
        const decisionMods = fireAction?.modifiers ?? [];
        if (decisionMods.length > 0) {
            for (const mod of decisionMods) this.aiShotModifierSystem.add(mod);
        } else {
            this.aiDecideModifiers();
        }

        const profile = this.aiWeapon.physicsProfile;
        this.lastAiShot = { force: shotForce, angle: shotAngle };

        const { shots, delayedShots } = this.aiShotModifierSystem.resolve(
            shotAngle,
            shotForce,
            this.aiWeapon,
        );
        this.aiShotModifierSystem.consumeAll();

        if (shots.length > 1 || delayedShots.length > 0) {
            this.fireAiShotVolley(
                [...shots, ...delayedShots],
                profile,
                wind,
                turnToken,
            );
        } else {
            // Single-shot path (no modifiers active)
            const config: ProjectileConfig = {
                angle: shotAngle,
                force: shotForce,
                gravityScale: profile.gravityScale,
                windInfluence: profile.windInfluence,
                baseDamage: this.aiWeapon.baseDamage,
            };
            const path = this.computeProjectilePath(
                this.aiStats.x,
                this.aiStats.y,
                config,
                wind,
                this.aiWeapon,
            );
            this.maybeBuildRunicTerrain(path, "ai");
            this.animateProjectileResolved(
                path,
                false,
                this.aiWeapon.baseDamage,
                this.aiWeapon.excavationRadius,
                { turnToken },
            );
        }
    }

    private runDungeonMonsterTurn(turnToken: number): void {
        if (
            !this.dungeonStageConfig ||
            this.battleEnded ||
            this.turnManager.isPlayerTurn ||
            this.turnManager.turnNumber !== turnToken
        ) {
            return;
        }

        const aliveMonsters = this.getAliveDungeonMonsters();
        if (aliveMonsters.length === 0) {
            if (this.dungeonStageConfig.objective === "TRAVERSE") {
                this.endTurn(false, false);
            } else {
                this.finishBattle(true);
            }
            return;
        }

        const movementDelay = Math.max(
            0,
            ...aliveMonsters.map((monster) =>
                this.moveDungeonMonsterForTurn(monster),
            ),
        );

        const maxAttackers =
            this.dungeonStageConfig.objective === "TRAVERSE"
                ? aliveMonsters.length
                : 1;
        const attackers = aliveMonsters.slice(0, maxAttackers);
        let index = 0;

        const runNext = (): void => {
            if (
                this.battleEnded ||
                this.turnManager.isPlayerTurn ||
                this.turnManager.turnNumber !== turnToken
            ) {
                return;
            }
            const monster = attackers[index];
            index += 1;
            if (!monster) {
                this.scheduleTurnEvent(450, () => {
                    if (
                        !this.battleEnded &&
                        !this.turnManager.isPlayerTurn &&
                        this.turnManager.turnNumber === turnToken
                    ) {
                        this.endTurn(false, true);
                    }
                });
                return;
            }
            if (monster.stats.hp <= 0) {
                runNext();
                return;
            }
            this.scheduleTurnEvent(260, () =>
                this.fireDungeonMonsterShot(monster, turnToken, runNext),
            );
        };

        this.scheduleTurnEvent(movementDelay + 120, runNext);
    }

    private moveDungeonMonsterForTurn(monster: DungeonMonsterRuntime): number {
        if (monster.behavior === "BOSS_FLYER") {
            return this.moveDungeonBossFreely(monster);
        }
        this.moveDungeonMonsterHorizontal(monster);
        return 0;
    }

    private moveDungeonMonsterHorizontal(monster: DungeonMonsterRuntime): void {
        if (monster.stats.hp <= 0) return;
        const distance = Phaser.Math.Between(52, 126);
        let nextX = monster.stats.x + monster.patrolDirection * distance;
        if (nextX > monster.patrolMaxX) {
            monster.patrolDirection = -1;
            nextX = monster.patrolMaxX;
        } else if (nextX < monster.patrolMinX) {
            monster.patrolDirection = 1;
            nextX = monster.patrolMinX;
        }

        monster.stats.facing = monster.patrolDirection > 0 ? "right" : "left";
        monster.container.setPosition(nextX, monster.stats.y);
        if (monster.body instanceof Phaser.GameObjects.Image) {
            monster.body.setFlipX(monster.stats.facing === "left");
        }
        this.updateDungeonMonsterVisual(monster);
        this.syncPrimaryDungeonMonster();
    }

    private moveDungeonBossFreely(monster: DungeonMonsterRuntime): number {
        if (monster.stats.hp <= 0) return 0;

        const target = this.findBossFlyerMoveTarget(monster) ?? {
            x: monster.stats.x,
            y: monster.stats.y,
        };
        const dx = target.x - monster.stats.x;
        const dy = target.y - monster.stats.y;
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return 0;

        monster.stats.facing = dx >= 0 ? "right" : "left";
        if (monster.body instanceof Phaser.GameObjects.Image) {
            monster.body.setFlipX(monster.stats.facing === "left");
        }

        const duration = Phaser.Math.Clamp(
            Math.round(
                Phaser.Math.Distance.Between(
                    monster.stats.x,
                    monster.stats.y,
                    target.x,
                    target.y,
                ) * 1.8,
            ),
            520,
            980,
        );
        this.tweens.add({
            targets: monster.container,
            x: target.x,
            y: target.y,
            duration,
            ease: "Sine.easeInOut",
            onUpdate: () => {
                monster.stats.x = monster.container.x;
                monster.stats.y = monster.container.y;
                this.syncPrimaryDungeonMonster();
            },
            onComplete: () => {
                monster.stats.x = target.x;
                monster.stats.y = target.y;
                monster.container.setPosition(target.x, target.y);
                this.updateDungeonMonsterVisual(monster);
                this.syncPrimaryDungeonMonster();
            },
        });

        return duration;
    }

    private findBossFlyerMoveTarget(
        monster: DungeonMonsterRuntime,
    ): { x: number; y: number } | null {
        const minX = 96 + monster.width / 2;
        const maxX = MAP_WORLD_WIDTH - 96 - monster.width / 2;
        const minY = 96 + monster.height / 2;
        const maxY = WORLD_HEIGHT - 160 - monster.height / 2;

        const tryCandidate = (
            x: number,
            y: number,
        ): { x: number; y: number } | null => {
            const candidate = {
                x: Phaser.Math.Clamp(x, minX, maxX),
                y: Phaser.Math.Clamp(y, minY, maxY),
            };
            return this.isDungeonMonsterAreaClear(
                monster,
                candidate.x,
                candidate.y,
            )
                ? candidate
                : null;
        };

        for (let attempt = 0; attempt < 18; attempt += 1) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.Between(240, 560);
            const candidate = tryCandidate(
                monster.stats.x + Math.cos(angle) * distance,
                monster.stats.y + Math.sin(angle) * distance,
            );
            if (candidate) return candidate;
        }

        for (let attempt = 0; attempt < 36; attempt += 1) {
            const candidate = tryCandidate(
                Phaser.Math.Between(Math.round(minX), Math.round(maxX)),
                Phaser.Math.Between(Math.round(minY), Math.round(maxY)),
            );
            if (candidate) return candidate;
        }

        return null;
    }

    private isDungeonMonsterAreaClear(
        monster: DungeonMonsterRuntime,
        x: number,
        y: number,
    ): boolean {
        const halfWidth = Math.max(24, monster.width * 0.42);
        const halfHeight = Math.max(24, monster.height * 0.42);
        const samples = [
            { x, y },
            { x: x - halfWidth, y },
            { x: x + halfWidth, y },
            { x, y: y - halfHeight },
            { x, y: y + halfHeight },
            { x: x - halfWidth, y: y - halfHeight },
            { x: x + halfWidth, y: y - halfHeight },
            { x: x - halfWidth, y: y + halfHeight },
            { x: x + halfWidth, y: y + halfHeight },
        ];

        return samples.every(
            (point) =>
                point.x >= 72 &&
                point.x <= MAP_WORLD_WIDTH - 72 &&
                point.y >= 72 &&
                point.y <= WORLD_HEIGHT - 72 &&
                this.terrainEngine.getMaterialAt(point.x, point.y) ===
                    TerrainMaterial.EMPTY,
        );
    }

    private fireDungeonMonsterShot(
        monster: DungeonMonsterRuntime,
        turnToken: number,
        done: () => void,
    ): void {
        if (
            this.battleEnded ||
            this.turnManager.isPlayerTurn ||
            this.turnManager.turnNumber !== turnToken ||
            monster.stats.hp <= 0
        ) {
            done();
            return;
        }

        this.aiStats = monster.stats;
        this.aiSprite.setPosition(monster.stats.x, monster.stats.y);
        this.opponentName = monster.name;
        const shot = this.calculateDungeonMonsterShot(monster);
        this.lastAiShot = { angle: shot.angle, force: shot.force };
        const profile = this.aiWeapon.physicsProfile;
        const baseDamage = scaleDungeonDamage(
            monster.baseDamage,
            this.difficulty,
        );
        const config: ProjectileConfig = {
            angle: shot.angle,
            force: shot.force,
            gravityScale: profile.gravityScale,
            windInfluence: profile.windInfluence,
            baseDamage,
        };
        const path = this.computeProjectilePath(
            monster.stats.x,
            monster.stats.y,
            config,
            this.windSystem.getCurrent(),
            this.aiWeapon,
        );

        if (path.length === 0) {
            done();
            return;
        }

        this.animateProjectileResolved(
            path,
            false,
            baseDamage,
            this.aiWeapon.excavationRadius,
            {
                turnToken,
                endTurnOnComplete: false,
                onComplete: (gameEnded) => {
                    if (!gameEnded) done();
                },
            },
        );
    }

    private calculateDungeonMonsterShot(monster: DungeonMonsterRuntime): {
        angle: number;
        force: number;
        score: number;
    } {
        const profile = this.aiWeapon.physicsProfile;
        const wind = this.windSystem.getCurrent();
        const playerIsLeft = this.playerStats.x < monster.stats.x;
        const angleMin = playerIsLeft ? 95 : 5;
        const angleMax = playerIsLeft ? 175 : 85;
        const defaultAngle = playerIsLeft ? 135 : 45;
        const baseDamage = scaleDungeonDamage(
            monster.baseDamage,
            this.difficulty,
        );
        let best = {
            angle: defaultAngle,
            force: 58,
            score: Number.POSITIVE_INFINITY,
        };

        best = this.searchDungeonMonsterShot(
            monster,
            profile,
            wind,
            baseDamage,
            angleMin,
            angleMax,
            20,
            100,
            2,
            3,
            best,
        );
        best = this.searchDungeonMonsterShot(
            monster,
            profile,
            wind,
            baseDamage,
            Math.max(angleMin, best.angle - 3),
            Math.min(angleMax, best.angle + 3),
            Math.max(20, best.force - 5),
            Math.min(100, best.force + 5),
            0.5,
            0.5,
            best,
        );

        return {
            angle: best.angle,
            force: best.force,
            score: best.score,
        };
    }

    private searchDungeonMonsterShot(
        monster: DungeonMonsterRuntime,
        profile: ProjectilePhysicsProfile,
        wind: WindState,
        baseDamage: number,
        angleMin: number,
        angleMax: number,
        forceMin: number,
        forceMax: number,
        angleStep: number,
        forceStep: number,
        currentBest: { angle: number; force: number; score: number },
    ): { angle: number; force: number; score: number } {
        let best = currentBest;

        for (let angle = angleMin; angle <= angleMax; angle += angleStep) {
            for (let force = forceMin; force <= forceMax; force += forceStep) {
                const config: ProjectileConfig = {
                    angle,
                    force,
                    gravityScale: profile.gravityScale,
                    windInfluence: profile.windInfluence,
                    baseDamage,
                };
                const path = this.projectilePhysics.simulate(
                    monster.stats.x,
                    monster.stats.y,
                    config,
                    wind,
                    profile,
                );
                const score = this.scoreDungeonMonsterPath(path);
                if (score < best.score) best = { angle, force, score };
            }
        }

        return best;
    }

    private scoreDungeonMonsterPath(
        path: Array<{ x: number; y: number }>,
    ): number {
        let bestDistance = Number.POSITIVE_INFINITY;
        for (const point of path) {
            bestDistance = Math.min(
                bestDistance,
                this.getDistanceToTargetBounds(
                    point.x,
                    point.y,
                    this.playerStats,
                    this.getTargetDamageBounds(),
                ),
            );
            if (bestDistance <= 0) break;
            if (this.hasTerrainNearProjectile(point.x, point.y)) break;
        }
        return bestDistance;
    }

    private buildAiBattleSnapshot(): BattleSnapshot {
        const aiConsumedIds = new Set(this.aiUsedConsumableIds);
        const availableConsumables: string[] = [];
        if (!aiConsumedIds.has("heal") && this.consumableSystem.getById("heal"))
            availableConsumables.push("heal");
        if (
            !aiConsumedIds.has("ice-throw") &&
            this.consumableSystem.getById("ice-throw")
        )
            availableConsumables.push("ice-throw");

        const aiSecId =
            this.aiShieldReduction === 0 && !aiConsumedIds.has("__shield")
                ? "shield"
                : null;

        return {
            ai: {
                id: "ai",
                x: this.aiStats.x,
                y: this.aiStats.y,
                hp: this.aiStats.hp,
                maxHp: this.aiStats.maxHp,
                facing: this.aiStats.facing,
                weapon: this.aiWeapon,
                shieldReduction: this.aiShieldReduction,
                effects: this.statusEffects.getEffects("ai"),
                strength: this.aiStrength,
                luck: this.aiLuck,
                usedConsumableIds: aiConsumedIds,
                invisibleTurns: 0,
                frozenTurns: this.statusEffects.hasEffect("ai", "FREEZE")
                    ? 1
                    : 0,
            },
            player: {
                id: "player",
                x: this.playerStats.x,
                y: this.playerStats.y,
                hp: this.playerStats.hp,
                maxHp: this.playerStats.maxHp,
                facing: this.playerStats.facing,
                weapon: this.playerWeapon,
                shieldReduction: this.playerShieldReduction,
                effects: this.statusEffects.getEffects("player"),
                strength: this.playerStrength,
                luck: this.playerLuck,
                usedConsumableIds: new Set<string>(),
                invisibleTurns: this.playerInvisibleTurns,
                frozenTurns: this.statusEffects.hasEffect("player", "FREEZE")
                    ? 1
                    : 0,
            },
            wind: this.windSystem.getCurrent(),
            turnNumber: this.turnManager.turnNumber,
            terrain: this.terrainEngine,
            availableConsumables,
            availableSecondaryItemId: aiSecId,
            aiShieldActive: this.aiShieldReduction > 0,
        };
    }

    private maybeBuildRunicTerrain(
        path: Array<{ x: number; y: number }>,
        playerId: "player" | "ai",
    ): void {
        if (!this.secondaryItemSystem.isRunicBuilderActive(playerId)) return;
        const segment = path.slice(0, 18);
        if (segment.length < 2) return;
        const start = segment[0];
        const end = segment[segment.length - 1];
        const created = this.terrainEngine.drawRunicLine(
            start.x,
            start.y,
            end.x,
            end.y,
            playerId,
        );
        this.secondaryItemSystem.consumeRunicBuilder(playerId);
        this.constructedByPlayer =
            this.terrainEngine.getConstructedCount("player");
        this.ensureCharactersOutsideTerrain();
        this.playerStats.x = this.playerSprite.x;
        this.playerStats.y = this.playerSprite.y;
        this.aiStats.x = this.aiSprite.x;
        this.aiStats.y = this.aiSprite.y;
        this.syncActorAssets();
        // Terrain renderer uses bitmap approach; no full re-render needed after runic builder
    }

    private animateProjectile(
        path: Array<{ x: number; y: number }>,
        isPlayerShot: boolean,
    ): void {
        const weapon = isPlayerShot ? this.playerWeapon : this.aiWeapon;
        this.animateProjectileResolved(
            path,
            isPlayerShot,
            weapon.baseDamage,
            weapon.excavationRadius,
        );
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
        options: ProjectileAnimationOptions = {},
    ): void {
        if (path.length === 0) return;

        const weapon = isPlayerShot ? this.playerWeapon : this.aiWeapon;
        this.animateProjectileResolved(
            path,
            isPlayerShot,
            baseDamageOverride ?? weapon.baseDamage,
            excavationRadiusOverride ?? weapon.excavationRadius,
            options,
        );
    }

    private animateProjectileResolved(
        path: Array<{ x: number; y: number }>,
        isPlayerShot: boolean,
        baseDamage: number,
        excavationRadius: number,
        options: ProjectileAnimationOptions = {},
    ): void {
        if (path.length === 0) return;

        this.isAnimating = true;

        const weapon = isPlayerShot ? this.playerWeapon : this.aiWeapon;
        const projectile = options.projectile ?? this.projectileArc;
        const turnToken = options.turnToken ?? this.turnManager.turnNumber;

        this.applyProjectileVisual(projectile, weapon.id);
        // Camera follows projectile during flight
        this.cameras.main.startFollow(projectile, true, 0.08, 0.08);

        // Mutable state for map-modifier interactions (shared between both paths)
        const mapModProjState = {
            baseDamage,
            excavationRadius,
            isCritical: false,
            applyStatus: (_status: string, _duration: number) => {
                /* reserved for future integration */
            },
        };
        const checkMapModifier = (x: number, y: number): boolean => {
            if (this.mapModifierManager) {
                const mod = this.mapModifierManager.checkProjectileCollision(
                    x,
                    y,
                );
                if (mod)
                    this.mapModifierManager.applyEffect(mod, mapModProjState);
            }
            return false;
        };

        // ── Detonation-delay weapons (TNT, magic-grenade): bounce + timed explosion ──
        if (weapon.detonationDelay && weapon.detonationDelay > 0) {
            this.showProjectileTrailFx(weapon.id, path);

            let detonated = false;
            const animControl = this.projRenderer.animateAlongPath(
                projectile,
                path,
                () => {
                    /* path exhausted — projectile rests until timer */
                },
                (x, y) => {
                    checkMapModifier(x, y);
                    return false;
                },
            );

            this.scheduleTurnEvent(weapon.detonationDelay, () => {
                if (detonated) return;
                detonated = true;
                animControl.cancel();

                if (this.turnManager.turnNumber !== turnToken) {
                    this.isAnimating = false;
                    options.onComplete?.(true);
                    return;
                }

                const detonX = projectile.x;
                const detonY = projectile.y;
                projectile.setVisible(false);
                if (options.destroyProjectileOnComplete) projectile.destroy();

                this.isAnimating = false;
                this.showProjectileImpactFx(weapon.id, detonX, detonY);
                if (isPlayerShot) this.ghostTrace?.recordShot(path);

                const resolvedBaseDamage = mapModProjState.baseDamage;
                const resolvedExcavationRadius =
                    mapModProjState.excavationRadius;

                const explodeResult = this.terrainEngine.explode(
                    detonX,
                    detonY,
                    resolvedExcavationRadius,
                );
                this.terrainRenderer.applyExplosion(
                    explodeResult.center.x,
                    explodeResult.center.y,
                    explodeResult.radius,
                );

                const impact = this.getProjectileImpact(
                    { x: detonX, y: detonY },
                    isPlayerShot,
                );
                const effectiveRadius = resolvedExcavationRadius;
                const distanceToTarget =
                    this.getProjectileDistanceToTargetBounds(
                        detonX,
                        detonY,
                        impact,
                    );
                const inSplashZone =
                    impact.hitTarget || distanceToTarget <= effectiveRadius;

                let gameEnded = false;
                if (inSplashZone) {
                    gameEnded = this.onProjectileImpact(
                        detonX,
                        detonY,
                        isPlayerShot,
                        impact.targetStats,
                        resolvedBaseDamage,
                        effectiveRadius,
                        options.endTurnOnComplete ?? true,
                        impact.dungeonMonster,
                    );
                } else if (options.endTurnOnComplete ?? true) {
                    this.endTurn(isPlayerShot, true);
                }
                options.onComplete?.(gameEnded);
            });
            return;
        }

        // ── Normal weapons: immediate explosion on first terrain/target hit ──
        const realtimeCollision = options.realtimeCollision ?? false;
        const clipped = realtimeCollision
            ? {
                  path,
                  impactPoint: null as { x: number; y: number } | null,
                  impact: null as ReturnType<
                      typeof this.getProjectileImpact
                  > | null,
              }
            : this.clipPathToFirstImpact(path, isPlayerShot);
        const animationPath = clipped.path;
        this.showProjectileTrailFx(weapon.id, animationPath);

        let realtimePreviousPoint = path[0];
        let realtimeImpactPoint: { x: number; y: number } | null = null;
        let realtimeImpact: ReturnType<typeof this.getProjectileImpact> | null =
            null;
        const checkImpactFn = realtimeCollision
            ? (x: number, y: number): boolean => {
                  checkMapModifier(x, y);
                  const point = { x, y };
                  const impactPoint = this.findImpactOnSegment(
                      realtimePreviousPoint,
                      point,
                      isPlayerShot,
                  );
                  realtimePreviousPoint = point;
                  if (!impactPoint) return false;
                  realtimeImpactPoint = impactPoint;
                  realtimeImpact = this.getProjectileImpact(
                      impactPoint,
                      isPlayerShot,
                  );
                  return true;
              }
            : checkMapModifier;

        this.projRenderer.animateAlongPath(
            projectile,
            animationPath,
            (impactPoint) => {
                projectile.setVisible(false);
                if (options.destroyProjectileOnComplete) {
                    projectile.destroy();
                }

                if (this.turnManager.turnNumber !== turnToken) {
                    this.isAnimating = false;
                    options.onComplete?.(true);
                    return;
                }

                this.isAnimating = false;

                const resolvedImpact =
                    clipped.impactPoint ??
                    realtimeImpactPoint ??
                    impactPoint ??
                    animationPath[animationPath.length - 1];
                const traveledPath = animationPath;
                this.showProjectileImpactFx(
                    weapon.id,
                    resolvedImpact.x,
                    resolvedImpact.y,
                );

                if (isPlayerShot) {
                    this.ghostTrace?.recordShot(traveledPath);
                }

                const impact =
                    clipped.impact ??
                    realtimeImpact ??
                    this.getProjectileImpact(resolvedImpact, isPlayerShot);
                const teleportUtilityShot =
                    isPlayerShot && this.teleportShotArmed;
                const explodeOnImpact =
                    options.explodeOnImpact ?? !teleportUtilityShot;
                const applyDamage = options.applyDamage ?? !teleportUtilityShot;

                const resolvedBaseDamage = mapModProjState.baseDamage;
                const resolvedExcavationRadius =
                    mapModProjState.excavationRadius;

                // Volley shots (realtimeCollision) always explode at their endpoint:
                // the second shot of a shot_plus1 can fly through a crater already
                // created by the first shot and would otherwise fizzle silently.
                const forceExplode = realtimeCollision;
                if (
                    explodeOnImpact &&
                    (impact.hitTerrain || impact.hitTarget || forceExplode)
                ) {
                    const explosionCenter = impact.hitTerrain
                        ? (this.findNearestTerrainPoint(
                              resolvedImpact,
                              PROJECTILE_COLLISION_RADIUS * 2,
                          ) ?? resolvedImpact)
                        : resolvedImpact;
                    const explodeResult = this.terrainEngine.explode(
                        explosionCenter.x,
                        explosionCenter.y,
                        resolvedExcavationRadius,
                    );
                    this.terrainRenderer.applyExplosion(
                        explodeResult.center.x,
                        explodeResult.center.y,
                        explodeResult.radius,
                    );
                }

                this.resolveTeleportShot(
                    isPlayerShot,
                    resolvedImpact,
                    impact,
                    traveledPath,
                );

                const effectiveRadius = resolvedExcavationRadius;
                const distanceToTarget =
                    this.getProjectileDistanceToTargetBounds(
                        resolvedImpact.x,
                        resolvedImpact.y,
                        impact,
                    );
                const inSplashZone =
                    impact.hitTarget || distanceToTarget <= effectiveRadius;

                let gameEnded = false;
                if (applyDamage && inSplashZone) {
                    gameEnded = this.onProjectileImpact(
                        resolvedImpact.x,
                        resolvedImpact.y,
                        isPlayerShot,
                        impact.targetStats,
                        resolvedBaseDamage,
                        effectiveRadius,
                        options.endTurnOnComplete ?? true,
                        impact.dungeonMonster,
                    );
                } else if (options.endTurnOnComplete ?? true) {
                    this.endTurn(isPlayerShot, true);
                }

                // Bug 4: Apply/disarm ice shot (hit = inSplashZone with damage enabled)
                this.resolveIceShot(isPlayerShot, applyDamage && inSplashZone);

                options.onComplete?.(gameEnded);
            },
            checkImpactFn,
        );
    }

    /** Simulate projectile path, using bounce physics for detonation-delay weapons. */
    private computeProjectilePath(
        startX: number,
        startY: number,
        config: {
            angle: number;
            force: number;
            gravityScale: number;
            windInfluence: number;
            baseDamage: number;
        },
        wind: ReturnType<WindSystem["getCurrent"]>,
        weapon: WeaponDefinition,
    ): Array<{ x: number; y: number; time: number }> {
        if (weapon.detonationDelay && weapon.detonationDelay > 0) {
            // Enough frames so animation fills the detonation window (8 ms/frame)
            const maxPoints = Math.ceil(weapon.detonationDelay / 8);
            return this.projectilePhysics.simulate(
                startX,
                startY,
                config,
                wind,
                weapon.physicsProfile,
                {
                    terrainAt: (x, y) => this.hasTerrainNearProjectile(x, y),
                    maxPoints,
                },
            );
        }
        return this.projectilePhysics.simulate(
            startX,
            startY,
            config,
            wind,
            weapon.physicsProfile,
        );
    }

    private clipPathToFirstImpact(
        path: Array<{ x: number; y: number }>,
        isPlayerShot: boolean,
    ): {
        path: Array<{ x: number; y: number }>;
        impactPoint: { x: number; y: number } | null;
        impact: ProjectileImpactResult | null;
    } {
        if (path.length <= 1) return { path, impactPoint: null, impact: null };

        const clippedPath: Array<{ x: number; y: number }> = [path[0]];

        for (let i = 1; i < path.length; i++) {
            const previous = path[i - 1];
            const current = path[i];
            const impactPoint = this.findImpactOnSegment(
                previous,
                current,
                isPlayerShot,
            );

            if (impactPoint) {
                const impact = this.getProjectileImpact(
                    impactPoint,
                    isPlayerShot,
                );
                clippedPath.push(impactPoint);
                return { path: clippedPath, impactPoint, impact };
            }

            clippedPath.push(current);
        }

        return { path: clippedPath, impactPoint: null, impact: null };
    }

    private findImpactOnSegment(
        start: { x: number; y: number },
        end: { x: number; y: number },
        isPlayerShot: boolean,
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

    private getProjectileImpact(
        point: { x: number; y: number },
        isPlayerShot: boolean,
    ): ProjectileImpactResult {
        if (isPlayerShot && this.dungeonStageConfig) {
            const hitMonster = this.getDungeonTargetAt(point);
            const targetMonster =
                hitMonster ?? this.getNearestDungeonTarget(point);
            return {
                hitTerrain: this.hasTerrainNearProjectile(point.x, point.y),
                hitTarget: !!hitMonster,
                targetStats: targetMonster?.stats ?? this.aiStats,
                dungeonMonster: targetMonster,
            };
        }

        const targetStats = isPlayerShot ? this.aiStats : this.playerStats;
        const dx = Math.abs(point.x - targetStats.x);
        const dy = Math.abs(point.y - targetStats.y);

        return {
            hitTerrain: this.hasTerrainNearProjectile(point.x, point.y),
            hitTarget: dx < 30 && dy < 40,
            targetStats,
        };
    }

    private getProjectileDistanceToTargetBounds(
        impactX: number,
        impactY: number,
        impact: ProjectileImpactResult,
    ): number {
        return this.getDistanceToTargetBounds(
            impactX,
            impactY,
            impact.targetStats,
            this.getTargetDamageBounds(impact.dungeonMonster),
        );
    }

    private getDistanceToTargetBounds(
        impactX: number,
        impactY: number,
        targetStats: BattleCharacterState,
        bounds: TargetDamageBounds,
    ): number {
        const dx = Math.max(
            Math.abs(impactX - targetStats.x) - bounds.halfWidth,
            0,
        );
        const dy = Math.max(
            Math.abs(impactY - targetStats.y) - bounds.halfHeight,
            0,
        );
        return Math.sqrt(dx * dx + dy * dy);
    }

    private getTargetDamageBounds(
        dungeonMonster?: DungeonMonsterRuntime,
    ): TargetDamageBounds {
        if (dungeonMonster) {
            return {
                halfWidth: Math.max(30, dungeonMonster.width * 0.45),
                halfHeight: Math.max(36, dungeonMonster.height * 0.45),
            };
        }

        return {
            halfWidth: Math.max(30, CHARACTER_BODY_HALF_WIDTH),
            halfHeight: Math.max(40, CHARACTER_BODY_HEIGHT / 2),
        };
    }

    private hasTerrainNearProjectile(x: number, y: number): boolean {
        const samples = [
            { x, y },
            { x: x + PROJECTILE_COLLISION_RADIUS, y },
            { x: x - PROJECTILE_COLLISION_RADIUS, y },
            { x, y: y + PROJECTILE_COLLISION_RADIUS },
            { x, y: y - PROJECTILE_COLLISION_RADIUS },
            {
                x: x + PROJECTILE_COLLISION_RADIUS * 0.7,
                y: y + PROJECTILE_COLLISION_RADIUS * 0.7,
            },
            {
                x: x - PROJECTILE_COLLISION_RADIUS * 0.7,
                y: y + PROJECTILE_COLLISION_RADIUS * 0.7,
            },
            {
                x: x + PROJECTILE_COLLISION_RADIUS * 0.7,
                y: y - PROJECTILE_COLLISION_RADIUS * 0.7,
            },
            {
                x: x - PROJECTILE_COLLISION_RADIUS * 0.7,
                y: y - PROJECTILE_COLLISION_RADIUS * 0.7,
            },
        ];

        return samples.some(
            (point) =>
                this.terrainEngine.getMaterialAt(point.x, point.y) !==
                TerrainMaterial.EMPTY,
        );
    }

    private calculateAiShot(): { angle: number; force: number; score: number } {
        const profile = this.aiWeapon.physicsProfile;
        const wind = this.windSystem.getCurrent();
        const search = AI_SEARCH_BY_DIFFICULTY[this.difficulty];

        // For excavation strategy aim at terrain below the enemy's feet
        const targetYOffset = this.aiStrategyEngine.getAimTargetOffset(
            this.aiStrategy,
            this.aiExcavScore,
        );

        // Dynamic angle range based on player position relative to AI
        const playerIsLeft = this.playerStats.x < this.aiStats.x;
        const angleMin = playerIsLeft ? 95 : 5;
        const angleMax = playerIsLeft ? 175 : 85;
        const defaultAngle = playerIsLeft ? 135 : 45;

        let best = {
            angle: defaultAngle,
            force: 60,
            score: Number.POSITIVE_INFINITY,
        };

        for (
            let angle = angleMin;
            angle <= angleMax;
            angle += search.angleStep
        ) {
            for (let force = 20; force <= 100; force += search.forceStep) {
                const config: ProjectileConfig = {
                    angle,
                    force,
                    gravityScale: profile.gravityScale,
                    windInfluence: profile.windInfluence,
                    baseDamage: this.aiWeapon.baseDamage,
                };
                const path = this.projectilePhysics.simulate(
                    this.aiStats.x,
                    this.aiStats.y,
                    config,
                    wind,
                    this.aiWeapon.physicsProfile,
                );
                const score = this.scoreAiPath(path, targetYOffset);
                if (score < best.score) best = { angle, force, score };
            }
        }

        // DDTank-style shot correction: remember last impact and pre-correct force.
        // Positive errorX means shot landed right of target.
        // If player is to the left (AI shoots left), positive error = overshot → reduce force.
        // If player is to the right (AI shoots right), positive error = undershot → increase force.
        if (this.aiLastImpactX !== null && this.difficulty !== "easy") {
            const errorX = this.aiLastImpactX - this.playerStats.x;
            const absError = Math.abs(errorX);
            if (absError > 15) {
                const corrK = this.difficulty === "hard" ? 0.065 : 0.04;
                const dirSign = playerIsLeft ? 1 : -1;
                const forceCorr = dirSign * errorX * corrK;
                best = {
                    ...best,
                    force: Math.max(
                        20,
                        Math.min(100, Math.round(best.force + forceCorr)),
                    ),
                };
            }
        }

        return {
            angle: Math.max(
                angleMin,
                Math.min(
                    angleMax,
                    best.angle +
                        Phaser.Math.FloatBetween(
                            -search.angleError,
                            search.angleError,
                        ),
                ),
            ),
            force: Math.max(
                20,
                Math.min(
                    100,
                    Math.round(
                        best.force +
                            Phaser.Math.FloatBetween(
                                -search.forceError,
                                search.forceError,
                            ),
                    ),
                ),
            ),
            score: best.score,
        };
    }

    private tryRepositionAi(): boolean {
        const currentX = this.aiSprite.x;
        const candidates = [-96, -64, -32, 32, 64, 96]
            .map((offset) =>
                this.clampInitialX(currentX + offset, this.scale.width),
            )
            .filter(
                (x, index, values) =>
                    Math.abs(x - currentX) > 4 && values.indexOf(x) === index,
            );

        let best = {
            x: currentX,
            y: this.aiSprite.y,
            score: Number.POSITIVE_INFINITY,
        };

        for (const x of candidates) {
            const safe = this.findSafeCharacterPosition(
                x,
                this.aiSprite.y + this.aiSprite.height / 2,
                {
                    halfWidth: this.aiSprite.width / 2,
                    height: this.aiSprite.height,
                    searchUp: this.aiSprite.height * 2,
                    searchDown: this.aiSprite.height * 4,
                    searchRadiusX: 0,
                },
            );
            if (!safe) continue;
            const original = { x: this.aiStats.x, y: this.aiStats.y };
            this.aiStats.x = safe.x;
            this.aiStats.y = safe.y;
            const shot = this.calculateAiShot();
            if (shot.score < best.score)
                best = {
                    x: this.aiStats.x,
                    y: this.aiStats.y,
                    score: shot.score,
                };
            this.aiStats.x = original.x;
            this.aiStats.y = original.y;
        }

        if (best.score >= AI_REPOSITION_THRESHOLD) return false;

        this.aiSprite.setPosition(best.x, best.y);
        this.aiStats.x = best.x;
        this.aiStats.y = best.y;
        const label = this.add
            .text(best.x, best.y - 48, "Reposicionando", {
                fontSize: "12px",
                color: "#ffdd66",
                fontFamily: "monospace",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(20)
            .setAlpha(0.95);
        this.tweens.add({
            targets: label,
            y: best.y - 78,
            alpha: 0,
            duration: 700,
            onComplete: () => label.destroy(),
        });
        return true;
    }

    private scoreAiPath(
        path: Array<{ x: number; y: number }>,
        targetYOffset = 0,
    ): number {
        const targetX = this.playerStats.x;
        const targetY = this.playerStats.y + targetYOffset;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (const point of path) {
            const dx = point.x - targetX;
            const dy = point.y - targetY;
            bestDistance = Math.min(bestDistance, Math.sqrt(dx * dx + dy * dy));

            const hitTerrain =
                this.terrainEngine.getMaterialAt(point.x, point.y) !==
                TerrainMaterial.EMPTY;
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
        shouldEndTurn = true,
        dungeonMonster?: DungeonMonsterRuntime,
    ): boolean {
        const targetMonster =
            isPlayerShot && this.dungeonStageConfig
                ? (dungeonMonster ??
                  this.dungeonMonsters.find(
                      (monster) => monster.stats === targetStats,
                  ))
                : undefined;
        const damageTargetStats = targetMonster?.stats ?? targetStats;
        const distanceToTarget = this.getDistanceToTargetBounds(
            impactX,
            impactY,
            damageTargetStats,
            this.getTargetDamageBounds(targetMonster),
        );
        let damage = this.damageCalc.calculateByDistance(
            distanceToTarget,
            baseDamage,
            excavationRadius,
        );

        const shooterId = isPlayerShot ? "player" : "ai";
        const targetId = isPlayerShot ? "ai" : "player";

        // Track AI impact position for DDTank-style shot correction next turn
        if (!isPlayerShot) {
            this.aiLastImpactX = impactX;
        }

        // Strength scales damage (each point = +5%)
        const strength = isPlayerShot ? this.playerStrength : this.aiStrength;
        if (strength > 0) {
            damage = Math.round(damage * (1 + strength * 0.05));
        }

        // VULNERABILITY multiplies damage received by 1.5
        if (this.statusEffects.hasEffect(targetId, "VULNERABILITY")) {
            damage = Math.round(damage * 1.5);
        }

        if (!targetMonster) {
            damage = this.applyDefenseReduction(targetId, damage);
        }

        // FREEZE breaks when the frozen target receives damage
        const targetWasFrozen = this.statusEffects.hasEffect(
            targetId,
            "FREEZE",
        );

        if (isPlayerShot) {
            damage = this.applyShieldReduction("ai", damage);
            damageTargetStats.hp = Math.max(0, damageTargetStats.hp - damage);
            this.showDamageText(
                damageTargetStats.x,
                damageTargetStats.y,
                damage,
                "#ff4444",
            );
            if (targetMonster) {
                this.updateDungeonMonsterVisual(targetMonster);
                this.syncPrimaryDungeonMonster();
            } else {
                if (this.aiStats.hp <= 0) {
                    this.aiCharacterSprite?.play("death", true);
                } else {
                    this.aiCharacterSprite?.play("hit", true);
                }
            }
        } else {
            damage = this.applyShieldReduction("player", damage);
            this.playerStats.hp = Math.max(0, this.playerStats.hp - damage);
            this.showDamageText(
                this.playerStats.x,
                this.playerStats.y,
                damage,
                "#44aaff",
            );
            if (this.playerStats.hp <= 0) {
                this.playerCharacterSprite?.play("death", true);
            } else {
                this.playerCharacterSprite?.play("hit", true);
            }
        }

        // Break pre-existing freeze when target takes damage
        if (damage > 0 && targetWasFrozen) {
            this.statusEffects.remove(targetId, "FREEZE");
        }

        // Roll runic effect from shooter's weapon
        const shooterWeapon = isPlayerShot ? this.playerWeapon : this.aiWeapon;
        const luck = isPlayerShot ? this.playerLuck : this.aiLuck;
        if (rollRunicEffect(luck)) {
            const runicEffect = getWeaponRunicEffect(shooterWeapon.id);
            if (runicEffect) {
                this.statusEffects.apply(targetId, runicEffect);
                this.showEffectFloatingText(
                    isPlayerShot ? damageTargetStats.x : this.playerStats.x,
                    isPlayerShot ? damageTargetStats.y : this.playerStats.y,
                    runicEffect.type,
                );

                // RANDOM_TELEPORT: move target sprite to random X position
                if (runicEffect.type === "RANDOM_TELEPORT" && !targetMonster) {
                    const newX = Phaser.Math.Between(72, MAP_WORLD_WIDTH - 72);
                    this.teleportActor(
                        isPlayerShot ? "ai" : "player",
                        newX,
                        0,
                        {
                            searchUp: 0,
                            searchDown: WORLD_HEIGHT,
                            searchRadiusX: 180,
                        },
                    );
                }
            }
        }

        // BLIND: hide angle display for the affected player (next turn it kicks in)
        this.updateBlindState();

        this.refreshHud();

        // Check game over
        if (this.dungeonStageConfig) {
            if (this.playerStats.hp <= 0) {
                this.finishBattle(false);
                return true;
            }
            const aliveMonsters = this.getAliveDungeonMonsters();
            if (
                this.dungeonStageConfig.objective !== "TRAVERSE" &&
                aliveMonsters.length === 0
            ) {
                this.finishBattle(true);
                return true;
            }
            if (shouldEndTurn) {
                this.endTurn(isPlayerShot, true);
            }
            return false;
        }

        if (this.aiStats.hp <= 0) {
            this.finishBattle(true);
            return true;
        }
        if (this.playerStats.hp <= 0) {
            this.finishBattle(false);
            return true;
        }

        if (shouldEndTurn) {
            this.endTurn(isPlayerShot, true);
        }
        return false;
    }

    private endTurn(_wasPlayerShot: boolean, delayAfterShot: boolean): void {
        const endingTurnNumber = this.turnManager.turnNumber;
        if (this.lastEndedTurnNumber === endingTurnNumber) return;
        this.lastEndedTurnNumber = endingTurnNumber;
        const requestedAt = this.time.now;

        // Lock input while waiting for falls to settle so the player cannot fire
        // a second shot or accidentally pass the turn during the fall animation.
        this.isAnimating = true;

        // Refresh fall state — it may be stale if isAnimating was true since last update()
        this.playerFall.update(this.playerSprite, this.terrainEngine, 0);
        if (!this.dungeonStageConfig) {
            this.aiFall.update(this.aiSprite, this.terrainEngine, 0);
        }

        // Unlock and advance turn only once all characters have landed.
        this.waitForFallsToSettle(() => {
            const elapsed = this.time.now - requestedAt;
            const remainingDelay = delayAfterShot
                ? Math.max(0, POST_SHOT_TURN_ADVANCE_DELAY_MS - elapsed)
                : 0;

            this.scheduleTurnEvent(remainingDelay, () => {
                if (this.battleEnded) return;
                this.isAnimating = false;
                this.processEndTurn();
            });
        }, requestedAt);
    }

    private waitForFallsToSettle(
        callback: () => void,
        startedAt: number,
    ): void {
        if (this.battleEnded) return;
        const aiSettled = this.dungeonStageConfig || !this.aiFall.isFalling;
        if (!this.playerFall.isFalling && aiSettled) {
            callback();
            return;
        }
        if (this.time.now - startedAt >= MAX_TURN_FALL_WAIT_MS) {
            this.snapCharactersToGround();
            callback();
            return;
        }
        this.time.delayedCall(100, () =>
            this.waitForFallsToSettle(callback, startedAt),
        );
    }

    private processEndTurn(): void {
        if (this.battleEnded) return;

        this.activeVolleyId++;
        this.clearScheduledTurnEvents();
        this.onAngleButtonUp(); // clean up hold-to-repeat timers
        this.turnManager.nextTurn();
        this.windSystem.generate();

        // [v1.5.0] MapModifierManager: at end of each full round (after AI turn), spawn new modifiers
        if (this.turnManager.isPlayerTurn && this.mapModifierManager) {
            this.mapModifierManager.onRoundEnd();
            this.mapModifierManager.trySpawn(this, (x, y) => {
                return (
                    this.terrainEngine.getMaterialAt(x, y) !==
                    TerrainMaterial.EMPTY
                );
            });
        }

        // Tick status effects for the player whose turn is starting
        const activePlayerId = this.turnManager.isPlayerTurn ? "player" : "ai";
        const activeStats = this.turnManager.isPlayerTurn
            ? this.playerStats
            : this.aiStats;
        const tickResult = this.statusEffects.tick(
            activePlayerId,
            activeStats.hp,
            activeStats.maxHp,
        );

        if (activeStats.hp !== tickResult.newHp) {
            const bleedDamage = activeStats.hp - tickResult.newHp;
            activeStats.hp = tickResult.newHp;
            if (bleedDamage > 0) {
                this.showDamageText(
                    activeStats.x,
                    activeStats.y,
                    bleedDamage,
                    "#ff4444",
                );
                // Bug 4: Bleed damage breaks freeze
                if (this.statusEffects.hasEffect(activePlayerId, "FREEZE")) {
                    this.statusEffects.remove(activePlayerId, "FREEZE");
                }
            }
        }
        if (this.dungeonStageConfig && activePlayerId === "ai") {
            const activeMonster = this.dungeonMonsters.find(
                (monster) => monster.stats === activeStats,
            );
            if (activeMonster) this.updateDungeonMonsterVisual(activeMonster);
            this.syncPrimaryDungeonMonster();
        }

        // Update BLIND state for current turn
        this.updateBlindState();
        // Update FREEZE lock state
        this.updateFreezeState();

        this.refreshHud();

        // Check game over from BLEED
        if (this.dungeonStageConfig) {
            if (this.playerStats.hp <= 0) {
                this.finishBattle(false);
                return;
            }
            if (
                this.dungeonStageConfig.objective !== "TRAVERSE" &&
                this.getAliveDungeonMonsters().length === 0
            ) {
                this.finishBattle(true);
                return;
            }
        } else if (this.aiStats.hp <= 0) {
            this.finishBattle(true);
            return;
        }
        if (this.playerStats.hp <= 0) {
            this.finishBattle(false);
            return;
        }

        if (!this.turnManager.isPlayerTurn) {
            this.syncPrimaryDungeonMonster();
            this.cameras.main.startFollow(this.aiSprite, true, 0.08, 0.08);
            this.movementBudgetHUD?.setVisible(false);
            const aiTurnToken = this.turnManager.turnNumber;
            const aiDelay = this.dungeonStageConfig
                ? Phaser.Math.Between(650, 1200)
                : Phaser.Math.Between(3000, 7000);
            this.scheduleTurnEvent(aiDelay, () => {
                if (this.dungeonStageConfig) {
                    this.runDungeonMonsterTurn(aiTurnToken);
                } else {
                    this.fireAiShot(aiTurnToken);
                }
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
            // Disarm teleport/ice if not fired last turn (player passed turn)
            this.teleportShotArmed = false;
            this.iceShotArmed = false;
            // Clear calibration zone at start of new turn
            this.calibrationTargetZone = null;
            this.battleHud?.setCalibrationZone(null);
            this.updateTrajectoryPreview();
            // [v1.5.0] BattleInputController: reset charge flag on new player turn
            this.battleInputController?.resetTurn();
        }
        this.syncActorAssets();
    }

    private scheduleTurnEvent(
        delayMs: number,
        callback: () => void,
    ): Phaser.Time.TimerEvent {
        const event = this.time.delayedCall(delayMs, () => {
            this.scheduledTurnEvents = this.scheduledTurnEvents.filter(
                (item) => item !== event,
            );
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

    private applyWeaponUpgrade(
        baseDamage: number,
        rarity: string,
        upgradeLevel: number,
    ): number {
        const RARITY_BONUS: Record<string, number> = {
            common: 1.0,
            uncommon: 1.02,
            rare: 1.04,
            heroic: 1.07,
        };
        const mult = RARITY_BONUS[rarity] ?? 1.0;
        return Math.round(baseDamage * mult) + upgradeLevel;
    }

    private applyShieldReduction(
        target: "player" | "ai",
        damage: number,
    ): number {
        const reduction =
            target === "player"
                ? this.playerShieldReduction
                : this.aiShieldReduction;
        if (reduction <= 0) return damage;
        if (target === "player") this.playerShieldReduction = 0;
        else this.aiShieldReduction = 0;
        return Math.max(0, Math.round(damage * (1 - reduction)));
    }

    private applyDefenseReduction(
        target: "player" | "ai",
        damage: number,
    ): number {
        const reduction =
            target === "player" ? this.playerDefense : this.aiDefense;
        if (reduction <= 0 || damage <= 0) return damage;
        return Math.max(0, Math.round(damage * (1 - reduction)));
    }

    // ──────────────────────────────────────────────────────────
    // Runic effect helpers
    // ──────────────────────────────────────────────────────────

    private showEffectFloatingText(
        x: number,
        y: number,
        effectType: RunicEffectType,
    ): void {
        const labels: Record<RunicEffectType, string> = {
            BLEED: "💀 BLEED!",
            FREEZE: "❄ FREEZE!",
            BLIND: "🌫 BLIND!",
            WEAK_SHOT: "↓ WEAK SHOT!",
            ITEM_BLOCK: "🚫 ITEM BLOCK!",
            RANDOM_TELEPORT: "⚡ TELEPORT!",
            VULNERABILITY: "💢 VULNERABILITY!",
        };
        const colors: Record<RunicEffectType, string> = {
            BLEED: "#ff4444",
            FREEZE: "#44aaff",
            BLIND: "#ffdd44",
            WEAK_SHOT: "#ff8800",
            ITEM_BLOCK: "#888888",
            RANDOM_TELEPORT: "#cc44ff",
            VULNERABILITY: "#ff88cc",
        };
        const text = this.add
            .text(x, y - 50, labels[effectType] ?? effectType, {
                fontSize: "16px",
                color: colors[effectType] ?? "#ffffff",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(22);

        this.tweens.add({
            targets: text,
            y: y - 100,
            alpha: 0,
            duration: 1200,
            ease: "Power2",
            onComplete: () => text.destroy(),
        });
    }

    /**
     * Hides or shows the angle text based on BLIND effect on player.
     * Called after each hit and at turn start.
     */
    private updateBlindState(): void {
        if (
            this.turnManager.isPlayerTurn &&
            this.statusEffects.hasEffect("player", "BLIND")
        ) {
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
        if (
            this.turnManager.isPlayerTurn &&
            this.statusEffects.hasEffect("player", "FREEZE")
        ) {
            this._btnAngleMinus.setFillStyle(0x2266cc, 0.6);
            this._btnAnglePlus.setFillStyle(0x2266cc, 0.6);
        } else {
            this._btnAngleMinus.setFillStyle(0x000000, 0.001);
            this._btnAnglePlus.setFillStyle(0x000000, 0.001);
        }
    }

    private showDamageText(
        x: number,
        y: number,
        damage: number,
        color: string,
    ): void {
        const text = this.add
            .text(x, y - 30, `-${damage}`, {
                fontSize: "22px",
                color,
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setDepth(20);

        this.tweens.add({
            targets: text,
            y: y - 80,
            alpha: 0,
            duration: 900,
            ease: "Power2",
            onComplete: () => text.destroy(),
        });
    }

    private showItemFloatingText(
        x: number,
        y: number,
        label: string,
        color = "#66ffcc",
    ): void {
        const text = this.add
            .text(x, y - 48, label, {
                fontSize: "15px",
                color,
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(22);

        this.tweens.add({
            targets: text,
            y: y - 88,
            alpha: 0,
            duration: 900,
            ease: "Power2",
            onComplete: () => text.destroy(),
        });
    }

    // ──────────────────────────────────────────────────────────
    // HUD refresh
    // ──────────────────────────────────────────────────────────

    private refreshHud(): void {
        const lastShot = this.turnManager.isPlayerTurn
            ? this.lastPlayerShot
            : this.lastAiShot;
        if (lastShot) {
            this.battleHud.setLastShot(lastShot.force, lastShot.angle);
        }
    }

    private onResize(): void {
        this.applyCameraLayout();
        this.refreshHud();
        this.layoutAngleControls();
        this.layoutBattleMenuButton();
    }

    private applyCameraLayout(): void {
        if (!this.terrainEngine) return;
        this.cameras.main.setZoom(1);
    }

    private getPassButtonX(): number {
        const leftCards = 1;
        const cardW = Math.round(Math.min(this.scale.width * 0.068, 120));
        const gap = Math.round(this.scale.width * 0.007);
        const margin = 0;
        const buttonHalf = 59;
        return (
            margin +
            leftCards * cardW +
            Math.max(0, leftCards - 1) * gap +
            gap +
            buttonHalf
        );
    }

    private layoutAngleControls(): void {
        if (!this._btnAngleMinus || !this._btnAnglePlus) return;
        const angleY = this.scale.height - 53;
        const dialR = Math.round(
            Math.min(this.scale.height * 0.085, this.scale.width * 0.052),
        );
        const angleX = dialR + 2;
        const hitW = Math.max(56, Math.round(dialR * 0.9));
        const hitH = Math.max(96, Math.round(dialR * 1.55));
        this._btnAngleMinus
            .setPosition(angleX - hitW / 2, angleY)
            .setSize(hitW, hitH);
        this._btnAnglePlus
            .setPosition(angleX + hitW / 2, angleY)
            .setSize(hitW, hitH);
    }

    // ──────────────────────────────────────────────────────────
    // Debug API (accessed via window['battleScene'])
    // ──────────────────────────────────────────────────────────

    setWindOverride(directionIntensity: number): void {
        const direction = directionIntensity >= 0 ? 1 : -1;
        const intensity = Math.abs(directionIntensity);
        (
            this.windSystem as unknown as {
                current: { direction: number; intensity: number };
            }
        ).current = { direction, intensity };
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
        this.applyProjectileVisual(this.projectileArc, id);
        this.playerWeaponIcon?.setTexture(this.weaponSpriteKey(id));
        this.playerCharacterSprite?.setWeapon(id);
        this.clampCurrentAngleForWeapon();
        this.refreshHud();
    }

    setAiWeapon(id: string): void {
        const weapon = this.weaponSystem.getById(id);
        if (!weapon) return;
        this.aiWeapon = weapon;
        this.aiWeaponIcon?.setTexture(this.weaponSpriteKey(id));
        this.aiCharacterSprite?.setWeapon(id);
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
        this.terrainRenderer.applyExplosion(
            result.center.x,
            result.center.y,
            result.radius,
        );
    }

    private getMapOption(mapName: MapName): BattleMapOption {
        return (
            MAP_OPTIONS_BY_ID.get(mapName) ?? MAP_OPTIONS_BY_ID.get("plains")!
        );
    }

    private getTerrainImageData(key: string): ImageData {
        const source = this.textures
            .get(key)
            .getSourceImage() as HTMLImageElement;
        const canvas = document.createElement("canvas");
        canvas.width = source.naturalWidth;
        canvas.height = source.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(source, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    setBattleMode(mode: BattleMode): void {
        const fallbackMap = mode === "dungeon" ? "dungeon_f1_s1" : "plains";
        this.switchMap(fallbackMap);
    }

    resetTerrain(): void {
        const terrainKey = `map_${this.currentMap}_terrain`;
        if (this.textures.exists(terrainKey)) {
            const imgData = this.getTerrainImageData(terrainKey);
            this.terrainEngine = TerrainEngine.fromImageData(imgData);
        }
    }

    switchMap(mapName: MapName): void {
        this.currentMap = mapName;
        const map = this.getMapOption(mapName);
        this.battleMode = map.mode;

        if (this.textures.exists(`map_${mapName}_terrain`)) {
            const imgData = this.getTerrainImageData(`map_${mapName}_terrain`);
            this.terrainEngine = TerrainEngine.fromImageData(imgData);
        } else if (mapName.startsWith("dungeon")) {
            this.terrainEngine = new TerrainEngine();
        }

        this.aiAvatar?.setTexture(
            this.battleMode === "dungeon" ? "dwarf_battle" : "elf_battle",
        );
        this.aiAvatar?.setTint(
            this.battleMode === "dungeon" ? 0xffcc88 : 0xffffff,
        );
        this.aiCharacterSprite?.destroy();
        const aiRace: RuneWarsRaceId =
            this.battleMode === "dungeon" ? "dwarf" : "elf";
        this.aiCharacterSprite = new ModularCharacterRenderer(this, {
            race: aiRace,
            x: this.aiSprite.x,
            y: this.characterVisualY(this.aiSprite.y),
            facing: "left",
            weaponId: this.aiWeapon.id,
        });
        this.aiCharacterSprite.setDepth(10);

        // Camera bounds
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.applyCameraLayout();

        // Re-spawn using meta spawn points if available
        const mapJson = this.getMapJsonById(mapName);
        const mapMeta = mapJson?.meta as MapMeta | undefined;
        const rawSpawns = mapMeta?.spawnPoints ?? [];
        const spawnContext = this.getSpawnNormalizationContext(
            mapName,
            mapMeta,
        );
        const charHeight = 60;

        const spawns =
            rawSpawns.length >= 2
                ? selectSpawns(rawSpawns, 2, this.terrainEngine, spawnContext)
                : [];

        const worldCenterY = WORLD_HEIGHT / 2;

        if (spawns[0]) {
            const p = spawnToWorld(
                spawns[0],
                1,
                charHeight,
                this.terrainEngine,
            );
            this.playerSprite.setPosition(p.x, p.y);
        } else {
            const fallbackX = WORLD_WIDTH * 0.1;
            const safe = this.findSafeCharacterPosition(
                fallbackX,
                worldCenterY,
            );
            this.playerSprite.setPosition(
                safe?.x ?? fallbackX,
                safe?.y ?? worldCenterY,
            );
        }

        if (spawns[1]) {
            const a = spawnToWorld(
                spawns[1],
                1,
                charHeight,
                this.terrainEngine,
            );
            this.aiSprite.setPosition(a.x, a.y);
        } else {
            const fallbackX = WORLD_WIDTH * 0.9;
            const safe = this.findSafeCharacterPosition(
                fallbackX,
                worldCenterY,
            );
            this.aiSprite.setPosition(
                safe?.x ?? fallbackX,
                safe?.y ?? worldCenterY,
            );
        }
        this.syncActorAssets();
    }

    private getMapJsonById(
        mapName: MapName,
    ): { meta?: unknown; grid: number[][] } | null {
        switch (mapName) {
            case "plains":
                return mapPlains as unknown as {
                    meta?: unknown;
                    grid: number[][];
                };
            case "mystic_castle":
                return mapMysticCastle as unknown as {
                    meta?: unknown;
                    grid: number[][];
                };
            case "deep_mines":
                return mapDeepMines as unknown as {
                    meta?: unknown;
                    grid: number[][];
                };
            case "arcane_ruins":
                return mapArcaneRuins as unknown as {
                    meta?: unknown;
                    grid: number[][];
                };
            case "runic_forest":
                return mapRunicForest as unknown as {
                    meta?: unknown;
                    grid: number[][];
                };
            case "dungeon_f1_s1":
                return mapDungeonF1S1 as unknown as {
                    meta?: unknown;
                    grid: number[][];
                };
            case "dungeon_f1_s2":
                return mapDungeonF1S2 as unknown as {
                    meta?: unknown;
                    grid: number[][];
                };
            case "dungeon_cave_entrance":
                return mapDungeonCaveEntrance as unknown as {
                    meta?: unknown;
                    grid: number[][];
                };
            case "dungeon_cave_hall":
                return mapDungeonCaveHall as unknown as {
                    meta?: unknown;
                    grid: number[][];
                };
            case "dungeon_cave_boss":
                return mapDungeonCaveBoss as unknown as {
                    meta?: unknown;
                    grid: number[][];
                };
            default:
                return null;
        }
    }

    paintCell(worldX: number, worldY: number, material: number): void {
        this.terrainEngine.setMaterialAt(
            worldX,
            worldY,
            material as TerrainMaterial,
        );
        if (this.playerSprite && this.aiSprite) {
            this.ensureCharactersOutsideTerrain();
            this.playerStats.x = this.playerSprite.x;
            this.playerStats.y = this.playerSprite.y;
            this.aiStats.x = this.aiSprite.x;
            this.aiStats.y = this.aiSprite.y;
            this.syncActorAssets();
        }
        // Terrain renderer uses bitmap approach; visual update requires applyExplosion for erasure
    }

    // ──────────────────────────────────────────────────────────
    // v0.6.0 Debug API
    // ──────────────────────────────────────────────────────────

    applyDebugEffect(target: "player" | "ai", type: string): void {
        const validTypes: RunicEffectType[] = [
            "BLEED",
            "FREEZE",
            "BLIND",
            "WEAK_SHOT",
            "ITEM_BLOCK",
            "RANDOM_TELEPORT",
            "VULNERABILITY",
        ];
        if (!validTypes.includes(type as RunicEffectType)) return;
        const effect: RunicEffect = {
            type: type as RunicEffectType,
            duration: type === "RANDOM_TELEPORT" ? 0 : 2,
            value: type === "BLEED" ? 0.05 : undefined,
        };
        this.statusEffects.apply(target, effect);

        // If RANDOM_TELEPORT applied via debug, move sprite immediately
        if (type === "RANDOM_TELEPORT") {
            const newX = Phaser.Math.Between(72, MAP_WORLD_WIDTH - 72);
            this.teleportActor(target, newX, 0, {
                searchUp: 0,
                searchDown: WORLD_HEIGHT,
                searchRadiusX: 180,
            });
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

    useDebugConsumable(target: "player" | "ai", id: string): void {
        const item = this.consumableSystem.getById(id);
        if (!item) return;

        if (id === "heal") {
            const stats = target === "player" ? this.playerStats : this.aiStats;
            stats.hp = Math.min(
                stats.maxHp,
                stats.hp + Math.round(stats.maxHp * 0.25),
            );
            this.showItemFloatingText(stats.x, stats.y, "+Cura", "#66ff88");
        } else if (id === "teleport") {
            if (target !== "player") return;
            this.teleportShotArmed = true;
            this.showItemFloatingText(
                this.playerStats.x,
                this.playerStats.y,
                "Teleporte armado",
                "#88ccff",
            );
            this.refreshHud();
            return;
        } else if (id === "ice-throw") {
            if (target === "player") {
                this.iceShotArmed = true;
                this.showItemFloatingText(
                    this.playerStats.x,
                    this.playerStats.y,
                    "❄ Disparo gelado armado!",
                    "#44aaff",
                );
            } else {
                this.aiIceShotArmed = true;
            }
            this.refreshHud();
            return; // arma o disparo sem encerrar o turno
        } else if (id === "invisibility") {
            if (target === "player") this.playerInvisibleTurns = 1;
            this.syncActorAssets();
        } else if (id === "calibration-shot") {
            this.calibrationShotActive = true;
            this.calibrationTargetZone = this.computeCalibrationZone();
            this.battleHud?.setCalibrationZone(this.calibrationTargetZone);
            this.showItemFloatingText(
                this.playerStats.x,
                this.playerStats.y,
                "Calibrado",
                "#ffdd66",
            );
            this.updateTrajectoryPreview();
        }

        // Consumables that fire a shot cancel any pending shot modifier
        if (item.usesTurn) this.shotModifierSystem.consumeAll();

        this.refreshHud();
        if (item.usesTurn) this.endTurn(target === "player", false);
    }

    useDebugSecondaryItem(target: "player" | "ai", id: string): void {
        const item = this.secondaryItemSystem.getById(id);
        if (!item) return;
        if (target === "player") this.playerSecondaryItemId = id;
        else this.aiSecondaryItemId = id;
        this.applySecondaryVisual(target, id);

        if (id === "shield") {
            if (target === "player") this.playerShieldReduction = 0.4;
            else this.aiShieldReduction = 0.4;
        } else if (id === "healing-book") {
            const stats = target === "player" ? this.playerStats : this.aiStats;
            stats.hp = Math.min(
                stats.maxHp,
                stats.hp + Math.round(stats.maxHp * 0.15),
            );
            this.showItemFloatingText(stats.x, stats.y, "+Livro", "#66ff88");
        } else if (id === "camouflage-orb") {
            if (target === "player") this.playerInvisibleTurns = 1;
        } else if (id === "protection-totem") {
            if (target === "player") this.playerShieldReduction = 0.6;
            else this.aiShieldReduction = 0.6;
        } else if (id === "runic-builder") {
            this.secondaryItemSystem.activateRunicBuilder(
                target,
                this.terrainEngine.getConstructedCount(target),
            );
        }

        this.refreshHud();
        this.syncActorAssets();
        if (item.usesTurn) this.endTurn(target === "player", false);
    }

    private resolveTeleportShot(
        isPlayerShot: boolean,
        impactPoint: { x: number; y: number },
        impact: ProjectileImpactResult,
        traveledPath: Array<{ x: number; y: number }>,
    ): void {
        if (!isPlayerShot || !this.teleportShotArmed) return;

        this.teleportShotArmed = false;

        if (!impact.hitTerrain && !impact.hitTarget) {
            this.showItemFloatingText(
                this.playerStats.x,
                this.playerStats.y,
                "Teleporte falhou",
                "#bbbbbb",
            );
            return;
        }

        const teleportAnchor =
            (impact.hitTerrain
                ? this.findNearestTerrainPoint(
                      impactPoint,
                      PROJECTILE_COLLISION_RADIUS,
                  )
                : null) ?? impactPoint;
        const teleported =
            (impact.hitTerrain &&
                this.teleportPlayerNearTerrainImpact(
                    teleportAnchor,
                    impactPoint,
                    traveledPath,
                )) ||
            this.teleportActor("player", teleportAnchor.x, teleportAnchor.y, {
                searchUp: 180,
                searchDown: WORLD_HEIGHT,
                searchRadiusX: 96,
            });
        if (teleported) {
            this.showItemFloatingText(
                this.playerStats.x,
                this.playerStats.y,
                "Teleporte",
                "#88ccff",
            );
            this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);
        } else {
            this.showItemFloatingText(
                this.playerStats.x,
                this.playerStats.y,
                "Teleporte falhou",
                "#bbbbbb",
            );
        }
    }

    private resolveIceShot(isPlayerShot: boolean, hitEnemy: boolean): void {
        if (isPlayerShot && this.iceShotArmed) {
            this.iceShotArmed = false;
            if (hitEnemy) {
                this.statusEffects.apply("ai", { type: "FREEZE", duration: 2 });
                this.showEffectFloatingText(
                    this.aiStats.x,
                    this.aiStats.y,
                    "FREEZE",
                );
            }
        }
        if (!isPlayerShot && this.aiIceShotArmed) {
            this.aiIceShotArmed = false;
            if (hitEnemy) {
                this.statusEffects.apply("player", {
                    type: "FREEZE",
                    duration: 2,
                });
                this.showEffectFloatingText(
                    this.playerStats.x,
                    this.playerStats.y,
                    "FREEZE",
                );
            }
        }
    }

    private computeCalibrationZone(): { min: number; max: number } | null {
        const profile = this.playerWeapon.physicsProfile;
        const wind = this.windSystem.getCurrent();
        let minForce: number | null = null;
        let maxForce: number | null = null;

        for (let force = 2; force <= 100; force += 2) {
            const config: ProjectileConfig = {
                angle: this.getWorldAngle(this.currentAngle),
                force,
                gravityScale: profile.gravityScale,
                windInfluence: profile.windInfluence,
                baseDamage: this.playerWeapon.baseDamage,
            };
            const path = this.projectilePhysics.simulate(
                this.playerStats.x,
                this.playerStats.y,
                config,
                wind,
                this.playerWeapon.physicsProfile,
            );
            const clipped = this.clipPathToFirstImpact(path, true);
            if (clipped.impact?.hitTarget) {
                if (minForce === null) minForce = force;
                maxForce = force;
            }
        }

        if (minForce === null || maxForce === null) return null;
        return {
            min: Math.max(0, minForce - 1),
            max: Math.min(100, maxForce + 1),
        };
    }

    private teleportActor(
        target: "player" | "ai",
        x: number,
        floorSearchY = 0,
        options?: {
            searchUp?: number;
            searchDown?: number;
            searchRadiusX?: number;
        },
    ): boolean {
        const sprite = target === "player" ? this.playerSprite : this.aiSprite;
        const newX = Math.max(72, Math.min(x, MAP_WORLD_WIDTH - 72));
        const safe = this.findSafeCharacterPosition(newX, floorSearchY, {
            halfWidth: sprite.width / 2,
            height: sprite.height,
            searchUp: options?.searchUp ?? sprite.height * 3,
            searchDown: options?.searchDown ?? sprite.height * 4,
            searchRadiusX: options?.searchRadiusX ?? sprite.width * 3,
        });
        if (!safe) return false;

        sprite.setPosition(safe.x, safe.y);
        if (target === "player") {
            this.playerStats.x = sprite.x;
            this.playerStats.y = sprite.y;
        } else {
            this.aiStats.x = sprite.x;
            this.aiStats.y = sprite.y;
        }
        this.syncActorAssets();
        return true;
    }

    private teleportPlayerNearTerrainImpact(
        terrainPoint: { x: number; y: number },
        impactPoint: { x: number; y: number },
        traveledPath: Array<{ x: number; y: number }>,
    ): boolean {
        const previous = this.findPointBeforeImpact(traveledPath, impactPoint);
        if (!previous) return false;

        const dx = impactPoint.x - previous.x;
        const dy = impactPoint.y - previous.y;
        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return false;

        const sprite = this.playerSprite;
        const halfWidth = sprite.width / 2;
        const height = sprite.height;
        const halfHeight = height / 2;
        const trajectoryPlacement =
            this.findClearTeleportPlacementAlongIncomingPath(
                terrainPoint,
                dx,
                dy,
                halfWidth,
                halfHeight,
                height,
            );
        if (trajectoryPlacement) {
            sprite.setPosition(trajectoryPlacement.x, trajectoryPlacement.y);
            this.playerStats.x = sprite.x;
            this.playerStats.y = sprite.y;
            this.syncActorAssets();
            return true;
        }

        const primaryAxis =
            Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
        const axisOrder =
            primaryAxis === "horizontal"
                ? (["horizontal", "vertical"] as const)
                : (["vertical", "horizontal"] as const);

        for (const axis of axisOrder) {
            const placement = this.findClearTeleportPlacementOnImpactSide(
                terrainPoint,
                axis,
                dx,
                dy,
                halfWidth,
                halfHeight,
                height,
            );
            if (!placement) continue;

            sprite.setPosition(placement.x, placement.y);
            this.playerStats.x = sprite.x;
            this.playerStats.y = sprite.y;
            this.syncActorAssets();
            return true;
        }

        return false;
    }

    private findClearTeleportPlacementAlongIncomingPath(
        terrainPoint: { x: number; y: number },
        dx: number,
        dy: number,
        halfWidth: number,
        halfHeight: number,
        height: number,
    ): { x: number; y: number } | null {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length < 0.001) return null;

        const incomingX = -dx / length;
        const incomingY = -dy / length;
        const supportDistance =
            halfWidth * Math.abs(incomingX) +
            halfHeight * Math.abs(incomingY);
        const clearance = 3;
        const backOffsets = [0, 4, 8, 12, 18, 26, 36, 48, 64, 80];
        const perpendicularOffsets = [
            0, -4, 4, -8, 8, -12, 12, -18, 18, -26, 26, -36, 36, -48, 48,
        ];
        const perpendicularX = -incomingY;
        const perpendicularY = incomingX;

        for (const backOffset of backOffsets) {
            const distance = supportDistance + clearance + backOffset;
            const baseX = terrainPoint.x + incomingX * distance;
            const baseY = terrainPoint.y + incomingY * distance;

            for (const perpendicularOffset of perpendicularOffsets) {
                const x = baseX + perpendicularX * perpendicularOffset;
                const y = baseY + perpendicularY * perpendicularOffset;
                const placement = this.getClearTeleportPlacement(
                    x,
                    y,
                    halfWidth,
                    halfHeight,
                    height,
                );
                if (placement) return placement;
            }
        }

        return null;
    }

    private findPointBeforeImpact(
        traveledPath: Array<{ x: number; y: number }>,
        impactPoint: { x: number; y: number },
    ): { x: number; y: number } | null {
        for (let i = traveledPath.length - 2; i >= 0; i--) {
            const point = traveledPath[i];
            if (
                Phaser.Math.Distance.Squared(
                    point.x,
                    point.y,
                    impactPoint.x,
                    impactPoint.y,
                ) > 1
            ) {
                return point;
            }
        }

        return null;
    }

    private findClearTeleportPlacementOnImpactSide(
        terrainPoint: { x: number; y: number },
        axis: "horizontal" | "vertical",
        dx: number,
        dy: number,
        halfWidth: number,
        halfHeight: number,
        height: number,
    ): { x: number; y: number } | null {
        const clearance = 3;
        const side =
            axis === "horizontal" ? (dx >= 0 ? -1 : 1) : dy >= 0 ? -1 : 1;
        const backOffsets = [0, 4, 8, 12, 18, 26, 36, 48];
        const perpendicularOffsets = [
            0, -4, 4, -8, 8, -12, 12, -18, 18, -26, 26, -36, 36, -48, 48,
        ];

        for (const backOffset of backOffsets) {
            for (const perpendicularOffset of perpendicularOffsets) {
                const x =
                    axis === "horizontal"
                        ? terrainPoint.x +
                          side * (halfWidth + clearance + backOffset)
                        : terrainPoint.x + perpendicularOffset;
                const y =
                    axis === "vertical"
                        ? terrainPoint.y +
                          side * (halfHeight + clearance + backOffset)
                        : terrainPoint.y + perpendicularOffset;
                const placement = this.getClearTeleportPlacement(
                    x,
                    y,
                    halfWidth,
                    halfHeight,
                    height,
                );
                if (placement) return placement;
            }
        }

        return null;
    }

    private getClearTeleportPlacement(
        x: number,
        y: number,
        halfWidth: number,
        halfHeight: number,
        height: number,
    ): { x: number; y: number } | null {
        const clampedX = Phaser.Math.Clamp(
            x,
            Math.max(72, halfWidth),
            Math.min(MAP_WORLD_WIDTH - 72, WORLD_WIDTH - halfWidth),
        );
        const clampedY = Phaser.Math.Clamp(
            y,
            halfHeight,
            WORLD_HEIGHT - halfHeight,
        );

        if (
            characterBodyOverlapsTerrain(this.terrainEngine, clampedX, clampedY, {
                halfWidth,
                height,
            })
        ) {
            return null;
        }

        return { x: clampedX, y: clampedY };
    }

    private findNearestTerrainPoint(
        center: { x: number; y: number },
        radius: number,
    ): { x: number; y: number } | null {
        let best: { x: number; y: number; distSq: number } | null = null;
        const minX = Math.floor(center.x - radius);
        const maxX = Math.ceil(center.x + radius);
        const minY = Math.floor(center.y - radius);
        const maxY = Math.ceil(center.y + radius);
        const radiusSq = radius * radius;

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const dx = x - center.x;
                const dy = y - center.y;
                const distSq = dx * dx + dy * dy;
                if (distSq > radiusSq) continue;
                if (
                    this.terrainEngine.getMaterialAt(x, y) ===
                    TerrainMaterial.EMPTY
                ) {
                    continue;
                }
                if (!best || distSq < best.distSq) {
                    best = { x, y, distSq };
                }
            }
        }

        return best ? { x: best.x, y: best.y } : null;
    }

    getActiveEffects(): { player: RunicEffect[]; ai: RunicEffect[] } {
        return {
            player: this.statusEffects.getEffects("player"),
            ai: this.statusEffects.getEffects("ai"),
        };
    }
}
