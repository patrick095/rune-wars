import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Character } from '../character/character.entity';

@Entity('dungeon_progress')
export class DungeonProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  character_id: string;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({ default: 1 })
  floor: number;

  @Column({ default: 1 })
  phase: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'jsonb', default: { easy: 0, medium: 0, hard: 0, heroic: 0 } })
  cleared_by_difficulty: { easy: number; medium: number; hard: number; heroic: number };

  @UpdateDateColumn()
  updated_at: Date;
}
