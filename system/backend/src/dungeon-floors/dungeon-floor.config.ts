export type DifficultyTrack = 'initiates' | 'adventurers' | 'champions' | 'heroes';

export interface FloorConfig {
  floor: number;
  name: string;
  phases: number;
  boss: string;
  xpRange: [number, number];
  rarityByTrack: Record<DifficultyTrack, string>;
}

export const FLOOR_CONFIGS: FloorConfig[] = [
  {
    floor: 1, name: 'Cavernas dos Iniciados', phases: 3, boss: 'Golem Menor',
    xpRange: [50, 200],
    rarityByTrack: { initiates: 'common', adventurers: 'uncommon', champions: 'rare', heroes: 'epic' },
  },
  {
    floor: 2, name: 'Minas Perdidas', phases: 3, boss: 'Mestre Escavador',
    xpRange: [100, 350],
    rarityByTrack: { initiates: 'common', adventurers: 'uncommon', champions: 'rare', heroes: 'epic' },
  },
  {
    floor: 3, name: 'Floresta Corrompida', phases: 3, boss: 'Guardião Corrompido',
    xpRange: [200, 500],
    rarityByTrack: { initiates: 'uncommon', adventurers: 'rare', champions: 'epic', heroes: 'legendary' },
  },
  {
    floor: 4, name: 'Fortaleza Rúnica', phases: 4, boss: 'Comandante + Trono Rúnico',
    xpRange: [300, 700],
    rarityByTrack: { initiates: 'uncommon', adventurers: 'rare', champions: 'epic', heroes: 'legendary' },
  },
  {
    floor: 5, name: 'Núcleo do Caos', phases: 4, boss: 'Coração do Caos + Avatar do Caos',
    xpRange: [500, 1200],
    rarityByTrack: { initiates: 'rare', adventurers: 'epic', champions: 'legendary', heroes: 'legendary' },
  },
];

export function getFloorConfig(floor: number): FloorConfig | undefined {
  return FLOOR_CONFIGS.find(f => f.floor === floor);
}
