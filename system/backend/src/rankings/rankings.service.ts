import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RankingEntry, RankingPeriod, RankingCategory } from './ranking-entry.entity';
import { getDailyKey, getMonthlyKey, getWeeklyKey } from './ranking-period.util';

@Injectable()
export class RankingsService {
  constructor(@InjectRepository(RankingEntry) private repo: Repository<RankingEntry>) {}

  private periodKey(period: RankingPeriod): string {
    switch (period) {
      case 'daily': return getDailyKey();
      case 'weekly': return getWeeklyKey();
      case 'monthly': return getMonthlyKey();
      default: return 'all';
    }
  }

  async recordWin(characterId: string, category: RankingCategory, scoreGain: number): Promise<void> {
    const periods: RankingPeriod[] = ['daily', 'weekly', 'monthly', 'alltime'];
    for (const period of periods) {
      const key = this.periodKey(period);
      let entry = await this.repo.findOne({ where: { character_id: characterId, period, category, period_key: key } });
      if (!entry) {
        entry = this.repo.create({ character_id: characterId, period, category, period_key: key });
      }
      entry.score += scoreGain;
      entry.wins += 1;
      await this.repo.save(entry);
    }
  }

  async recordLoss(characterId: string, category: RankingCategory): Promise<void> {
    const periods: RankingPeriod[] = ['daily', 'weekly', 'monthly', 'alltime'];
    for (const period of periods) {
      const key = this.periodKey(period);
      let entry = await this.repo.findOne({ where: { character_id: characterId, period, category, period_key: key } });
      if (!entry) {
        entry = this.repo.create({ character_id: characterId, period, category, period_key: key });
      }
      entry.losses += 1;
      await this.repo.save(entry);
    }
  }

  async getLeaderboard(period: RankingPeriod, category: RankingCategory, limit = 50): Promise<RankingEntry[]> {
    const key = this.periodKey(period);
    return this.repo.find({
      where: { period, category, period_key: key },
      order: { score: 'DESC' },
      take: limit,
    });
  }
}
