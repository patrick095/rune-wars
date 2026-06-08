import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { ItemInstance } from '../inventory/item-instance.entity';

@Entity('character')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, u => u.characters)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 50 })
  name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 0 })
  strength: number;

  @Column({ default: 0 })
  agility: number;

  @Column({ default: 0 })
  vitality: number;

  @Column({ default: 0 })
  luck: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ItemInstance, i => i.owner)
  items: ItemInstance[];
}
