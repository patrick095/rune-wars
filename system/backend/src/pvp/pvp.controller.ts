import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PvpService } from './pvp.service';

@Controller('pvp')
@UseGuards(JwtAuthGuard)
export class PvpController {
  constructor(private readonly pvpService: PvpService) {}

  @Get('rooms')
  listRooms() {
    return this.pvpService.listRooms();
  }

  @Post('rooms')
  createRoom(@Request() req: any, @Body() body: { name?: string; mapName?: string; characterId: string }) {
    return this.pvpService.createRoom(req.user.userId, body.characterId, body.name, body.mapName);
  }

  @Delete('rooms/:id')
  deleteRoom(@Param('id') id: string) {
    return this.pvpService.deleteRoom(id);
  }

  @Post('rooms/:id/join')
  joinRoom(@Param('id') id: string, @Request() req: any, @Body() body: { characterId: string }) {
    return this.pvpService.joinRoom(id, req.user.userId, body.characterId);
  }

  @Post('rooms/:id/leave')
  leaveRoom(@Param('id') id: string, @Request() req: any, @Body() body: { characterId: string }) {
    return this.pvpService.leaveRoom(id, req.user.userId, body.characterId);
  }

  @Post('rooms/:id/heartbeat')
  heartbeat(@Param('id') id: string, @Request() req: any, @Body() body: { characterId: string }) {
    return this.pvpService.touchRoom(id, req.user.userId, body.characterId);
  }
}
