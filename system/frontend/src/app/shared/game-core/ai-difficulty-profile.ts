/** Extended difficulty — 'heroic' is a superset of 'hard'. */
export type ExtendedDifficulty = 'easy' | 'medium' | 'hard' | 'heroic';

export interface DifficultyProfile {
  /** Degrees between each candidate angle during ballistic search */
  angleStep: number;
  /** Force units between each candidate force during ballistic search */
  forceStep: number;
  /** Max random angle error added to the chosen shot (±degrees) */
  angleError: number;
  /** Max random force error added to the chosen shot (±units) */
  forceError: number;
  /** Hit-chance below this threshold is treated as "too risky to attempt" */
  minHitChance: number;
  /** Run win-condition check before item/heal decisions */
  detectWinCondition: boolean;
  /** Run loss-prevention check (will enemy kill us next turn?) */
  detectLossPrevention: boolean;
  /** Simulate terrain excavation for fall damage / fall kill */
  analyzeTerrainFall: boolean;
  /** Allow combining non-turn items (heal, shield) with a shot in the same turn */
  useItemCombos: boolean;
  /**
   * Jitter applied to utility scores as a fraction of the score magnitude.
   * 0 = fully deterministic, 0.4 = chaotic.
   */
  randomNoise: number;
  /** Multiplier applied to raw expected damage in utility scoring */
  damageWeight: number;
  /**
   * When estimated win-chance for a lethal shot is below this threshold
   * the AI considers defensive alternatives (heal / reposition).
   */
  winChanceThreshold: number;
}

export const DIFFICULTY_PROFILES: Record<ExtendedDifficulty, DifficultyProfile> = {
  easy: {
    angleStep: 8,
    forceStep: 12,
    angleError: 14,
    forceError: 14,
    minHitChance: 0,
    detectWinCondition: false,
    detectLossPrevention: false,
    analyzeTerrainFall: false,
    useItemCombos: false,
    randomNoise: 0.40,
    damageWeight: 1.0,
    winChanceThreshold: 0.10,
  },
  medium: {
    angleStep: 5,
    forceStep: 8,
    angleError: 7,
    forceError: 8,
    minHitChance: 0.10,
    detectWinCondition: true,
    detectLossPrevention: false,
    analyzeTerrainFall: false,
    useItemCombos: false,
    randomNoise: 0.20,
    damageWeight: 1.2,
    winChanceThreshold: 0.20,
  },
  hard: {
    angleStep: 3,
    forceStep: 5,
    angleError: 3,
    forceError: 4,
    minHitChance: 0.20,
    detectWinCondition: true,
    detectLossPrevention: true,
    analyzeTerrainFall: true,
    useItemCombos: false,
    randomNoise: 0.05,
    damageWeight: 1.5,
    winChanceThreshold: 0.35,
  },
  heroic: {
    angleStep: 2,
    forceStep: 3,
    angleError: 1,
    forceError: 2,
    minHitChance: 0.30,
    detectWinCondition: true,
    detectLossPrevention: true,
    analyzeTerrainFall: true,
    useItemCombos: true,
    randomNoise: 0,
    damageWeight: 2.0,
    winChanceThreshold: 0.50,
  },
};
