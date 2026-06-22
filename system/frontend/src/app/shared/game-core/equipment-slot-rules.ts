import { EquipmentSlotType, InventoryItem, ItemCategory } from './types';

const ACCESSORY_SLOT_OVERRIDES: Record<string, EquipmentSlotType[]> = {
  ring_luck: ['accessory1', 'accessory2'],
  necklace_vitality: ['necklace'],
  bracelet_strength: ['bracelet'],
};

const CATEGORY_ALLOWED_SLOTS: Partial<Record<ItemCategory, EquipmentSlotType[]>> = {
  weapon: ['mainHand'],
  secondary: ['offHand'],
  armor: ['chest'],
  head: ['head'],
  legs: ['legs'],
  accessory: ['accessory1', 'accessory2'],
};

export function getAllowedEquipmentSlots(item: InventoryItem | null | undefined): EquipmentSlotType[] {
  if (!item) return [];
  const baseId = item.item_base_id ?? item.definitionId ?? '';
  return ACCESSORY_SLOT_OVERRIDES[baseId] ?? CATEGORY_ALLOWED_SLOTS[item.category] ?? [];
}

export function isItemAllowedInEquipmentSlot(
  item: InventoryItem | null | undefined,
  slot: EquipmentSlotType,
): boolean {
  return getAllowedEquipmentSlots(item).includes(slot);
}
