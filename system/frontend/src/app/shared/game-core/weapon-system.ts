import { PROJECTILE_GRAVITY } from './projectile-physics';
import { WeaponDefinition } from './weapon-definition';

const MAX_FULL_FORCE_RANGE = 4000;
const MAX_BASE_DAMAGE = 70;
const MAX_EXCAVATION_RADIUS = 40;

const TNT_GRAVITY = 2.5;
const CANNON_GRAVITY = 1.5;
const ICE_BOOK_GRAVITY = 0.5;
const MAGIC_GRENADE_GRAVITY = 1.8;
const LONGBOW_GRAVITY = 0.8;
const POTION_GRAVITY = 1.0;
const BOOMERANG_GRAVITY = 0.6;

function speedForRangePercent(rangePercent: number, gravityScale: number): number {
  return Math.round(
    Math.sqrt(MAX_FULL_FORCE_RANGE * rangePercent * PROJECTILE_GRAVITY * gravityScale),
  );
}

function statPercent(maxValue: number, percent: number): number {
  return Math.round(maxValue * percent);
}

export class WeaponSystem {
  private static readonly WEAPONS: WeaponDefinition[] = [
    {
      id: 'cannon',
      name: 'Canhão',
      hands: 2,
      damageType: 'physical',
      baseDamage: statPercent(MAX_BASE_DAMAGE, 0.8),
      physicsProfile: {
        gravityScale: CANNON_GRAVITY,
        windInfluence: 0.25,
        initialSpeed: speedForRangePercent(0.7, CANNON_GRAVITY),
        boomerang: false,
      },
      impactRadius: 50,
      excavationRadius: statPercent(MAX_EXCAVATION_RADIUS, 0.8),
      weight: 36,
      requirements: { minStrength: 20, minLevel: 5 },
    },
    {
      id: 'longbow',
      name: 'Arco Longo',
      hands: 1,
      damageType: 'physical',
      baseDamage: statPercent(MAX_BASE_DAMAGE, 0.7),
      physicsProfile: {
        gravityScale: LONGBOW_GRAVITY,
        windInfluence: 0.6,
        initialSpeed: speedForRangePercent(0.85, LONGBOW_GRAVITY),
        boomerang: false,
      },
      impactRadius: 20,
      excavationRadius: statPercent(MAX_EXCAVATION_RADIUS, 0.5),
      weight: 18,
      requirements: { minAgility: 15 },
    },
    {
      id: 'tnt',
      name: 'TNT',
      hands: 2,
      damageType: 'physical',
      baseDamage: statPercent(MAX_BASE_DAMAGE, 0.9),
      physicsProfile: {
        gravityScale: TNT_GRAVITY,
        windInfluence: 0.1,
        initialSpeed: speedForRangePercent(0.6, TNT_GRAVITY),
        boomerang: false,
      },
      impactRadius: 80,
      excavationRadius: statPercent(MAX_EXCAVATION_RADIUS, 1),
      weight: 40,
      detonationDelay: 3000,
      requirements: { minStrength: 15, minLevel: 3 },
    },
    {
      id: 'magic-grenade',
      name: 'Granada Mágica',
      hands: 1,
      damageType: 'magical',
      baseDamage: statPercent(MAX_BASE_DAMAGE, 0.8),
      physicsProfile: {
        gravityScale: MAGIC_GRENADE_GRAVITY,
        windInfluence: 0.4,
        initialSpeed: speedForRangePercent(0.85, MAGIC_GRENADE_GRAVITY),
        boomerang: false,
      },
      impactRadius: 56,
      excavationRadius: statPercent(MAX_EXCAVATION_RADIUS, 0.8),
      weight: 26,
      detonationDelay: 3000,
      requirements: { minLevel: 5 },
    },
    {
      id: 'boomerang',
      name: 'Boomerang',
      hands: 1,
      damageType: 'physical',
      baseDamage: statPercent(MAX_BASE_DAMAGE, 1),
      physicsProfile: {
        gravityScale: BOOMERANG_GRAVITY,
        windInfluence: 0.9,
        initialSpeed: speedForRangePercent(1, BOOMERANG_GRAVITY),
        boomerang: true,
      },
      impactRadius: 15,
      excavationRadius: statPercent(MAX_EXCAVATION_RADIUS, 0.5),
      weight: 12,
      requirements: { minAgility: 10 },
    },
    {
      id: 'ice-book',
      name: 'Livro de Gelo',
      hands: 2,
      damageType: 'magical',
      baseDamage: statPercent(MAX_BASE_DAMAGE, 0.8),
      physicsProfile: {
        gravityScale: ICE_BOOK_GRAVITY,
        windInfluence: 0.3,
        initialSpeed: speedForRangePercent(0.7, ICE_BOOK_GRAVITY),
        boomerang: false,
      },
      impactRadius: 30,
      excavationRadius: statPercent(MAX_EXCAVATION_RADIUS, 0.7),
      weight: 24,
    },
    {
      id: 'potion',
      name: 'Poção',
      hands: 1,
      damageType: 'mixed',
      baseDamage: statPercent(MAX_BASE_DAMAGE, 0.7),
      physicsProfile: {
        gravityScale: POTION_GRAVITY,
        windInfluence: 0.5,
        initialSpeed: speedForRangePercent(0.85, POTION_GRAVITY),
        boomerang: false,
      },
      impactRadius: 40,
      excavationRadius: statPercent(MAX_EXCAVATION_RADIUS, 0.6),
      weight: 16,
    },
  ];

  getAll(): WeaponDefinition[] {
    return WeaponSystem.WEAPONS.slice();
  }

  getById(id: string): WeaponDefinition | undefined {
    return WeaponSystem.WEAPONS.find((w) => w.id === id);
  }

  getDefault(): WeaponDefinition {
    return WeaponSystem.WEAPONS.find((w) => w.id === 'cannon')!;
  }
}
