import Phaser from 'phaser';
import assetCatalog from '../../assets/rune-wars/asset-catalog.json';

export type RuneWarsCharacterId = 'human' | 'dwarf' | 'elf';
export type RuneWarsAnimationState = 'idle' | 'battle';
export type RuneWarsCharacterLayer =
  | 'back'
  | 'base'
  | 'armor'
  | 'face'
  | 'hair'
  | 'helmet'
  | 'weapon'
  | 'effect';

export type RuneWarsProjectileAsset = 'projectile' | 'trail' | 'impact';

export interface RuneWarsCatalogItem {
  id: string;
  name: string;
  slot: string;
  manifest: string;
  icon: string;
  visualLayer?: RuneWarsCharacterLayer;
}

interface RuneWarsCatalog {
  scale: number;
  root: string;
  renderOrder: RuneWarsCharacterLayer[];
  characters: Array<{
    id: RuneWarsCharacterId;
    availableStates: RuneWarsAnimationState[];
    layers: RuneWarsCharacterLayer[];
  }>;
  items: RuneWarsCatalogItem[];
  projectiles: Array<{
    weaponId: string;
    projectileAsset: string;
    trailAsset: string;
    impactAsset: string;
  }>;
}

export const RUNE_WARS_ASSETS = assetCatalog as RuneWarsCatalog;

export const RUNE_WARS_RENDER_ORDER: RuneWarsCharacterLayer[] = [
  'back',
  'base',
  'armor',
  'face',
  'hair',
  'helmet',
  'weapon',
  'effect',
];

export const RUNE_WARS_BATTLE_WEAPONS = [
  'cannon',
  'longbow',
  'tnt',
  'boomerang',
  'ice-book',
  'potion',
  'magic-grenade',
] as const;

export function runeWarsCharacterLayerKey(
  characterId: RuneWarsCharacterId,
  layer: RuneWarsCharacterLayer,
  state: RuneWarsAnimationState,
  frame = 0
): string {
  return `rw_character_${characterId}_${layer}_${state}_${frame}`;
}

export function runeWarsItemIconKey(slot: string, itemId: string): string {
  return `rw_item_${slot}_${itemId}_icon`;
}

export function runeWarsItemLayerKey(slot: string, itemId: string, state = 'idle', frame = 0): string {
  return `rw_item_${slot}_${itemId}_${state}_${frame}`;
}

export function runeWarsProjectileKey(weaponId: string, asset: RuneWarsProjectileAsset): string {
  return `rw_projectile_${weaponId}_${asset}`;
}

export function findRuneWarsItem(itemId: string, slot?: string): RuneWarsCatalogItem | undefined {
  return RUNE_WARS_ASSETS.items.find((item) => item.id === itemId && (!slot || item.slot === slot));
}

export function runeWarsWeaponLayerKey(weaponId: string): string {
  return RUNE_WARS_BATTLE_WEAPONS.includes(weaponId as (typeof RUNE_WARS_BATTLE_WEAPONS)[number])
    ? runeWarsItemLayerKey('weapon', weaponId, 'aim')
    : runeWarsItemLayerKey('weapon', weaponId, 'idle');
}

export function preloadRuneWarsAssets(scene: Phaser.Scene): void {
  for (const character of RUNE_WARS_ASSETS.characters) {
    for (const state of character.availableStates) {
      for (const layer of character.layers) {
        scene.load.image(
          runeWarsCharacterLayerKey(character.id, layer, state),
          `${RUNE_WARS_ASSETS.root}/characters/${character.id}/${layer}/${state}_0.png`
        );
      }
    }
  }

  for (const item of RUNE_WARS_ASSETS.items) {
    scene.load.image(runeWarsItemIconKey(item.slot, item.id), item.icon);

    if (item.visualLayer) {
      scene.load.image(
        runeWarsItemLayerKey(item.slot, item.id, 'idle'),
        `${RUNE_WARS_ASSETS.root}/items/${item.slot}/${item.id}/idle_0.png`
      );
    }
  }

  for (const weaponId of RUNE_WARS_BATTLE_WEAPONS) {
    scene.load.image(
      runeWarsItemLayerKey('weapon', weaponId, 'aim'),
      `${RUNE_WARS_ASSETS.root}/items/weapon/${weaponId}/aim_0.png`
    );
  }

  for (const projectile of RUNE_WARS_ASSETS.projectiles) {
    scene.load.image(runeWarsProjectileKey(projectile.weaponId, 'projectile'), projectile.projectileAsset);
    scene.load.image(runeWarsProjectileKey(projectile.weaponId, 'trail'), projectile.trailAsset);
    scene.load.image(runeWarsProjectileKey(projectile.weaponId, 'impact'), projectile.impactAsset);
  }
}
