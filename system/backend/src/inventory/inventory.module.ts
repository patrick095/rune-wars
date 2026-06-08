import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemInstance } from './item-instance.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { CharacterModule } from '../character/character.module';

@Module({
  imports: [TypeOrmModule.forFeature([ItemInstance]), CharacterModule],
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {}
