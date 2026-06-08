import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DungeonLobby } from './dungeon-lobby.entity';
import { DifficultyTrack, FLOOR_CONFIGS, getFloorConfig } from './dungeon-floor.config';

@Injectable()
export class DungeonFloorsService {
  constructor(
    @InjectRepository(DungeonLobby) private lobbyRepo: Repository<DungeonLobby>,
  ) {}

  getFloorInfo(floor: number) {
    const config = getFloorConfig(floor);
    if (!config) throw new NotFoundException(`Floor ${floor} not found`);
    return config;
  }

  getAllFloors() {
    return FLOOR_CONFIGS;
  }

  async createLobby(leaderId: string, floor: number, track: DifficultyTrack): Promise<DungeonLobby> {
    if (!getFloorConfig(floor)) throw new BadRequestException(`Invalid floor: ${floor}`);
    const lobby = this.lobbyRepo.create({
      leader_character_id: leaderId,
      member_character_ids: [leaderId],
      floor,
      track,
    });
    return this.lobbyRepo.save(lobby);
  }

  async joinLobby(lobbyId: string, characterId: string): Promise<DungeonLobby> {
    const lobby = await this.lobbyRepo.findOne({ where: { id: lobbyId } });
    if (!lobby) throw new NotFoundException('Lobby not found');
    if (lobby.status !== 'waiting') throw new BadRequestException('Lobby is not accepting members');
    if (lobby.member_character_ids.length >= 4) throw new BadRequestException('Lobby is full (max 4)');
    if (!lobby.member_character_ids.includes(characterId)) {
      lobby.member_character_ids = [...lobby.member_character_ids, characterId];
      await this.lobbyRepo.save(lobby);
    }
    return lobby;
  }

  async startDungeon(lobbyId: string, leaderId: string): Promise<DungeonLobby> {
    const lobby = await this.lobbyRepo.findOne({ where: { id: lobbyId } });
    if (!lobby) throw new NotFoundException('Lobby not found');
    if (lobby.leader_character_id !== leaderId) throw new BadRequestException('Only the leader can start');
    lobby.status = 'in_progress';
    return this.lobbyRepo.save(lobby);
  }

  async completePhase(lobbyId: string): Promise<{ lobby: DungeonLobby; completed: boolean; xpReward: number; dropRarity: string }> {
    const lobby = await this.lobbyRepo.findOne({ where: { id: lobbyId } });
    if (!lobby) throw new NotFoundException('Lobby not found');
    const config = getFloorConfig(lobby.floor);
    if (!config) throw new NotFoundException('Floor config not found');

    const xpReward = Math.floor(config.xpRange[0] + Math.random() * (config.xpRange[1] - config.xpRange[0]));
    const dropRarity = config.rarityByTrack[lobby.track as DifficultyTrack] ?? 'common';

    if (lobby.current_phase >= config.phases) {
      lobby.status = 'completed';
      await this.lobbyRepo.save(lobby);
      return { lobby, completed: true, xpReward, dropRarity };
    }

    lobby.current_phase += 1;
    await this.lobbyRepo.save(lobby);
    return { lobby, completed: false, xpReward, dropRarity };
  }

  async getLobby(lobbyId: string): Promise<DungeonLobby> {
    const lobby = await this.lobbyRepo.findOne({ where: { id: lobbyId } });
    if (!lobby) throw new NotFoundException('Lobby not found');
    return lobby;
  }
}
