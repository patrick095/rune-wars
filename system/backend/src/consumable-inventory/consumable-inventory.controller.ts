import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConsumableInventoryService } from './consumable-inventory.service';

@Controller('characters/:characterId/consumables')
@UseGuards(JwtAuthGuard)
export class ConsumableInventoryController {
  constructor(private readonly service: ConsumableInventoryService) {}

  @Get()
  getConsumables(@Param('characterId') characterId: string) {
    return this.service.getConsumables(characterId);
  }

  @Post('use')
  async useConsumable(
    @Param('characterId') characterId: string,
    @Body('consumableId') consumableId: string,
    @Req() req: any,
  ) {
    if (req.user?.isAdmin !== true) {
      const isOwner = await this.service.validateOwnership(characterId, req.user?.userId);
      if (!isOwner) {
        throw new ForbiddenException('Access denied');
      }
    }
    return this.service.useConsumable(characterId, consumableId);
  }

  @Post('add')
  async addConsumable(
    @Param('characterId') characterId: string,
    @Body('consumableId') consumableId: string,
    @Body('quantity') quantity: number,
    @Req() req: any,
  ) {
    if (req.user?.isAdmin !== true) {
      const isOwner = await this.service.validateOwnership(characterId, req.user?.userId);
      if (!isOwner) {
        throw new ForbiddenException('Access denied');
      }
    }
    return this.service.addConsumable(characterId, consumableId, quantity);
  }
}
