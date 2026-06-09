import Phaser from 'phaser';
import { TurnTimer } from './turn-timer';
import { WindDisplay } from './wind-display';
import { PlayerStatusBar } from './player-status-bar';
import { ConsumableDock } from './consumable-dock';
import { ModifierDock } from './modifier-dock';
import { PowerBar } from './power-bar';

export interface BattleHudState {
  player: { hp: number; maxHp: number; stamina: number; maxStamina: number; name: string };
  enemy: { hp: number; maxHp: number; stamina: number; maxStamina: number; name: string };
  wind: { x: number; y: number };
  power: number;
  angle: number;
  isCharging: boolean;
  consumables: Array<{ iconKey: string; quantity?: number } | null>;
  modifiers: Array<{ iconKey: string } | null>;
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

    // ── Top row ──────────────────────────────────────────────────────────────
    this.playerBar = new PlayerStatusBar();
    this.playerBar.create(scene, 'left');

    this.enemyBar = new PlayerStatusBar();
    this.enemyBar.create(scene, 'right');

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
    scene.scale.on('resize', this._onResize, this);
  }

  /**
   * Propagate game state to all HUD sub-components.
   * Call every frame (or whenever state changes).
   */
  update(state: BattleHudState): void {
    // Player status bars
    this.playerBar.setName(state.player.name);
    this.playerBar.update(
      state.player.hp,
      state.player.maxHp,
      state.player.stamina,
      state.player.maxStamina,
    );

    this.enemyBar.setName(state.enemy.name);
    this.enemyBar.update(
      state.enemy.hp,
      state.enemy.maxHp,
      state.enemy.stamina,
      state.enemy.maxStamina,
    );

    // Wind
    this.windDisplay.update(state.wind.x, state.wind.y);

    // Power bar (angle + force + fire button)
    this.powerBar.update(state.power, state.angle);
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
    this.scene?.scale.off('resize', this._onResize, this);

    this.turnTimer.stop();
    this.playerBar.destroy();
    this.enemyBar.destroy();
    this.consumableDock.destroy();
    this.modifierDock.destroy();
    this.powerBar.destroy();

    // WindDisplay has no explicit destroy; its container is a scene child
    // and will be cleaned up when the scene shuts down.
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private — resize handler
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Re-positions components that manage their own layout via create() calls
   * which bake in the canvas dimensions. Components that already handle resize
   * internally (ModifierDock, PowerBar) are intentionally omitted here.
   *
   * NOTE: PlayerStatusBar and ConsumableDock bake dimensions at create-time and
   * do not expose a reposition method. A full rebuild would be needed for a
   * proper resize; that is deferred to future work. The listener is registered
   * so the scene at minimum fires it and downstream components that do handle
   * resize (ModifierDock, PowerBar) are triggered through Phaser's own
   * scale event chain.
   */
  private _onResize(_gameSize: Phaser.Structs.Size): void {
    // ModifierDock and PowerBar handle resize internally via their own
    // scene.scale 'resize' listeners registered during create().
    // No additional action required here unless components are rebuilt.
  }
}
