import { ActionEvaluation, AiDecision, BattleSnapshot } from './ai-battle-types';
import { ExtendedDifficulty } from './ai-difficulty-profile';

export type AiLogLevel = 'off' | 'summary' | 'verbose';

export class AiDebugLogger {
  private level: AiLogLevel;
  private readonly logs: string[] = [];

  constructor(level: AiLogLevel = 'off') {
    this.level = level;
  }

  setLevel(level: AiLogLevel): void {
    this.level = level;
  }

  logDecision(
    decision: AiDecision,
    snapshot: BattleSnapshot,
    difficulty: ExtendedDifficulty,
  ): void {
    if (this.level === 'off') return;

    const { ai, player } = snapshot;
    const chosen = decision.evaluation;

    const header = [
      `[AI Turn ${snapshot.turnNumber}] Difficulty: ${difficulty}`,
      `  AI   HP: ${ai.hp}/${ai.maxHp} (${((ai.hp / ai.maxHp) * 100).toFixed(0)}%)`,
      `  Enemy HP: ${player.hp}/${player.maxHp} (${((player.hp / player.maxHp) * 100).toFixed(0)}%)`,
      `  Wind: dir=${snapshot.wind.direction.toFixed(2)} int=${snapshot.wind.intensity.toFixed(1)}`,
      ``,
      `  ► CHOSEN action: ${JSON.stringify(decision.action)}`,
      `    Score: ${chosen.score.toFixed(0)}`,
      `    Reason: ${chosen.debugReason}`,
      `    winsBattle=${chosen.winsBattle} dropsEnemy=${chosen.dropsEnemy}`,
      `    hitChance=${(chosen.hitChance * 100).toFixed(0)}% dmg=${chosen.expectedDamage}`,
    ].join('\n');

    this.logs.push(header);

    if (this.level === 'verbose') {
      const top5 = [...decision.allEvaluations]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      const details = top5.map((e, i) =>
        `  [${i + 1}] score=${e.score.toFixed(0)} | ${e.debugReason}`
      ).join('\n');

      this.logs.push('  Top-5 candidates:\n' + details);
    }

    // Print to console so developers can inspect in DevTools
    console.group(`%c[AI] Turn ${snapshot.turnNumber} — ${difficulty}`, 'color:#ffcc44;font-weight:bold');
    console.log(header);
    if (this.level === 'verbose' && decision.allEvaluations.length > 0) {
      console.table(
        decision.allEvaluations
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
          .map(e => ({
            score: e.score.toFixed(0),
            wins: e.winsBattle,
            drops: e.dropsEnemy,
            kills: e.killsTarget,
            hitChance: `${(e.hitChance * 100).toFixed(0)}%`,
            dmg: e.expectedDamage,
            reason: e.debugReason.slice(0, 80),
          }))
      );
    }
    console.groupEnd();
  }

  logWinDetected(evaluation: ActionEvaluation, snapshot: BattleSnapshot): void {
    if (this.level === 'off') return;
    const msg = `[AI] WIN DETECTED at turn ${snapshot.turnNumber}! ${evaluation.debugReason}`;
    this.logs.push(msg);
    console.log(`%c${msg}`, 'color:#00ff88;font-weight:bold');
  }

  logLossPreventionDetected(evaluation: ActionEvaluation, snapshot: BattleSnapshot): void {
    if (this.level === 'off') return;
    const msg = `[AI] LOSS PREVENTION at turn ${snapshot.turnNumber}: ${evaluation.debugReason}`;
    this.logs.push(msg);
    console.log(`%c${msg}`, 'color:#ff8844;font-weight:bold');
  }

  /** Returns all log messages accumulated so far. */
  getHistory(): string[] {
    return [...this.logs];
  }

  clearHistory(): void {
    this.logs.length = 0;
  }
}
