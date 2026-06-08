import { WeaponDefinition } from './weapon-definition';

export class WeaponSystem {
  private static readonly WEAPONS: WeaponDefinition[] = [
    {
      id: 'cannon',
      name: 'Canhão',
      hands: 2,
      damageType: 'physical',
      baseDamage: 40,
      physicsProfile: {
        gravityScale: 1.5,
        windInfluence: 0.2,
        initialSpeed: 600,
        boomerang: false,
      },
      impactRadius: 50,
      excavationRadius: 60,
    },
    {
      id: 'longbow',
      name: 'Arco Longo',
      hands: 1,
      damageType: 'physical',
      baseDamage: 25,
      physicsProfile: {
        gravityScale: 0.8,
        windInfluence: 0.8,
        initialSpeed: 800,
        boomerang: false,
      },
      impactRadius: 20,
      excavationRadius: 10,
    },
    {
      id: 'tnt',
      name: 'TNT',
      hands: 2,
      damageType: 'physical',
      baseDamage: 70,
      physicsProfile: {
        gravityScale: 2.5,
        windInfluence: 0.1,
        initialSpeed: 400,
        boomerang: false,
      },
      impactRadius: 80,
      excavationRadius: 100,
    },
    {
      id: 'boomerang',
      name: 'Boomerang',
      hands: 1,
      damageType: 'physical',
      baseDamage: 20,
      physicsProfile: {
        gravityScale: 0.6,
        windInfluence: 1.0,
        initialSpeed: 500,
        boomerang: true,
      },
      impactRadius: 15,
      excavationRadius: 0,
    },
    {
      id: 'ice-book',
      name: 'Livro de Gelo',
      hands: 2,
      damageType: 'magical',
      baseDamage: 35,
      physicsProfile: {
        gravityScale: 0.5,
        windInfluence: 0.4,
        initialSpeed: 700,
        boomerang: false,
      },
      impactRadius: 30,
      excavationRadius: 5,
    },
    {
      id: 'potion',
      name: 'Poção',
      hands: 1,
      damageType: 'mixed',
      baseDamage: 30,
      physicsProfile: {
        gravityScale: 1.0,
        windInfluence: 0.6,
        initialSpeed: 550,
        boomerang: false,
      },
      impactRadius: 40,
      excavationRadius: 0,
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
