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

  async canAccessFloor(characterId: string, floor: number, difficulty: string): Promise<boolean> {
    const progress = await this.repo.findOne({ where: { character_id: characterId } });
    if (!progress) return floor <= 1;
    const cleared = (progress.cleared_by_difficulty as any)[difficulty] ?? 0;
    return floor <= cleared + 1;
  }

  async recordFloorClear(characterId: string, floor: number, difficulty: string): Promise<void> {
    let progress = await this.repo.findOne({ where: { character_id: characterId } });
    if (!progress) {
      progress = this.repo.create({
        character_id: characterId,
        cleared_by_difficulty: { easy: 0, medium: 0, hard: 0, heroic: 0 },
      });
    }
    const current = (progress.cleared_by_difficulty as any)[difficulty] ?? 0;
    (progress.cleared_by_difficulty as any)[difficulty] = Math.max(current, floor);
    await this.repo.save(progress);
  }
}
