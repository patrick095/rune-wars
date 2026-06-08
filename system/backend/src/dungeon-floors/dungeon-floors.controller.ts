import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DungeonFloorsService } from './dungeon-floors.service';
import { DifficultyTrack } from './dungeon-floor.config';

@Controller('dungeon-floors')
@UseGuards(JwtAuthGuard)
export class DungeonFloorsController {
  constructor(private service: DungeonFloorsService) {}

  @Get()
  getAllFloors() {
    return this.service.getAllFloors();
  }

  @Get(':floor')
  getFloor(@Param('floor') floor: string) {
    return this.service.getFloorInfo(Number(floor));
  }

  @Post('lobbies')
  createLobby(@Body() body: { characterId: string; floor: number; track: DifficultyTrack }) {
    return this.service.createLobby(body.characterId, body.floor, body.track);
  }

  @Post('lobbies/:id/join')
  joinLobby(@Param('id') id: string, @Body() body: { characterId: string }) {
    return this.service.joinLobby(id, body.characterId);
  }

  @Post('lobbies/:id/start')
  startDungeon(@Param('id') id: string, @Body() body: { leaderId: string }) {
    return this.service.startDungeon(id, body.leaderId);
  }

  @Post('lobbies/:id/phase-complete')
  completePhase(@Param('id') id: string) {
    return this.service.completePhase(id);
  }

  @Get('lobbies/:id')
  getLobby(@Param('id') id: string) {
    return this.service.getLobby(id);
  }
}
