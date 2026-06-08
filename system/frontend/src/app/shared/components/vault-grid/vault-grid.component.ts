import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemSlotComponent } from '../item-slot/item-slot.component';
import { VaultService, VaultData } from '../../services/vault.service';
import { InventoryItem } from '../../game-core/types';

@Component({
  selector: 'app-vault-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemSlotComponent],
  templateUrl: './vault-grid.component.html',
  styleUrls: ['./vault-grid.component.scss']
})
export class VaultGridComponent implements OnInit {
  @Input() characterId: number = 0;
  @Input() characterGold: number = 0;
  @Output() vaultChanged = new EventEmitter<void>();

  vault: VaultData | null = null;
  loading = false;
  error = '';

  // Gold withdrawal/deposit forms
  goldWithdrawAmount = 0;
  goldDepositAmount = 0;

  get vaultSlots(): (InventoryItem | null)[] {
    const slots = new Array(60).fill(null);
    if (this.vault?.slots) {
      this.vault.slots.forEach(s => {
        if (s.slotIndex >= 0 && s.slotIndex < 60) slots[s.slotIndex] = s.item;
      });
    }
    return slots;
  }

  get goldFeePreview(): number {
    return this.vaultService.calculateGoldFee(this.goldWithdrawAmount);
  }

  get canWithdrawGold(): boolean {
    const total = this.goldWithdrawAmount + this.goldFeePreview;
    return this.goldWithdrawAmount > 0 && (this.vault?.gold ?? 0) >= total;
  }

  constructor(private vaultService: VaultService) {}

  ngOnInit(): void {
    this.loadVault();
  }

  loadVault(): void {
    this.loading = true;
    this.vaultService.getVault().subscribe({
      next: v => { this.vault = v; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Erro ao carregar cofre'; }
    });
  }

  canWithdrawItem(_slotIndex: number): boolean {
    return this.characterGold >= this.vaultService.VAULT_ITEM_FEE;
  }

  onWithdrawItem(slotIndex: number): void {
    if (!this.canWithdrawItem(slotIndex)) {
      this.error = `Gold insuficiente. Necessário: ${this.vaultService.VAULT_ITEM_FEE} gold`;
      return;
    }
    this.vaultService.withdrawItem(this.characterId, slotIndex, -1).subscribe({
      next: () => { this.loadVault(); this.vaultChanged.emit(); },
      error: (err: any) => { this.error = err?.error?.message || 'Erro ao retirar item'; }
    });
  }

  onDepositGold(): void {
    if (this.goldDepositAmount <= 0) return;
    this.vaultService.depositGold(this.characterId, this.goldDepositAmount).subscribe({
      next: () => { this.loadVault(); this.vaultChanged.emit(); this.goldDepositAmount = 0; },
      error: (err: any) => { this.error = err?.error?.message || 'Erro ao depositar gold'; }
    });
  }

  onWithdrawGold(): void {
    if (!this.canWithdrawGold) return;
    this.vaultService.withdrawGold(this.characterId, this.goldWithdrawAmount).subscribe({
      next: () => { this.loadVault(); this.vaultChanged.emit(); this.goldWithdrawAmount = 0; },
      error: (err: any) => { this.error = err?.error?.message || 'Erro ao retirar gold'; }
    });
  }
}
