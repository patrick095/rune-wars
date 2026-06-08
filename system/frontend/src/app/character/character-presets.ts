import { PlayerBaseStats } from '../shared/game-core/player-stats';

export interface BuildPreset {
  name: string;
  stats: PlayerBaseStats;
}

export const CHARACTER_PRESETS: BuildPreset[] = [
  { name: 'DPS',        stats: { level: 50, strength: 80, agility: 40, vitality: 40, luck: 36 } },
  { name: 'Tank',       stats: { level: 50, strength: 20, agility: 60, vitality: 100, luck: 16 } },
  { name: 'Sorte',      stats: { level: 50, strength: 20, agility: 40, vitality: 60, luck: 76 } },
  { name: 'Escavador',  stats: { level: 50, strength: 60, agility: 50, vitality: 56, luck: 30 } },
  { name: 'Engenheiro', stats: { level: 50, strength: 20, agility: 80, vitality: 40, luck: 56 } },
];
