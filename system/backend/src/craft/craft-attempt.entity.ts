import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('craft_attempt')
export class CraftAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  character_id: string;

  @Column()
  recipe_id: string;

  @Column({ default: false })
  success: boolean;

  @Column({ nullable: true })
  result_item_instance_id: string;

  @CreateDateColumn()
  created_at: Date;
}
