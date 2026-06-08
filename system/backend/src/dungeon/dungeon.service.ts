import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DungeonProgress } from './dungeon-progress.entity';
import { CharacterService } from '../character/character.service';

@Injectable()
export class DungeonService {
  constructor(
    @InjectRepository(DungeonProgress) private repo: Repository<DungeonProgress>,
    private chars: CharacterService,
  ) {}

  async getProgress(characterId: string, userId: string) {
    await this.chars.findOne(characterId, userId);
    let progress = await this.repo.findOne({ where: { character_id: characterId } });
    if (!progress) {
      progress = this.repo.create({ character_id: characterId });
      await this.repo.save(progress);
    }
    return progress;
  }

  async save(characterId: string, userId: string, dto: Partial<DungeonProgress>) {
    const progress = await this.getProgress(characterId, userId);
    Object.assign(progress, dto);
    return this.repo.save(progress);
  }
}
