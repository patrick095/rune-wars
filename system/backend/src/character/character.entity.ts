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

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 20, default: 'human' })
  race: string;

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

  @Column({ default: 0 })
  gold: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ItemInstance, i => i.owner)
  items: ItemInstance[];
}
