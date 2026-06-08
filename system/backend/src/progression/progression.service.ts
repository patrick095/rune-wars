import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterProgression } from './character-progression.entity';
import { RACE_BONUSES, Race } from './race.enum';

@Injectable()
export class ProgressionService {
  constructor(
    @InjectRepository(CharacterProgression)
    private repo: Repository<CharacterProgression>,
  ) {}

  xpForLevel(level: number): number {
    return Math.floor(100 * level * level * 0.5);
  }

  async getOrCreate(characterId: string, race = Race.HUMAN): Promise<CharacterProgression> {
    let prog = await this.repo.findOne({ where: { character_id: characterId } });
    if (!prog) {
      prog = this.repo.create({ character_id: characterId, race });
      await this.repo.save(prog);
    }
    return prog;
  }

  async setRace(characterId: string, race: Race): Promise<CharacterProgression> {
    const prog = await this.getOrCreate(characterId, race);
    prog.race = race;
    return this.repo.save(prog);
  }

  async addXp(characterId: string, baseXp: number, currentLevel: number, currentXp: number): Promise<{
    newLevel: number;
    newXp: number;
    leveledUp: boolean;
    attributePointsGained: number;
    progression: CharacterProgression;
  }> {
    const prog = await this.getOrCreate(characterId);
    const bonus = RACE_BONUSES[prog.race as Race] ?? RACE_BONUSES[Race.HUMAN];
    const xpGained = Math.floor(baseXp * bonus.xpMultiplier);

    let xp = currentXp + xpGained;
    let level = currentLevel;
    let leveledUp = false;
    let attributePointsGained = 0;

    while (xp >= this.xpForLevel(level + 1)) {
      xp -= this.xpForLevel(level + 1);
      level++;
      leveledUp = true;
      attributePointsGained += 4;
    }

    prog.attribute_points += attributePointsGained;
    prog.total_xp_earned += xpGained;
    await this.repo.save(prog);

    return { newLevel: level, newXp: xp, leveledUp, attributePointsGained, progression: prog };
  }

  async spendAttributePoints(characterId: string, points: number): Promise<CharacterProgression> {
    const prog = await this.getOrCreate(characterId);
    if (prog.attribute_points < points) {
      throw new Error('Not enough attribute points');
    }
    prog.attribute_points -= points;
    return this.repo.save(prog);
  }
}
