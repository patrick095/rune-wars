import { TerrainEngine } from './terrain-engine';
import { TerrainMaterial } from './terrain-types';
import { Difficulty } from './ai-local';
import { ShotModifierType } from './shot-modifier-system';

export type AiStrategyType = 'damage' | 'excavation' | 'mixed';

export interface AiStrategyStats {
  strength: number;
  agility: number;
  vitality: number;
  luck: number;
  maxHp: number;
}

// Probability weight of each strategy per difficulty level
const STRATEGY_WEIGHTS: Record<Difficulty, Record<AiStrategyType, number>> = {
  easy:   { damage: 0.50, excavation: 0.30, mixed: 0.20 },
  medium: { damage: 0.33, excavation: 0.34, mixed: 0.33 },
  hard:   { damage: 0.30, excavation: 0.30, mixed: 0.40 },
  heroic: { damage: 0.25, excavation: 0.35, mixed: 0.40 },
};

const MODIFIER_BUDGET = 100;
const MODIFIER_COST: Record<ShotModifierType, number> = {
  shot_x3: 60, shot_plus1: 60, shot_damage_2x: 40, shot_dig_2x: 40,
};

type ModCombo = { mods: ShotModifierType[]; weight: number };

function affordable(combos: ModCombo[]): ModCombo[] {
  return combos.filter(c =>
    c.mods.reduce((sum, m) => sum + MODIFIER_COST[m], 0) <= MODIFIER_BUDGET
  );
}

function weightedPick<T extends { weight: number }>(items: T[]): T {
  let rand = Math.random() * items.reduce((s, it) => s + it.weight, 0);
  for (const item of items) {
    rand -= item.weight;
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
}

export class AiStrategyEngine {
  pickStrategy(difficulty: Difficulty): AiStrategyType {
    const w = STRATEGY_WEIGHTS[difficulty];
    return weightedPick([
      { strategy: 'damage'     as AiStrategyType, weight: w.damage },
      { strategy: 'excavation' as AiStrategyType, weight: w.excavation },
      { strategy: 'mixed'      as AiStrategyType, weight: w.mixed },
    ]).strategy;
  }

  /**
   * Returns 0–1: how much diggable terrain exists below the target.
   * 1 = lots of terrain to collapse, 0 = near a cliff / nothing below.
   */
  scoreExcavationTarget(
    terrainEngine: TerrainEngine,
    targetX: number,
    targetY: number,
  ): number {
    let filled = 0;
    const probes = 10;
    for (let i = 1; i <= probes; i++) {
      const mat = terrainEngine.getMaterialAt(targetX, targetY + i * 6);
      if (mat !== TerrainMaterial.EMPTY) filled++;
    }
    return filled / probes;
  }

  /**
   * Vertical aim offset in pixels applied to the target position.
   * Positive = further down the screen (below the character's feet).
   * For excavation the AI aims at the terrain beneath the enemy.
   */
  getAimTargetOffset(strategy: AiStrategyType, excavScore: number): number {
    if (strategy === 'excavation') return 26;
    if (strategy === 'mixed' && excavScore > 0.5) return 18;
    return 0;
  }

  /**
   * Choose shot modifiers aligned with the current strategy.
   *
   * Damage  → maximize impact per turn (+dano 2x, +1 tiro +dano)
   * Escavação → maximize dig radius (+escav 2x, x3 +escav)
   * Mista   → reads terrain: digs if lots of ground below, damages otherwise
   */
  decideModifiers(
    strategy: AiStrategyType,
    excavScore: number,
    aiHpRatio: number,
    enemyHpRatio: number,
    distance: number,
  ): ShotModifierType[] {
    let combos: ModCombo[];
    const isLosing = aiHpRatio < enemyHpRatio - 0.15;

    switch (strategy) {
      case 'damage': {
        combos = [
          { mods: [],                                     weight: 0.4 },
          { mods: ['shot_damage_2x'],                     weight: 2.0 },
          { mods: ['shot_damage_2x', 'shot_damage_2x'],   weight: isLosing ? 3.5 : 1.2 },
          { mods: ['shot_plus1', 'shot_damage_2x'],       weight: 2.5 },
          { mods: ['shot_plus1'],                         weight: distance > 300 ? 1.5 : 0.6 },
          { mods: ['shot_x3'],                            weight: distance > 400 ? 1.0 : 0.3 },
        ];
        break;
      }
      case 'excavation': {
        // High excavation score → terrain below is diggable; lean heavily on dig
        const digBonus = excavScore > 0.5 ? 2.0 : 0.8;
        combos = [
          { mods: [],                                     weight: 0.3 },
          { mods: ['shot_dig_2x'],                        weight: 2.5 },
          { mods: ['shot_dig_2x', 'shot_dig_2x'],         weight: 3.0 * digBonus },
          { mods: ['shot_x3', 'shot_dig_2x'],             weight: excavScore > 0.4 ? 2.5 : 0.5 },
          { mods: ['shot_plus1', 'shot_dig_2x'],          weight: 1.5 },
        ];
        break;
      }
      case 'mixed': {
        if (excavScore > 0.55) {
          // Enemy on solid ground → collapse floor beneath them
          combos = [
            { mods: ['shot_dig_2x'],                     weight: 2.0 },
            { mods: ['shot_dig_2x', 'shot_dig_2x'],      weight: 2.5 },
            { mods: ['shot_x3', 'shot_dig_2x'],          weight: 2.0 },
            { mods: ['shot_damage_2x'],                  weight: 0.8 },
            { mods: [],                                  weight: 0.3 },
          ];
        } else {
          // Enemy near edge / little ground below → pure damage
          combos = [
            { mods: ['shot_damage_2x'],                  weight: 2.0 },
            { mods: ['shot_damage_2x', 'shot_damage_2x'],weight: isLosing ? 2.5 : 1.2 },
            { mods: ['shot_plus1', 'shot_damage_2x'],    weight: 1.8 },
            { mods: ['shot_dig_2x'],                     weight: 0.6 },
            { mods: [],                                  weight: 0.4 },
          ];
        }
        break;
      }
    }

    const pool = affordable(combos);
    return (pool.length > 0 ? weightedPick(pool) : { mods: [], weight: 0 }).mods;
  }

  /**
   * Redistribute attribute points for the AI based on player level and chosen strategy.
   * Mirrors how a skilled player would build their character for that playstyle.
   *
   *   Damage     → Força  50% | Agilidade 25% | Luck 10% | Vitalidade resto
   *   Escavação  → Vital  45% | Força     30% | Luck 15% | Agilidade resto
   *   Mista      → Força  35% | Vital     30% | Agil 20% | Luck resto
   */
  computeAiStats(playerLevel: number, strategy: AiStrategyType): AiStrategyStats {
    const points = Math.max(0, (playerLevel - 1) * 4);
    let str: number, agi: number, vit: number, lck: number;

    switch (strategy) {
      case 'damage':
        str = Math.floor(points * 0.50);
        agi = Math.floor(points * 0.25);
        lck = Math.floor(points * 0.10);
        vit = Math.max(0, points - str - agi - lck);
        break;
      case 'excavation':
        vit = Math.floor(points * 0.45);
        str = Math.floor(points * 0.30);
        lck = Math.floor(points * 0.15);
        agi = Math.max(0, points - vit - str - lck);
        break;
      case 'mixed':
      default:
        str = Math.floor(points * 0.35);
        vit = Math.floor(points * 0.30);
        agi = Math.floor(points * 0.20);
        lck = Math.max(0, points - str - vit - agi);
        break;
    }

    return {
      strength: Math.max(0, str),
      agility:  Math.max(0, agi),
      vitality: Math.max(0, vit),
      luck:     Math.max(0, lck),
      maxHp:    200 + Math.max(0, vit) * 20,
    };
  }
}
