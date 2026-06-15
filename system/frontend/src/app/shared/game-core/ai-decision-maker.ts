/**
 * AiDecisionMaker — main entry point for the tactical AI.
 *
 * Decision flow (priority order):
 *  1. Generate all candidate actions.
 *  2. Simulate and score each action.
 *  3. If any action wins the battle NOW → pick the best winning action.
 *  4. If we are about to lose and a defensive action prevents it → take it.
 *  5. If any action creates a decisive advantage → prefer it.
 *  6. Otherwise pick the highest utility action.
 *  7. Apply difficulty profile modifiers (noise, thresholds).
 */

import { AiAction, ActionEvaluation, AiDecision, BattleSnapshot } from './ai-battle-types';
import { ExtendedDifficulty, DIFFICULTY_PROFILES } from './ai-difficulty-profile';
import { AiActionGenerator } from './ai-action-generator';
import { AiUtilityScorer } from './ai-utility-scorer';
import { AiDebugLogger, AiLogLevel } from './ai-debug-logger';

const generator = new AiActionGenerator();
const scorer    = new AiUtilityScorer();

// Singleton logger; game code can call AiDecisionMaker.logger.setLevel('verbose')
export const aiLogger = new AiDebugLogger('off');

// ─── Seeded RNG (Mulberry32) ─────────────────────────────────────────────────

function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ─── Main pick helper ─────────────────────────────────────────────────────────

function pickBest(evals: ActionEvaluation[]): ActionEvaluation {
  return evals.reduce((best, e) => e.score > best.score ? e : best);
}

// ─── AiDecisionMaker ─────────────────────────────────────────────────────────

export class AiDecisionMaker {
  /**
   * Decide the best action for the AI given the current battle snapshot.
   *
   * @param snapshot   - read-only battle state
   * @param difficulty - selected difficulty level
   * @param logLevel   - optional log level override for this decision
   */
  decide(
    snapshot: BattleSnapshot,
    difficulty: ExtendedDifficulty,
    logLevel?: AiLogLevel,
  ): AiDecision {
    const profile = DIFFICULTY_PROFILES[difficulty];
    const rng = makeRng(snapshot.seed ?? Math.floor(Math.random() * 0xFFFFFF));

    if (logLevel) aiLogger.setLevel(logLevel);

    // ── 1. Generate candidates ────────────────────────────────────────────────
    const actions: AiAction[] = generator.generate(snapshot, profile);

    // ── 2. Evaluate all ───────────────────────────────────────────────────────
    const allEvaluations: ActionEvaluation[] = actions.map(action =>
      scorer.evaluate(action, snapshot, profile, rng)
    );

    // ── 3. Win detection ──────────────────────────────────────────────────────
    if (profile.detectWinCondition) {
      const winningNow = allEvaluations.filter(e =>
        e.winsBattle && e.hitChance >= profile.winChanceThreshold
      );
      if (winningNow.length > 0) {
        const best = pickBest(winningNow);
        aiLogger.logWinDetected(best, snapshot);
        const decision: AiDecision = { action: best.action, evaluation: best, allEvaluations };
        aiLogger.logDecision(decision, snapshot, difficulty);
        return decision;
      }
    }

    // ── 4. Loss prevention ────────────────────────────────────────────────────
    if (profile.detectLossPrevention) {
      // Identify defensive actions that the AI should take to survive
      const { ai, player } = snapshot;
      const couldDieNextTurn = player.weapon.baseDamage * 2.5 * (1 + player.strength * 0.05) >= ai.hp;

      if (couldDieNextTurn) {
        const defensiveActions = allEvaluations.filter(e =>
          e.action.type === 'use_heal' || e.action.type === 'use_shield'
        );

        if (defensiveActions.length > 0) {
          // Still attack if we have a high-chance lethal
          const nearLetal = allEvaluations.filter(e =>
            e.winsBattle && e.hitChance >= 0.65
          );
          if (nearLetal.length === 0) {
            const best = pickBest(defensiveActions);
            aiLogger.logLossPreventionDetected(best, snapshot);
            const decision: AiDecision = { action: best.action, evaluation: best, allEvaluations };
            aiLogger.logDecision(decision, snapshot, difficulty);
            return decision;
          }
        }
      }
    }

    // ── 5. Decisive advantage ─────────────────────────────────────────────────
    const decisiveActions = allEvaluations.filter(e =>
      e.createsDecisiveAdvantage && e.hitChance >= profile.minHitChance
    );
    if (decisiveActions.length > 0) {
      const best = pickBest(decisiveActions);
      const decision: AiDecision = { action: best.action, evaluation: best, allEvaluations };
      aiLogger.logDecision(decision, snapshot, difficulty);
      return decision;
    }

    // ── 6. Highest utility ────────────────────────────────────────────────────
    // Filter out shots with hit-chance below the minimum threshold (unless nothing else)
    const validActions = allEvaluations.filter(e =>
      e.action.type !== 'fire' || e.hitChance >= profile.minHitChance
    );
    const pool = validActions.length > 0 ? validActions : allEvaluations;

    const best = pickBest(pool);
    const decision: AiDecision = { action: best.action, evaluation: best, allEvaluations };
    aiLogger.logDecision(decision, snapshot, difficulty);
    return decision;
  }

  /**
   * Convenience method that returns just the FireShotAction parameters
   * (angle + force) to slot into the existing calculateAiShot() call-site.
   *
   * If the chosen action is not a fire shot (e.g. heal/shield), returns null
   * and the caller should apply the item instead.
   */
  decideShotParams(
    snapshot: BattleSnapshot,
    difficulty: ExtendedDifficulty,
  ): { angle: number; force: number; modifiers: import('./shot-modifier-system').ShotModifierType[]; targetOffset: number } | null {
    const decision = this.decide(snapshot, difficulty);

    if (decision.action.type === 'fire') {
      return {
        angle:        decision.action.angle,
        force:        decision.action.force,
        modifiers:    decision.action.modifiers,
        targetOffset: decision.action.targetOffset,
      };
    }

    if (decision.action.type === 'use_heal' && decision.action.thenFire) {
      return {
        angle:        decision.action.thenFire.angle,
        force:        decision.action.thenFire.force,
        modifiers:    decision.action.thenFire.modifiers,
        targetOffset: decision.action.thenFire.targetOffset,
      };
    }

    return null;
  }
}
