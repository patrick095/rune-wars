import { Module } from '@nestjs/common';
import { BattleGateway } from './battle.gateway';
import { MatchmakingService } from './matchmaking.service';

@Module({
  providers: [BattleGateway, MatchmakingService],
})
export class BattleModule {}
