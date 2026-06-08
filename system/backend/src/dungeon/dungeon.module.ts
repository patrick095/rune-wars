import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DungeonProgress } from './dungeon-progress.entity';
import { DungeonService } from './dungeon.service';
import { DungeonController } from './dungeon.controller';
import { CharacterModule } from '../character/character.module';

@Module({
  imports: [TypeOrmModule.forFeature([DungeonProgress]), CharacterModule],
  providers: [DungeonService],
  controllers: [DungeonController],
})
export class DungeonModule {}
