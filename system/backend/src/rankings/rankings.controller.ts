import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RankingsService } from './rankings.service';
import { RankingCategory, RankingPeriod } from './ranking-entry.entity';

@Controller('rankings')
@UseGuards(JwtAuthGuard)
export class RankingsController {
  constructor(private service: RankingsService) {}

  @Get()
  getLeaderboard(
    @Query('period') period: RankingPeriod = 'daily',
    @Query('category') category: RankingCategory = 'pvp_solo',
    @Query('limit') limit = '50',
  ) {
    return this.service.getLeaderboard(period, category, Number(limit));
  }

  @Post('win')
  recordWin(@Body() body: { characterId: string; category: RankingCategory; score: number }) {
    return this.service.recordWin(body.characterId, body.category, body.score);
  }

  @Post('loss')
  recordLoss(@Body() body: { characterId: string; category: RankingCategory }) {
    return this.service.recordLoss(body.characterId, body.category);
  }
}
