import { WindState } from './wind-system';
import { WeaponDefinition } from './weapon-definition';
import { ShotModifierType } from './shot-modifier-system';
import { RunicEffect } from './runic-effect-system';
import { TerrainEngine } from './terrain-engine';

// ─── Snapshot ────────────────────────────────────────────────────────────────

export interface CombatantSnapshot {
  id: 'ai' | 'player';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  facing: 'left' | 'right';
  weapon: WeaponDefinition;
  /** 0 = no shield; 0.4 = shield item active (reduces 40% damage) */
  shieldReduction: number;
  effects: RunicEffect[];
  /** Each point adds +5% to outgoing damage */
  strength: number;
  luck: number;
  usedConsumableIds: Set<string>;
  /** Turns of invisibility remaining (0 = visible) */
  invisibleTurns: number;
  /** Turns frozen (0 = mobile) */
  frozenTurns: number;
}

export interface BattleSnapshot {
  ai: CombatantSnapshot;
  player: CombatantSnapshot;
  wind: WindState;
  turnNumber: number;
  terrain: TerrainEngine;
  /** Consumable IDs the AI still has available (not yet used) */
  availableConsumables: string[];
  availableSecondaryItemId: string | null;
  aiShieldActive: boolean;
  /** Optional fixed seed for deterministic behaviour (used in tests) */
  seed?: number;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type AiAction =
  | FireShotAction
  | UseItemAction
  | RepositionAction
  | PassAction;

export interface FireShotAction {
  type: 'fire';
  angle: number;
  force: number;
  modifiers: ShotModifierType[];
  /** Vertical offset from enemy centre when targeting terrain below them */
  targetOffset: number;
}

export interface UseItemAction {
  type: 'use_heal' | 'use_shield' | 'use_ice_throw';
  /** Fire this shot after applying the non-turn-consuming item */
  thenFire?: FireShotAction;
}

export interface RepositionAction {
  type: 'reposition';
  targetX: number;
}

export interface PassAction {
  type: 'pass';
}

// ─── Simulation result ────────────────────────────────────────────────────────

export interface BallisticHit {
  impactX: number;
  impactY: number;
  /** Closest distance the projectile path reached to the enemy centre */
  minDistToEnemy: number;
  /** Closest distance to self (for self-damage check) */
  minDistToSelf: number;
  /** Damage that would be dealt if the shot lands at impactX/impactY */
  expectedDamage: number;
  /** 0–1: probability the shot connects given weapon blast radius */
  hitChance: number;
  /** True if impactX/impactY is close enough to kill the enemy */
  killsTarget: boolean;
}

// ─── Evaluation ──────────────────────────────────────────────────────────────

export interface ActionEvaluation {
  action: AiAction;
  expectedDamage: number;
  hitChance: number;
  killsTarget: boolean;
  /** Killing the target OR dropping them off the map */
  winsBattle: boolean;
  /** Excavation collapses terrain beneath the enemy, causing a fatal fall */
  dropsEnemy: boolean;
  /** Self-damage as a fraction of own max HP (0–1) */
  selfDamageRisk: number;
  /** True if taking this defensive action neutralises an imminent enemy kill */
  preventsLoss: boolean;
  createsDecisiveAdvantage: boolean;
  terrainAdvantageGain: number;
  /** Final composite utility score — higher is better */
  score: number;
  debugReason: string;
}

// ─── Decision ────────────────────────────────────────────────────────────────

export interface AiDecision {
  action: AiAction;
  evaluation: ActionEvaluation;
  /** Full ranked list (useful for debug logging) */
  allEvaluations: ActionEvaluation[];
}
