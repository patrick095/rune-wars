import { BattleSnapshot, AiAction, FireShotAction, UseItemAction } from './ai-battle-types';
import { DifficultyProfile } from './ai-difficulty-profile';
import { ShotModifierType } from './shot-modifier-system';
import { WEAPON_ANGLE_LIMITS } from './weapon-definition';

// ─── Modifier combos ──────────────────────────────────────────────────────────

interface ModCombo {
  mods: ShotModifierType[];
  /** Relative weight for inclusion in the candidate set */
  weight: number;
}

/** Pre-defined modifier sets the AI evaluates for each angle/force pair */
const MODIFIER_COMBOS: ModCombo[] = [
  { mods: [],                                   weight: 1.0 },
  { mods: ['shot_damage_2x'],                   weight: 1.2 },
  { mods: ['shot_damage_2x', 'shot_damage_2x'], weight: 0.8 },
  { mods: ['shot_dig_2x'],                      weight: 0.8 },
  { mods: ['shot_dig_2x', 'shot_dig_2x'],       weight: 0.5 },
  { mods: ['shot_plus1', 'shot_damage_2x'],     weight: 0.6 },
  { mods: ['shot_x3'],                          weight: 0.5 },
  { mods: ['shot_x3', 'shot_dig_2x'],           weight: 0.6 },  // max area excavation
];

const MODIFIER_COST: Record<ShotModifierType, number> = {
  shot_plus1: 60, shot_x3: 60, shot_damage_2x: 40, shot_dig_2x: 40,
};
const MODIFIER_BUDGET = 100;

function isAffordable(mods: ShotModifierType[]): boolean {
  return mods.reduce((s, m) => s + MODIFIER_COST[m], 0) <= MODIFIER_BUDGET;
}

// ─── Candidate generation ─────────────────────────────────────────────────────

export class AiActionGenerator {
  /**
   * Generates all candidate AiActions for the current turn.
   *
   * Fire actions are the primary candidates. Item actions (heal, shield,
   * ice-throw) are appended when the AI has them available and hasn't used
   * them yet this battle.
   *
   * `targetOffset` is set to 26 when we should aim below the enemy's feet
   * (excavation intent); otherwise 0 (direct aim).
   */
  generate(snapshot: BattleSnapshot, profile: DifficultyProfile): AiAction[] {
    const actions: AiAction[] = [];

    const { ai, player } = snapshot;
    const weapon = ai.weapon;
    const limits = WEAPON_ANGLE_LIMITS[weapon.id] ?? WEAPON_ANGLE_LIMITS['default'];

    // Direction-aware angle range
    const playerIsLeft = player.x < ai.x;
    const angleMin = playerIsLeft
      ? 180 - limits.maxAngle
      : limits.minAngle;
    const angleMax = playerIsLeft
      ? 180 - limits.minAngle
      : limits.maxAngle;

    // Direct aim target offsets: 0 = head/body, 26 = feet/ground for dig
    const targetOffsets = [0, 26];

    // Modifier sets to try (fewer on easy/medium for performance)
    const modCombos = profile.randomNoise > 0.3
      ? MODIFIER_COMBOS.slice(0, 2)          // easy: no-mod and single-damage only
      : profile.randomNoise > 0.1
        ? MODIFIER_COMBOS.slice(0, 4)        // medium
        : MODIFIER_COMBOS;                   // hard / heroic

    for (const offset of targetOffsets) {
      for (let angle = angleMin; angle <= angleMax; angle += profile.angleStep) {
        for (let force = 20; force <= 100; force += profile.forceStep) {
          for (const combo of modCombos) {
            if (!isAffordable(combo.mods)) continue;

            const action: FireShotAction = {
              type: 'fire',
              angle,
              force,
              modifiers: combo.mods,
              targetOffset: offset,
            };
            actions.push(action);
          }
        }
      }
    }

    // ── Non-shot actions ────────────────────────────────────────────────────

    // Heal (never consumes a turn)
    if (
      !ai.usedConsumableIds.has('heal') &&
      snapshot.availableConsumables.includes('heal')
    ) {
      const healAction: UseItemAction = { type: 'use_heal' };
      actions.push(healAction);

      // heal + shoot combo (hard / heroic only)
      if (profile.useItemCombos) {
        const bestShotAngle = playerIsLeft ? 135 : 45;
        actions.push({
          type: 'use_heal',
          thenFire: {
            type: 'fire',
            angle: bestShotAngle,
            force: 60,
            modifiers: [],
            targetOffset: 0,
          },
        } as UseItemAction);
      }
    }

    // Shield (never consumes a turn)
    if (
      !ai.usedConsumableIds.has('__shield') &&
      !snapshot.aiShieldActive &&
      snapshot.availableSecondaryItemId === 'shield'
    ) {
      actions.push({ type: 'use_shield' } as UseItemAction);
    }

    // Ice-throw (never consumes a turn — freezes player)
    if (
      !ai.usedConsumableIds.has('ice-throw') &&
      snapshot.availableConsumables.includes('ice-throw') &&
      player.frozenTurns === 0
    ) {
      actions.push({ type: 'use_ice_throw' } as UseItemAction);
    }

    return actions;
  }

  /**
   * Returns the effective baseDamage and excavationRadius for a fire action,
   * after applying the shot modifiers.
   */
  resolveModifiers(
    modifiers: ShotModifierType[],
    weapon: { baseDamage: number; excavationRadius: number },
  ): { baseDamage: number; excavationRadius: number; totalShots: number } {
    const shotPlus1 = modifiers.filter(m => m === 'shot_plus1').length;
    const shotX3 = modifiers.filter(m => m === 'shot_x3').length;
    const damage2x = modifiers.filter(m => m === 'shot_damage_2x').length;
    const dig2x = modifiers.filter(m => m === 'shot_dig_2x').length;

    const totalShots = 1 + shotPlus1 + 2 * shotX3;
    const shotDamageMult = totalShots > 1 ? 1.5 / totalShots : 1.0;
    const damageMult = shotDamageMult * (1 + 0.5 * damage2x);
    const excavMult = 1 + dig2x;

    return {
      baseDamage: Math.round(weapon.baseDamage * damageMult),
      excavationRadius: Math.round(weapon.excavationRadius * excavMult),
      totalShots,
    };
  }
}
