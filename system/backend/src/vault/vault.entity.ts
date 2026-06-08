import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VaultSlot } from './vault-slot.entity';

@Entity('vaults')
export class Vault {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: string;

  @Column({ type: 'int', default: 0 })
  gold: number;

  @OneToMany(() => VaultSlot, slot => slot.vault, { cascade: true, eager: true })
  slots: VaultSlot[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
