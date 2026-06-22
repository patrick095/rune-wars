import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DungeonLobby } from './dungeon-lobby.entity';
import { DungeonFloorsService } from './dungeon-floors.service';
import { DungeonFloorsController } from './dungeon-floors.controller';
import { CharacterModule } from '../character/character.module';
import { DungeonModule } from '../dungeon/dungeon.module';
import { PortalModule } from '../dungeon-rewards/portal.module';
import { ItemInstance } from '../inventory/item-instance.entity';
import { DungeonPresenceGateway } from './dungeon-presence.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([DungeonLobby, ItemInstance]), CharacterModule, DungeonModule, PortalModule],
  providers: [DungeonFloorsService, DungeonPresenceGateway],
  controllers: [DungeonFloorsController],
  exports: [DungeonFloorsService],
})
export class DungeonFloorsModule {}
