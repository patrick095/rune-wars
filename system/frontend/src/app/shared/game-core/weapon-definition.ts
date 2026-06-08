import { ProjectileConfig } from './projectile-config';

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
}
