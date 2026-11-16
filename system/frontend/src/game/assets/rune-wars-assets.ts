import Phaser from 'phaser';
import assetCatalog from '../../assets/rune-wars/asset-catalog.json';
import {
  AssetCatalogV2,
  CharacterAnimation,
  CharacterFrameId,
  CharacterLayer,
  RUNE_WARS_ANIMATION_DEFINITIONS,
  RUNE_WARS_LEGACY_RACES,
  RUNE_WARS_RENDER_ORDER_V2,
  RUNE_WARS_REQUIRED_RACES,
  RuneWarsRaceId,
  WeaponVisualState,
} from '../character/asset-manifest.types';
import { getWeaponVisualProfile } from '../character/weapon-visual-profile';

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
  schemaVersion?: number;
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

type RuneWarsRuntimeCatalog = Partial<RuneWarsCatalog> & Partial<AssetCatalogV2> & {
  schemaVersion?: number;
  items?: RuneWarsCatalogItem[];
};

export const RUNE_WARS_ASSETS = assetCatalog as RuneWarsRuntimeCatalog;

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
  'bow_wood',
  'staff_runic',
] as const;

export const RUNE_WARS_CANONICAL_ANIMATIONS = RUNE_WARS_ANIMATION_DEFINITIONS;
export const RUNE_WARS_CANONICAL_RENDER_ORDER = RUNE_WARS_RENDER_ORDER_V2;
export const RUNE_WARS_CANONICAL_RACES = RUNE_WARS_REQUIRED_RACES;
export const RUNE_WARS_CANONICAL_FRAME_IDS = Object.values(
  RUNE_WARS_ANIMATION_DEFINITIONS,
).flatMap((animation) => animation.frames) as CharacterFrameId[];

export function runeWarsCharacterLayerKey(
  characterId: RuneWarsCharacterId,
  layer: RuneWarsCharacterLayer,
  state: RuneWarsAnimationState,
  frame = 0
): string {
  return `rw_character_${characterId}_${layer}_${state}_${frame}`;
}

export function runeWarsCharacterFrameKey(
  characterId: RuneWarsRaceId,
  layer: CharacterLayer,
  frame: CharacterFrameId
): string {
  return `rw_character_${characterId}_${layer}_${frame}`;
}

export function runeWarsCharacterAnimationKey(
  characterId: RuneWarsRaceId,
  animation: CharacterAnimation
): string {
  return `rw_character_${characterId}_${animation}`;
}

export function runeWarsItemIconKey(slot: string, itemId: string): string {
  return `rw_item_${slot}_${itemId}_icon`;
}

export function runeWarsItemLayerKey(slot: string, itemId: string, state = 'idle', frame = 0): string {
  return `rw_item_${slot}_${itemId}_${state}_${frame}`;
}

export function runeWarsWeaponStateKey(itemId: string, state: WeaponVisualState): string {
  return `rw_item_weapon_${itemId}_${state}`;
}

export function runeWarsProjectileKey(weaponId: string, asset: RuneWarsProjectileAsset): string {
  return `rw_projectile_${weaponId}_${asset}`;
}

export function findRuneWarsItem(itemId: string, slot?: string): RuneWarsCatalogItem | undefined {
  return RUNE_WARS_ASSETS.items?.find((item) => item.id === itemId && (!slot || item.slot === slot));
}

export function runeWarsWeaponLayerKey(weaponId: string): string {
  return RUNE_WARS_BATTLE_WEAPONS.includes(weaponId as (typeof RUNE_WARS_BATTLE_WEAPONS)[number])
    ? runeWarsWeaponStateKey(weaponId, 'weapon_aim')
    : runeWarsItemLayerKey('weapon', weaponId, 'idle');
}

export function runeWarsWeaponFireLayerKey(weaponId: string): string {
  const profile = getWeaponVisualProfile(weaponId);
  return runeWarsWeaponStateKey(weaponId, profile.weaponState);
}

const RUNE_WARS_WEAPON_FIRE_FALLBACKS = new Set(['bow_wood', 'staff_runic']);

export function preloadRuneWarsAssets(scene: Phaser.Scene): void {
  if (RUNE_WARS_ASSETS.schemaVersion === 2) {
    preloadRuneWarsV2Assets(scene);
  }

  for (const character of RUNE_WARS_ASSETS.characters ?? []) {
    for (const state of character.availableStates) {
      for (const layer of character.layers) {
        scene.load.image(
          runeWarsCharacterLayerKey(character.id, layer, state),
          `${RUNE_WARS_ASSETS.root}/characters/${character.id}/${layer}/${state}_0.png`
        );
      }
    }
  }

  for (const item of RUNE_WARS_ASSETS.items ?? []) {
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

  for (const projectile of RUNE_WARS_ASSETS.projectiles ?? []) {
    if (!('weaponId' in projectile)) continue;
    scene.load.image(runeWarsProjectileKey(projectile.weaponId, 'projectile'), projectile.projectileAsset);
    scene.load.image(runeWarsProjectileKey(projectile.weaponId, 'trail'), projectile.trailAsset);
    scene.load.image(runeWarsProjectileKey(projectile.weaponId, 'impact'), projectile.impactAsset);
  }
}

function preloadRuneWarsV2Assets(scene: Phaser.Scene): void {
  const root = RUNE_WARS_ASSETS.root ?? 'assets/rune-wars';
  const races = [
    ...(RUNE_WARS_ASSETS.races ?? [...RUNE_WARS_REQUIRED_RACES]),
    ...(RUNE_WARS_ASSETS.legacyRaces ?? [...RUNE_WARS_LEGACY_RACES]),
  ] as RuneWarsRaceId[];
  const renderOrder = (RUNE_WARS_ASSETS.renderOrder ?? [
    ...RUNE_WARS_RENDER_ORDER_V2,
  ]) as CharacterLayer[];

  for (const race of races) {
    for (const frame of RUNE_WARS_CANONICAL_FRAME_IDS) {
      for (const layer of renderOrder) {
        scene.load.image(
          runeWarsCharacterFrameKey(race, layer, frame),
          `${root}/characters/${race}/${layer}/${frame}.png`
        );
      }
    }
  }

  for (const weapon of RUNE_WARS_ASSETS.weapons ?? []) {
    for (const state of [
      'weapon_idle',
      'weapon_ready',
      'weapon_aim',
      'weapon_fire',
    ] as const) {
      const fileState =
        state === 'weapon_fire' && RUNE_WARS_WEAPON_FIRE_FALLBACKS.has(weapon.id)
          ? 'weapon_aim'
          : state;
      scene.load.image(
        runeWarsWeaponStateKey(weapon.id, state),
        `${root}/items/weapon/${weapon.id}/${fileState}.png`
      );
    }
  }

  for (const projectile of RUNE_WARS_ASSETS.projectiles ?? []) {
    if (!('id' in projectile)) continue;
    scene.load.image(
      `rw_projectile_v2_${projectile.id}`,
      projectile.asset
    );
  }

  for (const effect of RUNE_WARS_ASSETS.effects ?? []) {
    if (!effect.asset) continue;
    scene.load.image(`rw_effect_${effect.id}`, effect.asset);
  }
}
