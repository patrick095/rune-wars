import { InventoryItem } from './types';
import { ItemCategory } from './item-catalog';
import {
  ItemRarity,
  RARITY_BONUS,
  applyRarity,
  normalizeRarity,
} from './rarity';

/** Effective stats for a single item in combat, after rarity and upgrade bonuses are applied. */
export interface CombatItemStats {
  attack: number;
  defense: number;
  [key: string]: number;
}

/** Full combat loadout for a character ready to enter battle. */
export interface CombatLoadout {
  itemId: string;
  itemName: string;
  rarity: ItemRarity;
  upgradeLevel: number;
  effectiveStats: CombatItemStats;
}

/**
 * Builds the effective combat stats for a single item.
 *
 * Formula:
 *   stat_effective = Math.round(stat_base * RARITY_BONUS[rarity]) + upgrade_level
 *
 * The rarity multiplier is applied first (rounds to integer), then the upgrade
 * level is added as a flat bonus per stat point.
 *
 * @param item         The inventory item instance (contains base stats, rarity, upgrade_level).
 * @param rarityOverride  Optional rarity override (defaults to item.rarity ?? 'common').
 * @param upgradeLevelOverride  Optional upgrade level override (defaults to item.upgrade_level ?? 0).
 */
export function buildCombatLoadout(
  item: InventoryItem,
  rarityOverride?: string,
  upgradeLevelOverride?: number,
): CombatLoadout {
  const rarity = normalizeRarity(rarityOverride ?? item.rarity ?? 'common');
  const upgradeLevel = upgradeLevelOverride ?? item.upgrade_level ?? 0;
  const category = item.category as ItemCategory;

  // Build base stats object from item.stats or empty
  const baseStats: Record<string, number> = {};
  if (item.stats) {
    for (const [k, v] of Object.entries(item.stats)) {
      if (typeof v === 'number') {
        baseStats[k] = v;
      }
    }
  }

  // Apply rarity multiplier to primary stat via applyRarity
  const rarityApplied = applyRarity(baseStats, category, rarity);

  // Apply flat upgrade_level bonus to each numeric stat
  const effectiveStats: CombatItemStats = { attack: 0, defense: 0 };
  for (const [k, v] of Object.entries(rarityApplied)) {
    if (typeof v === 'number') {
      effectiveStats[k] = v + upgradeLevel;
    }
  }

  return {
    itemId: item.id,
    itemName: item.name,
    rarity,
    upgradeLevel,
    effectiveStats,
  };
}

/**
 * Applies rarity bonus to a raw numeric stat value.
 * Useful when the full InventoryItem is not available (e.g. building from API payload).
 *
 * stat_effective = Math.round(stat_base * RARITY_BONUS[rarity]) + upgrade_level
 */
export function applyRarityToStat(
  statValue: number,
  rarity: ItemRarity | string,
  upgradeLevel: number = 0,
): number {
  const r = normalizeRarity(rarity);
  return Math.round(statValue * RARITY_BONUS[r]) + upgradeLevel;
}

export function getEffectiveItemStats(item: InventoryItem | null | undefined): CombatItemStats {
  if (!item) return { attack: 0, defense: 0 };
  return buildCombatLoadout(item).effectiveStats;
}

export function sumEffectiveEquipmentStat(
  equippedItems: Record<string, InventoryItem | null | undefined>,
  stat: string,
  fallback = 0,
): number {
  return Object.values(equippedItems).reduce((total, item) => {
    const value = getEffectiveItemStats(item)[stat];
    return total + (typeof value === 'number' ? value : 0);
  }, fallback);
}
