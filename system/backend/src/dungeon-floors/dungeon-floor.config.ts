export type DifficultyTrack = 'initiates' | 'adventurers' | 'champions' | 'heroes';
export type DungeonDifficulty = 'easy' | 'medium' | 'hard' | 'heroic';

export interface FloorConfig {
  floor: number;
  name: string;
  phases: number;
  boss: string;
  xpRange: [number, number];
  rarityByTrack: Record<DifficultyTrack, string>;
}

export const FLOOR_CONFIGS: FloorConfig[] = [
  {
    floor: 1, name: 'Entrada da Caverna', phases: 2, boss: 'Morcego Gigante',
    xpRange: [50, 200],
    rarityByTrack: { initiates: 'common', adventurers: 'uncommon', champions: 'rare', heroes: 'rare' },
  },
  {
    floor: 2, name: 'Raiz da Corrupção', phases: 3, boss: 'Treant da Corrupção',
    xpRange: [100, 350],
    rarityByTrack: { initiates: 'common', adventurers: 'uncommon', champions: 'rare', heroes: 'rare' },
  },
  {
    floor: 3, name: 'Floresta Corrompida', phases: 3, boss: 'Guardião Corrompido',
    xpRange: [200, 500],
    rarityByTrack: { initiates: 'uncommon', adventurers: 'rare', champions: 'epic', heroes: 'legendary' },
  },
  {
    floor: 4, name: 'Fortaleza Rúnica', phases: 4, boss: 'Comandante + Trono Rúnico',
    xpRange: [300, 700],
    rarityByTrack: { initiates: 'uncommon', adventurers: 'rare', champions: 'epic', heroes: 'legendary' },
  },
  {
    floor: 5, name: 'Núcleo do Caos', phases: 4, boss: 'Coração do Caos + Avatar do Caos',
    xpRange: [500, 1200],
    rarityByTrack: { initiates: 'rare', adventurers: 'epic', champions: 'legendary', heroes: 'legendary' },
  },
];

export function getFloorConfig(floor: number): FloorConfig | undefined {
  return FLOOR_CONFIGS.find(f => f.floor === floor);
}

export const TRACK_BY_DIFFICULTY: Record<DungeonDifficulty, DifficultyTrack> = {
  easy: 'initiates',
  medium: 'adventurers',
  hard: 'champions',
  heroic: 'heroes',
};

export function normalizeDifficulty(difficulty: string | undefined): DungeonDifficulty {
  const value = difficulty ?? 'easy';
  if (value === 'easy' || value === 'medium' || value === 'hard' || value === 'heroic') return value;
  if (value === 'initiates') return 'easy';
  if (value === 'adventurers') return 'medium';
  if (value === 'champions') return 'hard';
  if (value === 'heroes') return 'heroic';
  return 'easy';
}
