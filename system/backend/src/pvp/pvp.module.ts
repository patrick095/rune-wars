import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PvpRoom } from './pvp-room.entity';
import { ItemInstance } from '../inventory/item-instance.entity';
import { PvpService } from './pvp.service';
import { PvpController } from './pvp.controller';
import { CharacterModule } from '../character/character.module';
import { PortalModule } from '../dungeon-rewards/portal.module';

@Module({
  imports: [TypeOrmModule.forFeature([PvpRoom, ItemInstance]), CharacterModule, PortalModule],
  providers: [PvpService],
  controllers: [PvpController],
  exports: [PvpService],
})
export class PvpModule {}
