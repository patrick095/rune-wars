import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('guild_chat_message')
export class GuildChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  guild_id: string;

  @Column()
  character_id: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  created_at: Date;
}
