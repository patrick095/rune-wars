export enum Race {
  HUMAN = 'human',
  DWARF = 'dwarf',
  ELF = 'elf',
}

export const RACE_BONUSES: Record<Race, { xpMultiplier: number; craftBonus: number; dropBonus: number }> = {
  [Race.HUMAN]: { xpMultiplier: 1.05, craftBonus: 1.0, dropBonus: 1.0 },
  [Race.DWARF]: { xpMultiplier: 1.0, craftBonus: 1.05, dropBonus: 1.0 },
  [Race.ELF]:   { xpMultiplier: 1.0, craftBonus: 1.0, dropBonus: 1.05 },
};
