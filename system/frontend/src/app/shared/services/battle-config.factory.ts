import { AttributeCalculator } from '../game-core/attribute-calculator';
import { EquipmentSlotType, InventoryItem } from '../game-core/types';
import { sumEffectiveEquipmentStat } from '../game-core/combat-loadout';
import { Character } from '../models/character.model';
import { BattleConfig } from './game-navigator.service';
import { DungeonRoom } from './dungeon-storage.service';

export interface BattlePlayerConfig {
  characterId: string;
  name: string;
  race: string;
  maxHp: number;
  agility: number;
  strength: number;
  defense?: number;
  luck: number;
  weaponId: string;
  weaponUpgradeLevel?: number;
  weaponRarity?: string;
  consumables?: string[];
}

export interface BattleStartResult {
  matched: boolean;
  mapName: string;
  roomName: string;
  mode: string;
  vsAI: boolean;
  players: BattlePlayerConfig[];
  opponents: BattlePlayerConfig[];
}

export interface AcademyBattleOptions {
  mapId: string;
  weaponId: string;
  targetType: 'fixed' | 'mobile' | 'dummy_player';
}

export type EquippedItems = Partial<Record<EquipmentSlotType, InventoryItem>>;
export type ConsumableSelection = Array<string | null | undefined>;

const SUPPORTED_BATTLE_WEAPON_IDS = new Set([
  'cannon',
  'longbow',
  'tnt',
  'magic-grenade',
  'boomerang',
  'ice-book',
  'potion',
]);

const EQUIPMENT_TO_BATTLE_WEAPON: Record<string, string> = {
  bow_wood: 'longbow',
  staff_runic: 'ice-book',
};

type BattleMapId =
  | 'plains'
  | 'runic_forest'
  | 'arcane_ruins'
  | 'mystic_castle'
  | 'deep_mines'
  | 'dungeon_cave_entrance'
  | 'dungeon_cave_hall'
  | 'dungeon_cave_boss';

export function selectedConsumables(selection: ConsumableSelection): string[] {
  return selection.filter(Boolean) as string[];
}

export function buildPvpBattleConfig(
  roomId: string,
  result: BattleStartResult,
  currentCharacterId: string,
  fallbackConsumables: ConsumableSelection,
): BattleConfig {
  const me =
    result.players.find(player => player.characterId === currentCharacterId) ??
    result.players[0];
  const opponent = result.opponents[0];
  const playerConsumables =
    (me?.consumables ?? []).length > 0
      ? me!.consumables!
      : selectedConsumables(fallbackConsumables);

  return {
    roomId,
    mode: 'pvp',
    returnScreen: 'pvp-room',
    rewardMode: 'pvp',
    completeBattle: true,
    mapName: result.mapName,
    vsAI: result.vsAI,
    roomName: result.roomName,
    playerName: me?.name,
    playerRace: me?.race,
    playerMaxHp: me?.maxHp,
    playerAgility: me?.agility,
    playerWeaponId: me?.weaponId,
    playerWeaponUpgradeLevel: me?.weaponUpgradeLevel,
    playerWeaponRarity: me?.weaponRarity,
    playerConsumables,
    playerStrength: me?.strength,
    playerDefense: me?.defense,
    playerLuck: me?.luck,
    opponentName: opponent?.name,
    opponentRace: opponent?.race,
    aiMaxHp: opponent?.maxHp,
    aiAgility: opponent?.agility,
    aiWeaponId: opponent?.weaponId,
    aiWeaponUpgradeLevel: opponent?.weaponUpgradeLevel,
    aiWeaponRarity: opponent?.weaponRarity,
    aiStrength: opponent?.strength,
    aiDefense: opponent?.defense,
    aiLuck: opponent?.luck,
  };
}

export function buildAcademyBattleConfig(
  config: AcademyBattleOptions,
  character: Character | null,
  equippedItems: EquippedItems,
): BattleConfig {
  const selectedWeapon = config.weaponId || equippedItems.mainHand?.item_base_id || 'cannon';
  const player = buildLocalPlayerConfig(character, equippedItems, {
    selectedWeapon,
    consumables: [],
  });

  return {
    mode: 'pvp',
    returnScreen: 'academy',
    rewardMode: 'none',
    mapName: normalizeAcademyMapId(config.mapId),
    vsAI: true,
    roomName: 'Academia',
    difficulty: difficultyForAcademyTarget(config.targetType),
    ...player,
    opponentName: opponentNameForAcademyTarget(config.targetType),
    opponentRace: 'human',
    aiMaxHp: config.targetType === 'dummy_player' ? 100 : 1,
    aiAgility: config.targetType === 'mobile' ? 65 : 0,
    aiWeaponId: 'cannon',
  };
}

export function buildDungeonBattleConfig(
  room: DungeonRoom,
  character: Character | null,
  equippedItems: EquippedItems,
  consumableSelection: ConsumableSelection,
): BattleConfig {
  return {
    roomId: room.id,
    mode: 'dungeon',
    mapName: mapNameForDungeonRoom(room),
    returnScreen: 'dungeon-room',
    rewardMode: 'dungeon',
    completeBattle: false,
    dungeonFloor: room.floor,
    dungeonStage: room.current_stage,
    vsAI: true,
    roomName: `Dungeon · Andar ${room.floor}`,
    difficulty: room.difficulty,
    ...buildLocalPlayerConfig(character, equippedItems, {
      consumables: selectedConsumables(consumableSelection),
    }),
    opponentName: opponentNameForDungeonRoom(room),
    opponentRace: 'dwarf',
    aiMaxHp: dungeonAiHpForRoom(room),
    aiAgility: dungeonAiAgilityForRoom(room),
    aiWeaponId: 'cannon',
  };
}

export function mapNameForDungeonRoom(room: DungeonRoom): 'dungeon_f1_s1' | 'dungeon_f1_s2' | 'dungeon_cave_hall' {
  if (room.floor === 1 && room.current_stage >= 2) return 'dungeon_f1_s2';
  if (room.floor === 1) return 'dungeon_f1_s1';
  return 'dungeon_cave_hall';
}

export function opponentNameForDungeonRoom(room: DungeonRoom): string {
  if (room.floor === 1 && room.current_stage >= 2) return 'Morcego Gigante';
  return 'Morcego Ácido';
}

export function dungeonAiHpForRoom(room: DungeonRoom): number {
  const base = room.current_stage >= room.stage_count ? 10000 : 1000;
  return Math.round(base * dungeonDifficultyMultiplier(room.difficulty));
}

export function dungeonAiAgilityForRoom(room: DungeonRoom): number {
  if (room.difficulty === 'heroic') return 72;
  if (room.difficulty === 'hard') return 62;
  return 50;
}

export function dungeonDifficultyMultiplier(difficulty: DungeonRoom['difficulty']): number {
  switch (difficulty) {
    case 'medium':
      return 1.5;
    case 'hard':
      return 3;
    case 'heroic':
      return 7;
    default:
      return 1;
  }
}

function buildLocalPlayerConfig(
  character: Character | null,
  equippedItems: EquippedItems,
  options: {
    selectedWeapon?: string;
    consumables: string[];
  },
): Pick<
  BattleConfig,
  | 'playerName'
  | 'playerRace'
  | 'playerMaxHp'
  | 'playerAgility'
  | 'playerWeaponId'
  | 'playerWeaponUpgradeLevel'
  | 'playerWeaponRarity'
  | 'playerConsumables'
  | 'playerStrength'
  | 'playerDefense'
  | 'playerLuck'
> {
  const stats = new AttributeCalculator().calculate({
    level: character?.level ?? 1,
    strength: character?.strength ?? 0,
    agility: character?.agility ?? 0,
    vitality: character?.vitality ?? 0,
    luck: character?.luck ?? 10,
  });
  const mainHand = equippedItems.mainHand;
  const equippedBattleWeaponId = resolveBattleWeaponId(mainHand?.item_base_id);
  const selectedWeapon = options.selectedWeapon || equippedBattleWeaponId || 'cannon';
  const usesEquippedWeapon = !!mainHand && selectedWeapon === equippedBattleWeaponId;
  const baseAgility = character?.agility && character.agility > 0 ? character.agility : 50;

  return {
    playerName: character?.name,
    playerRace: character?.race,
    playerMaxHp: stats.maxHp + equippedNumberStat(equippedItems, 'hp', 0),
    playerAgility: baseAgility +
      equippedNumberStat(equippedItems, 'agility', 0) +
      equippedNumberStat(equippedItems, 'speed', 0),
    playerWeaponId: selectedWeapon,
    playerWeaponUpgradeLevel: usesEquippedWeapon ? mainHand?.upgrade_level ?? 0 : 0,
    playerWeaponRarity: usesEquippedWeapon ? mainHand?.rarity ?? 'common' : 'common',
    playerConsumables: options.consumables,
    playerStrength: (character?.strength ?? 0) +
      equippedNumberStat(equippedItems, 'strength', 0) +
      equippedNumberStat(equippedItems, 'attack', 0),
    playerDefense: Math.min(
      stats.defense + equippedNumberStat(equippedItems, 'defense', 0) * 0.01,
      0.6,
    ),
    playerLuck: (character?.luck ?? 10) + equippedNumberStat(equippedItems, 'luck', 0),
  };
}

function resolveBattleWeaponId(itemBaseId?: string | null): string | null {
  if (!itemBaseId) return null;
  if (SUPPORTED_BATTLE_WEAPON_IDS.has(itemBaseId)) return itemBaseId;
  return EQUIPMENT_TO_BATTLE_WEAPON[itemBaseId] ?? null;
}

function equippedNumberStat(
  equippedItems: EquippedItems,
  stat: string,
  fallback: number,
): number {
  return sumEffectiveEquipmentStat(equippedItems, stat, fallback);
}

function normalizeAcademyMapId(mapId: string): BattleMapId {
  const normalized = mapId
    .replace(/^map-/, '')
    .replace(/^dungeon-cave-/, 'dungeon_cave_')
    .replace(/-/g, '_');
  const known = new Set<BattleMapId>([
    'plains',
    'runic_forest',
    'arcane_ruins',
    'mystic_castle',
    'deep_mines',
    'dungeon_cave_entrance',
    'dungeon_cave_hall',
    'dungeon_cave_boss',
  ]);
  return known.has(normalized as BattleMapId) ? normalized as BattleMapId : 'plains';
}

function difficultyForAcademyTarget(
  targetType: AcademyBattleOptions['targetType'],
): 'easy' | 'medium' | 'hard' {
  if (targetType === 'mobile') return 'medium';
  if (targetType === 'dummy_player') return 'hard';
  return 'easy';
}

function opponentNameForAcademyTarget(targetType: AcademyBattleOptions['targetType']): string {
  if (targetType === 'mobile') return 'Alvo Móvel';
  if (targetType === 'dummy_player') return 'Boneco de Duelo';
  return 'Alvo Fixo';
}
