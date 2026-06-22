import type { MapName } from "../scenes/battle.scene";

export type DungeonDifficulty = "easy" | "medium" | "hard" | "heroic";
export type DungeonBattleObjective = "TRAVERSE" | "DEFEAT_BOSS" | "DEFEAT_ALL";
export type DungeonMonsterType = "ACID_BAT" | "GIANT_BAT_BOSS";
export type DungeonMonsterBehavior = "HORIZONTAL_FLYER" | "BOSS_FLYER";

export interface DungeonMonsterDefinition {
    type: DungeonMonsterType;
    name: string;
    count: number;
    baseHp: number;
    behavior: DungeonMonsterBehavior;
    width: number;
    height: number;
    patrolRange: number;
    baseDamage: number;
}

export interface DungeonBattleStageConfig {
    floor: number;
    stage: number;
    mapName: MapName;
    objective: DungeonBattleObjective;
    playerStartX: number;
    portalX?: number;
    monsters: DungeonMonsterDefinition[];
}

const DIFFICULTY_MULTIPLIER: Record<DungeonDifficulty, number> = {
    easy: 1,
    medium: 1.5,
    hard: 3,
    heroic: 7,
};

const STAGES: DungeonBattleStageConfig[] = [
    {
        floor: 1,
        stage: 1,
        mapName: "dungeon_f1_s1",
        objective: "TRAVERSE",
        playerStartX: 1124,
        portalX: 3180,
        monsters: [
            {
                type: "ACID_BAT",
                name: "Morcego Ácido",
                count: 12,
                baseHp: 1000,
                behavior: "HORIZONTAL_FLYER",
                width: 58,
                height: 58,
                patrolRange: 130,
                baseDamage: 120,
            },
        ],
    },
    {
        floor: 1,
        stage: 2,
        mapName: "dungeon_f1_s2",
        objective: "DEFEAT_BOSS",
        playerStartX: 1124,
        monsters: [
            {
                type: "GIANT_BAT_BOSS",
                name: "Morcego Gigante",
                count: 1,
                baseHp: 10000,
                behavior: "BOSS_FLYER",
                width: 148,
                height: 148,
                patrolRange: 220,
                baseDamage: 420,
            },
        ],
    },
];

export function dungeonMonsterFrameKey(
    type: DungeonMonsterType,
    frame: number,
): string {
    return `dungeon_enemy_${type}_${frame}`;
}

export function dungeonMonsterAssetPath(
    mapName: MapName,
    type: DungeonMonsterType,
    frame: number,
): string | null {
    if (mapName === "dungeon_f1_s1") {
        return `assets/dungeon/floor1/stage1/enemies/${type}/${frame}.png`;
    }
    if (mapName === "dungeon_f1_s2") {
        return `assets/dungeon/floor1/stage2/enemies/${type}/${frame}.png`;
    }
    return null;
}

export function scaleDungeonHp(
    baseHp: number,
    difficulty: DungeonDifficulty,
): number {
    return Math.round(baseHp * DIFFICULTY_MULTIPLIER[difficulty]);
}

export function scaleDungeonDamage(
    baseDamage: number,
    difficulty: DungeonDifficulty,
): number {
    return Math.round(
        baseDamage * Math.sqrt(DIFFICULTY_MULTIPLIER[difficulty]),
    );
}

export function getDungeonBattleStage(
    mapName: MapName,
    floor = 1,
    stage = 1,
): DungeonBattleStageConfig | null {
    return (
        STAGES.find((item) => item.floor === floor && item.stage === stage) ??
        STAGES.find((item) => item.mapName === mapName) ??
        null
    );
}
