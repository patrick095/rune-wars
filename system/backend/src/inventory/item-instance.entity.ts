import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Character } from '../character/character.entity';

@Entity('item_instance')
export class ItemInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  owner_id: string;

  @ManyToOne(() => Character, c => c.items)
  @JoinColumn({ name: 'owner_id' })
  owner: Character;

  @Column()
  item_base_id: string;

  @Column({ default: 'common' })
  rarity: string;

  @Column({ default: 0 })
  upgrade_level: number;

  @Column({ nullable: true })
  equipped_slot: string;

  @CreateDateColumn()
  created_at: Date;
}
