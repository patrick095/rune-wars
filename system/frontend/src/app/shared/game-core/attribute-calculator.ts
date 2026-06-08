import { PlayerBaseStats, PlayerStats } from './player-stats';

export class AttributeCalculator {
  calculate(base: PlayerBaseStats): PlayerStats {
    const usedPoints = base.strength + base.agility + base.vitality + base.luck;
    return {
      ...base,
      maxHp: 200 + base.vitality * 20,
      damage: 1.0 + base.strength * 0.02,
      defense: Math.min(base.agility * 0.005, 0.6),
      mobility: 30 + base.agility * 2,
      runicChance: Math.min(0.05 + base.luck * 0.003, 0.75),
      totalPoints: (base.level - 1) * 4,
      usedPoints,
    };
  }

  hasValidPoints(base: PlayerBaseStats): boolean {
    const used = base.strength + base.agility + base.vitality + base.luck;
    return used <= (base.level - 1) * 4;
  }
}
