import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export interface DungeonSlot {
  playerId: string;
  playerName: string;
  ready: boolean;
  weaponId?: string | null;
  consumableSelection?: string[];
  equippedLoadout?: Record<string, unknown> | null;
  hp?: number;
  maxHp?: number;
}

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

  @Column({ default: 'easy' })
  difficulty: string;

  @Column({ default: 4 })
  max_members: number;

  @Column({ type: 'jsonb', default: [] })
  slots: DungeonSlot[];

  @Column({ default: 'waiting' })
  status: string;  // waiting | in_battle | portal | regroup | completed | failed

  @Column({ default: 1 })
  current_phase: number;

  @Column({ default: 1 })
  current_stage: number;

  @Column({ default: 2 })
  stage_count: number;

  @Column({ type: 'jsonb', nullable: true })
  portal_state: Record<string, unknown> | null;

  @CreateDateColumn()
  created_at: Date;
}
