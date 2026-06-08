export enum EquipmentSlot {
  MAIN_HAND = 'main_hand',
  OFF_HAND = 'off_hand',
  ARMOR = 'armor',
  HELMET = 'helmet',
  BOOTS = 'boots',
  RING_1 = 'ring_1',
  RING_2 = 'ring_2',
  NECKLACE = 'necklace',
  EARRING = 'earring',
  BRACELET = 'bracelet',
}

export enum BindingType {
  TRANSFERABLE = 'transferable',
  BIND_ON_EQUIP = 'bind_on_equip',
  NON_TRANSFERABLE = 'non_transferable',
}

export const SLOT_ALLOWED_TYPES: Record<EquipmentSlot, string[]> = {
  [EquipmentSlot.MAIN_HAND]: ['weapon_2h', 'weapon_1h'],
  [EquipmentSlot.OFF_HAND]: ['weapon_1h', 'shield', 'secondary'],
  [EquipmentSlot.ARMOR]: ['armor'],
  [EquipmentSlot.HELMET]: ['helmet'],
  [EquipmentSlot.BOOTS]: ['boots'],
  [EquipmentSlot.RING_1]: ['ring'],
  [EquipmentSlot.RING_2]: ['ring'],
  [EquipmentSlot.NECKLACE]: ['necklace'],
  [EquipmentSlot.EARRING]: ['earring'],
  [EquipmentSlot.BRACELET]: ['bracelet'],
};
