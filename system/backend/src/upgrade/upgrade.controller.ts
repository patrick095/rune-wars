import { Controller, Post, Get, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpgradeService, UpgradeTarget } from './upgrade.service';

@Controller('upgrade')
@UseGuards(JwtAuthGuard)
export class UpgradeController {
  constructor(private service: UpgradeService) {}

  @Get('chance')
  getChance(
    @Query('target') target: UpgradeTarget = 'item',
    @Query('level') level: string,
    @Query('luck') luck = '0',
    @Query('stoneLevels') stoneLevels = '',
    @Query('raceBonus') raceBonus = '0',
    @Query('eventBonus') eventBonus = '0',
    @Query('guildBonus') guildBonus = '0',
  ) {
    const parsedStoneLevels = stoneLevels
      ? stoneLevels.split(',').map(Number).filter(n => !isNaN(n))
      : [];

    if (target === 'item' || target === 'stone') {
      return this.service.getChanceInfo(
        target,
        Number(level),
        Number(luck),
        { race: Number(raceBonus), event: Number(eventBonus), guild: Number(guildBonus) },
        parsedStoneLevels,
      );
    }

    return { chance: this.service.getChance(Number(level), Number(luck)) };
  }

  @Post('attempt')
  attempt(@Body() body: { characterId: string; itemInstanceId: string; currentLevel: number; luck?: number }) {
    return this.service.attempt(body.characterId, body.itemInstanceId, body.currentLevel, body.luck ?? 0);
  }

  @Post('item')
  upgradeItem(@Body() body: { characterId: string; itemInstanceId: string; stoneInstanceIds: string[]; luck?: number }) {
    return this.service.upgradeItem(body);
  }

  @Post('stone')
  upgradeStone(@Body() body: { characterId: string; stoneInstanceIds: string[]; luck?: number }) {
    return this.service.upgradeStone(body);
  }

  @Get('history')
  history(@Query('characterId') characterId: string) {
    return this.service.getHistory(characterId);
  }
}
