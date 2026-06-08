import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CraftRecipe } from './craft-recipe.entity';
import { CraftAttempt } from './craft-attempt.entity';
import { CraftService } from './craft.service';
import { CraftController } from './craft.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CraftRecipe, CraftAttempt])],
  providers: [CraftService],
  controllers: [CraftController],
  exports: [CraftService],
})
export class CraftModule {}
