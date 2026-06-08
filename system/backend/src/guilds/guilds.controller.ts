import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuildsService } from './guilds.service';

@Controller('guilds')
@UseGuards(JwtAuthGuard)
export class GuildsController {
  constructor(private service: GuildsService) {}

  @Get('leaderboard')
  leaderboard() {
    return this.service.getLeaderboard();
  }

  @Post()
  create(@Body() body: { leaderId: string; name: string; description?: string }) {
    return this.service.create(body.leaderId, body.name, body.description);
  }

  @Get(':id')
  getGuild(@Param('id') id: string) {
    return this.service.getGuild(id);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.service.getMembers(id);
  }

  @Post(':id/invite')
  invite(@Param('id') id: string, @Body() body: { inviterId: string; characterId: string }) {
    return this.service.invite(id, body.inviterId, body.characterId);
  }

  @Delete(':id/kick')
  kick(@Param('id') id: string, @Body() body: { kickerId: string; characterId: string }) {
    return this.service.kick(id, body.kickerId, body.characterId);
  }

  @Post(':id/leave')
  leave(@Param('id') id: string, @Body() body: { characterId: string }) {
    return this.service.leave(id, body.characterId);
  }

  @Post(':id/xp')
  addXp(@Param('id') id: string, @Body() body: { xp: number }) {
    return this.service.addXp(id, body.xp);
  }

  @Post(':id/gold')
  depositGold(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.service.depositGold(id, body.amount);
  }

  @Get(':id/chat')
  getChat(@Param('id') id: string) {
    return this.service.getMessages(id);
  }

  @Post(':id/chat')
  sendMessage(@Param('id') id: string, @Body() body: { characterId: string; content: string }) {
    return this.service.saveMessage(id, body.characterId, body.content);
  }
}
