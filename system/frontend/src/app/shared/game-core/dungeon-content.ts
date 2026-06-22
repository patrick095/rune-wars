import {
    DungeonDifficulty,
    DungeonStageDefinition,
    EnemyState,
    PlayerState,
} from "./dungeon-types";
import {
    resolveAcidBatAction,
    resolveCorruptedBeetleAction,
} from "./monster-ai";

// ---------------------------------------------------------------------------
// Difficulty multipliers
// ---------------------------------------------------------------------------

export const DIFFICULTY_MULTIPLIER: Record<DungeonDifficulty, number> = {
    easy: 1.0,
    medium: 1.5,
    hard: 3.0,
    heroic: 7.0,
};

// ---------------------------------------------------------------------------
// Base stats
// ---------------------------------------------------------------------------

export const ENEMY_BASE_HP: Record<string, number> = {
    ACID_BAT: 1000,
    GIANT_BAT_BOSS: 10000,
    MYSTIC_BEETLE_NPC: 80,
    CORRUPTED_BEETLE: 60,
    TREANT_BOSS: 0, // calculado via computeBossMaxHp
    CAVE_CREATURE_BASIC: 50,
    BAT_SWARM: 30,
    GOLEM_MINOR: 120,
};

export const ENEMY_BASE_DAMAGE: Record<string, number> = {
    ACID_BAT: 15,
    GIANT_BAT_BOSS: 420,
    MYSTIC_BEETLE_NPC: 0, // NPC aliado
    CORRUPTED_BEETLE: 25,
    TREANT_BOSS: 50,
    CAVE_CREATURE_BASIC: 20,
    BAT_SWARM: 12,
    GOLEM_MINOR: 30,
};

// ---------------------------------------------------------------------------
// Enemy factory
// ---------------------------------------------------------------------------

/** Cria um inimigo escalado pela dificuldade. */
export function createEnemy(
    type: string,
    difficulty: DungeonDifficulty,
): EnemyState {
    const mult = DIFFICULTY_MULTIPLIER[difficulty];
    const baseHp = ENEMY_BASE_HP[type] ?? 50;
    const scaledHp = Math.round(baseHp * mult);
    return {
        id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: type as any,
        hp: scaledHp,
        maxHp: scaledHp,
        alive: true,
        ai: type.includes("BOSS")
            ? "BOSS"
            : type === "MYSTIC_BEETLE_NPC"
              ? "EASY"
              : "INTERMEDIATE",
    };
}

/** HP do boss baseado no dano médio da party. */
export function computeBossMaxHp(
    partyAvgDamage: number,
    difficulty: DungeonDifficulty,
): number {
    const mult = DIFFICULTY_MULTIPLIER[difficulty];
    return Math.round(50 * partyAvgDamage * mult);
}

// ---------------------------------------------------------------------------
// Boss phase plans
// ---------------------------------------------------------------------------

export type BossPhase =
    | "BASIC_ATTACK"
    | "SPREAD_X5"
    | "SUMMON_BATS"
    | "FRENZY"
    | "STOMP_AOE"
    | "ROOT_BURST"
    | "ONE_HIT";

export function bossPhasePlan(
    bossType: "GIANT_BAT_BOSS" | "TREANT_BOSS",
    difficulty: DungeonDifficulty,
): BossPhase[] {
    if (bossType === "GIANT_BAT_BOSS") {
        switch (difficulty) {
            case "easy":
                return ["BASIC_ATTACK"];
            case "medium":
                return ["BASIC_ATTACK", "SUMMON_BATS"];
            case "hard":
                return ["BASIC_ATTACK", "SUMMON_BATS", "SPREAD_X5"];
            case "heroic":
                return ["FRENZY", "SPREAD_X5", "SUMMON_BATS"]; // pula fase 1
        }
    }
    // TREANT_BOSS
    switch (difficulty) {
        case "easy":
            return ["BASIC_ATTACK"];
        case "medium":
            return ["BASIC_ATTACK", "STOMP_AOE"];
        case "hard":
            return ["BASIC_ATTACK", "STOMP_AOE", "ROOT_BURST"];
        case "heroic":
            return ["ROOT_BURST", "STOMP_AOE", "ONE_HIT"]; // pula fase 1
    }
    return ["BASIC_ATTACK"];
}

// ---------------------------------------------------------------------------
// Treant patterns
// ---------------------------------------------------------------------------

export type TreantPattern =
    | "BASIC_ATTACK"
    | "STOMP_AOE"
    | "ROOT_BURST"
    | "ONE_HIT";

export function resolveTreantAction(
    phase: TreantPattern,
    targets: PlayerState[],
): { pattern: TreantPattern; targetIds: string[] } {
    switch (phase) {
        case "STOMP_AOE":
            // AoE: atinge todos os jogadores
            return {
                pattern: "STOMP_AOE",
                targetIds: targets.map((t) => t.id),
            };
        case "ROOT_BURST":
            // Invoca 2 besouros corrompidos + AoE
            return {
                pattern: "ROOT_BURST",
                targetIds: targets.map((t) => t.id),
            };
        case "ONE_HIT": {
            // 1-hit no jogador com mais HP
            const strongest = targets.reduce(
                (a, b) => (a.hp > b.hp ? a : b),
                targets[0],
            );
            return {
                pattern: "ONE_HIT",
                targetIds: strongest ? [strongest.id] : [],
            };
        }
        default: {
            const cluster = targets.slice(0, 2);
            return {
                pattern: "BASIC_ATTACK",
                targetIds: cluster.map((t) => t.id),
            };
        }
    }
}

// ---------------------------------------------------------------------------
// Enemy phase resolver (batch)
// ---------------------------------------------------------------------------

export interface EnemyPhaseResult {
    spawned: EnemyState[];
    actions: { enemyId: string; action: string; targetIds: string[] }[];
}

export function resolveEnemyPhase(
    enemies: EnemyState[],
    players: PlayerState[],
    turn: number,
    difficulty: DungeonDifficulty,
    stageId: string,
): EnemyPhaseResult {
    const spawned: EnemyState[] = [];
    const actions: { enemyId: string; action: string; targetIds: string[] }[] =
        [];

    // f2-s1: spawn +2 ACID_BAT por turno
    if (stageId === "f2-s1") {
        spawned.push(
            createEnemy("ACID_BAT", difficulty),
            createEnemy("ACID_BAT", difficulty),
        );
    }

    for (const enemy of enemies.filter((e) => e.alive)) {
        if (enemy.type === "ACID_BAT") {
            const action = resolveAcidBatAction(enemy, players, turn);
            actions.push({
                enemyId: enemy.id,
                action: action.type,
                targetIds: action.targetId ? [action.targetId] : [],
            });
        } else if (enemy.type === "CORRUPTED_BEETLE") {
            const action = resolveCorruptedBeetleAction(enemy, players, turn);
            actions.push({
                enemyId: enemy.id,
                action: action.type,
                targetIds: action.targetId ? [action.targetId] : [],
            });
        }
        // Outros tipos: ação genérica (sem ação por ora)
    }

    return { spawned, actions };
}

// ---------------------------------------------------------------------------
// Dungeon content catalog (5 stages)
// ---------------------------------------------------------------------------

export const DUNGEON_CONTENT: DungeonStageDefinition[] = [
    {
        id: "f1-s1",
        name: "Corredor da Caverna",
        floor: 1,
        stage: 1,
        map: "dungeon-f1-s1",
        objective: { type: "TRAVERSE" },
        enemies: [{ type: "ACID_BAT" as any, count: 12, ai: "EASY" }],
        reward: { xp: 60, gold: 25 },
    },
    {
        id: "f1-s2",
        name: "Câmara do Morcego Gigante",
        floor: 1,
        stage: 2,
        map: "dungeon-f1-s2",
        objective: { type: "DEFEAT_BOSS", bossId: "GIANT_BAT_BOSS" },
        enemies: [{ type: "GIANT_BAT_BOSS" as any, count: 1, ai: "BOSS" }],
        reward: { xp: 150, gold: 80 },
    },
    {
        id: "f2-s1",
        name: "Proteger o Besouro Místico",
        floor: 2,
        stage: 1,
        map: "dungeon-f2-s1",
        objective: {
            type: "PROTECT",
            turns: 10,
            targetId: "MYSTIC_BEETLE_NPC",
        },
        enemies: [
            { type: "ACID_BAT" as any, count: 2, ai: "EASY", spawnWave: true },
        ],
        reward: { xp: 100, gold: 50 },
    },
    {
        id: "f2-s2",
        name: "Extermínio dos Besouros Corrompidos",
        floor: 2,
        stage: 2,
        map: "dungeon-f2-s2",
        objective: { type: "DEFEAT_ALL", count: 10 },
        enemies: [
            { type: "CORRUPTED_BEETLE" as any, count: 10, ai: "INTERMEDIATE" },
        ],
        reward: { xp: 120, gold: 60 },
    },
    {
        id: "f2-s3",
        name: "Boss: Treant Corrompido",
        floor: 2,
        stage: 3,
        map: "dungeon-f2-s3",
        objective: { type: "DEFEAT_BOSS", bossId: "TREANT_BOSS" },
        enemies: [{ type: "TREANT_BOSS" as any, count: 1, ai: "BOSS" }],
        reward: { xp: 250, gold: 150 },
    },
];
