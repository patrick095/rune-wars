import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vault } from './vault.entity';
import { VaultSlot } from './vault-slot.entity';
import { VaultService } from './vault.service';
import { VaultController } from './vault.controller';
import { Character } from '../character/character.entity';
import { ItemInstance } from '../inventory/item-instance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vault, VaultSlot, Character, ItemInstance])],
  providers: [VaultService],
  controllers: [VaultController],
  exports: [VaultService],
})
export class VaultModule {}
