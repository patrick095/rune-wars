export interface GameConfig {
  width: number;
  height: number;
  debugMode: boolean;
}

export interface PlayerSprite {
  x: number;
  y: number;
  color: number;
}

export type ItemCategory = 'weapon' | 'secondary' | 'consumable' | 'armor' | 'accessory' | 'material' | 'head' | 'legs';

export type EquipmentSlotType =
  | 'mainHand'
  | 'offHand'
  | 'head'
  | 'chest'
  | 'legs'
  | 'accessory1'
  | 'accessory2'
  | 'necklace'
  | 'earring'
  | 'bracelet';

export interface ItemStats {
  [key: string]: number | string;
}

/** Represents an item instance that can live in the inventory or an equipment slot. */
export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  /** Emoji icon (legacy mock data) */
  icon?: string;
  /** Path to icon image resolved from ITEM_CATALOG */
  iconPath?: string;
  description?: string;
  stats?: ItemStats;
  /** Reference to the base item definition id (backend: item_base_id) */
  definitionId?: string;
  /** Backend field: base item definition id */
  item_base_id?: string;
  /** Backend field: currently equipped slot, null when in bag */
  equipped_slot?: string | null;
  /** Backend field: item rarity */
  rarity?: string;
  /** Backend field: upgrade level */
  upgrade_level?: number;
  quantity?: number;
  usesTurn?: boolean;
}
