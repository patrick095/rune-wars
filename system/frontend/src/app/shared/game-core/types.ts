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

export type ItemCategory = 'weapon' | 'secondary' | 'consumable' | 'armor' | 'accessory' | 'material';

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
  icon: string;
  description?: string;
  stats?: ItemStats;
  /** Reference id to the base definition (weapon id, consumable id, etc.) */
  definitionId?: string;
  quantity?: number;
  usesTurn?: boolean;
}
