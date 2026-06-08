import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('upgrade_attempt')
export class UpgradeAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  character_id: string;

  @Column()
  item_instance_id: string;

  @Column()
  from_level: number;

  @Column({ default: false })
  success: boolean;

  @Column({ nullable: true })
  to_level: number;

  @CreateDateColumn()
  created_at: Date;
}
