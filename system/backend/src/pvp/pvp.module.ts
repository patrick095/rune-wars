import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PvpRoom } from './pvp-room.entity';
import { PvpService } from './pvp.service';
import { PvpController } from './pvp.controller';
import { CharacterModule } from '../character/character.module';

@Module({
  imports: [TypeOrmModule.forFeature([PvpRoom]), CharacterModule],
  providers: [PvpService],
  controllers: [PvpController],
  exports: [PvpService],
})
export class PvpModule {}
