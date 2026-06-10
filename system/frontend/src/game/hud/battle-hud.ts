import Phaser from "phaser";
import { TurnTimer } from "./turn-timer";
import { WindDisplay } from "./wind-display";
import { PlayerStatusBar } from "./player-status-bar";
import { ConsumableDock } from "./consumable-dock";
import { ModifierDock } from "./modifier-dock";
import { PowerBar } from "./power-bar";
import type { HudPlayerCard } from "./player-status-bar";

export interface BattleHudState {
    player: {
        hp: number;
        maxHp: number;
        stamina: number;
        maxStamina: number;
        name: string;
    };
    enemy: {
        hp: number;
        maxHp: number;
        stamina: number;
        maxStamina: number;
        name: string;
    };
    teams?: {
        left: HudPlayerCard[];
        right: HudPlayerCard[];
    };
    roomName?: string;
    mapName?: string;
    mode?: string;
    turnNumber?: number;
    wind: { x: number; y: number };
    power: number;
    angle: number;
    facing?: "left" | "right";
    angleLimits?: { minAngle: number; maxAngle: number };
    isPlayerTurn?: boolean;
    isCharging: boolean;
    consumables: Array<{ iconKey: string; quantity?: number } | null>;
    modifiers: Array<{
        iconKey?: string;
        label?: string;
        active?: boolean;
    } | null>;
}

/**
 * BattleHud — unified HUD entry point.
 *
 * Layout:
 * ┌──────────────────────────────────────────────┐
 * │ [PLAYER BAR]    [TIMER+WIND]    [ENEMY BAR]  │  ← Topo
 * ├──────────────────────────────────────────────┤
 * │              [CANVAS DO JOGO]                │
 * ├──────────────────────────────────────────────┤
 * │ [CONSUMÍVEIS]  [ÂNGULO+FORÇA+ATIRAR]  [MOD]  │  ← Base
 * └──────────────────────────────────────────────┘
 *
 * Usage:
 *   const hud = new BattleHud();
 *   hud.create(scene);
 *   // in update loop:
 *   hud.update(state);
 *   // on shutdown:
 *   hud.destroy();
 */
export class BattleHud {
    // ── Top row ────────────────────────────────────────────────────────────────
    private turnTimer!: TurnTimer;
    private windDisplay!: WindDisplay;
    private playerBar!: PlayerStatusBar;
    private enemyBar!: PlayerStatusBar;

    // ── Bottom row ─────────────────────────────────────────────────────────────
    private consumableDock!: ConsumableDock;
    private modifierDock!: ModifierDock;
    private powerBar!: PowerBar;
    private headerContainer!: Phaser.GameObjects.Container;
    private headerBg!: Phaser.GameObjects.Graphics;
    private titleText!: Phaser.GameObjects.Text;
    private blueText!: Phaser.GameObjects.Text;
    private redText!: Phaser.GameObjects.Text;
    private blueIcon!: Phaser.GameObjects.Text;
    private redIcon!: Phaser.GameObjects.Text;
    private lastTurnNumber = 0;

    // ── Scene reference (stored for resize listener cleanup) ───────────────────
    private scene!: Phaser.Scene;

    // ──────────────────────────────────────────────────────────────────────────
    // Public API
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Instantiate and attach all HUD components to the scene.
     * Call once, typically inside a Scene's `create()` method.
     */
    create(scene: Phaser.Scene): void {
        this.scene = scene;
        this.createHeader(scene);

        // ── Top row ──────────────────────────────────────────────────────────────
        this.playerBar = new PlayerStatusBar();
        this.playerBar.create(scene, "left");

        this.enemyBar = new PlayerStatusBar();
        this.enemyBar.create(scene, "right");

        this.windDisplay = new WindDisplay();
        this.windDisplay.create(scene);

        this.turnTimer = new TurnTimer();
        this.turnTimer.start(scene);

        // ── Bottom row ───────────────────────────────────────────────────────────
        this.consumableDock = new ConsumableDock();
        this.consumableDock.create(scene);

        this.modifierDock = new ModifierDock();
        this.modifierDock.create(scene);

        this.powerBar = new PowerBar();
        this.powerBar.create(scene);

        // ── Resize listener ──────────────────────────────────────────────────────
        scene.scale.on("resize", this._onResize, this);
    }

    /** Delegate power value update to the power bar (called every charge tick). */
    updatePower(force: number): void {
        this.powerBar.updatePowerOnly(force);
    }

    /** Record the last shot power on the ghost marker. */
    recordShot(power: number): void {
        this.powerBar.recordShot(power);
    }

    /** Wire pointerdown on the fire button. */
    onFireDown(callback: () => void): void {
        this.powerBar.onFireDown(callback);
    }

    /** Wire pointerup on the fire button. */
    onFireUp(callback: () => void): void {
        this.powerBar.onFireUp(callback);
    }

    /** Show last-shot info on the wind display. */
    setLastShot(force: number, angle: number): void {
        this.windDisplay.setLastShot(force, angle);
    }

    /**
     * Propagate game state to all HUD sub-components.
     * Call every frame (or whenever state changes).
     */
    update(state: BattleHudState): void {
        // Player status bars
        const leftTeam = state.teams?.left ?? [
            {
                name: state.player.name,
                hp: state.player.hp,
                maxHp: state.player.maxHp,
                active: true,
            },
        ];
        const rightTeam = state.teams?.right ?? [
            {
                name: state.enemy.name,
                hp: state.enemy.hp,
                maxHp: state.enemy.maxHp,
                active: true,
            },
        ];
        this.playerBar.setPlayers(leftTeam);
        this.enemyBar.setPlayers(rightTeam);

        if (state.turnNumber && state.turnNumber !== this.lastTurnNumber) {
            this.lastTurnNumber = state.turnNumber;
            this.turnTimer.reset();
            this.windDisplay.reset();
        }

        // Wind
        this.windDisplay.update(state.wind.x, state.wind.y);
        const title = state.roomName || state.mapName || "FLORESTA RUNICA";
        this.titleText.setText(
            `${(state.mode ?? "PVP").toUpperCase()} - ${title.toUpperCase()}`,
        );
        this.blueText.setText(
            `TIME AZUL\n${leftTeam.length}/${leftTeam.length}`,
        );
        this.redText.setText(
            `TIME VERMELHO\n${rightTeam.length}/${rightTeam.length}`,
        );

        // Show/hide bottom HUD elements based on whose turn it is
        const isPlayer = state.isPlayerTurn !== false;
        this.powerBar.setVisible(isPlayer);
        this.consumableDock.setVisible(isPlayer);
        this.modifierDock.setVisible(isPlayer);
        this.turnTimer.setVisible(isPlayer);

        // Power bar (angle + force + fire button)
        this.powerBar.update(
            state.power,
            state.angle,
            state.facing ?? "right",
            state.angleLimits,
        );
        this.powerBar.setCharging(state.isCharging);

        // Charging state also notifies the turn timer
        if (state.isCharging) {
            this.turnTimer.pauseForCharge();
        } else {
            this.turnTimer.resumeFromCharge();
        }

        // Consumable slots
        state.consumables.forEach((item, index) => {
            this.consumableDock.setSlot(index, item);
        });

        // Modifier slots
        state.modifiers.forEach((item, index) => {
            this.modifierDock.setSlot(index, item);
        });
    }

    /**
     * Destroy all HUD components and remove event listeners.
     * Call when the scene is shut down.
     */
    destroy(): void {
        this.scene?.scale.off("resize", this._onResize, this);

        this.turnTimer.stop();
        this.playerBar.destroy();
        this.enemyBar.destroy();
        this.consumableDock.destroy();
        this.modifierDock.destroy();
        this.powerBar.destroy();
        this.windDisplay.destroy();
        this.headerContainer?.destroy(true);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private — resize handler
    // ──────────────────────────────────────────────────────────────────────────

    private _onResize(_gameSize: Phaser.Structs.Size): void {
        this.layoutHeader();
    }

    private createHeader(scene: Phaser.Scene): void {
        this.headerContainer = scene.add
            .container(0, 0)
            .setDepth(33)
            .setScrollFactor(0);
        this.headerBg = scene.add.graphics();

        this.titleText = scene.add
            .text(0, 0, "PVP - FLORESTA RUNICA", {
                fontSize: "14px",
                color: "#ffd37a",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        this.blueText = scene.add
            .text(0, 0, "TIME AZUL\n4/4", {
                fontSize: "17px",
                color: "#4de0ff",
                fontFamily: "monospace",
                fontStyle: "bold",
                align: "center",
                stroke: "#001828",
                strokeThickness: 4,
            })
            .setOrigin(0.5);

        this.redText = scene.add
            .text(0, 0, "TIME VERMELHO\n4/4", {
                fontSize: "17px",
                color: "#ff6a56",
                fontFamily: "monospace",
                fontStyle: "bold",
                align: "center",
                stroke: "#280000",
                strokeThickness: 4,
            })
            .setOrigin(0.5);

        // Decorative crystal-star icons flanking team areas
        this.blueIcon = scene.add
            .text(0, 0, "✦", {
                fontSize: "28px",
                color: "#38c8ff",
                fontFamily: "Georgia, serif",
                fontStyle: "bold",
                stroke: "#001828",
                strokeThickness: 4,
            })
            .setOrigin(0.5);

        this.redIcon = scene.add
            .text(0, 0, "✦", {
                fontSize: "28px",
                color: "#ff4a38",
                fontFamily: "Georgia, serif",
                fontStyle: "bold",
                stroke: "#280000",
                strokeThickness: 4,
            })
            .setOrigin(0.5);

        this.headerContainer.add([
            this.headerBg,
            this.titleText,
            this.blueText,
            this.redText,
            this.blueIcon,
            this.redIcon,
        ]);
        this.layoutHeader();
    }

    private layoutHeader(): void {
        if (!this.scene || !this.headerBg) return;
        const W = this.scene.scale.width;
        const cx = W / 2;
        const top = 0;
        const w = Math.min(580, W * 0.48);
        const h = 80;

        this.headerBg.clear();

        // Outer shadow layer
        this.headerBg.fillStyle(0x000000, 0.5);
        this.headerBg.fillRoundedRect(cx - w / 2 + 3, top + 3, w, h, 9);

        // Main background
        this.headerBg.fillStyle(0x12100a, 0.95);
        this.headerBg.fillRoundedRect(cx - w / 2, top, w, h, 8);

        // Subtle top highlight strip
        this.headerBg.fillStyle(0xfff0a0, 0.06);
        this.headerBg.fillRoundedRect(
            cx - w / 2 + 4,
            top + 2,
            w - 8,
            h * 0.35,
            7,
        );

        // Outer gold border
        this.headerBg.lineStyle(3, 0x7a5530, 1);
        this.headerBg.strokeRoundedRect(
            cx - w / 2 + 1.5,
            top + 1.5,
            w - 3,
            h - 3,
            8,
        );

        // Inner thin highlight border
        this.headerBg.lineStyle(1, 0xe8c870, 0.5);
        this.headerBg.strokeRoundedRect(
            cx - w / 2 + 7,
            top + 7,
            w - 14,
            h - 14,
            6,
        );

        // Blue team area
        const blueX = cx - w / 2 + 16;
        const blueW = 158;
        this.headerBg.fillStyle(0x050d1a, 0.85);
        this.headerBg.fillRoundedRect(blueX, top + 22, blueW, 48, 7);
        this.headerBg.lineStyle(2, 0x1ca7ff, 0.8);
        this.headerBg.strokeRoundedRect(blueX, top + 22, blueW, 48, 7);
        this.headerBg.lineStyle(1, 0x7ae0ff, 0.3);
        this.headerBg.strokeRoundedRect(blueX + 4, top + 26, blueW - 8, 40, 5);

        // Red team area
        const redX = cx + w / 2 - 174;
        const redW = 158;
        this.headerBg.fillStyle(0x1a0505, 0.85);
        this.headerBg.fillRoundedRect(redX, top + 22, redW, 48, 7);
        this.headerBg.lineStyle(2, 0xff3b2f, 0.8);
        this.headerBg.strokeRoundedRect(redX, top + 22, redW, 48, 7);
        this.headerBg.lineStyle(1, 0xff9080, 0.3);
        this.headerBg.strokeRoundedRect(redX + 4, top + 26, redW - 8, 40, 5);

        // Corner accent dots
        const dotR = 4;
        this.headerBg.fillStyle(0xe8c870, 0.7);
        for (const [dx, dy] of [
            [-1, 1],
            [1, 1],
            [-1, -1],
            [1, -1],
        ] as const) {
            this.headerBg.fillCircle(
                cx + dx * (w / 2 - 8),
                top + (dy === 1 ? h - 8 : 8),
                dotR,
            );
        }

        // Text positions
        this.titleText.setPosition(cx, top + 12);
        this.blueText.setPosition(blueX + blueW / 2 + 10, top + 46);
        this.redText.setPosition(redX + redW / 2 - 10, top + 46);

        // Crystal icons
        this.blueIcon.setPosition(blueX + 14, top + 46);
        this.redIcon.setPosition(redX + redW - 14, top + 46);
    }
}
