import {
  Controller,
  Delete,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('characters')
  listCharacters() {
    return this.adminService.listCharacters();
  }

  @Get('characters/:id/inventory')
  getCharacterInventory(@Param('id') id: string) {
    return this.adminService.getCharacterInventory(id);
  }

  @Post('characters/:id/inventory/add')
  addItemToInventory(
    @Param('id') id: string,
    @Body() body: { item_base_id: string; rarity?: string; quantity?: number; upgrade_level?: number },
  ) {
    return this.adminService.addItemToInventory(
      id,
      body.item_base_id,
      body.rarity ?? 'common',
      body.quantity ?? 1,
      body.upgrade_level ?? 0,
    );
  }

  @Delete('characters/:id/inventory/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.adminService.removeItem(itemId);
  }

  @Post('characters/:id/gold/add')
  addGold(
    @Param('id') id: string,
    @Body() body: { amount: number },
  ) {
    return this.adminService.addGold(id, body.amount);
  }
}
