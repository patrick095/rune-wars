import { Controller, Post, Get, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpgradeService } from './upgrade.service';

@Controller('upgrade')
@UseGuards(JwtAuthGuard)
export class UpgradeController {
  constructor(private service: UpgradeService) {}

  @Get('chance')
  getChance(@Query('level') level: string, @Query('luck') luck = '0') {
    return { chance: this.service.getChance(Number(level), Number(luck)) };
  }

  @Post('attempt')
  attempt(@Body() body: { characterId: string; itemInstanceId: string; currentLevel: number; luck?: number }) {
    return this.service.attempt(body.characterId, body.itemInstanceId, body.currentLevel, body.luck ?? 0);
  }

  @Get('history')
  history(@Query('characterId') characterId: string) {
    return this.service.getHistory(characterId);
  }
}
