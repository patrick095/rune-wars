import { ProjectileConfig } from './projectile-config';
import { WeaponRequirements } from './weapon-requirements';

export interface ProjectilePhysicsProfile {
  gravityScale: number;
  windInfluence: number;
  initialSpeed: number;
  boomerang?: boolean;
  bounces?: number;
}

export interface WeaponDefinition {
  id: string;
  name: string;
  hands: 1 | 2;
  damageType: 'physical' | 'magical' | 'mixed';
  baseDamage: number;
  physicsProfile: ProjectilePhysicsProfile;
  impactRadius: number;
  excavationRadius: number;
  runeEffect?: string;
  requirements?: WeaponRequirements;
}

export interface WeaponAngleLimits {
  minAngle: number;
  maxAngle: number;
}

export const WEAPON_ANGLE_LIMITS: Record<string, WeaponAngleLimits> = {
  default: { minAngle: 5, maxAngle: 85 },
  mortar: { minAngle: 45, maxAngle: 85 },
  sniper: { minAngle: 5, maxAngle: 30 },
  grenade: { minAngle: 30, maxAngle: 75 },
  drill: { minAngle: 5, maxAngle: 45 },
  bouncer: { minAngle: 10, maxAngle: 80 },

  cannon: { minAngle: 45, maxAngle: 85 },
  longbow: { minAngle: 5, maxAngle: 30 },
  tnt: { minAngle: 30, maxAngle: 75 },
  boomerang: { minAngle: 10, maxAngle: 80 },
  'ice-book': { minAngle: 5, maxAngle: 45 },
  potion: { minAngle: 5, maxAngle: 85 },
};

export function getWeaponAngleLimits(weapon: string): WeaponAngleLimits {
  return WEAPON_ANGLE_LIMITS[weapon] ?? WEAPON_ANGLE_LIMITS['default'];
}
