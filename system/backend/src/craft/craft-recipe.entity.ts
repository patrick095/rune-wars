import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('craft_recipe')
export class CraftRecipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  result_item_base_id: string;

  @Column({ default: 'common' })
  result_rarity: string;

  @Column('jsonb')
  materials: Array<{ itemBaseId: string; quantity: number }>;

  @Column({ type: 'float', default: 0.7 })
  base_craft_chance: number;

  @Column({ type: 'float', default: 0.001 })
  luck_scaling: number;  // bônus por ponto de Sorte

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
