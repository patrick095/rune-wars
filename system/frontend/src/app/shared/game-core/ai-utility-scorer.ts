import {
  AiAction,
  ActionEvaluation,
  BattleSnapshot,
  BallisticHit,
  FireShotAction,
} from './ai-battle-types';
import { DifficultyProfile } from './ai-difficulty-profile';
import { AiBallisticSimulator } from './ai-ballistic-simulator';
import { AiTerrainAnalyzer } from './ai-terrain-analyzer';
import { AiActionGenerator } from './ai-action-generator';

// ─── Score constants ──────────────────────────────────────────────────────────

const SCORE_WIN_BATTLE         = 100_000;
const SCORE_PREVENTS_LOSS      =  50_000;
const SCORE_DROPS_ENEMY        =  30_000;
const SCORE_KILLS_TARGET       =  25_000;
const SCORE_DECISIVE_ADVANTAGE =  15_000;
const SCORE_HEAL_SURVIVAL      =   8_000;
const SCORE_FREEZE_BONUS       =   5_000;

// Negative weights
const PENALTY_SELF_DEATH_RISK   = 20_000;
const PENALTY_ALLY_DAMAGE       =  5_000;   // unused in 1v1, kept for future teams
const PENALTY_LOW_HIT_CHANCE    =  3_000;

// Per-unit weights
const W_DAMAGE                  = 8;
const W_HIT_CHANCE              = 2_000;
const W_TERRAIN_GAIN            = 500;

// Thresholds
const DECISIVE_ADVANTAGE_RATIO  = 0.40;   // enemy HP falls below 40%  → decisive

const simulator = new AiBallisticSimulator();
const terrainAnalyzer = new AiTerrainAnalyzer();
const generator = new AiActionGenerator();

// ─── Internal helpers ─────────────────────────────────────────────────────────

function applyNoise(score: number, noise: number, rng: () => number): number {
  if (noise === 0) return score;
  return score * (1 + (rng() * 2 - 1) * noise);
}

/** Rough enemy-lethality check: could the player kill the AI in one turn? */
function enemyCouldKillAiNextTurn(snapshot: BattleSnapshot): boolean {
  const { ai, player } = snapshot;
  // Use the player's weapon base damage scaled by impact radius as rough estimate.
  // The player could use modifiers, but we don't simulate their full turn here.
  const roughMaxDmg = player.weapon.baseDamage * 2.5 * (1 + player.strength * 0.05);
  const aiEffectiveHp = ai.hp * (1 - 0 /* no self-shield estimate */);
  return roughMaxDmg >= aiEffectiveHp;
}

// ─── AiUtilityScorer ─────────────────────────────────────────────────────────

export class AiUtilityScorer {
  /**
   * Evaluates a single action and returns a scored ActionEvaluation.
   *
   * @param action    - candidate action from the generator
   * @param snapshot  - current battle state
   * @param profile   - difficulty profile
   * @param rng       - seeded or Math.random function for noise
   */
  evaluate(
    action: AiAction,
    snapshot: BattleSnapshot,
    profile: DifficultyProfile,
    rng: () => number,
  ): ActionEvaluation {
    const { ai, player, wind, terrain } = snapshot;

    // ── Item-only actions ─────────────────────────────────────────────────────

    if (action.type === 'use_heal') {
      const healAmount = Math.round(ai.maxHp * 0.25);
      const newHp = Math.min(ai.maxHp, ai.hp + healAmount);
      const enemyCouldKill = profile.detectLossPrevention && enemyCouldKillAiNextTurn(snapshot);
      // Healing when death is imminent always counts as loss prevention.
      const preventsLoss = enemyCouldKill;
      let score = SCORE_HEAL_SURVIVAL * (1 - ai.hp / ai.maxHp);
      if (preventsLoss) score += SCORE_PREVENTS_LOSS * 0.3;

      // If a follow-up shot is included, evaluate it too
      let fireEval: ActionEvaluation | null = null;
      if (action.thenFire) {
        fireEval = this.evaluateFireShot(action.thenFire, snapshot, profile, rng);
        score += fireEval.score * 0.7;   // discounted because we just healed, not combo
      }

      score = applyNoise(score, profile.randomNoise, rng);

      return {
        action,
        expectedDamage: fireEval?.expectedDamage ?? 0,
        hitChance: fireEval?.hitChance ?? 0,
        killsTarget: false,
        winsBattle: false,
        dropsEnemy: false,
        selfDamageRisk: 0,
        preventsLoss,
        createsDecisiveAdvantage: false,
        terrainAdvantageGain: 0,
        score,
        debugReason: preventsLoss
          ? `Heal prevents likely death (AI HP ${ai.hp}/${ai.maxHp})`
          : `Heal for ${healAmount} HP (${ai.hp} → ${newHp})`,
      };
    }

    if (action.type === 'use_shield') {
      const enemyCouldKill = profile.detectLossPrevention && enemyCouldKillAiNextTurn(snapshot);
      let score = 3_000 * (1 - ai.hp / ai.maxHp);
      if (enemyCouldKill) score += SCORE_PREVENTS_LOSS * 0.15;
      score = applyNoise(score, profile.randomNoise, rng);
      return {
        action,
        expectedDamage: 0, hitChance: 0, killsTarget: false, winsBattle: false,
        dropsEnemy: false, selfDamageRisk: 0, preventsLoss: enemyCouldKill,
        createsDecisiveAdvantage: false, terrainAdvantageGain: 0,
        score,
        debugReason: 'Shield activation',
      };
    }

    if (action.type === 'use_ice_throw') {
      const score = applyNoise(SCORE_FREEZE_BONUS, profile.randomNoise, rng);
      return {
        action,
        expectedDamage: 0, hitChance: 0, killsTarget: false, winsBattle: false,
        dropsEnemy: false, selfDamageRisk: 0, preventsLoss: false,
        createsDecisiveAdvantage: false, terrainAdvantageGain: 0,
        score,
        debugReason: 'Ice-throw to freeze player',
      };
    }

    if (action.type === 'reposition') {
      return {
        action,
        expectedDamage: 0, hitChance: 0, killsTarget: false, winsBattle: false,
        dropsEnemy: false, selfDamageRisk: 0, preventsLoss: false,
        createsDecisiveAdvantage: false, terrainAdvantageGain: 0,
        score: 200,
        debugReason: `Reposition to x=${action.targetX}`,
      };
    }

    if (action.type === 'pass') {
      return {
        action,
        expectedDamage: 0, hitChance: 0, killsTarget: false, winsBattle: false,
        dropsEnemy: false, selfDamageRisk: 0, preventsLoss: false,
        createsDecisiveAdvantage: false, terrainAdvantageGain: 0,
        score: 0,
        debugReason: 'Pass (no good option)',
      };
    }

    // ── Fire actions ──────────────────────────────────────────────────────────

    return this.evaluateFireShot(action as FireShotAction, snapshot, profile, rng);
  }

  // ─── Private: fire evaluation ─────────────────────────────────────────────

  private evaluateFireShot(
    action: FireShotAction,
    snapshot: BattleSnapshot,
    profile: DifficultyProfile,
    rng: () => number,
  ): ActionEvaluation {
    const { ai, player, wind, terrain } = snapshot;

    const { baseDamage, excavationRadius, totalShots } = generator.resolveModifiers(
      action.modifiers,
      ai.weapon,
    );

    const isVulnerable = player.effects.some(e => e.type === 'VULNERABILITY');

    const hit: BallisticHit = simulator.simulateWithKillCheck({
      startX: ai.x,
      startY: ai.y,
      angle: action.angle,
      force: action.force,
      weapon: ai.weapon,
      wind,
      terrain,
      baseDamage,
      excavRadius: excavationRadius,
      targetX: player.x,
      targetY: player.y + action.targetOffset,
      selfX: ai.x,
      selfY: ai.y,
      targetShield: player.shieldReduction,
      shooterStrength: ai.strength,
      targetVulnerable: isVulnerable,
      enemyCurrentHp: player.hp,
    });

    // Fall risk check (skipped on easy/medium for performance)
    let dropsEnemy = false;
    let fallDamage = 0;
    if (profile.analyzeTerrainFall) {
      const fallRisk = terrainAnalyzer.estimateFallRisk(
        terrain,
        hit.impactX,
        hit.impactY,
        excavationRadius,
        player.x,
        player.y,
        player.maxHp,
      );
      dropsEnemy = fallRisk.willFall;
      fallDamage = fallRisk.estimatedFallDamage;
    }

    // Multi-shot modifiers fire totalShots projectiles; simulator only runs one.
    // Scale expected damage so combos like x3 and plus1 aren't artificially penalised.
    const scaledHitDamage = hit.expectedDamage * totalShots;
    const totalExpectedDmg = scaledHitDamage + (dropsEnemy ? fallDamage : 0);
    const killsTarget = (scaledHitDamage >= player.hp && hit.hitChance > 0)
      || (dropsEnemy && fallDamage >= player.hp);
    const winsBattle = killsTarget;

    // Self-damage risk as a fraction of own max HP
    const selfDmg = profile.analyzeTerrainFall
      ? hit.minDistToSelf < ai.weapon.impactRadius * 1.5
        ? hit.expectedDamage * (1 - hit.minDistToSelf / (ai.weapon.impactRadius * 1.5))
        : 0
      : 0;
    const selfDamageRisk = selfDmg / ai.maxHp;

    // Decisive advantage: shot would leave enemy below threshold
    const postShotHp = player.hp - totalExpectedDmg * hit.hitChance;
    const createsDecisiveAdvantage = !winsBattle && postShotHp / player.maxHp <= DECISIVE_ADVANTAGE_RATIO;

    // Loss prevention (simplified: if enemy could kill us and we can survive by attacking)
    const preventsLoss = false;   // fire actions don't prevent loss directly

    // Terrain advantage: how much cover AI gains relative to now
    const coverBefore = terrainAnalyzer.estimateCoverValue(terrain, ai.x, ai.y, player.x, player.y);
    const terrainAdvantageGain = profile.analyzeTerrainFall ? -coverBefore * 0.1 : 0;

    // ── Composite utility score ───────────────────────────────────────────────
    let score = 0;

    if (winsBattle)                   score += SCORE_WIN_BATTLE;
    if (dropsEnemy)                   score += SCORE_DROPS_ENEMY;
    if (killsTarget)                  score += SCORE_KILLS_TARGET;
    if (createsDecisiveAdvantage)     score += SCORE_DECISIVE_ADVANTAGE;

    score += totalExpectedDmg * W_DAMAGE * profile.damageWeight;
    score += hit.hitChance * W_HIT_CHANCE;
    score += terrainAdvantageGain * W_TERRAIN_GAIN;

    // Penalties
    score -= selfDamageRisk * PENALTY_SELF_DEATH_RISK;
    if (hit.hitChance < (profile.minHitChance ?? 0)) {
      score -= PENALTY_LOW_HIT_CHANCE * (1 - hit.hitChance);
    }

    score = applyNoise(score, profile.randomNoise, rng);

    // Build readable debug reason
    const reasons: string[] = [];
    if (winsBattle) reasons.push('WINS BATTLE');
    if (dropsEnemy) reasons.push(`drops enemy (fall ~${fallDamage} dmg)`);
    if (hit.killsTarget) reasons.push('kills target');
    if (createsDecisiveAdvantage) reasons.push('decisive advantage');
    reasons.push(`dmg=${totalExpectedDmg.toFixed(0)} hit=${(hit.hitChance * 100).toFixed(0)}% shots=${totalShots}`);
    reasons.push(`a=${action.angle}° f=${action.force}`);
    if (action.modifiers.length) reasons.push(`mods=${action.modifiers.join(',')}`);

    return {
      action,
      expectedDamage: totalExpectedDmg,
      hitChance: hit.hitChance,
      killsTarget,
      winsBattle,
      dropsEnemy,
      selfDamageRisk,
      preventsLoss,
      createsDecisiveAdvantage,
      terrainAdvantageGain,
      score,
      debugReason: reasons.join(' | '),
    };
  }
}
