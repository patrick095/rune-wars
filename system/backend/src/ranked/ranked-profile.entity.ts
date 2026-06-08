import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('ranked_profile')
export class RankedProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  character_id: string;

  @Column({ default: 1200 })
  solo_rating: number;

  @Column({ default: 'bronze' })
  solo_division: string;

  @Column({ default: 0 })
  solo_wins: number;

  @Column({ default: 0 })
  solo_losses: number;

  @Column({ default: 1200 })
  duo_rating: number;

  @Column({ default: 'bronze' })
  duo_division: string;

  @Column({ default: 0 })
  duo_wins: number;

  @Column({ default: 0 })
  duo_losses: number;

  @UpdateDateColumn()
  updated_at: Date;
}
