import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('guild')
export class Guild {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  leader_character_id: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 0 })
  gold_bank: number;

  @Column({ default: 0 })
  pvp_points: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
