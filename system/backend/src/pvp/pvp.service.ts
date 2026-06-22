import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, IsNull, LessThan, Not, Repository } from "typeorm";
import { PvpRoom, SlotState } from "./pvp-room.entity";
import { CharacterService } from "../character/character.service";
import { ItemInstance } from "../inventory/item-instance.entity";
import {
    applyRarity,
    ItemCategory,
    ItemStats,
    normalizeRarity,
} from "../game-engine/items/rarity.util";
import {
    PortalSelectionResult,
    PortalService,
} from "../dungeon-rewards/portal.service";

const WEAPON_IDS = [
    "cannon",
    "longbow",
    "tnt",
    "magic-grenade",
    "boomerang",
    "ice-book",
];
const RACES = ["human", "elf", "dwarf"] as const;
const BATTLE_MAPS = [
    "plains",
    "mystic-castle",
    "deep-mines",
    "arcane-ruins",
    "runic-forest",
];

interface EquipmentStatDefinition {
    category: ItemCategory;
    stats: ItemStats;
}

const EQUIPMENT_STAT_CATALOG: Record<string, EquipmentStatDefinition> = {
    boomerang: { category: "weapon", stats: { attack: 18, speed: 2 } },
    cannon: { category: "weapon", stats: { attack: 35 } },
    "ice-book": { category: "weapon", stats: { attack: 22, mana: 10 } },
    longbow: { category: "weapon", stats: { attack: 28, speed: 1 } },
    "magic-grenade": { category: "weapon", stats: { attack: 30, mana: 5 } },
    potion: { category: "weapon", stats: { attack: 15 } },
    tnt: { category: "weapon", stats: { attack: 40 } },
    sword_iron: { category: "weapon", stats: { attack: 20 } },
    sword_steel: { category: "weapon", stats: { attack: 32 } },
    bow_wood: { category: "weapon", stats: { attack: 16, speed: 1 } },
    staff_runic: { category: "weapon", stats: { attack: 25, mana: 20 } },
    armor_leather: { category: "armor", stats: { defense: 15, speed: 1 } },
    helmet_iron: { category: "head", stats: { defense: 12 } },
    boots_swift: { category: "legs", stats: { speed: 5, defense: 5 } },
    ring_luck: { category: "accessory", stats: { hp: 5 } },
    necklace_vitality: { category: "accessory", stats: { hp: 30 } },
    bracelet_strength: { category: "accessory", stats: { attack: 12 } },
    shield: { category: "secondary", stats: { defense: 25 } },
    "healing-book": { category: "secondary", stats: { hp: 20, mana: 15 } },
    "protection-totem": {
        category: "secondary",
        stats: { defense: 18, hp: 10 },
    },
    "runic-builder": { category: "secondary", stats: { mana: 10 } },
};

function resolveMap(slug: string | null | undefined): string {
    if (!slug || slug === "random") {
        return BATTLE_MAPS[Math.floor(Math.random() * BATTLE_MAPS.length)];
    }
    return BATTLE_MAPS.includes(slug) ? slug : "plains";
}

export interface BattlePlayerConfig {
    characterId: string;
    name: string;
    race: string;
    maxHp: number;
    agility: number;
    strength: number;
    defense: number;
    luck: number;
    weaponId: string;
    weaponUpgradeLevel: number;
    weaponRarity: string;
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
        @InjectRepository(ItemInstance)
        private itemRepo: Repository<ItemInstance>,
        private readonly characters: CharacterService,
        private readonly portals: PortalService,
    ) {}

    onModuleInit(): void {
        this.cleanupTimer = setInterval(() => this.cleanupEmptyRooms(), 30_000);
    }

    onModuleDestroy(): void {
        clearInterval(this.cleanupTimer);
    }

    async listRooms(): Promise<PvpRoom[]> {
        return this.repo.find({
            where: { status: In(["waiting", "in_battle"]) },
            order: { createdAt: "DESC" },
        });
    }

    async createRoom(
        userId: string,
        characterId: string,
        name?: string,
        mapName?: string,
    ): Promise<{ roomId: string; name: string; mapName: string }> {
        const character = await this.characters.findOne(characterId, userId);

        const roomName = name ?? `Sala-${Date.now()}`;
        const room = this.repo.create({
            name: roomName,
            ownerCharacterId: characterId,
            playerIds: [characterId],
            playerCount: 1,
            mapName: mapName ?? "plains",
            map_slug: "random",
            mode: "ranked",
            slots: [
                {
                    playerId: characterId,
                    playerName: character.name,
                    closed: false,
                },
            ],
        });
        const saved = await this.repo.save(room);
        return { roomId: saved.id, name: saved.name, mapName: saved.mapName };
    }

    async deleteRoom(id: string): Promise<void> {
        const room = await this.repo.findOne({ where: { id } });
        if (!room) throw new NotFoundException(`Room ${id} not found`);
        await this.repo.remove(room);
    }

    async joinRoom(
        id: string,
        userId: string,
        characterId: string,
    ): Promise<PvpRoom> {
        const character = await this.characters.findOne(characterId, userId);

        const room = await this.repo.findOne({ where: { id } });
        if (!room) throw new NotFoundException(`Room ${id} not found`);
        if (room.status === "closed" || room.status === "in_battle")
            throw new BadRequestException("Sala não está disponível");

        const playerIds = this.normalizePlayerIds(room);
        if (!playerIds.includes(characterId)) {
            if (playerIds.length >= room.maxPlayers)
                throw new BadRequestException("Sala cheia");
            playerIds.push(characterId);
        }

        room.playerIds = playerIds;
        room.playerCount = playerIds.length;
        room.status = "waiting";

        // Populate slot for this player if not already present
        const slots: SlotState[] = Array.isArray(room.slots)
            ? [...room.slots]
            : [];
        if (!slots.some((s) => s.playerId === characterId)) {
            const openIdx = slots.findIndex((s) => !s.playerId && !s.closed);
            const newSlot: SlotState = {
                playerId: characterId,
                playerName: character.name,
                closed: false,
            };
            if (openIdx !== -1) {
                slots[openIdx] = newSlot;
            } else {
                slots.push(newSlot);
            }
            room.slots = slots;
        }

        return this.repo.save(room);
    }

    async leaveRoom(
        id: string,
        userId: string,
        characterId: string,
    ): Promise<{ deleted: boolean; room?: PvpRoom }> {
        await this.characters.findOne(characterId, userId);

        const room = await this.repo.findOne({ where: { id } });
        if (!room) return { deleted: true };

        const playerIds = this.normalizePlayerIds(room).filter(
            (playerId) => playerId !== characterId,
        );
        const ownerLeft = room.ownerCharacterId === characterId;

        if (ownerLeft || playerIds.length === 0) {
            await this.repo.remove(room);
            return { deleted: true };
        }

        room.playerIds = playerIds;
        room.playerCount = playerIds.length;
        room.status = "waiting";

        return { deleted: false, room: await this.repo.save(room) };
    }

    async touchRoom(
        id: string,
        userId: string,
        characterId: string,
    ): Promise<void> {
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

    async completeBattle(roomId: string, winnerId?: string): Promise<PvpRoom> {
        const room = await this.findRoom(roomId);
        room.status = "closed";
        room.reward_state = {
            winnerId: winnerId ?? null,
            completedAt: new Date().toISOString(),
        };
        await this.repo.save(room);
        return this.ensureRewardState(roomId);
    }

    async ensureRewardState(roomId: string): Promise<PvpRoom> {
        const room = await this.findRoom(roomId);
        const existingContextId = room.reward_state?.contextId;
        if (existingContextId) return room;

        const playerIds = this.normalizePlayerIds(room);
        if (playerIds.length === 0)
            throw new BadRequestException(
                "Sala PvP sem jogadores para recompensa",
            );

        const contextId = `pvp:${room.id}:rewards`;
        const context = this.portals.createContext({
            contextId,
            mode: "pvp",
            participantIds: playerIds,
        });
        room.reward_state = {
            ...(room.reward_state ?? {}),
            contextId,
            portals: context.portals,
            picksPerCharacter: context.picksPerCharacter,
            selections: {},
            createdAt: new Date().toISOString(),
        };
        return this.repo.save(room);
    }

    async rewards(
        roomId: string,
        body: {
            characterId?: string;
            portalIndices?: number[];
            completeBattle?: boolean;
            winnerId?: string;
        } = {},
    ): Promise<PvpRoom | PortalSelectionResult> {
        if (body.completeBattle) {
            await this.completeBattle(roomId, body.winnerId);
        }
        if (!body.characterId) return this.ensureRewardState(roomId);
        return this.selectReward(roomId, body.characterId, body.portalIndices);
    }

    async selectReward(
        roomId: string,
        characterId: string,
        portalIndices?: number[],
    ): Promise<PortalSelectionResult> {
        const room = await this.ensureRewardState(roomId);
        if (!this.normalizePlayerIds(room).includes(characterId)) {
            throw new ForbiddenException("Personagem não está nesta sala");
        }
        const contextId = String(room.reward_state?.contextId);
        const result = await this.portals.select(
            contextId,
            characterId,
            portalIndices,
        );
        const selections = {
            ...((room.reward_state?.selections as Record<string, unknown>) ??
                {}),
        };
        selections[characterId] = {
            selectedIndices: result.selectedIndices,
            gains: result.gains.map((gain) => ({
                portalIndex: gain.portalIndex,
                kind: gain.kind,
                amount: gain.amount,
                itemBaseId: gain.itemBaseId,
                rarity: gain.rarity,
                stoneLevel: gain.stoneLevel,
            })),
            selectedAt: new Date().toISOString(),
        };
        room.reward_state = {
            ...(room.reward_state ?? {}),
            selections,
        };
        await this.repo.save(room);
        return result;
    }

    private async cleanupEmptyRooms(): Promise<void> {
        const threshold = new Date(Date.now() - 30_000);
        const staleRooms = await this.repo.find({
            where: [{ playerCount: 0, updatedAt: LessThan(threshold) }],
        });

        for (const room of staleRooms) {
            await this.repo.remove(room);
            this.logger.log(`[Lobby] Sala ${room.id} deletada por TTL`);
        }
    }

    async closeSlot(
        roomId: string,
        slotIndex: number,
        requesterId: string,
    ): Promise<PvpRoom> {
        const room = await this.repo.findOne({ where: { id: roomId } });
        if (!room) throw new NotFoundException(`Room ${roomId} not found`);
        if (room.ownerCharacterId !== requesterId) {
            throw new ForbiddenException(
                "Apenas o dono pode fechar/abrir vagas",
            );
        }

        const slots: SlotState[] = Array.isArray(room.slots)
            ? [...room.slots]
            : [];

        // Expand slots array if needed
        while (slots.length <= slotIndex) {
            slots.push({ playerId: null, playerName: null, closed: false });
        }

        const slot = slots[slotIndex];
        if (slot.playerId !== null) {
            throw new BadRequestException(
                "Não é possível fechar uma vaga ocupada",
            );
        }

        // Toggle closed state (RN18 / RN19)
        slots[slotIndex] = { ...slot, closed: !slot.closed };
        room.slots = slots;
        return this.repo.save(room);
    }

    async kickPlayer(
        roomId: string,
        slotIndex: number,
        requesterId: string,
    ): Promise<PvpRoom> {
        const room = await this.repo.findOne({ where: { id: roomId } });
        if (!room) throw new NotFoundException(`Room ${roomId} not found`);
        if (room.ownerCharacterId !== requesterId) {
            throw new ForbiddenException("Apenas o dono pode chutar jogadores");
        }

        const slots: SlotState[] = Array.isArray(room.slots)
            ? [...room.slots]
            : [];

        if (slotIndex < 0 || slotIndex >= slots.length) {
            throw new BadRequestException(`Slot ${slotIndex} inválido`);
        }

        const slot = slots[slotIndex];
        if (slot.playerId === null) {
            throw new BadRequestException("Slot está vazio");
        }

        // RN20: dono não pode chutar a si mesmo
        if (slot.playerId === requesterId) {
            throw new ForbiddenException("O dono não pode chutar a si mesmo");
        }

        const kickedId = slot.playerId;
        slots[slotIndex] = { playerId: null, playerName: null, closed: false };
        room.slots = slots;

        // Also remove from playerIds
        const playerIds = this.normalizePlayerIds(room).filter(
            (pid) => pid !== kickedId,
        );
        room.playerIds = playerIds;
        room.playerCount = playerIds.length;
        room.status = "waiting";

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
            throw new ForbiddenException("Personagem não está nesta sala");
        }

        if (consumableSelection.length > 5) {
            throw new BadRequestException("Máximo de 5 consumíveis permitido");
        }

        // vs_cpu is only valid for free mode with a single human player
        if (vsCpu) {
            if (room.mode !== "free") {
                throw new BadRequestException(
                    "Modo VS CPU só está disponível no modo LIVRE",
                );
            }
            if (playerIds.length !== 1) {
                throw new BadRequestException(
                    "VS CPU só está disponível quando há apenas 1 jogador na sala",
                );
            }
            room.vs_cpu = true;
        }

        const slots: SlotState[] = Array.isArray(room.slots)
            ? [...room.slots]
            : [];

        const slotIdx = slots.findIndex((s) => s.playerId === characterId);
        if (slotIdx === -1) {
            // Player exists in playerIds but not yet in slots — find first open slot and assign
            throw new BadRequestException(
                "Slot do personagem não encontrado. Entre na sala novamente.",
            );
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
            throw new ForbiddenException(
                "Apenas o dono pode alterar as configurações da sala",
            );
        }

        const VALID_MAPS = [
            "random",
            "plains",
            "mystic-castle",
            "deep-mines",
            "arcane-ruins",
            "runic-forest",
        ];
        const VALID_MODES = ["ranked", "free", "guild"];

        if (settings.map_slug !== undefined) {
            if (!VALID_MAPS.includes(settings.map_slug)) {
                throw new BadRequestException(
                    `Mapa inválido: ${settings.map_slug}`,
                );
            }
            room.map_slug = settings.map_slug;
        }

        if (settings.mode !== undefined) {
            if (!VALID_MODES.includes(settings.mode)) {
                throw new BadRequestException(
                    `Modo inválido: ${settings.mode}`,
                );
            }
            // In ranked mode, always force random map
            if (settings.mode === "ranked") {
                room.map_slug = "random";
            }
            room.mode = settings.mode;
        }

        return this.repo.save(room);
    }

    async findMatch(roomId: string): Promise<{ matched: boolean }> {
        const room = await this.repo.findOne({ where: { id: roomId } });
        if (!room) throw new NotFoundException(`Room ${roomId} not found`);
        const count = this.normalizePlayerIds(room).length;
        const others = await this.repo.find({
            where: { status: In(["waiting", "in_battle"]) },
        });
        const found = others.some(
            (r) =>
                r.id !== roomId && this.normalizePlayerIds(r).length === count,
        );
        return { matched: found };
    }

    async startBattle(
        roomId: string,
        characterId?: string,
    ): Promise<BattleStartResult> {
        const room = await this.repo.findOne({ where: { id: roomId } });
        if (!room) throw new NotFoundException(`Room ${roomId} not found`);

        room.status = "in_battle";
        await this.repo.save(room);

        const playerIds = this.normalizePlayerIds(room);
        const slots: SlotState[] = Array.isArray(room.slots) ? room.slots : [];

        // Validate all players have a valid weapon equipped
        for (const id of playerIds) {
            const weapon = await this.itemRepo.findOne({
                where: { owner_id: id, equipped_slot: "mainHand" },
            });
            if (!weapon || !WEAPON_IDS.includes(weapon.item_base_id)) {
                throw new BadRequestException(
                    "Todos os jogadores precisam ter uma arma equipada para iniciar a batalha.",
                );
            }
        }

        const players = await this.loadBattlePlayers(playerIds, slots);

        // Determine caller's config (first by explicit characterId, then position 0)
        const callerConfig = characterId
            ? (players.find((p) => p.characterId === characterId) ?? players[0])
            : players[0];
        const callerPlayers = [callerConfig];

        // Same-room 1v1: if 2+ real players are in the same room, pit them against each other
        if (playerIds.length >= 2) {
            const opponentPlayers = players.filter(
                (p) => p.characterId !== callerConfig.characterId,
            );
            if (opponentPlayers.length > 0) {
                return {
                    matched: true,
                    mapName: resolveMap(room.map_slug),
                    roomName: room.name,
                    mode: room.mode ?? "free",
                    vsAI: false,
                    players: callerPlayers,
                    opponents: opponentPlayers,
                };
            }
        }

        // Try last-chance match lookup (different rooms)
        const others = await this.repo.find({
            where: { status: In(["waiting", "in_battle"]) },
        });
        const matchRoom = others.find(
            (r) =>
                r.id !== roomId &&
                this.normalizePlayerIds(r).length === playerIds.length,
        );

        if (matchRoom) {
            const matchSlots: SlotState[] = Array.isArray(matchRoom.slots)
                ? matchRoom.slots
                : [];
            const opponents = await this.loadBattlePlayers(
                this.normalizePlayerIds(matchRoom),
                matchSlots,
            );
            return {
                matched: true,
                mapName: resolveMap(room.map_slug),
                roomName: room.name,
                mode: room.mode ?? "free",
                vsAI: false,
                players: callerPlayers,
                opponents,
            };
        }

        // No match — generate bots with similar stats
        const avgVit =
            players.reduce((s, p) => s + Math.round((p.maxHp - 200) / 20), 0) /
            Math.max(players.length, 1);
        const avgAgi =
            players.reduce((s, p) => s + p.agility, 0) /
            Math.max(players.length, 1);
        const avgStr =
            players.reduce((s, p) => s + p.strength, 0) /
            Math.max(players.length, 1);
        const bots = playerIds.map(() =>
            this.generateBot(
                Math.round(avgVit),
                Math.round(avgAgi),
                Math.round(avgStr),
            ),
        );

        return {
            matched: false,
            mapName: resolveMap(room.map_slug),
            roomName: room.name,
            mode: room.mode ?? "free",
            vsAI: true,
            players: callerPlayers,
            opponents: bots,
        };
    }

    private async loadBattlePlayers(
        characterIds: string[],
        slots: SlotState[] = [],
    ): Promise<BattlePlayerConfig[]> {
        const results: BattlePlayerConfig[] = [];
        for (const id of characterIds) {
            try {
                const char = await this.characters.findOneById(id);

                // Get consumable selection from the room slot
                const slot = slots.find((s) => s.playerId === id);
                const consumables = slot?.consumableSelection ?? [];
                const equippedItems = await this.itemRepo.find({
                    where: {
                        owner_id: id,
                        equipped_slot: Not(IsNull()),
                    },
                });

                // Get equipped weapon from ItemInstance (mainHand slot)
                let weaponId: string | null = null;
                let weaponUpgradeLevel = 0;
                let weaponRarity = "common";
                try {
                    const equippedWeapon = equippedItems.find(
                        (item) => item.equipped_slot === "mainHand",
                    );
                    if (equippedWeapon) {
                        weaponId = equippedWeapon.item_base_id;
                        weaponUpgradeLevel = equippedWeapon.upgrade_level ?? 0;
                        weaponRarity = equippedWeapon.rarity ?? "common";
                    }
                } catch {
                    // no equipped weapon — fall through to default
                }
                if (!weaponId || !WEAPON_IDS.includes(weaponId)) {
                    weaponId = "longbow";
                }
                const equipmentHp = this.sumEffectiveEquipmentStat(
                    equippedItems,
                    "hp",
                );
                const equipmentAttack = this.sumEffectiveEquipmentStat(
                    equippedItems,
                    "attack",
                );
                const equipmentDefense = this.sumEffectiveEquipmentStat(
                    equippedItems,
                    "defense",
                );
                const equipmentMobility =
                    this.sumEffectiveEquipmentStat(equippedItems, "agility") +
                    this.sumEffectiveEquipmentStat(equippedItems, "speed");
                const agility = Math.max(
                    0,
                    (char.agility > 0 ? char.agility : 50) + equipmentMobility,
                );

                results.push({
                    characterId: char.id,
                    name: char.name,
                    race: char.race ?? "human",
                    maxHp: 200 + (char.vitality ?? 0) * 20 + equipmentHp,
                    agility,
                    strength: (char.strength ?? 0) + equipmentAttack,
                    defense: Math.min(
                        agility * 0.005 + equipmentDefense * 0.01,
                        0.6,
                    ),
                    luck:
                        (char.luck ?? 10) +
                        this.sumEffectiveEquipmentStat(equippedItems, "luck"),
                    weaponId,
                    weaponUpgradeLevel,
                    weaponRarity,
                    consumables,
                });
            } catch {
                // character not found — skip
            }
        }
        return results;
    }

    private generateBot(
        avgVitality: number,
        avgAgility: number,
        avgStrength = 0,
    ): BattlePlayerConfig {
        const variance = Math.floor(Math.random() * 5) - 2;
        const vitality = Math.max(0, avgVitality + variance);
        const agility = Math.max(10, avgAgility + variance);
        const strength = Math.max(0, avgStrength + variance);
        const race = RACES[Math.floor(Math.random() * RACES.length)];
        return {
            characterId: "bot-" + Math.random().toString(36).slice(2, 8),
            name: `Bot ${race.charAt(0).toUpperCase() + race.slice(1)}`,
            race,
            maxHp: 200 + vitality * 20,
            agility,
            strength,
            defense: Math.min(agility * 0.005, 0.6),
            luck: 10,
            weaponId: WEAPON_IDS[Math.floor(Math.random() * WEAPON_IDS.length)],
            weaponUpgradeLevel: 0,
            weaponRarity: "common",
            consumables: [],
        };
    }

    private sumEffectiveEquipmentStat(
        equippedItems: ItemInstance[],
        stat: string,
    ): number {
        return equippedItems.reduce((total, item) => {
            const value = this.getEffectiveItemStats(item)[stat];
            return total + (typeof value === "number" ? value : 0);
        }, 0);
    }

    private getEffectiveItemStats(item: ItemInstance): ItemStats {
        const definition = EQUIPMENT_STAT_CATALOG[item.item_base_id];
        if (!definition) return {};

        const rarityStats = applyRarity(
            definition.stats,
            definition.category,
            normalizeRarity(item.rarity ?? "common"),
        );
        const upgradeLevel = item.upgrade_level ?? 0;
        const effectiveStats: ItemStats = {};

        for (const [key, value] of Object.entries(rarityStats)) {
            if (typeof value === "number") {
                effectiveStats[key] = value + upgradeLevel;
            }
        }

        return effectiveStats;
    }

    private normalizePlayerIds(room: PvpRoom): string[] {
        return Array.from(new Set((room.playerIds ?? []).filter(Boolean)));
    }

    async cleanupAllRooms(): Promise<{ deleted: number; message: string }> {
        const roomsToDelete = await this.repo.find({
            where: [{ status: "waiting" }, { status: "in_battle" }],
        });

        if (roomsToDelete.length === 0) {
            return { deleted: 0, message: "Nenhuma sala ativa encontrada" };
        }

        await this.repo.remove(roomsToDelete);
        this.logger.log(
            `[Cleanup] ${roomsToDelete.length} salas ativas deletadas`,
        );
        return {
            deleted: roomsToDelete.length,
            message: `${roomsToDelete.length} salas ativas deletadas`,
        };
    }
}
