import { Controller, Get, Param, Put, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@Controller('characters/:characterId/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Get()
  list(@Param('characterId') cid: string, @Request() req: any) {
    return this.service.list(cid, req.user.userId);
  }

  @Put(':itemId/equip')
  equip(@Param('characterId') cid: string, @Param('itemId') iid: string, @Body() body: { slot: string }, @Request() req: any) {
    return this.service.equip(iid, body.slot, cid, req.user.userId);
  }

  @Put(':itemId/unequip')
  unequip(@Param('characterId') cid: string, @Param('itemId') iid: string, @Request() req: any) {
    return this.service.unequip(iid, cid, req.user.userId);
  }

  /**
   * Accepts inventory reorder requests from the DnD UI.
   * Visual reordering is handled client-side; this endpoint acknowledges the
   * request so the frontend does not receive a 404 error.
   */
  @Post('move')
  move(
    @Param('characterId') cid: string,
    @Body() body: { fromIndex: number; toIndex: number },
    @Request() req: any,
  ) {
    return this.service.move(cid, req.user.userId, body.fromIndex, body.toIndex);
  }
}
