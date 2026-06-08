import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('dungeon_lobby')
export class DungeonLobby {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  leader_character_id: string;

  @Column('simple-array')
  member_character_ids: string[];

  @Column({ default: 1 })
  floor: number;

  @Column({ default: 'initiates' })
  track: string;

  @Column({ default: 'waiting' })
  status: string;  // waiting | in_progress | completed | failed

  @Column({ default: 1 })
  current_phase: number;

  @CreateDateColumn()
  created_at: Date;
}
