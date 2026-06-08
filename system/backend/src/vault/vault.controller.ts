import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VaultService } from './vault.service';
import { DepositItemDto } from './dto/deposit-item.dto';
import { WithdrawItemDto } from './dto/withdraw-item.dto';
import { DepositGoldDto } from './dto/deposit-gold.dto';
import { WithdrawGoldDto } from './dto/withdraw-gold.dto';

@Controller('vault')
@UseGuards(JwtAuthGuard)
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get()
  getVault(@Request() req: any) {
    return this.vaultService.getVault(req.user.userId);
  }

  @Post('deposit/item')
  depositItem(@Request() req: any, @Body() dto: DepositItemDto) {
    return this.vaultService.depositItem(req.user.userId, dto);
  }

  @Post('withdraw/item')
  withdrawItem(@Request() req: any, @Body() dto: WithdrawItemDto) {
    return this.vaultService.withdrawItem(req.user.userId, dto);
  }

  @Post('deposit/gold')
  depositGold(@Request() req: any, @Body() dto: DepositGoldDto) {
    return this.vaultService.depositGold(req.user.userId, dto);
  }

  @Post('withdraw/gold')
  withdrawGold(@Request() req: any, @Body() dto: WithdrawGoldDto) {
    return this.vaultService.withdrawGold(req.user.userId, dto);
  }
}
