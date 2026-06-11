import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterConsumable } from '../inventory/character-consumable.entity';
import { Character } from '../character/character.entity';
import { ConsumableInventoryService } from './consumable-inventory.service';
import { ConsumableInventoryController } from './consumable-inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterConsumable, Character])],
  providers: [ConsumableInventoryService],
  controllers: [ConsumableInventoryController],
  exports: [ConsumableInventoryService],
})
export class ConsumableInventoryModule {}
