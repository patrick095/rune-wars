import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'alltime';
export type RankingCategory = 'pvp_solo' | 'pvp_duo' | 'guild';

@Entity('ranking_entry')
@Index(['period', 'category', 'score'])
export class RankingEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  character_id: string;

  @Column({ nullable: true })
  guild_id: string;

  @Column()
  period: string;   // daily | weekly | monthly | alltime

  @Column()
  category: string; // pvp_solo | pvp_duo | guild

  @Column({ default: 0 })
  score: number;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;

  @Column({ type: 'varchar', length: 10 })
  period_key: string;  // ex: "2026-06-08" (daily), "2026-W23" (weekly), "2026-06" (monthly), "all"

  @CreateDateColumn()
  created_at: Date;
}
