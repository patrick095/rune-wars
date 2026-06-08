import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemBinding } from './item-binding.entity';
import { InventorySlotsService } from './inventory-slots.service';
import { InventorySlotsController } from './inventory-slots.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ItemBinding])],
  providers: [InventorySlotsService],
  controllers: [InventorySlotsController],
  exports: [InventorySlotsService],
})
export class InventorySlotsModule {}
