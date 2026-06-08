import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from './guild.entity';
import { GuildMember } from './guild-member.entity';
import { GuildChatMessage } from './guild-chat-message.entity';
import { GuildsService } from './guilds.service';
import { GuildsController } from './guilds.controller';
import { GuildChatGateway } from './guild-chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Guild, GuildMember, GuildChatMessage])],
  providers: [GuildsService, GuildChatGateway],
  controllers: [GuildsController],
  exports: [GuildsService],
})
export class GuildsModule {}
