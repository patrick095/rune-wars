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

  @UpdateDateColumn()
  updated_at: Date;
}
