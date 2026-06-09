export interface Character {
  id: string;
  name: string;
  race: 'human' | 'dwarf' | 'elf';
  level: number;
  xp: number;
  strength: number;
  agility: number;
  vitality: number;
  luck: number;
  gold: number;
  created_at: string;
}
