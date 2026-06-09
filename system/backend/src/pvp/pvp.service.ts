import { BadRequestException, Injectable, NotFoundException, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { PvpRoom } from './pvp-room.entity';
import { CharacterService } from '../character/character.service';

@Injectable()
export class PvpService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PvpService.name);
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor(
    @InjectRepository(PvpRoom) private repo: Repository<PvpRoom>,
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
    await this.characters.findOne(characterId, userId);

    const roomName = name ?? `Sala-${Date.now()}`;
    const room = this.repo.create({
      name: roomName,
      ownerCharacterId: characterId,
      playerIds: [characterId],
      playerCount: 1,
      mapName: mapName ?? 'plains',
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
    await this.characters.findOne(characterId, userId);

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
    if (room.playerCount >= room.maxPlayers) {
      room.status = 'active';
    } else {
      room.status = 'waiting';
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

  private async cleanupEmptyRooms(): Promise<void> {
    const threshold = new Date(Date.now() - 30_000);
    const staleRooms = await this.repo.find({
      where: [
        { playerCount: 0, updatedAt: LessThan(threshold) },
        { status: In(['waiting', 'active']), updatedAt: LessThan(threshold) },
      ],
    });

    for (const room of staleRooms) {
      await this.repo.remove(room);
      this.logger.log(`[Lobby] Sala ${room.id} deletada por TTL`);
    }
  }

  private normalizePlayerIds(room: PvpRoom): string[] {
    return Array.from(new Set((room.playerIds ?? []).filter(Boolean)));
  }
}
