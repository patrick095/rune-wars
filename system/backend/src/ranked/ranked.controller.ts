import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RankedService } from './ranked.service';

@Controller('ranked')
@UseGuards(JwtAuthGuard)
export class RankedController {
  constructor(private service: RankedService) {}

  @Get('profile/:characterId')
  getProfile(@Query() q: { characterId: string }) {
    return this.service.getOrCreate(q.characterId);
  }

  @Post('match')
  processMatch(@Body() body: { winnerId: string; loserId: string; mode?: 'solo' | 'duo' }) {
    return this.service.processMatch(body.winnerId, body.loserId, body.mode ?? 'solo');
  }

  @Get('leaderboard')
  leaderboard(@Query('mode') mode: 'solo' | 'duo' = 'solo', @Query('limit') limit = '50') {
    return this.service.getLeaderboard(mode, Number(limit));
  }
}
