import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MarketService } from './market.service';

@Controller('market')
@UseGuards(JwtAuthGuard)
export class MarketController {
  constructor(private service: MarketService) {}

  @Get()
  search(
    @Query('itemBaseId') itemBaseId?: string,
    @Query('rarity') rarity?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.search({
      itemBaseId,
      rarity,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      limit: limit ? Number(limit) : 50,
    });
  }

  @Get('my-listings')
  myListings(@Request() req: any) {
    // sellerId passado via body ou query; usamos query para GET
    return this.service.getMyListings(req.query?.sellerId ?? '');
  }

  @Get('history/:characterId')
  history(@Param('characterId') cid: string) {
    return this.service.getHistory(cid);
  }

  @Post('list')
  list(@Body() body: { sellerId: string; itemInstanceId: string; itemBaseId: string; itemRarity: string; price: number }) {
    return this.service.list(body.sellerId, body.itemInstanceId, body.itemBaseId, body.itemRarity, body.price);
  }

  @Post('buy/:id')
  buy(@Param('id') id: string, @Body() body: { buyerId: string }) {
    return this.service.buy(id, body.buyerId);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @Body() body: { sellerId: string }) {
    return this.service.cancel(id, body.sellerId);
  }
}
