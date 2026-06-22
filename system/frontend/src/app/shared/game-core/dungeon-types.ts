export type ObjectiveType = 'DEFEAT_ALL' | 'PROTECT' | 'DEFEAT_BOSS' | 'TRAVERSE' | 'SURVIVE';
export type DungeonStatus = 'IN_PROGRESS' | 'PHASE_COMPLETE' | 'FLOOR_COMPLETE' | 'FAILED';
export type EnemyType = 'CAVE_CREATURE_BASIC' | 'BAT_SWARM' | 'GOLEM_MINOR'
  | 'ACID_BAT' | 'GIANT_BAT_BOSS' | 'MYSTIC_BEETLE_NPC' | 'CORRUPTED_BEETLE' | 'TREANT_BOSS';

export type DungeonDifficulty = 'easy' | 'medium' | 'hard' | 'heroic';

export interface DungeonObjective {
  type: ObjectiveType;
  count?: number;
  turns?: number;
  targetId?: string;
  bossId?: string;
}

export interface EnemyConfig {
  type: EnemyType;
  count: number;
  ai: 'EASY' | 'INTERMEDIATE' | 'BOSS';
  spawnWave?: boolean;
}

export interface DungeonReward {
  xp: number;
  gold: number;
}

export interface DungeonPhase {
  id: string;
  name: string;
  objective: DungeonObjective;
  enemies: EnemyConfig[];
  map: string;
  reward: DungeonReward;
}

export interface PlayerState {
  id: string;
  hp: number;
  maxHp: number;
  weaponId: string;
  secondaryItemId?: string;
  consumableIds: string[];
}

export interface EnemyState {
  id: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  alive: boolean;
  ai: 'EASY' | 'INTERMEDIATE' | 'BOSS';
  x?: number;
  y?: number;
}

export interface ProtectTargetState {
  id: string;
  hp: number;
  maxHp: number;
  x?: number;
  y?: number;
}

export interface DungeonState {
  floorId: string;
  currentPhaseIndex: number;
  phases: DungeonPhase[];
  playerState: PlayerState;
  enemies: EnemyState[];
  protectTarget?: ProtectTargetState;
  protectedTurns: number;
  lives: number;
  localXp: number;
  localGold: number;
  status: DungeonStatus;
}

export interface DungeonStageDefinition {
  id: string;
  name: string;
  floor: number;
  stage: number;
  map: string;
  objective: DungeonObjective;
  enemies: EnemyConfig[];
  reward: DungeonReward;
}
