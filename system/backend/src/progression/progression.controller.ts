import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressionService } from './progression.service';
import { Race } from './race.enum';

@Controller('characters/:characterId/progression')
@UseGuards(JwtAuthGuard)
export class ProgressionController {
  constructor(private service: ProgressionService) {}

  @Get()
  get(@Param('characterId') cid: string) {
    return this.service.getOrCreate(cid);
  }

  @Post('race')
  setRace(@Param('characterId') cid: string, @Body() body: { race: Race }) {
    return this.service.setRace(cid, body.race);
  }

  @Post('xp')
  addXp(@Param('characterId') cid: string, @Body() body: { xp: number; currentLevel: number; currentXp: number }) {
    return this.service.addXp(cid, body.xp, body.currentLevel, body.currentXp);
  }

  @Post('spend-points')
  spendPoints(@Param('characterId') cid: string, @Body() body: { points: number }) {
    return this.service.spendAttributePoints(cid, body.points);
  }
}
