import {
  DungeonPhase,
  DungeonState,
  DungeonDifficulty,
  EnemyState,
  PlayerState,
  ProtectTargetState,
} from './dungeon-types';
import { createEnemy } from './dungeon-content';

const FLOOR_1_LIVES = 3;

export const FLOOR_1_PHASES: DungeonPhase[] = [
  {
    id: 'floor1-phase1',
    name: 'Entrada da Caverna',
    objective: { type: 'DEFEAT_ALL', count: 4 },
    enemies: [{ type: 'CAVE_CREATURE_BASIC', count: 4, ai: 'EASY' }],
    map: 'dungeon-cave-entrance',
    reward: { xp: 50, gold: 20 },
  },
  {
    id: 'floor1-phase2',
    name: 'Salão dos Morcegos',
    objective: { type: 'PROTECT', turns: 5, targetId: 'crystal' },
    enemies: [{ type: 'BAT_SWARM', count: 6, ai: 'EASY', spawnWave: true }],
    map: 'dungeon-cave-hall',
    reward: { xp: 75, gold: 30 },
  },
  {
    id: 'floor1-boss',
    name: 'Covil do Golem Menor',
    objective: { type: 'DEFEAT_BOSS', bossId: 'golem-minor' },
    enemies: [{ type: 'GOLEM_MINOR', count: 1, ai: 'BOSS' }],
    map: 'dungeon-cave-boss',
    reward: { xp: 150, gold: 80 },
  },
];

const DEFAULT_PLAYER: PlayerState = {
  id: 'player',
  hp: 120,
  maxHp: 120,
  weaponId: 'cannon',
  secondaryItemId: 'shield',
  consumableIds: ['heal'],
};

export class DungeonEngine {
  private state: DungeonState;

  constructor(
    playerState: Partial<PlayerState> = {},
    phases: DungeonPhase[] = FLOOR_1_PHASES,
    private readonly difficulty: DungeonDifficulty = 'easy',
  ) {
    this.state = {
      floorId: 'floor1',
      currentPhaseIndex: 0,
      phases: phases.map(phase => ({ ...phase, reward: { ...phase.reward } })),
      playerState: { ...DEFAULT_PLAYER, ...playerState },
      enemies: [],
      protectTarget: undefined,
      protectedTurns: 0,
      lives: FLOOR_1_LIVES,
      localXp: 0,
      localGold: 0,
      status: 'IN_PROGRESS',
    };
    this.resetPhaseState();
  }

  getState(): DungeonState {
    return {
      ...this.state,
      phases: this.state.phases.map(phase => ({ ...phase, reward: { ...phase.reward } })),
      playerState: { ...this.state.playerState, consumableIds: [...this.state.playerState.consumableIds] },
      enemies: this.state.enemies.map(enemy => ({ ...enemy })),
      protectTarget: this.state.protectTarget ? { ...this.state.protectTarget } : undefined,
    };
  }

  getCurrentPhase(): DungeonPhase {
    return this.state.phases[this.state.currentPhaseIndex];
  }

  updatePlayerLoadout(loadout: Pick<PlayerState, 'weaponId' | 'secondaryItemId' | 'consumableIds'>): void {
    this.state.playerState = {
      ...this.state.playerState,
      weaponId: loadout.weaponId,
      secondaryItemId: loadout.secondaryItemId,
      consumableIds: [...loadout.consumableIds],
    };
  }

  damageEnemy(enemyId: string, amount: number): void {
    const enemy = this.state.enemies.find(candidate => candidate.id === enemyId);
    if (!enemy || !enemy.alive || this.state.status === 'FAILED') return;
    enemy.hp = Math.max(0, enemy.hp - Math.max(0, amount));
    enemy.alive = enemy.hp > 0;
    this.syncObjectiveStatus();
  }

  completeCurrentPhase(): void {
    if (this.state.status === 'IN_PROGRESS') this.state.status = 'PHASE_COMPLETE';
  }

  addEnemy(enemy: EnemyState): void {
    if (this.state.status !== 'IN_PROGRESS') return;
    this.state.enemies.push({ ...enemy });
  }

  setEnemyPosition(enemyId: string, x: number, y: number): void {
    const enemy = this.state.enemies.find(candidate => candidate.id === enemyId);
    if (!enemy) return;
    enemy.x = x;
    enemy.y = y;
  }

  damagePlayer(amount: number): void {
    if (this.state.status === 'FAILED') return;
    this.state.playerState.hp = Math.max(0, this.state.playerState.hp - Math.max(0, amount));
    if (this.state.playerState.hp === 0) this.loseLife();
  }

  damageProtectTarget(amount: number): void {
    if (!this.state.protectTarget || this.state.status === 'FAILED') return;
    this.state.protectTarget.hp = Math.max(0, this.state.protectTarget.hp - Math.max(0, amount));
    this.syncObjectiveStatus();
  }

  recordProtectedTurn(): void {
    const objective = this.getCurrentPhase().objective;
    if (objective.type !== 'PROTECT' || this.state.status !== 'IN_PROGRESS') return;
    this.state.protectedTurns += 1;
    this.syncObjectiveStatus();
  }

  advancePhase(): void {
    if (this.state.status !== 'PHASE_COMPLETE') return;

    const completedPhase = this.getCurrentPhase();
    this.collectReward(completedPhase);

    if (this.state.currentPhaseIndex >= this.state.phases.length - 1) {
      this.state.status = 'FLOOR_COMPLETE';
      return;
    }

    this.state.currentPhaseIndex += 1;
    this.state.status = 'IN_PROGRESS';
    this.resetPhaseState();
  }

  checkObjective(): boolean {
    const objective = this.getCurrentPhase().objective;

    if (objective.type === 'DEFEAT_ALL') {
      return this.state.enemies.every(enemy => !enemy.alive);
    }

    if (objective.type === 'PROTECT') {
      if (!this.state.protectTarget || this.state.protectTarget.hp <= 0) return false;
      return this.state.protectedTurns >= (objective.turns ?? 0);
    }

    if (objective.type === 'DEFEAT_BOSS') {
      return this.state.enemies
        .filter(enemy => enemy.id === objective.bossId || enemy.type === objective.bossId || enemy.type === 'GOLEM_MINOR')
        .every(enemy => !enemy.alive);
    }

    return false;
  }

  collectReward(phase: DungeonPhase): void {
    this.state.localXp += phase.reward.xp;
    this.state.localGold += phase.reward.gold;
  }

  loseLife(): void {
    this.state.lives = Math.max(0, this.state.lives - 1);
    if (this.state.lives === 0) {
      this.state.status = 'FAILED';
      return;
    }

    this.state.status = 'IN_PROGRESS';
    this.state.playerState.hp = this.state.playerState.maxHp;
    this.resetPhaseState();
  }

  applyEnemyTurn(enemy: EnemyState): void {
    if (!enemy.alive || this.state.status !== 'IN_PROGRESS') return;
    if (this.getCurrentPhase().objective.type === 'PROTECT' && this.state.protectTarget) {
      this.damageProtectTarget(enemy.type === 'BAT_SWARM' ? 14 : 10);
      return;
    }
    this.damagePlayer(enemy.type === 'GOLEM_MINOR' ? 24 : 12);
  }

  private syncObjectiveStatus(): void {
    if (this.state.status !== 'IN_PROGRESS') return;

    const objective = this.getCurrentPhase().objective;
    if (objective.type === 'PROTECT' && (!this.state.protectTarget || this.state.protectTarget.hp <= 0)) {
      this.loseLife();
      return;
    }

    if (this.checkObjective()) {
      this.state.status = 'PHASE_COMPLETE';
    }
  }

  private resetPhaseState(): void {
    const phase = this.getCurrentPhase();
    this.state.enemies = this.createEnemies(phase);
    this.state.protectedTurns = 0;
    this.state.protectTarget = this.createProtectTarget(phase);
  }

  private createEnemies(phase: DungeonPhase): EnemyState[] {
    return phase.enemies.flatMap(config => {
      return Array.from({ length: config.count }, (_, index) => {
        const enemy = createEnemy(config.type, this.difficulty);
        enemy.id = config.type === 'GOLEM_MINOR' ? 'golem-minor' : `${phase.id}-${config.type.toLowerCase()}-${index + 1}`;
        enemy.ai = config.ai;
        if (config.type === 'GIANT_BAT_BOSS') {
          enemy.maxHp = this.difficulty === 'heroic' ? 70000 : this.difficulty === 'hard' ? 30000 : this.difficulty === 'medium' ? 15000 : 10000;
          enemy.hp = enemy.maxHp;
        } else if (config.type === 'TREANT_BOSS') {
          enemy.maxHp = this.difficulty === 'heroic' ? 1800 : this.difficulty === 'hard' ? 900 : this.difficulty === 'medium' ? 520 : 320;
          enemy.hp = enemy.maxHp;
        }
        return enemy;
      });
    });
  }

  private createProtectTarget(phase: DungeonPhase): ProtectTargetState | undefined {
    if (phase.objective.type !== 'PROTECT' || !phase.objective.targetId) return undefined;
    return {
      id: phase.objective.targetId,
      hp: phase.objective.targetId === 'MYSTIC_BEETLE_NPC' ? 220 : 120,
      maxHp: phase.objective.targetId === 'MYSTIC_BEETLE_NPC' ? 220 : 120,
    };
  }
}
