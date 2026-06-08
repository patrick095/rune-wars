import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketListing } from './market-listing.entity';
import { MarketTransaction } from './market-transaction.entity';

const FEE_RATE = 0.05;
const LISTING_DAYS = 7;

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(MarketListing) private listingRepo: Repository<MarketListing>,
    @InjectRepository(MarketTransaction) private txRepo: Repository<MarketTransaction>,
  ) {}

  async list(sellerId: string, itemInstanceId: string, itemBaseId: string, itemRarity: string, price: number): Promise<MarketListing> {
    if (price <= 0) throw new BadRequestException('Price must be positive');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + LISTING_DAYS);
    const listing = this.listingRepo.create({
      seller_id: sellerId,
      item_instance_id: itemInstanceId,
      item_base_id: itemBaseId,
      item_rarity: itemRarity,
      price,
      expires_at: expiresAt,
    });
    return this.listingRepo.save(listing);
  }

  async buy(listingId: string, buyerId: string): Promise<{ listing: MarketListing; transaction: MarketTransaction }> {
    const listing = await this.listingRepo.findOne({ where: { id: listingId, status: 'active' } });
    if (!listing) throw new NotFoundException('Listing not found or not active');
    if (listing.seller_id === buyerId) throw new BadRequestException('Cannot buy your own listing');
    if (new Date() > listing.expires_at) {
      listing.status = 'expired';
      await this.listingRepo.save(listing);
      throw new BadRequestException('Listing has expired');
    }

    const fee = Math.floor(listing.price * FEE_RATE);
    const net = listing.price - fee;

    listing.status = 'sold';
    listing.buyer_id = buyerId;
    await this.listingRepo.save(listing);

    const tx = this.txRepo.create({
      listing_id: listing.id,
      seller_id: listing.seller_id,
      buyer_id: buyerId,
      item_instance_id: listing.item_instance_id,
      gross_price: listing.price,
      fee,
      net_price: net,
    });
    await this.txRepo.save(tx);

    return { listing, transaction: tx };
  }

  async cancel(listingId: string, sellerId: string): Promise<MarketListing> {
    const listing = await this.listingRepo.findOne({ where: { id: listingId, seller_id: sellerId, status: 'active' } });
    if (!listing) throw new NotFoundException('Active listing not found');
    listing.status = 'cancelled';
    return this.listingRepo.save(listing);
  }

  async search(query: { itemBaseId?: string; rarity?: string; minPrice?: number; maxPrice?: number; limit?: number }): Promise<MarketListing[]> {
    const qb = this.listingRepo.createQueryBuilder('l')
      .where('l.status = :status', { status: 'active' })
      .andWhere('l.expires_at > :now', { now: new Date() });

    if (query.itemBaseId) qb.andWhere('l.item_base_id = :itemBaseId', { itemBaseId: query.itemBaseId });
    if (query.rarity) qb.andWhere('l.item_rarity = :rarity', { rarity: query.rarity });
    if (query.minPrice) qb.andWhere('l.price >= :min', { min: query.minPrice });
    if (query.maxPrice) qb.andWhere('l.price <= :max', { max: query.maxPrice });

    return qb.orderBy('l.price', 'ASC').take(query.limit ?? 50).getMany();
  }

  async getHistory(characterId: string): Promise<MarketTransaction[]> {
    return this.txRepo.find({
      where: [{ seller_id: characterId }, { buyer_id: characterId }],
      order: { created_at: 'DESC' },
      take: 100,
    });
  }

  async getMyListings(sellerId: string): Promise<MarketListing[]> {
    return this.listingRepo.find({ where: { seller_id: sellerId }, order: { created_at: 'DESC' } });
  }
}
