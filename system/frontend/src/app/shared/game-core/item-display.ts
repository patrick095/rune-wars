import { ItemRarity, RARITY_LABEL } from './rarity';
import { ITEM_CATALOG } from './item-catalog';

// ---------------------------------------------------------------------------
// Enhancement Stone — mapa de ícones por nível (0–5)
// ---------------------------------------------------------------------------

export const ENHANCEMENT_STONE_ICONS: Record<number, string> = {
  0: 'assets/items/materials/enhancement_stone_0.png',
  1: 'assets/items/materials/enhancement_stone_1.png',
  2: 'assets/items/materials/enhancement_stone_2.png',
  3: 'assets/items/materials/enhancement_stone_3.png',
  4: 'assets/items/materials/enhancement_stone_4.png',
  5: 'assets/items/materials/enhancement_stone_5.png',
};

// ---------------------------------------------------------------------------
// Helpers de exibição
// ---------------------------------------------------------------------------

/**
 * Returns the icon path for an enhancement stone at the given upgrade level.
 * Clamps to range [0, 5].
 */
export function getEnhancementStoneIcon(upgradeLevel: number | string | null | undefined): string {
  const numericLevel = Number(upgradeLevel ?? 0);
  const parsedLevel = Number.isFinite(numericLevel) ? Math.trunc(numericLevel) : 0;
  const level = Math.min(Math.max(parsedLevel, 0), 5);
  return ENHANCEMENT_STONE_ICONS[level];
}

/**
 * Returns a display label for a fragment item combined with its rarity.
 * Example: getFragmentLabel('fragment_weapon', 'rare') === 'Fragmento de Arma (Raro)'
 */
export function getFragmentLabel(itemId: string, rarity: ItemRarity): string {
  const item = ITEM_CATALOG[itemId];
  if (!item) return itemId;
  return `${item.name} (${RARITY_LABEL[rarity]})`;
}
