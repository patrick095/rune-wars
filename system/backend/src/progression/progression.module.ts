import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterProgression } from './character-progression.entity';
import { ProgressionService } from './progression.service';
import { ProgressionController } from './progression.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterProgression])],
  providers: [ProgressionService],
  controllers: [ProgressionController],
  exports: [ProgressionService],
})
export class ProgressionModule {}
