import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guild } from './guild.entity';
import { GuildMember, GuildRole } from './guild-member.entity';
import { GuildChatMessage } from './guild-chat-message.entity';

const MAX_MEMBERS_PER_LEVEL = [0, 20, 30, 40, 50, 60];

@Injectable()
export class GuildsService {
  constructor(
    @InjectRepository(Guild) private guildRepo: Repository<Guild>,
    @InjectRepository(GuildMember) private memberRepo: Repository<GuildMember>,
    @InjectRepository(GuildChatMessage) private chatRepo: Repository<GuildChatMessage>,
  ) {}

  async create(leaderId: string, name: string, description?: string): Promise<Guild> {
    const existing = await this.guildRepo.findOne({ where: { name } });
    if (existing) throw new BadRequestException('Guild name already taken');
    const alreadyInGuild = await this.memberRepo.findOne({ where: { character_id: leaderId } });
    if (alreadyInGuild) throw new BadRequestException('Already in a guild');

    const guild = await this.guildRepo.save(this.guildRepo.create({ name, description, leader_character_id: leaderId }));
    await this.memberRepo.save(this.memberRepo.create({ guild_id: guild.id, character_id: leaderId, role: GuildRole.LEADER }));
    return guild;
  }

  async getGuild(guildId: string): Promise<Guild> {
    const guild = await this.guildRepo.findOne({ where: { id: guildId } });
    if (!guild) throw new NotFoundException('Guild not found');
    return guild;
  }

  async getMembers(guildId: string): Promise<GuildMember[]> {
    return this.memberRepo.find({ where: { guild_id: guildId } });
  }

  async invite(guildId: string, inviterId: string, characterId: string): Promise<GuildMember> {
    const inviter = await this.memberRepo.findOne({ where: { guild_id: guildId, character_id: inviterId } });
    if (!inviter || inviter.role === GuildRole.MEMBER) throw new ForbiddenException('Insufficient permissions');

    const guild = await this.getGuild(guildId);
    const members = await this.getMembers(guildId);
    const maxMembers = MAX_MEMBERS_PER_LEVEL[Math.min(guild.level, 5)];
    if (members.length >= maxMembers) throw new BadRequestException('Guild is full');

    const alreadyIn = await this.memberRepo.findOne({ where: { character_id: characterId } });
    if (alreadyIn) throw new BadRequestException('Character already in a guild');

    return this.memberRepo.save(this.memberRepo.create({ guild_id: guildId, character_id: characterId, role: GuildRole.MEMBER }));
  }

  async kick(guildId: string, kickerId: string, characterId: string): Promise<void> {
    const kicker = await this.memberRepo.findOne({ where: { guild_id: guildId, character_id: kickerId } });
    if (!kicker || kicker.role === GuildRole.MEMBER) throw new ForbiddenException('Insufficient permissions');
    await this.memberRepo.delete({ guild_id: guildId, character_id: characterId });
  }

  async leave(guildId: string, characterId: string): Promise<void> {
    const member = await this.memberRepo.findOne({ where: { guild_id: guildId, character_id: characterId } });
    if (!member) throw new NotFoundException('Not in guild');
    if (member.role === GuildRole.LEADER) throw new BadRequestException('Leader must transfer leadership before leaving');
    await this.memberRepo.delete({ id: member.id });
  }

  async addXp(guildId: string, xp: number): Promise<Guild> {
    const guild = await this.getGuild(guildId);
    guild.xp += xp;
    const xpForLevel = guild.level * guild.level * 1000;
    if (guild.xp >= xpForLevel && guild.level < 5) {
      guild.xp -= xpForLevel;
      guild.level += 1;
    }
    return this.guildRepo.save(guild);
  }

  async depositGold(guildId: string, amount: number): Promise<Guild> {
    const guild = await this.getGuild(guildId);
    guild.gold_bank += amount;
    return this.guildRepo.save(guild);
  }

  async saveMessage(guildId: string, characterId: string, content: string): Promise<GuildChatMessage> {
    return this.chatRepo.save(this.chatRepo.create({ guild_id: guildId, character_id: characterId, content }));
  }

  async getMessages(guildId: string, limit = 50): Promise<GuildChatMessage[]> {
    return this.chatRepo.find({ where: { guild_id: guildId }, order: { created_at: 'DESC' }, take: limit });
  }

  async getLeaderboard(limit = 20): Promise<Guild[]> {
    return this.guildRepo.find({ order: { pvp_points: 'DESC' }, take: limit });
  }
}
