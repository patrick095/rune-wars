import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RankedProfile } from './ranked-profile.entity';
import { getDivision } from './division.enum';

const K = 32;

@Injectable()
export class RankedService {
  constructor(@InjectRepository(RankedProfile) private repo: Repository<RankedProfile>) {}

  async getOrCreate(characterId: string): Promise<RankedProfile> {
    let profile = await this.repo.findOne({ where: { character_id: characterId } });
    if (!profile) {
      profile = this.repo.create({ character_id: characterId });
      await this.repo.save(profile);
    }
    return profile;
  }

  async processMatch(winnerId: string, loserId: string, mode: 'solo' | 'duo' = 'solo'): Promise<{ winner: RankedProfile; loser: RankedProfile }> {
    const [winner, loser] = await Promise.all([
      this.getOrCreate(winnerId),
      this.getOrCreate(loserId),
    ]);

    const ratingField = mode === 'solo' ? 'solo_rating' : 'duo_rating';
    const divField = mode === 'solo' ? 'solo_division' : 'duo_division';
    const winsField = mode === 'solo' ? 'solo_wins' : 'duo_wins';
    const lossesField = mode === 'solo' ? 'solo_losses' : 'duo_losses';

    const winnerRating = winner[ratingField];
    const loserRating = loser[ratingField];

    const expected = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const gain = Math.round(K * (1 - expected));
    const loss = Math.round(K * expected);

    winner[ratingField] = winnerRating + gain;
    winner[divField] = getDivision(winner[ratingField]);
    winner[winsField] += 1;

    loser[ratingField] = Math.max(0, loserRating - loss);
    loser[divField] = getDivision(loser[ratingField]);
    loser[lossesField] += 1;

    await this.repo.save([winner, loser]);
    return { winner, loser };
  }

  async getLeaderboard(mode: 'solo' | 'duo' = 'solo', limit = 50): Promise<RankedProfile[]> {
    const field = mode === 'solo' ? 'solo_rating' : 'duo_rating';
    return this.repo.find({ order: { [field]: 'DESC' }, take: limit });
  }
}
