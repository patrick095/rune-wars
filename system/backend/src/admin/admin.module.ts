import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from '../character/character.entity';
import { ItemInstance } from '../inventory/item-instance.entity';
import { CharacterConsumable } from '../inventory/character-consumable.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Character, ItemInstance, CharacterConsumable])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
