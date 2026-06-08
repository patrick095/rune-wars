import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('character_progression')
export class CharacterProgression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  character_id: string;

  @Column({ default: 'human' })
  race: string;

  @Column({ default: 0 })
  attribute_points: number;

  @Column({ default: 0 })
  total_xp_earned: number;

  @UpdateDateColumn()
  updated_at: Date;
}
