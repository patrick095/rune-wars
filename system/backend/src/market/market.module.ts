import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketListing } from './market-listing.entity';
import { MarketTransaction } from './market-transaction.entity';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MarketListing, MarketTransaction])],
  providers: [MarketService],
  controllers: [MarketController],
  exports: [MarketService],
})
export class MarketModule {}
