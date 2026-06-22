export type PortalMode = 'dungeon' | 'pvp';
export type DungeonDifficulty = 'easy' | 'medium' | 'hard' | 'heroic';
export type RewardRarity = 'common' | 'uncommon' | 'rare';

export const ITEM_POOL: Record<RewardRarity, string[]> = {
  common: [
    'boomerang',
    'cannon',
    'longbow',
    'potion',
    'tnt',
    'sword_iron',
    'bow_wood',
    'armor_leather',
    'helmet_iron',
    'boots_swift',
    'ring_luck',
    'shield',
    'healing-book',
  ],
  uncommon: [
    'ice-book',
    'magic-grenade',
    'sword_steel',
    'staff_runic',
    'necklace_vitality',
    'bracelet_strength',
    'protection-totem',
    'runic-builder',
  ],
  rare: [
    'crossbow',
    'staff',
    'musket',
    'camouflage-orb',
  ],
};

export const STONE_LEVEL_BY_RARITY: Record<RewardRarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
};

export const DUNGEON_GOLD_BASE: Record<'normal' | 'boss', number[]> = {
  normal: [50, 100, 200, 300, 500],
  boss: [200, 500, 1000],
};

export const DUNGEON_GOLD_MULTIPLIER: Record<DungeonDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 4,
  heroic: 10,
};

export const PVP_GOLD_AMOUNTS = [50, 100, 200, 500];

export function pickItemBaseId(rarity: RewardRarity): string {
  const pool = ITEM_POOL[rarity] ?? ITEM_POOL.common;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickGoldAmount(amounts: number[], multiplier = 1): number {
  return amounts[Math.floor(Math.random() * amounts.length)] * multiplier;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
