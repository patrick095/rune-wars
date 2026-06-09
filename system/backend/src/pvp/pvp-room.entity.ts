import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type RoomStatus = 'waiting' | 'active' | 'closed';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
