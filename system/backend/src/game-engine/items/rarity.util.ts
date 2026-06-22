// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'heroic';

export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'accessory'
  | 'head'
  | 'legs'
  | 'secondary'
  | 'consumable'
  | 'material';

export interface ItemStats {
  attack?: number;
  defense?: number;
  speed?: number;
  hp?: number;
  mana?: number;
  [key: string]: number | undefined;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const RARITY_BONUS: Record<ItemRarity, number> = {
  common:   1.00,
  uncommon: 1.02,
  rare:     1.04,
  heroic:   1.07,
};

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common:   '#9e9e9e',
  uncommon: '#4caf50',
  rare:     '#2196f3',
  heroic:   '#ff9800',
};

export const RARITY_LABEL: Record<ItemRarity, string> = {
  common:   'Comum',
  uncommon: 'Incomum',
  rare:     'Raro',
  heroic:   'Heroico',
};

export const RARITY_SUFFIX: Record<ItemRarity, string> = {
  common:   '(Comum)',
  uncommon: '(Incomum)',
  rare:     '(Raro)',
  heroic:   '(Heroico)',
};

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Returns the primary stat key for a given item category.
 * weapon → 'attack'; armor/head/legs/secondary → 'defense'; accessory → 'defense' (default)
 */
export function getPrimaryStatKey(category: ItemCategory): string {
  switch (category) {
    case 'weapon':
      return 'attack';
    case 'armor':
    case 'head':
    case 'legs':
    case 'secondary':
      return 'defense';
    case 'accessory':
      return 'defense';
    default:
      return 'defense';
  }
}

/**
 * Applies rarity bonus to the primary stat of an item.
 * Multiplies the primary stat by RARITY_BONUS[rarity] and rounds it.
 * Other stats remain unchanged.
 */
export function applyRarity(
  stats: ItemStats,
  category: ItemCategory,
  rarity: ItemRarity,
): ItemStats {
  const primaryKey = getPrimaryStatKey(category);
  const result: ItemStats = { ...stats };
  if (result[primaryKey] !== undefined) {
    result[primaryKey] = Math.round(result[primaryKey]! * RARITY_BONUS[rarity]);
  }
  return result;
}

/**
 * Formats an item name with its rarity suffix.
 * Example: formatItemName('Canhão', 'common') === 'Canhão (Comum)'
 */
export function formatItemName(baseName: string, rarity: ItemRarity): string {
  return `${baseName} ${RARITY_SUFFIX[rarity]}`;
}

/**
 * Normalizes legacy rarity strings to the current ItemRarity type.
 * 'epic' → 'rare', 'legendary' → 'heroic', others kept if valid, default 'common'.
 */
export function normalizeRarity(legacy: string): ItemRarity {
  if (legacy === 'epic') return 'rare';
  if (legacy === 'legendary') return 'heroic';
  const valid: ItemRarity[] = ['common', 'uncommon', 'rare', 'heroic'];
  if (valid.includes(legacy as ItemRarity)) return legacy as ItemRarity;
  return 'common';
}
