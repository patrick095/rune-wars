import Phaser from "phaser";
import { WindSystem } from "../../app/shared/game-core/wind-system";
import { ProjectilePhysics } from "../../app/shared/game-core/projectile-physics";
import { WeaponSystem } from "../../app/shared/game-core/weapon-system";
import { WeaponDefinition } from "../../app/shared/game-core/weapon-definition";
import { ProjectileConfig } from "../../app/shared/game-core/projectile-config";
import { AiLocal } from "../../app/shared/game-core/ai-local";
import { TrajectoryIndicator } from "../ui/trajectory-indicator";
import { TutorialVisual } from "../tutorial/tutorial-visual";
import {
    AcademyTarget,
    FIXED_TARGETS,
    MOVING_TARGETS,
} from "../targets/academy-targets";
// [v1.5.0] novos componentes integrados
import { BattleHud, BattleHudState } from "../hud/battle-hud";
import { BattleInputController } from "../input/battle-input-controller";
// [v1.8.0] AcademyConfig
import { AcademyConfig } from "../../app/academy/academy-config";
import { preloadRuneWarsAssets } from "../assets/rune-wars-assets";
import { ModularCharacterRenderer } from "../character/modular-character-renderer";
import { getWeaponVisualProfile } from "../character/weapon-visual-profile";

type AcademyMode =
    | "free"
    | "fixed-targets"
    | "moving-targets"
    | "runic-training";

/** Map IDs to background color palettes */
const MAP_BG_COLORS: Record<
    string,
    { sky: number; ground: number; groundLine: number }
> = {
    "map-plains": { sky: 0x1a2e1a, ground: 0x225522, groundLine: 0x44aa44 },
    "map-runic-forest": {
        sky: 0x0d1a0d,
        ground: 0x1a4422,
        groundLine: 0x33cc55,
    },
    "map-arcane-ruins": {
        sky: 0x1a0d2e,
        ground: 0x33225a,
        groundLine: 0x8844ff,
    },
    "map-mystic-castle": {
        sky: 0x0d0d2e,
        ground: 0x222244,
        groundLine: 0x4488ff,
    },
    "map-deep-mines": { sky: 0x1a1008, ground: 0x3a2a10, groundLine: 0xcc9933 },
    "dungeon-cave-entrance": {
        sky: 0x0a0a14,
        ground: 0x222233,
        groundLine: 0x556688,
    },
    "dungeon-cave-hall": {
        sky: 0x080810,
        ground: 0x1a1a2a,
        groundLine: 0x445566,
    },
    "dungeon-cave-boss": {
        sky: 0x140808,
        ground: 0x2a1a1a,
        groundLine: 0xcc4444,
    },
};

const DEFAULT_BG = { sky: 0x0d0d2e, ground: 0x225522, groundLine: 0x44aa44 };

const WEAPON_COLORS: Record<string, number> = {
    cannon: 0xffaa00,
    longbow: 0x00ff88,
    tnt: 0xff4400,
    boomerang: 0xff88ff,
    "ice-book": 0x88ccff,
    potion: 0x00ffcc,
    "magic-grenade": 0xff44ff,
};

interface LiveTarget {
    sprite: Phaser.GameObjects.Rectangle;
    data: AcademyTarget;
    originX: number;
    moveDir: number;
    alive: boolean;
    hp: number;
    maxHp: number;
}

/** Data exposed to Angular overlay via window['academyScene'] */
export interface AcademySceneStats {
    hitCount: number;
    totalDamage: number;
}

export class AcademyScene extends Phaser.Scene {
    private windSystem = new WindSystem();
    private projectilePhysics = new ProjectilePhysics();
    private weaponSystem = new WeaponSystem();
    private aiLocal = new AiLocal();
    private trajectory = new TrajectoryIndicator();
    private tutorial!: TutorialVisual;

    private currentWeapon!: WeaponDefinition;
    private currentMode: AcademyMode = "free";

    // [v1.8.0] AcademyConfig (passed via window['academyConfig'])
    private academyConfig: AcademyConfig | null = null;
    private cpuDifficulty: "easy" | "normal" | "hard" = "normal";

    // Player position
    private playerX = 80;
    private playerY = 0;
    private playerSprite!: ModularCharacterRenderer;

    // Dummy player (dummy_player target type)
    private dummyPlayerSprite: ModularCharacterRenderer | null = null;
    private dummyPlayerX = 0;
    private dummyPlayerY = 0;
    private dummyFireCooldown = 0; // seconds until next AI shot
    private dummyProjectileArc: Phaser.GameObjects.Arc | null = null;
    private dummyIsAnimating = false;

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

    // [v1.5.0] BattleHud e BattleInputController
    private battleHud!: BattleHud;
    private battleInputController!: BattleInputController;

    // Targets
    private liveTargets: LiveTarget[] = [];

    // [v1.8.0] Stats — exposed to Angular overlay
    hitCount = 0;
    totalDamage = 0;
    private hitCountText!: Phaser.GameObjects.Text;
    private totalDamageText!: Phaser.GameObjects.Text;

    // Wind indicator
    private windText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: "AcademyScene" });
    }

    preload(): void {
        preloadRuneWarsAssets(this);
    }

    create(): void {
        // Expose for Angular polling
        (window as unknown as Record<string, unknown>)["academyScene"] = this; // eslint-disable-line

        // [v1.8.0] Read config passed from Angular component
        this.academyConfig =
            ((window as unknown as Record<string, unknown>)[
                "academyConfig"
            ] as AcademyConfig | null) ?? null;

        // Apply config
        if (this.academyConfig) {
            this.currentMode = this._targetTypeToMode(
                this.academyConfig.targetType,
            );
            this.cpuDifficulty = this.academyConfig.difficulty ?? "normal";
            const weapon = this.weaponSystem.getById(
                this.academyConfig.weaponId,
            );
            this.currentWeapon = weapon ?? this.weaponSystem.getDefault();
        } else {
            this.currentWeapon = this.weaponSystem.getDefault();
        }

        const { width, height } = this.scale;
        const bg = MAP_BG_COLORS[this.academyConfig?.mapId ?? ""] ?? DEFAULT_BG;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, bg.sky);
        this.add
            .rectangle(width / 2, height * 0.35, width, height * 0.7, 0x0d0d2e)
            .setAlpha(0.4);

        // Ground
        const groundY = height * 0.75;
        this.add.rectangle(
            width / 2,
            groundY + (height - groundY) / 2,
            width,
            height - groundY,
            bg.ground,
        );
        this.add.rectangle(width / 2, groundY, width, 4, bg.groundLine);

        // Player
        this.playerY = height * 0.65;
        this.playerSprite = new ModularCharacterRenderer(this, {
            race: "human",
            x: this.playerX,
            y: this.playerY,
            facing: "right",
            weaponId: this.currentWeapon.id,
            characterDisplaySize: 72,
            weaponDisplaySize: 34,
        });
        this.playerSprite.setDepth(2);
        this.playerSprite.setAimAngle(this.currentAngle);
        this.add
            .text(this.playerX, this.playerY + 38, "Você", {
                fontSize: "11px",
                color: "#ffffff",
                fontFamily: "monospace",
            })
            .setOrigin(0.5)
            .setDepth(3);

        // [v1.8.0] Dummy player position (right side) for dummy_player mode
        this.dummyPlayerX = width - 80;
        this.dummyPlayerY = this.playerY;

        // Projectile dot
        this.projectileArc = this.add
            .arc(0, 0, 6, 0, 360, false, 0xffff00)
            .setVisible(false)
            .setDepth(10);

        // Dummy projectile dot
        this.dummyProjectileArc = this.add
            .arc(0, 0, 5, 0, 360, false, 0xff4444)
            .setVisible(false)
            .setDepth(10);

        // HUD: hit counter + total damage — top-right
        this.hitCountText = this.add
            .text(width - 12, 12, "Acertos: 0", {
                fontSize: "16px",
                color: "#ffdd44",
                fontFamily: "monospace",
                fontStyle: "bold",
            })
            .setOrigin(1, 0)
            .setDepth(20);

        this.totalDamageText = this.add
            .text(width - 12, 36, "Dano Total: 0", {
                fontSize: "14px",
                color: "#ff8844",
                fontFamily: "monospace",
            })
            .setOrigin(1, 0)
            .setDepth(20);

        // Wind indicator top-left
        this.windText = this.add
            .text(12, 12, "", {
                fontSize: "14px",
                color: "#88ccff",
                fontFamily: "monospace",
            })
            .setOrigin(0, 0)
            .setDepth(20);
        this.updateWindText();

        // Controls
        this.createControls();
        this.createKeyboardControls();

        // [v1.5.0] BattleHud
        this.battleHud = new BattleHud();
        this.battleHud.create(this);

        // [v1.5.0] BattleInputController
        this.battleInputController = new BattleInputController();
        this.battleInputController.attach(this);

        this.events.on("consumable:use", (data: { slotIndex: number }) => {
            void data;
        });
        this.events.on("modifier:use", (data: { slotIndex: number }) => {
            void data;
        });
        this.events.on("charge:start", () => {
            if (!this.isChargingPower)
                this.startChargingPower(this.btnFire, this.btnFireText);
        });
        this.events.on("angle:left", () => this.adjustAngle(-5));
        this.events.on("angle:right", () => this.adjustAngle(5));

        // Tutorial on first access
        this.tutorial = new TutorialVisual(this);
        if (!TutorialVisual.hasBeenSeen()) {
            this.tutorial.show();
        }

        // Spawn targets
        this.spawnTargets();

        this.scale.on("resize", this.onResize, this);
    }

    private _targetTypeToMode(
        targetType: "fixed" | "mobile" | "dummy_player",
    ): AcademyMode {
        switch (targetType) {
            case "fixed":
                return "fixed-targets";
            case "mobile":
                return "moving-targets";
            case "dummy_player":
                return "fixed-targets"; // targets replaced by dummy_player logic
        }
    }

    override update(_time: number, delta: number): void {
        const dt = delta / 1000;
        this.playerSprite?.update(delta);
        this.dummyPlayerSprite?.update(delta);

        if (!this.isAnimating) {
            this.handleKeyboardInput(dt);
        }

        // [v1.5.0] BattleHud update
        if (this.battleHud) {
            const wind = this.windSystem.getCurrent();
            const hudState: BattleHudState = {
                player: {
                    name: "Jogador",
                    hp: 100,
                    maxHp: 100,
                    stamina: 100,
                    maxStamina: 100,
                },
                enemy: {
                    name: "Alvo",
                    hp: 100,
                    maxHp: 100,
                    stamina: 100,
                    maxStamina: 100,
                },
                wind: { x: wind.direction * wind.intensity, y: 0 },
                power: this.powerValue,
                angle: this.currentAngle,
                isCharging: this.isChargingPower,
                consumables: [],
                modifiers: [],
            };
            this.battleHud.update(hudState);
        }

        // Move mobile targets
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

        // [v1.8.0] Dummy player AI shoots back periodically
        if (
            this.academyConfig?.targetType === "dummy_player" &&
            this.dummyPlayerSprite
        ) {
            this.dummyFireCooldown -= dt;
            if (
                this.dummyFireCooldown <= 0 &&
                !this.dummyIsAnimating &&
                !this.isAnimating
            ) {
                this.dummyFireCooldown = 3 + Math.random() * 3; // 3–6 s between shots
                this.fireDummyShot();
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

        const btnMinus = this.add
            .rectangle(40, btnY, btnW, btnH, 0x335588)
            .setInteractive()
            .setDepth(15);
        this.add
            .text(40, btnY, "Ang -", {
                fontSize: "13px",
                color: "#ffffff",
                fontFamily: "monospace",
            })
            .setOrigin(0.5)
            .setDepth(16);

        this.angleText = this.add
            .text(120, btnY, `${this.currentAngle}°`, {
                fontSize: "16px",
                color: "#ffdd44",
                fontFamily: "monospace",
            })
            .setOrigin(0.5)
            .setDepth(16);

        const btnPlus = this.add
            .rectangle(200, btnY, btnW, btnH, 0x335588)
            .setInteractive()
            .setDepth(15);
        this.add
            .text(200, btnY, "Ang +", {
                fontSize: "13px",
                color: "#ffffff",
                fontFamily: "monospace",
            })
            .setOrigin(0.5)
            .setDepth(16);

        const barX = width / 2;
        const barY = height - 50;
        this.add.rectangle(barX, barY, 200, 24, 0x222222).setDepth(15);
        this.powerBarFill = this.add
            .rectangle(barX - 100, barY, 0, 20, 0xff8800)
            .setOrigin(0, 0.5)
            .setDepth(16);
        this.powerBarLabel = this.add
            .text(barX, barY - 16, "Força: 0", {
                fontSize: "12px",
                color: "#ffaa44",
                fontFamily: "monospace",
            })
            .setOrigin(0.5)
            .setDepth(16);

        const btnFireX = width - 70;
        this.btnFire = this.add
            .rectangle(btnFireX, btnY, 100, btnH, 0x884400)
            .setInteractive()
            .setDepth(15);
        this.btnFireText = this.add
            .text(btnFireX, btnY, "ATIRAR", {
                fontSize: "15px",
                color: "#ffffff",
                fontFamily: "monospace",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(16);

        btnMinus.on("pointerdown", () => this.adjustAngle(-5));
        btnPlus.on("pointerdown", () => this.adjustAngle(5));

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

        const spaceKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
        );
        spaceKey.on("up", () =>
            this.releaseFire(this.btnFire, this.btnFireText),
        );
    }

    private handleKeyboardInput(dt: number): void {
        if (!this.cursors || this.isAnimating) return;

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
        this.currentAngle = Math.max(
            5,
            Math.min(175, this.currentAngle + delta),
        );
        this.angleText.setText(`${this.currentAngle}°`);
        this.playerSprite.setAimAngle(this.currentAngle);
        this.playerSprite.play("aim");
        this.updateTrajectoryPreview();
    }

    private startChargingPower(
        btn: Phaser.GameObjects.Rectangle,
        btnText: Phaser.GameObjects.Text,
    ): void {
        if (this.isAnimating || this.isChargingPower) return;

        this.isChargingPower = true;
        this.powerValue = 0;
        btn.setFillStyle(0xcc8800);
        btnText.setText("...");
        this.playerSprite.setAimAngle(this.currentAngle);
        this.playerSprite.play("aim");

        this.powerInterval = setInterval(() => {
            this.powerValue = Math.min(100, this.powerValue + 2);
            this.powerBarFill.setDisplaySize(this.powerValue * 2, 20);
            this.powerBarLabel.setText(`Força: ${this.powerValue}`);
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

        if (this.powerValue < 5) return;

        this.fireShot(this.currentAngle, this.powerValue);
        this.powerValue = 0;
        this.powerBarFill.setDisplaySize(0, 20);
        this.powerBarLabel.setText("Força: 0");
    }

    // ──────────────────────────────────────────────────────────
    // Shooting — player
    // ──────────────────────────────────────────────────────────

    private fireShot(angle: number, force: number): void {
        this.trajectory.clear();
        this.playerSprite.setWeapon(this.currentWeapon.id);
        this.playerSprite.setAimAngle(angle);
        this.playerSprite.play(
            getWeaponVisualProfile(this.currentWeapon.id).animation,
            true,
        );

        const profile = this.currentWeapon.physicsProfile;
        const config: ProjectileConfig = {
            angle,
            force,
            gravityScale: profile.gravityScale,
            windInfluence: profile.windInfluence,
            baseDamage: this.currentWeapon.baseDamage,
        };

        const wind = this.windSystem.getCurrent();
        const path = this.projectilePhysics.simulate(
            this.playerX,
            this.playerY,
            config,
            wind,
            this.currentWeapon.physicsProfile,
        );
        this.animateProjectile(path, false);
    }

    // ──────────────────────────────────────────────────────────
    // Shooting — dummy AI fires back (dummy_player mode)
    // ──────────────────────────────────────────────────────────

    private fireDummyShot(): void {
        if (!this.dummyPlayerSprite) return;

        const wind = this.windSystem.getCurrent();
        const shot = this.aiLocal.calculateShot(
            { x: this.dummyPlayerX, y: this.dummyPlayerY },
            { x: this.playerX, y: this.playerY },
            wind,
            this.cpuDifficulty,
        );

        // Dummy fires with same weapon profile but angle mirrored (facing left)
        const profile = this.currentWeapon.physicsProfile;
        this.dummyPlayerSprite.setWeapon(this.currentWeapon.id);
        this.dummyPlayerSprite.setAimAngle(shot.angle);
        this.dummyPlayerSprite.play(
            getWeaponVisualProfile(this.currentWeapon.id).animation,
            true,
        );
        const config: ProjectileConfig = {
            angle: 180 - shot.angle, // mirror for left-facing direction
            force: shot.force,
            gravityScale: profile.gravityScale,
            windInfluence: profile.windInfluence,
            baseDamage: this.currentWeapon.baseDamage,
        };

        const path = this.projectilePhysics.simulate(
            this.dummyPlayerX,
            this.dummyPlayerY,
            config,
            wind,
            this.currentWeapon.physicsProfile,
        );
        this.animateProjectile(path, true);
    }

    private animateProjectile(
        path: Array<{ x: number; y: number }>,
        isDummy: boolean,
    ): void {
        if (path.length === 0) return;

        if (isDummy) {
            this.dummyIsAnimating = true;
        } else {
            this.isAnimating = true;
        }

        const arc = isDummy ? this.dummyProjectileArc! : this.projectileArc;
        const color = isDummy
            ? 0xff4444
            : (WEAPON_COLORS[this.currentWeapon.id] ?? 0xffff00);
        arc.setFillStyle(color).setVisible(true);

        const { height } = this.scale;
        const groundY = height * 0.75;

        let stopIndex = path.length - 1;
        for (let i = 0; i < path.length; i++) {
            if (
                path[i].y >= groundY ||
                path[i].x > this.scale.width + 100 ||
                path[i].x < -100
            ) {
                stopIndex = i;
                break;
            }
        }

        const clippedPath = path.slice(0, stopIndex + 1);

        let frameIndex = 0;
        const step = () => {
            if (frameIndex >= clippedPath.length) {
                arc.setVisible(false);
                if (isDummy) {
                    this.dummyIsAnimating = false;
                } else {
                    this.isAnimating = false;
                    this.windSystem.generate();
                    this.updateWindText();
                    this.updateTrajectoryPreview();
                }
                return;
            }

            const point = clippedPath[frameIndex];
            arc.setPosition(point.x, point.y);

            if (isDummy) {
                // Dummy projectile hits player — only visual, no real damage
                const dpx = Math.abs(point.x - this.playerX);
                const dpy = Math.abs(point.y - this.playerY);
                if (dpx < 25 && dpy < 40) {
                    arc.setVisible(false);
                    this.dummyIsAnimating = false;
                    this.showDummyHit();
                    return;
                }
            } else {
                // Player projectile checks target hits
                const hit = this.checkTargetHit(point.x, point.y);
                if (hit !== null) {
                    arc.setVisible(false);
                    this.isAnimating = false;
                    this.applyDamageToTarget(hit);
                    this.windSystem.generate();
                    this.updateWindText();
                    this.updateTrajectoryPreview();
                    return;
                }

                // [v1.8.0] Check dummy player hit
                if (this.dummyPlayerSprite) {
                    const ddx = Math.abs(point.x - this.dummyPlayerX);
                    const ddy = Math.abs(point.y - this.dummyPlayerY);
                    if (ddx < 25 && ddy < 40) {
                        arc.setVisible(false);
                        this.isAnimating = false;
                        this.onDummyPlayerHit();
                        this.windSystem.generate();
                        this.updateWindText();
                        this.updateTrajectoryPreview();
                        return;
                    }
                }
            }

            frameIndex += 2;
            this.time.delayedCall(16, step);
        };

        step();
    }

    private showDummyHit(): void {
        // Visual flash on player — no real HP loss
        this.playerSprite.play("hit", true);
        this.playerSprite.setAlpha(0.45);
        this.time.delayedCall(200, () => {
            if (this.playerSprite.container.active) this.playerSprite.setAlpha(1);
        });
        const floatText = this.add
            .text(this.playerX, this.playerY - 30, "ESQUIVA!", {
                fontSize: "16px",
                color: "#ff4444",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(25);
        this.tweens.add({
            targets: floatText,
            y: this.playerY - 70,
            alpha: 0,
            duration: 800,
            onComplete: () => floatText.destroy(),
        });
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

    private applyDamageToTarget(target: LiveTarget): void {
        const dmg = this.currentWeapon.baseDamage;
        target.hp -= dmg;
        this.totalDamage += dmg;
        this.totalDamageText.setText(`Dano Total: ${this.totalDamage}`);

        // Show damage float
        const floatText = this.add
            .text(target.sprite.x, target.sprite.y - 30, `-${dmg}`, {
                fontSize: "20px",
                color: "#ff4444",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(25);
        this.tweens.add({
            targets: floatText,
            y: target.sprite.y - 70,
            alpha: 0,
            duration: 700,
            onComplete: () => floatText.destroy(),
        });

        // Flash hit
        const origColor = target.data.moving ? 0xffdd00 : 0xff8800;
        target.sprite.setFillStyle(0xffffff);
        this.time.delayedCall(120, () => {
            if (target.sprite.active && target.alive)
                target.sprite.setFillStyle(origColor);
        });

        if (target.hp <= 0) {
            this.destroyTarget(target);
        }
    }

    private destroyTarget(target: LiveTarget): void {
        target.alive = false;
        this.hitCount++;
        this.hitCountText.setText(`Acertos: ${this.hitCount}`);

        this.tweens.add({
            targets: target.sprite,
            alpha: 0,
            scaleY: 0,
            duration: 300,
            ease: "Power2",
            onComplete: () => {
                target.sprite.destroy();
                // Respawn after 1.5s
                this.time.delayedCall(1500, () => this.respawnTarget(target));
            },
        });

        this.add
            .text(target.sprite.x, target.sprite.y - 30, "KO!", {
                fontSize: "22px",
                color: "#ffff44",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(25);
    }

    private respawnTarget(target: LiveTarget): void {
        const { height } = this.scale;
        const groundY = height * 0.75;
        const origY =
            groundY - target.data.height / 2 - (300 - target.data.y) * 0.3;

        target.hp = target.maxHp;
        const color = target.data.moving ? 0xffdd00 : 0xff8800;
        const newSprite = this.add
            .rectangle(
                target.originX,
                origY,
                target.data.width,
                target.data.height,
                color,
            )
            .setDepth(3)
            .setAlpha(0);
        target.sprite = newSprite;
        target.alive = true;

        this.tweens.add({
            targets: newSprite,
            alpha: 1,
            duration: 400,
            ease: "Power1",
        });
    }

    // [v1.8.0] Hit on dummy player — counts as a hit
    private onDummyPlayerHit(): void {
        this.hitCount++;
        this.hitCountText.setText(`Acertos: ${this.hitCount}`);

        const dmg = this.currentWeapon.baseDamage;
        this.totalDamage += dmg;
        this.totalDamageText.setText(`Dano Total: ${this.totalDamage}`);

        if (!this.dummyPlayerSprite) return;

        // Flash dummy
        this.dummyPlayerSprite.play("hit", true);
        this.dummyPlayerSprite.setAlpha(0.45);
        this.time.delayedCall(150, () => {
            if (this.dummyPlayerSprite?.container.active)
                this.dummyPlayerSprite.setAlpha(1);
        });

        const floatText = this.add
            .text(this.dummyPlayerX, this.dummyPlayerY - 30, `-${dmg}`, {
                fontSize: "20px",
                color: "#ff4444",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(25);
        this.tweens.add({
            targets: floatText,
            y: this.dummyPlayerY - 70,
            alpha: 0,
            duration: 700,
            onComplete: () => floatText.destroy(),
        });
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
        const points = this.projectilePhysics.simulate(
            this.playerX,
            this.playerY,
            config,
            wind,
            this.currentWeapon.physicsProfile,
        );
        this.trajectory.draw(this, points);
    }

    // ──────────────────────────────────────────────────────────
    // Target management
    // ──────────────────────────────────────────────────────────

    private spawnTargets(): void {
        for (const t of this.liveTargets) {
            if (t.sprite && t.sprite.active) t.sprite.destroy();
        }
        this.liveTargets = [];

        // Remove previous dummy player if any
        if (this.dummyPlayerSprite) {
            this.dummyPlayerSprite.destroy();
            this.dummyPlayerSprite = null;
        }

        const { height } = this.scale;
        const groundY = height * 0.75;

        const targetType = this.academyConfig?.targetType ?? "fixed";

        if (targetType === "dummy_player") {
            // Single dummy player sprite on the right
            this.dummyPlayerY = height * 0.65;
            this.dummyPlayerSprite = new ModularCharacterRenderer(this, {
                race: "human",
                x: this.dummyPlayerX,
                y: this.dummyPlayerY,
                facing: "left",
                weaponId: this.currentWeapon.id,
                characterDisplaySize: 72,
                weaponDisplaySize: 34,
            });
            this.dummyPlayerSprite.setDepth(2);
            this.dummyPlayerSprite.setAimAngle(45);
            this.add
                .text(this.dummyPlayerX, this.dummyPlayerY + 38, "Inimigo", {
                    fontSize: "11px",
                    color: "#ffffff",
                    fontFamily: "monospace",
                })
                .setOrigin(0.5)
                .setDepth(3);
            this.dummyFireCooldown = 2; // first shot after 2s
        } else if (targetType === "fixed") {
            for (const def of FIXED_TARGETS) {
                const targetY = groundY - def.height / 2 - (300 - def.y) * 0.3;
                const sprite = this.add
                    .rectangle(def.x, targetY, def.width, def.height, 0xff8800)
                    .setDepth(3);
                this.liveTargets.push({
                    sprite,
                    data: def,
                    originX: def.x,
                    moveDir: 1,
                    alive: true,
                    hp: 100,
                    maxHp: 100,
                });
            }
        } else if (targetType === "mobile") {
            for (const def of MOVING_TARGETS) {
                const targetY = groundY - def.height / 2 - (280 - def.y) * 0.3;
                const sprite = this.add
                    .rectangle(def.x, targetY, def.width, def.height, 0xffdd00)
                    .setDepth(3);
                this.liveTargets.push({
                    sprite,
                    data: def,
                    originX: def.x,
                    moveDir: 1,
                    alive: true,
                    hp: 100,
                    maxHp: 100,
                });
            }
        }

        this.updateTrajectoryPreview();
    }

    // ──────────────────────────────────────────────────────────
    // Wind indicator
    // ──────────────────────────────────────────────────────────

    private updateWindText(): void {
        const wind = this.windSystem.getCurrent();
        const dirLabel = wind.direction >= 0 ? "→" : "←";
        this.windText.setText(
            `Vento: ${dirLabel} ${Math.round(Math.abs(wind.direction * wind.intensity))} u/s`,
        );
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
        this.playerSprite.setWeapon(id);
        this.playerSprite.setAimAngle(this.currentAngle);
        this.playerSprite.play("aim");
        if (this.dummyPlayerSprite) {
            this.dummyPlayerSprite.setWeapon(id);
            this.dummyPlayerSprite.setAimAngle(45);
            this.dummyPlayerSprite.play("aim");
        }
        this.updateTrajectoryPreview();
    }

    resetTargets(): void {
        this.hitCount = 0;
        this.totalDamage = 0;
        if (this.hitCountText) this.hitCountText.setText("Acertos: 0");
        if (this.totalDamageText) this.totalDamageText.setText("Dano Total: 0");
        this.spawnTargets();
    }

    // ──────────────────────────────────────────────────────────
    // Resize handler
    // ──────────────────────────────────────────────────────────

    private onResize(): void {
        this.updateWindText();
    }
}
