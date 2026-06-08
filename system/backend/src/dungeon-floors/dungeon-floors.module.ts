import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DungeonLobby } from './dungeon-lobby.entity';
import { DungeonFloorsService } from './dungeon-floors.service';
import { DungeonFloorsController } from './dungeon-floors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DungeonLobby])],
  providers: [DungeonFloorsService],
  controllers: [DungeonFloorsController],
  exports: [DungeonFloorsService],
})
export class DungeonFloorsModule {}
