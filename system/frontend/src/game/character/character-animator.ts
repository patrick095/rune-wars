import Phaser from 'phaser';
import { Race } from './character-sprite';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AnimState =
  | 'idle'
  | 'walk'
  | 'fall'
  | 'charge'
  | 'shoot'
  | 'damage'
  | 'die'
  | 'critical';

/**
 * One-shot states: after completing, the animator automatically returns to
 * `idle`.  `die` is also one-shot but it is terminal (stays on the last
 * frame and never transitions back).
 */
const ONE_SHOT_STATES: ReadonlySet<AnimState> = new Set<AnimState>([
  'shoot',
  'damage',
  'critical',
  'die',
]);

const TERMINAL_STATES: ReadonlySet<AnimState> = new Set<AnimState>(['die']);

// ─── CharacterAnimator ────────────────────────────────────────────────────────

/**
 * Controls sprite animations for a single character layer (the `base` sprite).
 *
 * Animation keys follow the convention:  `{race}_{state}`
 * e.g. `human_idle`, `elf_walk`, `dwarf_die`
 *
 * If the animation key does not exist in `scene.anims`, the call is silently
 * skipped so the game never crashes on missing assets.
 */
export class CharacterAnimator {
  private readonly _scene: Phaser.Scene;
  private readonly _sprite: Phaser.GameObjects.Sprite;
  private readonly _race: Race;

  private _currentState: AnimState = 'idle';
  private _dead = false;

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor(
    scene: Phaser.Scene,
    sprite: Phaser.GameObjects.Sprite,
    race: Race
  ) {
    this._scene = scene;
    this._sprite = sprite;
    this._race = race;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Current animation state. */
  get currentState(): AnimState {
    return this._currentState;
  }

  /**
   * Transition to a new animation state.
   *
   * - Ignores all transitions once the character is in the `die` terminal state.
   * - One-shot states (shoot, damage, critical, die) automatically return to
   *   `idle` after the animation completes (except `die`).
   * - Logs transitions to the console for debug purposes.
   */
  transition(state: AnimState): void {
    // Terminal guard: once dead, nothing changes.
    if (this._dead) return;

    // Avoid re-entering the same state while it is already playing.
    if (state === this._currentState) return;

    const prev = this._currentState;
    this._currentState = state;
    console.log(`[CharacterAnimator] ${this._race}: ${prev} → ${state}`);

    const key = this._animKey(state);

    if (!this._animExists(key)) {
      // No animation asset – just update internal state, do nothing on sprite.
      console.warn(`[CharacterAnimator] Animation "${key}" not found; skipping playback.`);
      return;
    }

    if (ONE_SHOT_STATES.has(state)) {
      this._playOneShot(key, state);
    } else {
      this._sprite.play(key, true);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _animKey(state: AnimState): string {
    return `${this._race}_${state}`;
  }

  private _animExists(key: string): boolean {
    return this._scene.anims.exists(key);
  }

  private _playOneShot(key: string, state: AnimState): void {
    // Stop any previous animationcomplete listener to avoid stacking.
    this._sprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE);

    this._sprite.play(key, true);

    this._sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      () => {
        if (TERMINAL_STATES.has(state)) {
          // Stay on the last frame – mark as dead so no further transitions.
          this._dead = true;
          console.log(`[CharacterAnimator] ${this._race}: "${state}" complete – character is now dead (terminal).`);
        } else {
          // Return to idle after one-shot finishes.
          console.log(`[CharacterAnimator] ${this._race}: one-shot "${state}" complete → idle`);
          this._currentState = 'idle';
          const idleKey = this._animKey('idle');
          if (this._animExists(idleKey)) {
            this._sprite.play(idleKey, true);
          }
        }
      }
    );
  }
}
