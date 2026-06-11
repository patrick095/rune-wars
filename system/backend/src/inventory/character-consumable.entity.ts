import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('character_consumable')
export class CharacterConsumable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  character_id: string;

  @Column()
  consumable_id: string;

  @Column({ default: 0 })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;
}
