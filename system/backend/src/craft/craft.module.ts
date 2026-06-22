import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CraftRecipe } from './craft-recipe.entity';
import { CraftAttempt } from './craft-attempt.entity';
import { CraftService } from './craft.service';
import { CraftController } from './craft.controller';
import { ItemInstance } from '../inventory/item-instance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CraftRecipe, CraftAttempt, ItemInstance])],
  providers: [CraftService],
  controllers: [CraftController],
  exports: [CraftService],
})
export class CraftModule {}
