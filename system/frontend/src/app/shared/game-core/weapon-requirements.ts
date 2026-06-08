import { WeaponDefinition } from './weapon-definition';
import { PlayerStats } from './player-stats';

export interface WeaponRequirements {
  minStrength?: number;
  minAgility?: number;
  minVitality?: number;
  minLuck?: number;
  minLevel?: number;
}

export function canUseWeapon(stats: PlayerStats, weapon: WeaponDefinition): boolean {
  const req = weapon.requirements;
  if (!req) return true;
  if (req.minStrength && stats.strength < req.minStrength) return false;
  if (req.minAgility && stats.agility < req.minAgility) return false;
  if (req.minVitality && stats.vitality < req.minVitality) return false;
  if (req.minLuck && stats.luck < req.minLuck) return false;
  if (req.minLevel && stats.level < req.minLevel) return false;
  return true;
}
