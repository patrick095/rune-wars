import { Controller, Get, Put, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DungeonService } from './dungeon.service';

@Controller('characters/:characterId/dungeon')
@UseGuards(JwtAuthGuard)
export class DungeonController {
  constructor(private service: DungeonService) {}

  @Get()
  get(@Param('characterId') cid: string, @Request() req: any) {
    return this.service.getProgress(cid, req.user.userId);
  }

  @Put()
  save(@Param('characterId') cid: string, @Body() body: any, @Request() req: any) {
    return this.service.save(cid, req.user.userId, body);
  }

  @Get('floor/:floor/access')
  canAccessFloor(
    @Param('characterId') cid: string,
    @Param('floor') floor: string,
    @Query('difficulty') difficulty: string,
  ) {
    return this.service.canAccessFloor(cid, parseInt(floor, 10), difficulty ?? 'easy');
  }
}
