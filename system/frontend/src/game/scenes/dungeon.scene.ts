import Phaser from "phaser";
import { DungeonEngine } from "../../app/shared/game-core/dungeon-engine";
import {
    DungeonDifficulty,
    DungeonPhase,
    DungeonState,
    EnemyState,
    PlayerState,
} from "../../app/shared/game-core/dungeon-types";
import {
    DUNGEON_CONTENT,
    bossPhasePlan,
    resolveEnemyPhase,
} from "../../app/shared/game-core/dungeon-content";
import {
    MonsterAiSystem,
    resolveAcidBatAction,
} from "../../app/shared/game-core/monster-ai";
import {
    GRID_COLS,
    TerrainEngine,
} from "../../app/shared/game-core/terrain-engine";
import {
    CELL_SIZE,
    WORLD_HEIGHT,
    TerrainMaterial,
} from "../../app/shared/game-core/terrain-types";
import { TerrainRenderer } from "../terrain/terrain-renderer";
import { tryHorizontalMove } from "../terrain/terrain-collision";
import { EnemyRenderer } from "../enemies/enemy-renderer";
import { GolemBoss } from "../enemies/golem-boss";
import mapEntrance from "../../app/shared/game-core/maps/dungeon-cave-entrance.json";
import mapHall from "../../app/shared/game-core/maps/dungeon-cave-hall.json";
import mapBoss from "../../app/shared/game-core/maps/dungeon-cave-boss.json";
import mapF1S1 from "../../app/shared/game-core/maps/dungeon-f1-s1.json";
import mapF1S2 from "../../app/shared/game-core/maps/dungeon-f1-s2.json";
import mapF2S1 from "../../app/shared/game-core/maps/dungeon-f2-s1.json";
import mapF2S2 from "../../app/shared/game-core/maps/dungeon-f2-s2.json";
import mapF2S3 from "../../app/shared/game-core/maps/dungeon-f2-s3.json";
// [v1.5.0] novos componentes integrados
import { BattleHud, BattleHudState } from "../hud/battle-hud";
import { BattleInputController } from "../input/battle-input-controller";
import { preloadRuneWarsAssets } from "../assets/rune-wars-assets";
import { ModularCharacterRenderer } from "../character/modular-character-renderer";
import { getWeaponVisualProfile } from "../character/weapon-visual-profile";

interface DungeonSceneData {
    phaseIndex?: number;
    snapshot?: DungeonState;
    difficulty?: DungeonDifficulty;
    loadout?: Pick<
        PlayerState,
        "weaponId" | "secondaryItemId" | "consumableIds"
    >;
    playerMaxHp?: number;
    playerHp?: number;
    playerName?: string;
}

interface WorldSpawnPoint {
    x: number;
    y: number;
}

const MAPS: Record<string, { grid: number[][] }> = {
    "dungeon-cave-entrance": mapEntrance,
    "dungeon-cave-hall": mapHall,
    "dungeon-cave-boss": mapBoss,
    "dungeon-f1-s1": mapF1S1,
    "dungeon-f1-s2": mapF1S2,
    "dungeon-f2-s1": mapF2S1,
    "dungeon-f2-s2": mapF2S2,
    "dungeon-f2-s3": mapF2S3,
};
const MAP_WORLD_WIDTH = GRID_COLS * CELL_SIZE;
const PLAYER_MOVE_SPEED = 180;
const ANGLE_CHANGE_SPEED = 80;

const DUNGEON_STAGE_ASSETS: Record<string, { basePath: string }> = {
    "dungeon-f1-s1": { basePath: "assets/dungeon/floor1/stage1" },
    "dungeon-f1-s2": { basePath: "assets/dungeon/floor1/stage2" },
};

function mapBackgroundKey(mapId: string): string {
    return `dungeon_${mapId}_background`;
}

function mapTerrainKey(mapId: string): string {
    return `dungeon_${mapId}_terrain`;
}

function enemyFrameKey(type: string, frame: number): string {
    return `dungeon_enemy_${type}_${frame}`;
}

export class DungeonScene extends Phaser.Scene {
    private engine = new DungeonEngine();
    private ai = new MonsterAiSystem();
    private golem = new GolemBoss();
    private enemyRenderer!: EnemyRenderer;
    private terrainEngine!: TerrainEngine;
    private terrainRenderer!: TerrainRenderer;
    private phase!: DungeonPhase;
    private state!: DungeonState;
    private difficulty: DungeonDifficulty = "easy";
    private turn = 0;
    private player!: Phaser.GameObjects.Container;
    private playerRenderer!: ModularCharacterRenderer;
    private crystal?: Phaser.GameObjects.Rectangle;
    private exitPortal?: Phaser.GameObjects.Arc;
    private enemySprites = new Map<string, Phaser.GameObjects.Container>();
    private infoText!: Phaser.GameObjects.Text;
    private angleText!: Phaser.GameObjects.Text;
    private powerBarFill!: Phaser.GameObjects.Rectangle;
    private powerBarLabel!: Phaser.GameObjects.Text;
    private btnFire!: Phaser.GameObjects.Rectangle;
    private btnFireText!: Phaser.GameObjects.Text;
    private angle = 45;
    private power = 0;
    private isChargingPower = false;
    private powerInterval: ReturnType<typeof setInterval> | null = null;
    private busy = false;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private playerName = "Jogador";
    private batPatrols = new Map<
        string,
        { minX: number; maxX: number; direction: -1 | 1 }
    >();

    // [v1.5.0] BattleHud e BattleInputController — unificação de HUD/input
    private battleHud!: BattleHud;
    private battleInputController!: BattleInputController;

    constructor() {
        super({ key: "DungeonScene" });
    }

    init(data: DungeonSceneData): void {
        this.difficulty = data.difficulty ?? "easy";
        this.playerName = data.playerName?.trim() || "Jogador";
        const playerState: Partial<PlayerState> = {
            ...(data.snapshot?.playerState ?? {}),
            ...(data.loadout ?? {}),
            hp:
                data.playerHp ??
                data.playerMaxHp ??
                data.snapshot?.playerState?.hp,
            maxHp: data.playerMaxHp ?? data.snapshot?.playerState?.maxHp,
        };
        if (playerState.hp === undefined) delete playerState.hp;
        if (playerState.maxHp === undefined) delete playerState.maxHp;
        this.engine = new DungeonEngine(
            playerState,
            DUNGEON_CONTENT,
            this.difficulty,
        );
        const targetIndex =
            data.phaseIndex ?? data.snapshot?.currentPhaseIndex ?? 0;
        while (this.engine.getState().currentPhaseIndex < targetIndex) {
            this.forcePhaseAdvance();
        }
        if (data.loadout) this.engine.updatePlayerLoadout(data.loadout);
        this.state = this.engine.getState();
        this.phase = this.engine.getCurrentPhase();
    }

    preload(): void {
        preloadRuneWarsAssets(this);

        if (!this.textures.exists("terrain_dungeon_bg")) {
            this.load.image(
                "terrain_dungeon_bg",
                "assets/terrain/dungeon_bg.png",
            );
        }

        const stageAssets = DUNGEON_STAGE_ASSETS[this.phase.map];
        if (stageAssets) {
            const bgKey = mapBackgroundKey(this.phase.map);
            const terrainKey = mapTerrainKey(this.phase.map);
            if (!this.textures.exists(bgKey)) {
                this.load.image(
                    bgKey,
                    `${stageAssets.basePath}/map/background.png`,
                );
            }
            if (!this.textures.exists(terrainKey)) {
                this.load.image(
                    terrainKey,
                    `${stageAssets.basePath}/map/terrain.png`,
                );
            }

            const enemyTypes = [
                ...new Set(this.phase.enemies.map((enemy) => enemy.type)),
            ];
            for (const enemyType of enemyTypes) {
                for (let frame = 0; frame < 4; frame += 1) {
                    const key = enemyFrameKey(enemyType, frame);
                    if (!this.textures.exists(key)) {
                        this.load.image(
                            key,
                            `${stageAssets.basePath}/enemies/${enemyType}/${frame}.png`,
                        );
                    }
                }
            }
        }
    }

    create(): void {
        (window as unknown as Record<string, unknown>)["dungeonScene"] = this;
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x141725);
        const bgKey = this.textures.exists(mapBackgroundKey(this.phase.map))
            ? mapBackgroundKey(this.phase.map)
            : "terrain_dungeon_bg";
        const terrainKey = this.textures.exists(mapTerrainKey(this.phase.map))
            ? mapTerrainKey(this.phase.map)
            : "terrain_dungeon_bg";

        this.terrainEngine = this.textures.exists(mapTerrainKey(this.phase.map))
            ? TerrainEngine.fromImageData(
                  this.getTerrainImageData(mapTerrainKey(this.phase.map)),
              )
            : new TerrainEngine(MAPS[this.phase.map]?.grid ?? mapF1S1.grid);
        this.terrainRenderer = new TerrainRenderer(this, bgKey, terrainKey);
        this.enemyRenderer = new EnemyRenderer(this);

        this.placeActors();
        this.createHud();
        this.createControls();
        this.createKeyboardControls();

        // [v1.5.0] BattleHud — unified HUD entry point
        this.battleHud = new BattleHud();
        this.battleHud.create(this);

        // [v1.5.0] BattleInputController — unified keyboard input
        this.battleInputController = new BattleInputController();
        this.battleInputController.attach(this);

        // [v1.5.0] Listen to BattleInputController events
        this.events.on("consumable:use", (data: { slotIndex: number }) => {
            // Dungeon: consumíveis por slot — reservado para integração futura com ConsumableSystem
            void data;
        });
        this.events.on("modifier:use", (data: { slotIndex: number }) => {
            // Dungeon: modificadores por slot — reservado para integração futura
            void data;
        });
        this.events.on("charge:start", () => {
            if (!this.isChargingPower)
                this.startChargingPower(this.btnFire, this.btnFireText);
        });
        this.events.on("angle:left", () => this.adjustAngle(-5));
        this.events.on("angle:right", () => this.adjustAngle(5));
    }

    override update(_time: number, delta: number): void {
        this.playerRenderer?.update(delta);
        this.handleKeyboardInput(delta);

        // [v1.5.0] BattleHud update — sincroniza estado com HUD unificado
        if (this.battleHud) {
            const playerState = this.state?.playerState;
            const liveEnemies =
                this.state?.enemies?.filter((e: EnemyState) => e.alive) ?? [];
            const firstEnemy = liveEnemies[0] as EnemyState | undefined;
            const hudState: BattleHudState = {
                player: {
                    name: this.playerName,
                    hp: playerState?.hp ?? 100,
                    maxHp: playerState?.maxHp ?? 100,
                    stamina: 100,
                    maxStamina: 100,
                },
                enemy: {
                    name: firstEnemy
                        ? (firstEnemy.type ?? "Inimigo")
                        : "Nenhum",
                    hp: firstEnemy?.hp ?? 0,
                    maxHp: firstEnemy?.maxHp ?? 100,
                    stamina: 100,
                    maxStamina: 100,
                },
                wind: { x: 0, y: 0 },
                power: this.power,
                angle: this.angle,
                isCharging: this.isChargingPower,
                consumables: [],
                modifiers: [],
            };
            this.battleHud.update(hudState);
        }
    }

    private placeActors(): void {
        this.batPatrols.clear();
        const playerX = 96;
        const playerY = this.findGroundY(playerX) - 28;
        this.playerRenderer = new ModularCharacterRenderer(this, {
            race: "human",
            x: playerX,
            y: playerY,
            facing: "right",
            weaponId: this.state.playerState.weaponId,
            characterDisplaySize: 72,
            weaponDisplaySize: 34,
        });
        this.playerRenderer.setDepth(5);
        this.playerRenderer.setAimAngle(this.angle);
        this.player = this.playerRenderer.container;
        this.add
            .text(playerX, playerY + 38, this.playerName, {
                fontSize: "11px",
                color: "#ffffff",
                fontFamily: "monospace",
            })
            .setOrigin(0.5)
            .setDepth(6);
        this.cameras.main.setBounds(0, 0, MAP_WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
        this.cameras.main.setDeadzone(
            Math.min(420, this.scale.width * 0.35),
            Math.min(260, this.scale.height * 0.28),
        );

        if (this.state.protectTarget) {
            const crystalX = this.clampInitialX(MAP_WORLD_WIDTH / 2);
            const crystalY = this.findGroundY(crystalX) - 32;
            this.crystal = this.add
                .rectangle(crystalX, crystalY, 32, 54, 0x55e6ff)
                .setDepth(4);
            this.state.protectTarget = {
                ...this.state.protectTarget,
                x: crystalX,
                y: crystalY,
            };
            if (this.phase.id === "f2-s1")
                this.showNpcBubble(
                    "Vou ate a pedra mistica. Proteja-me dos morcegos.",
                );
        }

        if (this.phase.objective.type === "TRAVERSE") {
            const portalX = this.clampInitialX(MAP_WORLD_WIDTH - 140);
            const portalY = this.findGroundY(portalX) - 44;
            this.exitPortal = this.add
                .circle(portalX, portalY, 34, 0x6bd6ff, 0.36)
                .setStrokeStyle(3, 0x9ff2ff)
                .setDepth(4);
            this.add
                .text(portalX, portalY + 48, "Portal", {
                    fontSize: "11px",
                    color: "#b9f6ff",
                    fontFamily: "monospace",
                })
                .setOrigin(0.5)
                .setDepth(6);
        }

        const spawnPoints = this.getPhaseSpawnPoints();
        this.state.enemies.forEach((enemy, index) => {
            this.placeEnemy(enemy, index, spawnPoints);
            this.enemySprites.set(enemy.id, this.enemyRenderer.create(enemy));
        });
        this.state = this.engine.getState();
    }

    private placeEnemy(
        enemy: EnemyState,
        index: number,
        spawnPoints = this.getPhaseSpawnPoints(),
    ): void {
        let x: number;
        let y: number;

        if (enemy.type === "ACID_BAT") {
            // Spawn acid bats in groups of 3, one group per ceiling cavity (left, center, right)
            const batCount = Math.max(
                1,
                this.state.enemies.filter(
                    (candidate) => candidate.type === "ACID_BAT",
                ).length,
            );
            const groupIndex = Math.floor(index / 3); // Which group (0=left, 1=center, 2=right, 3+=extra)
            const posInGroup = index % 3; // Position within group (0, 1, 2)

            // Divide map into regions
            const regions = [
                { start: 200, end: 1000 }, // Left cavity
                { start: 1400, end: 2200 }, // Center cavity
                { start: 2600, end: 3400 }, // Right cavity
            ];

            const region = regions[Math.min(groupIndex, regions.length - 1)];
            x = this.clampInitialX(
                region.start +
                    (region.end - region.start) * (0.25 + posInGroup * 0.25),
            );

            // Find ceiling (top empty space) instead of ground
            y = this.findCeilingY(x);

            this.batPatrols.set(enemy.id, {
                minX: this.clampInitialX(region.start),
                maxX: this.clampInitialX(region.end),
                direction: groupIndex % 2 === 0 ? 1 : -1,
            });
        } else if (spawnPoints[index]) {
            x = this.clampInitialX(spawnPoints[index].x);
            y =
                enemy.ai === "BOSS"
                    ? this.findGroundY(x) - 62
                    : this.clampWorldY(spawnPoints[index].y);
        } else {
            const spacing =
                this.phase.objective.type === "DEFEAT_BOSS" ? 0 : 72;
            x =
                enemy.type === "GOLEM_MINOR"
                    ? this.clampInitialX(MAP_WORLD_WIDTH - 170)
                    : this.clampInitialX(
                          MAP_WORLD_WIDTH -
                              220 -
                              spacing *
                                  Math.max(
                                      0,
                                      this.state.enemies.length - index - 1,
                                  ),
                      );
            y = this.findGroundY(x) - (enemy.ai === "BOSS" ? 62 : 28);
        }

        enemy.x = x;
        enemy.y = y;
        this.engine.setEnemyPosition(enemy.id, x, y);
    }

    private getPhaseSpawnPoints(): WorldSpawnPoint[] {
        const map = MAPS[this.phase.map] as
            | {
                  meta?: {
                      cols?: number;
                      rows?: number;
                      width?: number;
                      height?: number;
                      spawnPoints?: Array<{
                          x?: number;
                          y?: number;
                          col?: number;
                          row?: number;
                      }>;
                  };
              }
            | undefined;
        const meta = map?.meta;
        const sourceWidth = meta?.width ?? meta?.cols ?? MAP_WORLD_WIDTH;
        const sourceHeight = meta?.height ?? meta?.rows ?? WORLD_HEIGHT;
        return (meta?.spawnPoints ?? [])
            .map((point) => {
                if (
                    typeof point.x === "number" &&
                    typeof point.y === "number"
                ) {
                    return {
                        x: (point.x / sourceWidth) * MAP_WORLD_WIDTH,
                        y: (point.y / sourceHeight) * WORLD_HEIGHT,
                    };
                }
                if (
                    typeof point.col === "number" &&
                    typeof point.row === "number"
                ) {
                    return {
                        x: ((point.col + 0.5) / sourceWidth) * MAP_WORLD_WIDTH,
                        y: ((point.row + 0.5) / sourceHeight) * WORLD_HEIGHT,
                    };
                }
                return null;
            })
            .filter((point): point is WorldSpawnPoint => point !== null);
    }

    private findGroundY(x: number): number {
        return (
            this.terrainEngine.getFloorBelow(x, WORLD_HEIGHT * 0.16) ??
            WORLD_HEIGHT - 90
        );
    }

    private findCeilingY(x: number): number {
        // Find the first solid terrain going down from the top (ceiling)
        for (let y = 30; y < WORLD_HEIGHT * 0.5; y += 4) {
            if (
                this.terrainEngine.getMaterialAt(x, y) !== TerrainMaterial.EMPTY
            ) {
                return Math.max(30, y - 60); // Position above the terrain
            }
        }
        return Math.max(30, WORLD_HEIGHT * 0.2); // Fallback to upper area
    }

    private clampWorldY(y: number): number {
        return Math.max(80, Math.min(y, WORLD_HEIGHT - 80));
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

    private showNpcBubble(message: string): void {
        const x = this.crystal?.x ?? this.scale.width / 2;
        const y = (this.crystal?.y ?? 180) - 58;
        const bubble = this.add
            .text(x, y, message, {
                fontSize: "12px",
                color: "#1b2428",
                fontFamily: "monospace",
                backgroundColor: "#d7fbff",
                padding: { x: 8, y: 5 },
                wordWrap: { width: 260 },
            })
            .setOrigin(0.5)
            .setDepth(30);
        this.time.delayedCall(3200, () => bubble.destroy());
    }

    private createHud(): void {
        this.infoText = this.add
            .text(14, 12, "", {
                fontSize: "13px",
                color: "#f2f2f2",
                fontFamily: "monospace",
                backgroundColor: "#00000088",
                padding: { x: 8, y: 6 },
            })
            .setDepth(20)
            .setScrollFactor(0);
        this.refreshHud();
    }

    private createControls(): void {
        const { width, height } = this.scale;
        const btnY = height - 50;
        const btnH = 44;
        const btnW = 70;

        // Angle - button
        this.button(40, btnY, "Ang -", () => this.adjustAngle(-5), btnW, btnH);
        this.angleText = this.add
            .text(120, btnY, `${this.angle}°`, {
                fontSize: "16px",
                color: "#f7d774",
                fontFamily: "monospace",
            })
            .setOrigin(0.5)
            .setDepth(21)
            .setScrollFactor(0);
        this.button(200, btnY, "Ang +", () => this.adjustAngle(5), btnW, btnH);

        // Power bar (hold-to-charge — same pattern as BattleScene)
        const barX = width / 2;
        const barY = btnY;
        this.add
            .rectangle(barX, barY, 200, 24, 0x222222)
            .setDepth(20)
            .setScrollFactor(0);
        this.powerBarFill = this.add
            .rectangle(barX - 100, barY, 0, 20, 0xff8800)
            .setOrigin(0, 0.5)
            .setDepth(21)
            .setScrollFactor(0);
        this.powerBarLabel = this.add
            .text(barX, barY - 16, "Força: 0", {
                fontSize: "12px",
                color: "#ffaa44",
                fontFamily: "monospace",
            })
            .setOrigin(0.5)
            .setDepth(21)
            .setScrollFactor(0);

        // Fire button (hold = charge, release = fire)
        const btnFireX = width - 70;
        this.btnFire = this.add
            .rectangle(btnFireX, btnY, 100, btnH, 0x884400)
            .setInteractive()
            .setDepth(20)
            .setScrollFactor(0);
        this.btnFireText = this.add
            .text(btnFireX, btnY, "ATIRAR", {
                fontSize: "15px",
                color: "#ffffff",
                fontFamily: "monospace",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(21)
            .setScrollFactor(0);

        this.btnFire.on("pointerover", () =>
            this.btnFire.setFillStyle(0xaa6600),
        );
        this.btnFire.on("pointerout", () =>
            this.btnFire.setFillStyle(0x884400),
        );
        this.btnFire.on("pointerdown", () =>
            this.startChargingPower(this.btnFire, this.btnFireText),
        );
        this.btnFire.on("pointerup", () =>
            this.releaseFire(this.btnFire, this.btnFireText),
        );
        this.btnFire.on("pointerupoutside", () =>
            this.releaseFire(this.btnFire, this.btnFireText),
        );
    }

    private createKeyboardControls(): void {
        if (!this.input.keyboard) return;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.addCapture([
            Phaser.Input.Keyboard.KeyCodes.LEFT,
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
            Phaser.Input.Keyboard.KeyCodes.UP,
            Phaser.Input.Keyboard.KeyCodes.DOWN,
            Phaser.Input.Keyboard.KeyCodes.SPACE,
        ]);

        // BattleInputController emite charge:start; a dungeon ainda precisa soltar o tiro no keyup.
        const spaceKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
        );
        spaceKey.on("up", () =>
            this.releaseFire(this.btnFire, this.btnFireText),
        );
    }

    private handleKeyboardInput(delta: number): void {
        if (!this.cursors || this.busy) return;
        const dt = delta / 1000;

        // [v1.5.0] LEFT/RIGHT e SPACE geridos pelo BattleInputController via eventos
        // Mantém LEFT/RIGHT aqui para movimento analógico contínuo (pressão mantida)
        // Os eventos 'angle:left'/'angle:right' do BIC disparam apenas no keydown (passo discreto)
        if (this.cursors.left?.isDown) this.movePlayer(-PLAYER_MOVE_SPEED * dt);
        if (this.cursors.right?.isDown) this.movePlayer(PLAYER_MOVE_SPEED * dt);
        // UP/DOWN continuam para controle analógico fino de ângulo
        if (this.cursors.up?.isDown) this.adjustAngle(ANGLE_CHANGE_SPEED * dt);
        if (this.cursors.down?.isDown)
            this.adjustAngle(-ANGLE_CHANGE_SPEED * dt);
    }

    private button(
        x: number,
        y: number,
        label: string,
        action: () => void,
        width = 72,
        height = 34,
        color = 0x2f456f,
    ): void {
        const rect = this.add
            .rectangle(x, y, width, height, color)
            .setInteractive()
            .setDepth(20)
            .setScrollFactor(0);
        this.add
            .text(x, y, label, {
                fontSize: "12px",
                color: "#ffffff",
                fontFamily: "monospace",
            })
            .setOrigin(0.5)
            .setDepth(21)
            .setScrollFactor(0);
        rect.on("pointerdown", action);
    }

    private adjustAngle(delta: number): void {
        if (this.busy) return;
        this.angle = Math.max(5, Math.min(175, this.angle + delta));
        this.angleText.setText(`${this.angle}°`);
        this.playerRenderer.setAimAngle(this.angle);
        this.playerRenderer.play("aim");
    }

    private movePlayer(deltaX: number): void {
        const result = tryHorizontalMove(
            this.player.x,
            this.player.y,
            deltaX,
            this.terrainEngine,
        );
        if (!result.canMove) return;
        this.player.setPosition(this.clampInitialX(result.newX), result.newY);
        if (
            this.phase.objective.type === "TRAVERSE" &&
            this.exitPortal &&
            Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                this.exitPortal.x,
                this.exitPortal.y,
            ) < 72
        ) {
            this.engine.completeCurrentPhase();
            this.syncFromEngine();
            this.finishIfNeeded();
        }
    }

    private clampInitialX(mapX: number): number {
        const minX = 64;
        const maxMapX = MAP_WORLD_WIDTH - 64;
        return Math.max(minX, Math.min(mapX, maxMapX));
    }

    private startChargingPower(
        btn: Phaser.GameObjects.Rectangle,
        btnText: Phaser.GameObjects.Text,
    ): void {
        if (this.busy || this.isChargingPower) return;
        this.isChargingPower = true;
        this.power = 0;
        btn.setFillStyle(0xcc8800);
        btnText.setText("...");
        this.playerRenderer.setAimAngle(this.angle);
        this.playerRenderer.play("aim");

        this.powerInterval = setInterval(() => {
            this.power = Math.min(100, this.power + 2);
            this.powerBarFill.setDisplaySize(this.power * 2, 20);
            this.powerBarLabel.setText(`Força: ${this.power}`);
        }, 30);
    }

    private releaseFire(
        btn: Phaser.GameObjects.Rectangle,
        btnText: Phaser.GameObjects.Text,
    ): void {
        if (!this.isChargingPower) return;
        this.isChargingPower = false;

        if (this.powerInterval) {
            clearInterval(this.powerInterval);
            this.powerInterval = null;
        }

        btn.setFillStyle(0x884400);
        btnText.setText("ATIRAR");

        if (this.power < 5) return; // too low, ignore

        const shotPower = this.power;
        this.power = 0;
        this.powerBarFill.setDisplaySize(0, 20);
        this.powerBarLabel.setText("Força: 0");

        this.playerTurn(shotPower);
    }

    private playerTurn(power: number): void {
        if (this.busy) return;
        const target = this.state.enemies.find((enemy) => enemy.alive);
        if (!target) return;
        this.busy = true;
        const weaponId = this.state.playerState.weaponId;
        this.playerRenderer.setWeapon(weaponId);
        this.playerRenderer.setAimAngle(this.angle);
        this.playerRenderer.play(getWeaponVisualProfile(weaponId).animation, true);
        const projectile = this.add
            .circle(this.player.x, this.player.y - 20, 6, 0xffd166)
            .setDepth(10);
        const targetSprite = this.enemySprites.get(target.id);
        this.tweens.add({
            targets: projectile,
            x: targetSprite?.x ?? target.x,
            y: (targetSprite?.y ?? target.y ?? 0) - 12,
            duration: 520,
            ease: "Quad.easeOut",
            onComplete: () => {
                projectile.destroy();
                const hitChance = Math.max(
                    0.35,
                    Math.min(
                        0.95,
                        1 - Math.abs(this.angle - 45) / 160 + power / 350,
                    ),
                );
                if (Math.random() <= hitChance) {
                    this.engine.damageEnemy(
                        target.id,
                        this.phase.objective.type === "DEFEAT_BOSS" ? 58 : 42,
                    );
                }
                this.afterPlayerTurn();
            },
        });
    }

    private afterPlayerTurn(): void {
        this.syncFromEngine();
        if (this.finishIfNeeded()) return;
        this.time.delayedCall(450, () => this.enemyTurn());
    }

    private enemyTurn(): void {
        this.turn += 1;
        const phaseResult = resolveEnemyPhase(
            this.state.enemies,
            [
                {
                    ...this.state.playerState,
                    x: this.player.x,
                    y: this.player.y,
                } as PlayerState,
            ],
            this.turn,
            this.difficulty,
            this.phase.id,
        );

        if (phaseResult.spawned.length > 0) {
            for (const spawned of phaseResult.spawned) {
                this.engine.addEnemy(spawned);
            }
            this.state = this.engine.getState();
            const spawnPoints = this.getPhaseSpawnPoints();
            const firstSpawnIndex = Math.max(
                0,
                this.state.enemies.length - phaseResult.spawned.length,
            );
            phaseResult.spawned.forEach((spawned, index) => {
                const enemy = this.state.enemies.find(
                    (candidate) => candidate.id === spawned.id,
                );
                if (!enemy) return;
                this.placeEnemy(enemy, firstSpawnIndex + index, spawnPoints);
                this.enemySprites.set(
                    enemy.id,
                    this.enemyRenderer.create(enemy),
                );
            });
            this.state = this.engine.getState();
        }

        const enemies = this.state.enemies.filter(
            (candidate) => candidate.alive,
        );
        if (enemies.length === 0) {
            this.finishEnemySequence();
            return;
        }

        let pending = enemies.length;
        const done = () => {
            pending -= 1;
            if (pending === 0) this.finishEnemySequence();
        };

        enemies.forEach((enemy, index) => {
            this.time.delayedCall(index * 140, () =>
                this.runEnemyAction(enemy, index, done),
            );
        });
    }

    private runEnemyAction(
        enemy: EnemyState,
        index: number,
        done: () => void,
    ): void {
        const current = this.engine
            .getState()
            .enemies.find((candidate) => candidate.id === enemy.id);
        if (
            !current?.alive ||
            this.engine.getState().status !== "IN_PROGRESS"
        ) {
            done();
            return;
        }

        if (current.type === "ACID_BAT") {
            const action = resolveAcidBatAction(
                current,
                [
                    {
                        ...this.state.playerState,
                        x: this.player.x,
                        y: this.player.y,
                    } as PlayerState,
                ],
                this.turn + index,
            );
            if (action.type === "MOVE") {
                this.moveAcidBat(current, action.direction);
                done();
                return;
            }
            this.acidBatSpit(current, done);
            return;
        }

        const action = this.ai.planAction(
            current,
            {
                ...this.state.playerState,
                x: this.player.x,
                y: this.player.y,
            } as PlayerState,
            this.terrainEngine,
        );
        if (typeof action.moveToX === "number") {
            const sprite = this.enemySprites.get(current.id);
            const nextX = this.clampInitialX(action.moveToX);
            const nextY =
                this.findGroundY(nextX) - (current.ai === "BOSS" ? 62 : 28);
            sprite?.setPosition(nextX, nextY);
            this.engine.setEnemyPosition(current.id, nextX, nextY);
        }
        if (current.ai === "BOSS") this.showBossPattern(current);
        this.engine.applyEnemyTurn(current);
        done();
    }

    private moveAcidBat(
        enemy: EnemyState,
        requestedDirection?: "LEFT" | "RIGHT",
    ): void {
        const sprite = this.enemySprites.get(enemy.id);
        const currentX = sprite?.x ?? enemy.x ?? MAP_WORLD_WIDTH - 240;
        const currentY = sprite?.y ?? enemy.y ?? WORLD_HEIGHT * 0.5;
        const patrol = this.batPatrols.get(enemy.id) ?? {
            minX: this.clampInitialX(currentX - 120),
            maxX: this.clampInitialX(currentX + 120),
            direction: 1 as -1 | 1,
        };
        const direction = requestedDirection
            ? requestedDirection === "RIGHT"
                ? 1
                : -1
            : patrol.direction;
        let nextX = Math.max(
            patrol.minX,
            Math.min(currentX + direction * 72, patrol.maxX),
        );
        let nextDirection: -1 | 1 = direction;
        if (nextX <= patrol.minX || nextX >= patrol.maxX) {
            nextDirection = direction === 1 ? -1 : 1;
            nextX = Math.max(
                patrol.minX,
                Math.min(currentX + nextDirection * 72, patrol.maxX),
            );
        }
        patrol.direction = nextDirection;
        this.batPatrols.set(enemy.id, patrol);
        sprite?.setPosition(nextX, currentY);
        this.engine.setEnemyPosition(enemy.id, nextX, currentY);
    }

    private acidBatSpit(enemy: EnemyState, done: () => void): void {
        const sprite = this.enemySprites.get(enemy.id);
        const startX = sprite?.x ?? enemy.x ?? MAP_WORLD_WIDTH - 240;
        const startY = (sprite?.y ?? enemy.y ?? WORLD_HEIGHT * 0.5) - 6;
        const projectile = this.add
            .circle(startX, startY, 7, 0x9be85b, 0.95)
            .setStrokeStyle(2, 0x305c1c)
            .setDepth(11);
        const targetX = this.player.x;
        const targetY = this.player.y - 14;
        this.tweens.add({
            targets: projectile,
            x: targetX,
            y: targetY,
            duration: 420,
            ease: "Quad.easeIn",
            onComplete: () => {
                projectile.destroy();
                this.engine.damagePlayer(this.acidBatDamage());
                this.syncFromEngine();
                done();
            },
        });
    }

    private acidBatDamage(): number {
        switch (this.difficulty) {
            case "medium":
                return 7;
            case "hard":
                return 11;
            case "heroic":
                return 18;
            default:
                return 4;
        }
    }

    private finishEnemySequence(): void {
        if (this.phase.objective.type === "PROTECT")
            this.engine.recordProtectedTurn();
        this.syncFromEngine();
        if (!this.finishIfNeeded()) this.busy = false;
    }

    private showBossPattern(enemy: EnemyState): void {
        if (enemy.type === "GOLEM_MINOR") {
            const message = this.golem.applyPhaseAction(
                this.terrainEngine,
                this.player.x,
                this.player.y,
                enemy.hp,
                enemy.maxHp,
            );
            this.infoText.setText(`${this.phase.name}\n${message}`);
            return;
        }
        if (enemy.type !== "GIANT_BAT_BOSS" && enemy.type !== "TREANT_BOSS")
            return;
        const plan = bossPhasePlan(enemy.type, this.difficulty);
        const phaseIndex = Math.min(
            plan.length - 1,
            Math.floor((1 - enemy.hp / Math.max(1, enemy.maxHp)) * plan.length),
        );
        this.infoText.setText(`${this.phase.name}\nBoss: ${plan[phaseIndex]}`);
    }

    private syncFromEngine(): void {
        this.state = this.engine.getState();
        this.state.enemies.forEach((enemy) => {
            const sprite = this.enemySprites.get(enemy.id);
            if (sprite) {
                if (
                    typeof enemy.x === "number" &&
                    typeof enemy.y === "number"
                ) {
                    sprite.setPosition(enemy.x, enemy.y);
                }
                this.enemyRenderer.update(sprite, enemy);
            }
            if (!enemy.alive) this.batPatrols.delete(enemy.id);
        });
        if (this.crystal && this.state.protectTarget) {
            this.crystal.setFillStyle(
                this.state.protectTarget.hp <= 35 ? 0xff5f6d : 0x55e6ff,
            );
        }
        this.refreshHud();
    }

    private refreshHud(): void {
        if (!this.infoText) return;
        const liveEnemies = this.state.enemies.filter(
            (enemy) => enemy.alive,
        ).length;
        const objective = this.getObjectiveText(liveEnemies);
        this.infoText.setText(
            `${this.phase.name}\n${objective}\nVidas: ${this.state.lives} | HP: ${this.state.playerState.hp}/${this.state.playerState.maxHp}`,
        );
    }

    private getObjectiveText(liveEnemies: number): string {
        if (this.phase.objective.type === "TRAVERSE")
            return "Alcance o portal no fim da caverna";
        if (this.phase.objective.type === "PROTECT") {
            const targetName =
                this.phase.objective.targetId === "MYSTIC_BEETLE_NPC"
                    ? "Besouro"
                    : "Cristal";
            return `${targetName} ${this.state.protectTarget?.hp ?? 0}/${this.state.protectTarget?.maxHp ?? 0} | Turnos ${this.state.protectedTurns}/${this.phase.objective.turns}`;
        }
        if (
            this.phase.objective.type === "DEFEAT_ALL" &&
            this.phase.objective.count
        ) {
            return `Derrote ${this.phase.objective.count} | Restam: ${liveEnemies}`;
        }
        if (this.phase.objective.type === "DEFEAT_BOSS")
            return `Boss vivo: ${liveEnemies > 0 ? "sim" : "nao"}`;
        return `Inimigos vivos: ${liveEnemies}`;
    }

    private finishIfNeeded(): boolean {
        if (
            this.state.status === "PHASE_COMPLETE" ||
            this.state.status === "FAILED"
        ) {
            this.busy = true;
            this.time.delayedCall(700, () => {
                const detail = {
                    state: this.engine.getState(),
                    phase: this.phase,
                };
                window.dispatchEvent(
                    new CustomEvent("dungeon:stage-finished", { detail }),
                );
                window.dispatchEvent(
                    new CustomEvent("rune-wars:dungeon-phase-finished", {
                        detail,
                    }),
                );
            });
            return true;
        }
        return false;
    }

    private forcePhaseAdvance(): void {
        const phase = this.engine.getCurrentPhase();
        if (phase.objective.type === "PROTECT") {
            for (let i = 0; i < (phase.objective.turns ?? 0); i++)
                this.engine.recordProtectedTurn();
        } else if (
            phase.objective.type === "TRAVERSE" ||
            phase.objective.type === "SURVIVE"
        ) {
            this.engine.completeCurrentPhase();
        } else {
            this.engine
                .getState()
                .enemies.forEach((enemy) =>
                    this.engine.damageEnemy(enemy.id, enemy.maxHp),
                );
        }
        this.engine.advancePhase();
    }
}
