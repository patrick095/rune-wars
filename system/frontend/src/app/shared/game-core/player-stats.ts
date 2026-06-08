export interface PlayerBaseStats {
  level: number;
  strength: number;
  agility: number;
  vitality: number;
  luck: number;
}

export interface PlayerStats extends PlayerBaseStats {
  readonly maxHp: number;
  readonly damage: number;
  readonly defense: number;
  readonly mobility: number;
  readonly runicChance: number;
  readonly totalPoints: number;
  readonly usedPoints: number;
}
