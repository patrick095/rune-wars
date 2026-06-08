import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('market_listing')
export class MarketListing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  seller_id: string;      // character_id

  @Column()
  item_instance_id: string;

  @Column()
  item_base_id: string;

  @Column({ default: 'common' })
  item_rarity: string;

  @Column()
  price: number;

  @Column({ default: 'active' })
  status: string;  // active | sold | cancelled | expired

  @Column({ nullable: true })
  buyer_id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp' })
  expires_at: Date;
}
