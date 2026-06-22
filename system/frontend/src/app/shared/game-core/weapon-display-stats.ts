import { PROJECTILE_GRAVITY } from './projectile-physics';
import { InventoryItem, ItemStats } from './types';
import { getEffectiveItemStats } from './combat-loadout';
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

const RARITY_BONUS_MAP: Record<string, number> = { common: 1.00, uncommon: 1.02, rare: 1.04, heroic: 1.07 };

function effectiveDamage(baseDamage: number, rarity?: string, upgradeLevel?: number): number {
  const mult = RARITY_BONUS_MAP[rarity ?? 'common'] ?? 1.00;
  return Math.round(baseDamage * mult) + (upgradeLevel ?? 0);
}

export function getWeaponDisplayStatsByItemId(
  itemBaseId?: string,
  rarity?: string,
  upgradeLevel?: number,
): DisplayStatEntry[] {
  const weapon = getWeaponDefinitionByItemId(itemBaseId);
  if (!weapon) return [];

  return [
    { key: 'Dano', value: effectiveDamage(weapon.baseDamage, rarity, upgradeLevel) },
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
    item.rarity,
    item.upgrade_level,
  );
  if (weaponStats.length) return weaponStats;

  const effectiveStats = getEffectiveItemStats(item);
  const displayStats: ItemStats = {};
  for (const key of Object.keys(item.stats ?? {})) {
    displayStats[key] = effectiveStats[key] ?? item.stats?.[key];
  }
  return getGenericDisplayStats(displayStats);
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
