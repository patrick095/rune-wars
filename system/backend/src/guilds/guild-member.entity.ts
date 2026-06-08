import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum GuildRole {
  LEADER = 'leader',
  OFFICER = 'officer',
  MEMBER = 'member',
}

@Entity('guild_member')
export class GuildMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  guild_id: string;

  @Column({ unique: true })
  character_id: string;

  @Column({ default: GuildRole.MEMBER })
  role: string;

  @Column({ default: 0 })
  contribution_xp: number;

  @CreateDateColumn()
  joined_at: Date;
}
