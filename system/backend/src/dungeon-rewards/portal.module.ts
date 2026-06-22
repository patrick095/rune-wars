import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterModule } from '../character/character.module';
import { ItemInstance } from '../inventory/item-instance.entity';
import { PortalService } from './portal.service';

@Module({
  imports: [TypeOrmModule.forFeature([ItemInstance]), CharacterModule],
  providers: [PortalService],
  exports: [PortalService],
})
export class PortalModule {}
