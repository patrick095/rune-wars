import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type RoomStatus = 'waiting' | 'active' | 'closed';
export type RoomMode = 'ranked' | 'free' | 'guild';

export interface SlotState {
  playerId: string | null;
  playerName: string | null;
  closed: boolean;
  ready?: boolean;
  consumableSelection?: string[];
}

@Entity('pvp_rooms')
export class PvpRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  ownerCharacterId: string | null;

  @Column('simple-array', { default: '' })
  playerIds: string[];

  @Column({ default: 'plains' })
  mapName: string;

  @Column({ default: 1 })
  playerCount: number;

  @Column({ default: 2 })
  maxPlayers: number;

  @Column({ default: 'waiting' })
  status: RoomStatus;

  @Column({ type: 'jsonb', default: [] })
  slots: SlotState[];

  @Column({ default: 'free' })
  mode: string;

  @Column({ default: 'plains' })
  map_slug: string;

  @Column({ default: false })
  vs_cpu: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
