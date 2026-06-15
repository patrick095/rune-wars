import { BadRequestException, ForbiddenException, Injectable, NotFoundException, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { PvpRoom, SlotState } from './pvp-room.entity';
import { CharacterService } from '../character/character.service';
import { ItemInstance } from '../inventory/item-instance.entity';

const WEAPON_IDS = ['cannon', 'longbow', 'tnt', 'magic-grenade', 'boomerang', 'ice-book'];
const RACES = ['human', 'elf', 'dwarf'] as const;
const BATTLE_MAPS = ['plains', 'mystic-castle', 'deep-mines', 'arcane-ruins', 'runic-forest'];

function resolveMap(slug: string | null | undefined): string {
  if (!slug || slug === 'random') {
    return BATTLE_MAPS[Math.floor(Math.random() * BATTLE_MAPS.length)];
  }
  return BATTLE_MAPS.includes(slug) ? slug : 'plains';
}

export interface BattlePlayerConfig {
  characterId: string;
  name: string;
  race: string;
  maxHp: number;
  agility: number;
  strength: number;
  luck: number;
  weaponId: string;
  consumables: string[];
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

@Injectable()
export class PvpService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PvpService.name);
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor(
    @InjectRepository(PvpRoom) private repo: Repository<PvpRoom>,
    @InjectRepository(ItemInstance) private itemRepo: Repository<ItemInstance>,
    private readonly characters: CharacterService,
  ) {}

  onModuleInit(): void {
    this.cleanupTimer = setInterval(() => this.cleanupEmptyRooms(), 30_000);
  }

  onModuleDestroy(): void {
    clearInterval(this.cleanupTimer);
  }

  async listRooms(): Promise<PvpRoom[]> {
    return this.repo.find({
      where: { status: In(['waiting', 'active']) },
      order: { createdAt: 'DESC' },
    });
  }

  async createRoom(
    userId: string,
    characterId: string,
    name?: string,
    mapName?: string
  ): Promise<{ roomId: string; name: string; mapName: string }> {
    const character = await this.characters.findOne(characterId, userId);

    const roomName = name ?? `Sala-${Date.now()}`;
    const room = this.repo.create({
      name: roomName,
      ownerCharacterId: characterId,
      playerIds: [characterId],
      playerCount: 1,
      mapName: mapName ?? 'plains',
      map_slug: 'random',
      mode: 'ranked',
      slots: [{ playerId: characterId, playerName: character.name, closed: false }],
    });
    const saved = await this.repo.save(room);
    return { roomId: saved.id, name: saved.name, mapName: saved.mapName };
  }

  async deleteRoom(id: string): Promise<void> {
    const room = await this.repo.findOne({ where: { id } });
    if (!room) throw new NotFoundException(`Room ${id} not found`);
    await this.repo.remove(room);
  }

  async joinRoom(id: string, userId: string, characterId: string): Promise<PvpRoom> {
    const character = await this.characters.findOne(characterId, userId);

    const room = await this.repo.findOne({ where: { id } });
    if (!room) throw new NotFoundException(`Room ${id} not found`);
    if (room.status === 'closed') throw new NotFoundException(`Room ${id} not found`);

    const playerIds = this.normalizePlayerIds(room);
    if (!playerIds.includes(characterId)) {
      if (playerIds.length >= room.maxPlayers) throw new BadRequestException('Sala cheia');
      playerIds.push(characterId);
    }

    room.playerIds = playerIds;
    room.playerCount = playerIds.length;
    room.status = room.playerCount >= room.maxPlayers ? 'active' : 'waiting';

    // Populate slot for this player if not already present
    const slots: SlotState[] = Array.isArray(room.slots) ? [...room.slots] : [];
    if (!slots.some(s => s.playerId === characterId)) {
      const openIdx = slots.findIndex(s => !s.playerId && !s.closed);
      const newSlot: SlotState = { playerId: characterId, playerName: character.name, closed: false };
      if (openIdx !== -1) {
        slots[openIdx] = newSlot;
      } else {
        slots.push(newSlot);
      }
      room.slots = slots;
    }

    return this.repo.save(room);
  }

  async leaveRoom(id: string, userId: string, characterId: string): Promise<{ deleted: boolean; room?: PvpRoom }> {
    await this.characters.findOne(characterId, userId);

    const room = await this.repo.findOne({ where: { id } });
    if (!room) return { deleted: true };

    const playerIds = this.normalizePlayerIds(room).filter(playerId => playerId !== characterId);
    const ownerLeft = room.ownerCharacterId === characterId;

    if (ownerLeft || playerIds.length === 0) {
      await this.repo.remove(room);
      return { deleted: true };
    }

    room.playerIds = playerIds;
    room.playerCount = playerIds.length;
    room.status = room.playerCount >= room.maxPlayers ? 'active' : 'waiting';

    return { deleted: false, room: await this.repo.save(room) };
  }

  async touchRoom(id: string, userId: string, characterId: string): Promise<void> {
    await this.characters.findOne(characterId, userId);

    const room = await this.repo.findOne({ where: { id } });
    if (!room) throw new NotFoundException(`Room ${id} not found`);
    if (!this.normalizePlayerIds(room).includes(characterId)) {
      throw new NotFoundException(`Room ${id} not found`);
    }

    await this.repo.save(room);
  }

  async findRoom(id: string): Promise<PvpRoom> {
    const room = await this.repo.findOne({ where: { id } });
    if (!room) throw new NotFoundException(`Room ${id} not found`);
    return room;
  }

  private async cleanupEmptyRooms(): Promise<void> {
    const threshold = new Date(Date.now() - 30_000);
    const staleRooms = await this.repo.find({
      where: [
        { playerCount: 0, updatedAt: LessThan(threshold) },
      ],
    });

    for (const room of staleRooms) {
      await this.repo.remove(room);
      this.logger.log(`[Lobby] Sala ${room.id} deletada por TTL`);
    }
  }

  async closeSlot(roomId: string, slotIndex: number, requesterId: string): Promise<PvpRoom> {
    const room = await this.repo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException(`Room ${roomId} not found`);
    if (room.ownerCharacterId !== requesterId) {
      throw new ForbiddenException('Apenas o dono pode fechar/abrir vagas');
    }

    const slots: SlotState[] = Array.isArray(room.slots) ? [...room.slots] : [];

    // Expand slots array if needed
    while (slots.length <= slotIndex) {
      slots.push({ playerId: null, playerName: null, closed: false });
    }

    const slot = slots[slotIndex];
    if (slot.playerId !== null) {
      throw new BadRequestException('Não é possível fechar uma vaga ocupada');
    }

    // Toggle closed state (RN18 / RN19)
    slots[slotIndex] = { ...slot, closed: !slot.closed };
    room.slots = slots;
    return this.repo.save(room);
  }

  async kickPlayer(roomId: string, slotIndex: number, requesterId: string): Promise<PvpRoom> {
    const room = await this.repo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException(`Room ${roomId} not found`);
    if (room.ownerCharacterId !== requesterId) {
      throw new ForbiddenException('Apenas o dono pode chutar jogadores');
    }

    const slots: SlotState[] = Array.isArray(room.slots) ? [...room.slots] : [];

    if (slotIndex < 0 || slotIndex >= slots.length) {
      throw new BadRequestException(`Slot ${slotIndex} inválido`);
    }

    const slot = slots[slotIndex];
    if (slot.playerId === null) {
      throw new BadRequestException('Slot está vazio');
    }

    // RN20: dono não pode chutar a si mesmo
    if (slot.playerId === requesterId) {
      throw new ForbiddenException('O dono não pode chutar a si mesmo');
    }

    const kickedId = slot.playerId;
    slots[slotIndex] = { playerId: null, playerName: null, closed: false };
    room.slots = slots;

    // Also remove from playerIds
    const playerIds = this.normalizePlayerIds(room).filter(pid => pid !== kickedId);
    room.playerIds = playerIds;
    room.playerCount = playerIds.length;
    room.status = room.playerCount >= room.maxPlayers ? 'active' : 'waiting';

    return this.repo.save(room);
  }

  async setReady(
    roomId: string,
    characterId: string,
    consumableSelection: string[],
    vsCpu = false,
  ): Promise<PvpRoom> {
    const room = await this.repo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException(`Room ${roomId} not found`);

    const playerIds = this.normalizePlayerIds(room);
    if (!playerIds.includes(characterId)) {
      throw new ForbiddenException('Personagem não está nesta sala');
    }

    if (consumableSelection.length > 5) {
      throw new BadRequestException('Máximo de 5 consumíveis permitido');
    }

    // vs_cpu is only valid for free mode with a single human player
    if (vsCpu) {
      if (room.mode !== 'free') {
        throw new BadRequestException('Modo VS CPU só está disponível no modo LIVRE');
      }
      if (playerIds.length !== 1) {
        throw new BadRequestException('VS CPU só está disponível quando há apenas 1 jogador na sala');
      }
      room.vs_cpu = true;
    }

    const slots: SlotState[] = Array.isArray(room.slots) ? [...room.slots] : [];

    const slotIdx = slots.findIndex(s => s.playerId === characterId);
    if (slotIdx === -1) {
      // Player exists in playerIds but not yet in slots — find first open slot and assign
      throw new BadRequestException('Slot do personagem não encontrado. Entre na sala novamente.');
    }

    slots[slotIdx] = {
      ...slots[slotIdx],
      ready: true,
      consumableSelection,
    };
    room.slots = slots;
    return this.repo.save(room);
  }

  async updateSettings(
    roomId: string,
    requesterId: string,
    settings: { map_slug?: string; mode?: string },
  ): Promise<PvpRoom> {
    const room = await this.repo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException(`Room ${roomId} not found`);
    if (room.ownerCharacterId !== requesterId) {
      throw new ForbiddenException('Apenas o dono pode alterar as configurações da sala');
    }

    const VALID_MAPS = ['random', 'plains', 'mystic-castle', 'deep-mines', 'arcane-ruins', 'runic-forest'];
    const VALID_MODES = ['ranked', 'free', 'guild'];

    if (settings.map_slug !== undefined) {
      if (!VALID_MAPS.includes(settings.map_slug)) {
        throw new BadRequestException(`Mapa inválido: ${settings.map_slug}`);
      }
      room.map_slug = settings.map_slug;
    }

    if (settings.mode !== undefined) {
      if (!VALID_MODES.includes(settings.mode)) {
        throw new BadRequestException(`Modo inválido: ${settings.mode}`);
      }
      // In ranked mode, always force random map
      if (settings.mode === 'ranked') {
        room.map_slug = 'random';
      }
      room.mode = settings.mode;
    }

    return this.repo.save(room);
  }

  async findMatch(roomId: string): Promise<{ matched: boolean }> {
    const room = await this.repo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException(`Room ${roomId} not found`);
    const count = this.normalizePlayerIds(room).length;
    const others = await this.repo.find({ where: { status: In(['waiting', 'active']) } });
    const found = others.some(r => r.id !== roomId && this.normalizePlayerIds(r).length === count);
    return { matched: found };
  }

  async startBattle(roomId: string, characterId?: string): Promise<BattleStartResult> {
    const room = await this.repo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException(`Room ${roomId} not found`);

    const playerIds = this.normalizePlayerIds(room);
    const slots: SlotState[] = Array.isArray(room.slots) ? room.slots : [];

    // Validate all players have a valid weapon equipped
    for (const id of playerIds) {
      const weapon = await this.itemRepo.findOne({
        where: { owner_id: id, equipped_slot: 'mainHand' },
      });
      if (!weapon || !WEAPON_IDS.includes(weapon.item_base_id)) {
        throw new BadRequestException('Todos os jogadores precisam ter uma arma equipada para iniciar a batalha.');
      }
    }

    const players = await this.loadBattlePlayers(playerIds, slots);

    // Determine caller's config (first by explicit characterId, then position 0)
    const callerConfig = characterId
      ? (players.find(p => p.characterId === characterId) ?? players[0])
      : players[0];
    const callerPlayers = [callerConfig];

    // Same-room 1v1: if 2+ real players are in the same room, pit them against each other
    if (playerIds.length >= 2) {
      const opponentPlayers = players.filter(p => p.characterId !== callerConfig.characterId);
      if (opponentPlayers.length > 0) {
        return {
          matched: true,
          mapName: resolveMap(room.map_slug),
          roomName: room.name,
          mode: room.mode ?? 'free',
          vsAI: false,
          players: callerPlayers,
          opponents: opponentPlayers,
        };
      }
    }

    // Try last-chance match lookup (different rooms)
    const others = await this.repo.find({ where: { status: In(['waiting', 'active']) } });
    const matchRoom = others.find(r => r.id !== roomId && this.normalizePlayerIds(r).length === playerIds.length);

    if (matchRoom) {
      const matchSlots: SlotState[] = Array.isArray(matchRoom.slots) ? matchRoom.slots : [];
      const opponents = await this.loadBattlePlayers(this.normalizePlayerIds(matchRoom), matchSlots);
      return {
        matched: true,
        mapName: resolveMap(room.map_slug),
        roomName: room.name,
        mode: room.mode ?? 'free',
        vsAI: false,
        players: callerPlayers,
        opponents,
      };
    }

    // No match — generate bots with similar stats
    const avgVit = players.reduce((s, p) => s + Math.round((p.maxHp - 200) / 20), 0) / Math.max(players.length, 1);
    const avgAgi = players.reduce((s, p) => s + p.agility, 0) / Math.max(players.length, 1);
    const avgStr = players.reduce((s, p) => s + p.strength, 0) / Math.max(players.length, 1);
    const bots = playerIds.map(() => this.generateBot(Math.round(avgVit), Math.round(avgAgi), Math.round(avgStr)));

    return {
      matched: false,
      mapName: resolveMap(room.map_slug),
      roomName: room.name,
      mode: room.mode ?? 'free',
      vsAI: true,
      players: callerPlayers,
      opponents: bots,
    };
  }

  private async loadBattlePlayers(characterIds: string[], slots: SlotState[] = []): Promise<BattlePlayerConfig[]> {
    const results: BattlePlayerConfig[] = [];
    for (const id of characterIds) {
      try {
        const char = await this.characters.findOneById(id);

        // Get consumable selection from the room slot
        const slot = slots.find(s => s.playerId === id);
        const consumables = slot?.consumableSelection ?? [];

        // Get equipped weapon from ItemInstance (mainHand slot)
        let weaponId: string | null = null;
        try {
          const equippedWeapon = await this.itemRepo.findOne({
            where: { owner_id: id, equipped_slot: 'mainHand' },
          });
          if (equippedWeapon) weaponId = equippedWeapon.item_base_id;
        } catch {
          // no equipped weapon — fall through to default
        }
        if (!weaponId || !WEAPON_IDS.includes(weaponId)) {
          weaponId = 'longbow';
        }

        results.push({
          characterId: char.id,
          name: char.name,
          race: char.race ?? 'human',
          maxHp: 200 + (char.vitality ?? 0) * 20,
          agility: char.agility > 0 ? char.agility : 50,
          strength: char.strength ?? 0,
          luck: char.luck ?? 10,
          weaponId,
          consumables,
        });
      } catch {
        // character not found — skip
      }
    }
    return results;
  }

  private generateBot(avgVitality: number, avgAgility: number, avgStrength = 0): BattlePlayerConfig {
    const variance = Math.floor(Math.random() * 5) - 2;
    const vitality = Math.max(0, avgVitality + variance);
    const agility = Math.max(10, avgAgility + variance);
    const strength = Math.max(0, avgStrength + variance);
    const race = RACES[Math.floor(Math.random() * RACES.length)];
    return {
      characterId: 'bot-' + Math.random().toString(36).slice(2, 8),
      name: `Bot ${race.charAt(0).toUpperCase() + race.slice(1)}`,
      race,
      maxHp: 200 + vitality * 20,
      agility,
      strength,
      luck: 10,
      weaponId: WEAPON_IDS[Math.floor(Math.random() * WEAPON_IDS.length)],
      consumables: [],
    };
  }

  private normalizePlayerIds(room: PvpRoom): string[] {
    return Array.from(new Set((room.playerIds ?? []).filter(Boolean)));
  }
}
