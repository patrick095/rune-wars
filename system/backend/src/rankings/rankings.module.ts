import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingEntry } from './ranking-entry.entity';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RankingEntry])],
  providers: [RankingsService],
  controllers: [RankingsController],
  exports: [RankingsService],
})
export class RankingsModule {}
