import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventorySlotsService } from './inventory-slots.service';
import { BindingType } from './equipment-slot.enum';

@Controller('inventory-slots')
@UseGuards(JwtAuthGuard)
export class InventorySlotsController {
  constructor(private service: InventorySlotsService) {}

  @Get('slots')
  getSlots() {
    return this.service.getEquipmentSlots();
  }

  @Get('binding/:itemId')
  getBinding(@Param('itemId') id: string) {
    return this.service.getBinding(id);
  }

  @Post('binding/:itemId')
  setBinding(@Param('itemId') id: string, @Body() body: { type: BindingType }) {
    return this.service.setBindingType(id, body.type);
  }

  @Get('can-sell/:itemId')
  canSell(@Param('itemId') id: string) {
    return this.service.canSell(id).then(ok => ({ canSell: ok }));
  }
}
