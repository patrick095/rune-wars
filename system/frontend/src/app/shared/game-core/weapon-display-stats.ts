import { PROJECTILE_GRAVITY } from './projectile-physics';
import { InventoryItem, ItemStats } from './types';
import { WeaponDefinition } from './weapon-definition';
import { WeaponSystem } from './weapon-system';

export interface DisplayStatEntry {
  key: string;
  value: number | string;
}

const weaponSystem = new WeaponSystem();

const STAT_LABELS: Record<string, string> = {
  attack: 'Ataque',
  defense: 'Defesa',
  speed: 'Velocidade',
  hp: 'HP',
  mana: 'Mana',
  weight: 'Peso',
};

export function getWeaponDefinitionByItemId(
  itemBaseId?: string,
): WeaponDefinition | undefined {
  return itemBaseId ? weaponSystem.getById(itemBaseId) : undefined;
}

export function getWeaponDisplayStatsByItemId(
  itemBaseId?: string,
): DisplayStatEntry[] {
  const weapon = getWeaponDefinitionByItemId(itemBaseId);
  if (!weapon) return [];

  return [
    { key: 'Dano', value: weapon.baseDamage },
    { key: 'Alcance', value: `${getFullForceRange(weapon)} px` },
    { key: 'Vento', value: `${formatMultiplier(weapon.physicsProfile.windInfluence)}x` },
    { key: 'Escava\u00e7\u00e3o', value: `${weapon.excavationRadius} px` },
    { key: 'Peso', value: weapon.weight },
  ];
}

export function getItemDisplayStats(item: InventoryItem | null): DisplayStatEntry[] {
  if (!item) return [];

  const weaponStats = getWeaponDisplayStatsByItemId(
    item.item_base_id ?? item.definitionId,
  );
  if (weaponStats.length) return weaponStats;

  return getGenericDisplayStats(item.stats);
}

export function getFullForceRange(weapon: WeaponDefinition): number {
  const { initialSpeed, gravityScale } = weapon.physicsProfile;
  return Math.round(
    (initialSpeed * initialSpeed) / (PROJECTILE_GRAVITY * gravityScale),
  );
}

function getGenericDisplayStats(stats?: ItemStats): DisplayStatEntry[] {
  if (!stats) return [];

  return Object.entries(stats)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ({
      key: STAT_LABELS[key] ?? key,
      value,
    }));
}

function formatMultiplier(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '');
}
