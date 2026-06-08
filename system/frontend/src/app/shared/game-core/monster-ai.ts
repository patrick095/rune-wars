import { TerrainEngine } from './terrain-engine';
import { TerrainMaterial } from './terrain-types';
import { EnemyState, PlayerState } from './dungeon-types';

export enum AiLevel {
  EASY = 'EASY',
  INTERMEDIATE = 'INTERMEDIATE',
  BOSS = 'BOSS',
}

export interface MonsterAi {
  level: AiLevel;
  aimErrorDegrees: number;
  forceErrorPercent: number;
  usesCover: boolean;
  targetsWeakest: boolean;
  phaseThresholds?: number[];
}

export interface MonsterAction {
  angle: number;
  force: number;
  targetId: string;
  moveToX?: number;
}

export const MONSTER_AI_CONFIGS: Record<AiLevel, MonsterAi> = {
  [AiLevel.EASY]: {
    level: AiLevel.EASY,
    aimErrorDegrees: 20,
    forceErrorPercent: 25,
    usesCover: false,
    targetsWeakest: false,
  },
  [AiLevel.INTERMEDIATE]: {
    level: AiLevel.INTERMEDIATE,
    aimErrorDegrees: 10,
    forceErrorPercent: 15,
    usesCover: true,
    targetsWeakest: false,
  },
  [AiLevel.BOSS]: {
    level: AiLevel.BOSS,
    aimErrorDegrees: 5,
    forceErrorPercent: 8,
    usesCover: true,
    targetsWeakest: true,
    phaseThresholds: [0.5],
  },
};

export class MonsterAiSystem {
  getConfig(level: AiLevel | keyof typeof AiLevel): MonsterAi {
    return MONSTER_AI_CONFIGS[level as AiLevel];
  }

  planAction(enemy: EnemyState, player: PlayerState, terrainEngine?: TerrainEngine): MonsterAction {
    const config = this.getConfig(enemy.ai as AiLevel);
    const dx = (player as PlayerState & { x?: number }).x ?? 120;
    const ex = enemy.x ?? 650;
    const targetX = dx - ex;
    const baseAngle = targetX < 0 ? 135 : 45;
    const baseForce = enemy.type === 'GOLEM_MINOR' ? 72 : 52;
    const angle = this.withError(baseAngle, config.aimErrorDegrees);
    const force = this.withError(baseForce, baseForce * (config.forceErrorPercent / 100));

    return {
      angle,
      force: Math.max(15, Math.min(100, force)),
      targetId: player.id,
      moveToX: config.usesCover && terrainEngine ? this.findCoverX(enemy.x ?? ex, terrainEngine) : undefined,
    };
  }

  private withError(value: number, errorRange: number): number {
    return value + (Math.random() * 2 - 1) * errorRange;
  }

  private findCoverX(currentX: number, terrainEngine: TerrainEngine): number | undefined {
    for (let offset = 24; offset <= 160; offset += 16) {
      const leftX = currentX - offset;
      const rightX = currentX + offset;
      if (terrainEngine.getMaterialAt(leftX, 210) === TerrainMaterial.INDESTRUCTIBLE) return leftX + 18;
      if (terrainEngine.getMaterialAt(rightX, 210) === TerrainMaterial.INDESTRUCTIBLE) return rightX - 18;
    }
    return undefined;
  }
}
