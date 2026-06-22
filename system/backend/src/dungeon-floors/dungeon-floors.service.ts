import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, LessThan, Repository } from "typeorm";
import { DungeonLobby, DungeonSlot } from "./dungeon-lobby.entity";
import {
    DifficultyTrack,
    DungeonDifficulty,
    FLOOR_CONFIGS,
    getFloorConfig,
    normalizeDifficulty,
    TRACK_BY_DIFFICULTY,
} from "./dungeon-floor.config";
import { CharacterService } from "../character/character.service";
import { DungeonService } from "../dungeon/dungeon.service";
import {
    PortalSelectionResult,
    PortalService,
} from "../dungeon-rewards/portal.service";
import { ItemInstance } from "../inventory/item-instance.entity";

const ROOM_TTL_MS = 6 * 60 * 60 * 1000;

@Injectable()
export class DungeonFloorsService {
    constructor(
        @InjectRepository(DungeonLobby)
        private lobbyRepo: Repository<DungeonLobby>,
        @InjectRepository(ItemInstance)
        private itemRepo: Repository<ItemInstance>,
        private readonly characters: CharacterService,
        private readonly dungeon: DungeonService,
        private readonly portals: PortalService,
    ) {}

    getFloorInfo(floor: number) {
        const config = getFloorConfig(floor);
        if (!config) throw new NotFoundException(`Floor ${floor} not found`);
        return config;
    }

    getAllFloors() {
        return FLOOR_CONFIGS;
    }

    async createLobby(
        leaderId: string,
        floor: number,
        track: DifficultyTrack,
    ): Promise<DungeonLobby> {
        const difficulty = normalizeDifficulty(track);
        return this.createRoom(leaderId, floor, difficulty);
    }

    async listRooms(): Promise<DungeonLobby[]> {
        await this.cleanupExpiredRooms();
        return this.lobbyRepo.find({ order: { created_at: "DESC" } });
    }

    async createRoom(
        leaderId: string,
        floor: number,
        difficulty: DungeonDifficulty,
    ): Promise<DungeonLobby> {
        await this.cleanupExpiredRooms();
        if (!getFloorConfig(floor))
            throw new BadRequestException(`Invalid floor: ${floor}`);
        await this.assertCanAccess(leaderId, floor, difficulty);
        const leader = await this.characters.findOneById(leaderId);
        const config = getFloorConfig(floor)!;
        const lobby = this.lobbyRepo.create({
            leader_character_id: leaderId,
            member_character_ids: [leaderId],
            floor,
            difficulty,
            track: TRACK_BY_DIFFICULTY[difficulty],
            max_members: 4,
            slots: [
                this.createSlot(
                    leaderId,
                    leader.name,
                    this.resolveMaxHp(leader),
                ),
            ],
            status: "waiting",
            current_phase: 1,
            current_stage: 1,
            stage_count: config.phases,
            portal_state: null,
        });
        return this.lobbyRepo.save(lobby);
    }

    async joinLobby(
        lobbyId: string,
        characterId: string,
    ): Promise<DungeonLobby> {
        const lobby = await this.lobbyRepo.findOne({ where: { id: lobbyId } });
        if (!lobby) throw new NotFoundException("Lobby not found");
        if (lobby.status === "in_battle")
            throw new BadRequestException("Lobby is in battle");
        if (lobby.status !== "waiting" && lobby.status !== "regroup")
            throw new BadRequestException("Lobby is not accepting members");
        if (lobby.member_character_ids.length >= (lobby.max_members ?? 4))
            throw new BadRequestException("Lobby is full (max 4)");
        await this.assertCanAccess(
            characterId,
            lobby.floor,
            normalizeDifficulty(lobby.difficulty),
        );
        const character = await this.characters.findOneById(characterId);
        if (!lobby.member_character_ids.includes(characterId)) {
            lobby.member_character_ids = [
                ...lobby.member_character_ids,
                characterId,
            ];
            lobby.slots = [
                ...this.normalizeSlots(lobby),
                this.createSlot(
                    characterId,
                    character.name,
                    this.resolveMaxHp(character),
                ),
            ];
            await this.lobbyRepo.save(lobby);
        }
        return lobby;
    }

    async leaveRoom(
        lobbyId: string,
        characterId: string,
    ): Promise<{ deleted: boolean; lobby?: DungeonLobby }> {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby.member_character_ids.includes(characterId))
            throw new BadRequestException("Character is not in this lobby");

        lobby.member_character_ids = lobby.member_character_ids.filter(
            (id) => id !== characterId,
        );
        lobby.slots = this.normalizeSlots(lobby).filter(
            (slot) => slot.playerId !== characterId,
        );

        if (lobby.member_character_ids.length === 0) {
            await this.lobbyRepo.remove(lobby);
            return { deleted: true };
        }

        if (lobby.leader_character_id === characterId) {
            lobby.leader_character_id = lobby.member_character_ids[0];
        }

        await this.lobbyRepo.save(lobby);
        return { deleted: false, lobby };
    }

    async failRoom(
        lobbyId: string,
        characterId: string,
    ): Promise<DungeonLobby> {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby.member_character_ids.includes(characterId))
            throw new BadRequestException("Character is not in this lobby");

        if (lobby.status !== "in_battle" && lobby.status !== "regroup") {
            throw new BadRequestException("Lobby is not in battle");
        }

        lobby.current_stage = 1;
        lobby.current_phase = 1;
        lobby.status = "regroup";
        lobby.portal_state = null;
        const hydratedSlots = await this.hydrateSlots(lobby);
        lobby.slots = hydratedSlots.map((slot) => ({
            ...slot,
            ready: false,
            hp: slot.maxHp ?? 100,
            maxHp: slot.maxHp ?? 100,
        }));
        return this.lobbyRepo.save(lobby);
    }

    async setReady(
        lobbyId: string,
        characterId: string,
        ready: boolean,
        options: {
            weaponId?: string | null;
            consumableSelection?: string[];
            equippedLoadout?: Record<string, unknown> | null;
        } = {},
    ): Promise<DungeonLobby> {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby.member_character_ids.includes(characterId))
            throw new BadRequestException("Character is not in this lobby");
        if (lobby.status !== "waiting" && lobby.status !== "regroup") {
            throw new BadRequestException(
                "Lobby is not accepting ready changes",
            );
        }

        const character = await this.characters.findOneById(characterId);
        const maxHp = this.resolveMaxHp(character);
        const equippedWeaponId = await this.findEquippedWeaponId(characterId);
        lobby.slots = this.normalizeSlots(lobby).map((slot) => {
            if (slot.playerId !== characterId) return slot;
            return {
                ...slot,
                ready,
                playerName: character.name,
                weaponId: options.weaponId ?? slot.weaponId ?? equippedWeaponId,
                consumableSelection:
                    options.consumableSelection ??
                    slot.consumableSelection ??
                    [],
                equippedLoadout:
                    options.equippedLoadout ?? slot.equippedLoadout ?? null,
                hp: Math.min(slot.hp ?? maxHp, maxHp),
                maxHp,
            };
        });
        return this.lobbyRepo.save(lobby);
    }

    async updateSettings(
        lobbyId: string,
        leaderId: string,
        settings: { floor?: number; difficulty?: DungeonDifficulty },
    ): Promise<DungeonLobby> {
        const lobby = await this.getLobby(lobbyId);
        if (lobby.leader_character_id !== leaderId)
            throw new BadRequestException(
                "Only the leader can update settings",
            );
        if (lobby.status !== "waiting" && lobby.status !== "regroup")
            throw new BadRequestException("Lobby settings are locked");

        const floor = settings.floor ?? lobby.floor;
        const difficulty = normalizeDifficulty(
            settings.difficulty ?? lobby.difficulty,
        );
        const config = getFloorConfig(floor);
        if (!config) throw new BadRequestException(`Invalid floor: ${floor}`);

        for (const memberId of lobby.member_character_ids) {
            await this.assertCanAccess(memberId, floor, difficulty);
        }

        lobby.floor = floor;
        lobby.difficulty = difficulty;
        lobby.track = TRACK_BY_DIFFICULTY[difficulty];
        lobby.stage_count = config.phases;
        lobby.current_stage = 1;
        lobby.current_phase = 1;
        lobby.portal_state = null;
        lobby.slots = this.normalizeSlots(lobby).map((slot) => ({
            ...slot,
            ready: false,
        }));
        return this.lobbyRepo.save(lobby);
    }

    async startDungeon(
        lobbyId: string,
        leaderId: string,
    ): Promise<DungeonLobby> {
        const lobby = await this.lobbyRepo.findOne({ where: { id: lobbyId } });
        if (!lobby) throw new NotFoundException("Lobby not found");
        if (lobby.leader_character_id !== leaderId)
            throw new BadRequestException("Only the leader can start");
        if (lobby.status !== "waiting" && lobby.status !== "regroup")
            throw new BadRequestException("Lobby cannot start now");
        const slots = this.normalizeSlots(lobby);
        if (slots.length === 0)
            throw new BadRequestException("Lobby has no members");
        if (!slots.every((slot) => slot.ready || slot.playerId === leaderId)) {
            throw new BadRequestException(
                "All non-leader members must be ready",
            );
        }
        lobby.slots = await this.hydrateSlots(lobby);
        lobby.status = "in_battle";
        return this.lobbyRepo.save(lobby);
    }

    async completePhase(
        lobbyId: string,
    ): Promise<{
        lobby: DungeonLobby;
        completed: boolean;
        xpReward: number;
        dropRarity: string;
        portalState: Record<string, unknown>;
    }> {
        const lobby = await this.lobbyRepo.findOne({ where: { id: lobbyId } });
        if (!lobby) throw new NotFoundException("Lobby not found");
        if (lobby.status !== "in_battle")
            throw new BadRequestException("Lobby is not in battle");
        const config = getFloorConfig(lobby.floor);
        if (!config) throw new NotFoundException("Floor config not found");

        const xpReward = Math.floor(
            config.xpRange[0] +
                Math.random() * (config.xpRange[1] - config.xpRange[0]),
        );
        const dropRarity =
            config.rarityByTrack[lobby.track as DifficultyTrack] ?? "common";
        const isBoss =
            lobby.current_stage >= (lobby.stage_count || config.phases);
        const contextId = `dungeon:${lobby.id}:stage:${lobby.current_stage}`;
        const context = this.portals.createContext({
            contextId,
            mode: "dungeon",
            floor: lobby.floor,
            stage: lobby.current_stage,
            difficulty: normalizeDifficulty(lobby.difficulty),
            isBoss,
            participantIds: lobby.member_character_ids,
        });

        if (isBoss) {
            for (const memberId of lobby.member_character_ids) {
                await this.dungeon.recordFloorClear(
                    memberId,
                    lobby.floor,
                    normalizeDifficulty(lobby.difficulty),
                );
            }
        }

        lobby.status = "portal";
        lobby.portal_state = {
            contextId,
            portals: context.portals,
            picksPerCharacter: context.picksPerCharacter,
            stage: lobby.current_stage,
            isBoss,
            createdAt: new Date().toISOString(),
        };
        await this.lobbyRepo.save(lobby);
        return {
            lobby,
            completed: isBoss,
            xpReward,
            dropRarity,
            portalState: lobby.portal_state,
        };
    }

    async selectPortal(
        lobbyId: string,
        characterId: string,
        portalIndices?: number[],
    ): Promise<PortalSelectionResult> {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby.portal_state?.contextId)
            throw new BadRequestException("Lobby has no active portal state");
        return this.portals.select(
            String(lobby.portal_state.contextId),
            characterId,
            portalIndices,
        );
    }

    async regroup(lobbyId: string, characterId: string): Promise<DungeonLobby> {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby.member_character_ids.includes(characterId))
            throw new BadRequestException("Character is not in this lobby");
        if (lobby.status !== "portal" && lobby.status !== "regroup")
            throw new BadRequestException("Lobby cannot regroup now");

        if (lobby.current_stage >= lobby.stage_count) {
            lobby.current_stage = 1;
            lobby.current_phase = 1;
            lobby.status = "regroup";
        } else {
            lobby.current_stage += 1;
            lobby.current_phase = lobby.current_stage;
            lobby.status = "regroup";
        }

        lobby.portal_state = null;
        const hydratedSlots = await this.hydrateSlots(lobby);
        lobby.slots = hydratedSlots.map((slot) => ({
            ...slot,
            ready: false,
            hp: slot.maxHp ?? 100,
            maxHp: slot.maxHp ?? 100,
        }));
        return this.lobbyRepo.save(lobby);
    }

    async getLobby(lobbyId: string): Promise<DungeonLobby> {
        const lobby = await this.lobbyRepo.findOne({ where: { id: lobbyId } });
        if (!lobby) throw new NotFoundException("Lobby not found");
        lobby.slots = await this.hydrateSlots(lobby);
        return lobby;
    }

    async cleanupExpiredRooms(now = new Date()): Promise<void> {
        const cutoff = new Date(now.getTime() - ROOM_TTL_MS);
        await this.lobbyRepo.delete({
            status: In(["waiting", "regroup", "completed", "failed"]),
            created_at: LessThan(cutoff),
        } as any);
    }

    private async assertCanAccess(
        characterId: string,
        floor: number,
        difficulty: DungeonDifficulty,
    ): Promise<void> {
        const canAccess = await this.dungeon.canAccessFloor(
            characterId,
            floor,
            difficulty,
        );
        if (!canAccess)
            throw new BadRequestException(
                "Dungeon floor is locked for this difficulty",
            );
    }

    private createSlot(
        playerId: string,
        playerName: string,
        maxHp = 100,
    ): DungeonSlot {
        return {
            playerId,
            playerName,
            ready: false,
            weaponId: null,
            consumableSelection: [],
            equippedLoadout: null,
            hp: maxHp,
            maxHp,
        };
    }

    private normalizeSlots(lobby: DungeonLobby): DungeonSlot[] {
        const slots = Array.isArray(lobby.slots) ? lobby.slots : [];
        return lobby.member_character_ids.map((memberId) => {
            const existing = slots.find((slot) => slot.playerId === memberId);
            return existing ?? this.createSlot(memberId, memberId);
        });
    }

    private async hydrateSlots(lobby: DungeonLobby): Promise<DungeonSlot[]> {
        const slots = this.normalizeSlots(lobby);
        return Promise.all(
            slots.map(async (slot) => {
                try {
                    const character = await this.characters.findOneById(
                        slot.playerId,
                    );
                    const maxHp = this.resolveMaxHp(character);
                    const weaponId =
                        slot.weaponId ??
                        (await this.findEquippedWeaponId(slot.playerId));
                    return {
                        ...slot,
                        playerName: character.name,
                        weaponId,
                        hp: Math.min(slot.hp ?? maxHp, maxHp),
                        maxHp,
                    };
                } catch {
                    return slot;
                }
            }),
        );
    }

    private resolveMaxHp(character: { vitality?: number | null }): number {
        return 200 + (character.vitality ?? 0) * 20;
    }

    private async findEquippedWeaponId(
        characterId: string,
    ): Promise<string | null> {
        const weapon = await this.itemRepo.findOne({
            where: { owner_id: characterId, equipped_slot: "mainHand" },
        });
        return weapon?.item_base_id ?? null;
    }

    async cleanupAllRooms(): Promise<{ deleted: number; message: string }> {
        const roomsToDelete = await this.lobbyRepo.find({
            where: [
                { status: "waiting" },
                { status: "in_battle" },
                { status: "portal" },
                { status: "regroup" },
            ],
        });

        if (roomsToDelete.length === 0) {
            return {
                deleted: 0,
                message: "Nenhuma sala de dungeon ativa encontrada",
            };
        }

        await this.lobbyRepo.remove(roomsToDelete);
        return {
            deleted: roomsToDelete.length,
            message: `${roomsToDelete.length} salas de dungeon deletadas`,
        };
    }
}
