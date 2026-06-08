import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vault } from './vault.entity';

@Entity('vault_slots')
export class VaultSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vaultId: number;

  @Column({ type: 'int' })
  slotIndex: number; // 0–59

  @Column({ type: 'jsonb', nullable: true })
  item: any; // serialized item object

  @ManyToOne(() => Vault, vault => vault.slots)
  @JoinColumn({ name: 'vaultId' })
  vault: Vault;
}
