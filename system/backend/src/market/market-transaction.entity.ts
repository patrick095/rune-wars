import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('market_transaction')
export class MarketTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  listing_id: string;

  @Column()
  seller_id: string;

  @Column()
  buyer_id: string;

  @Column()
  item_instance_id: string;

  @Column()
  gross_price: number;

  @Column({ type: 'float' })
  fee: number;

  @Column()
  net_price: number;

  @CreateDateColumn()
  created_at: Date;
}
