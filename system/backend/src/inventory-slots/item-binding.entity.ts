import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { BindingType } from './equipment-slot.enum';

@Entity('item_binding')
export class ItemBinding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  item_instance_id: string;

  @Column({ default: BindingType.TRANSFERABLE })
  binding_type: string;

  @Column({ default: false })
  is_bound: boolean;

  @CreateDateColumn()
  created_at: Date;
}
