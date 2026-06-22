import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpgradeAttempt } from './upgrade-attempt.entity';
import { UpgradeService } from './upgrade.service';
import { UpgradeController } from './upgrade.controller';
import { ItemInstance } from '../inventory/item-instance.entity';
import { CharacterModule } from '../character/character.module';
import { Character } from '../character/character.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UpgradeAttempt, ItemInstance, Character]), CharacterModule],
  providers: [UpgradeService],
  controllers: [UpgradeController],
  exports: [UpgradeService],
})
export class UpgradeModule {}
