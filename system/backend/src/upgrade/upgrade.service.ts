import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpgradeAttempt } from './upgrade-attempt.entity';

const UPGRADE_CHANCES = [0, 0.80, 0.75, 0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.15, 0.10];

@Injectable()
export class UpgradeService {
  constructor(@InjectRepository(UpgradeAttempt) private repo: Repository<UpgradeAttempt>) {}

  getChance(currentLevel: number, luckStat = 0): number {
    const base = UPGRADE_CHANCES[currentLevel] ?? 0.05;
    return Math.min(0.95, base + luckStat * 0.001);
  }

  async attempt(characterId: string, itemInstanceId: string, currentLevel: number, luckStat = 0): Promise<UpgradeAttempt> {
    if (currentLevel >= 10) {
      return this.repo.save(this.repo.create({
        character_id: characterId,
        item_instance_id: itemInstanceId,
        from_level: currentLevel,
        success: false,
        to_level: currentLevel,
      }));
    }

    const chance = this.getChance(currentLevel, luckStat);
    const success = Math.random() < chance;

    return this.repo.save(this.repo.create({
      character_id: characterId,
      item_instance_id: itemInstanceId,
      from_level: currentLevel,
      success,
      to_level: success ? currentLevel + 1 : currentLevel,
    }));
  }

  async getHistory(characterId: string): Promise<UpgradeAttempt[]> {
    return this.repo.find({ where: { character_id: characterId }, order: { created_at: 'DESC' }, take: 50 });
  }
}
