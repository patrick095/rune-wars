import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { VaultService, VaultData } from '../shared/services/vault.service';
import { InventoryService } from '../shared/services/inventory.service';
import { GameNavigatorService } from '../shared/services/game-navigator.service';
import { ActiveCharacterService } from '../shared/services/active-character.service';
import { InventoryItem, EquipmentSlotType } from '../shared/game-core/types';
import { InventoryGridComponent } from '../shared/components/inventory-grid/inventory-grid.component';
import { ItemSlotComponent } from '../shared/components/item-slot/item-slot.component';
import { EquipmentSlotsComponent } from '../shared/components/equipment-slots/equipment-slots.component';

const VAULT_GRID_SIZE = 60;

@Component({
  selector: 'app-vault-screen',
  standalone: true,
  imports: [CommonModule, InventoryGridComponent, ItemSlotComponent, EquipmentSlotsComponent],
  templateUrl: './vault-screen.component.html',
  styleUrls: ['./vault-screen.component.scss'],
})
export class VaultScreenComponent implements OnInit {
  private vaultService = inject(VaultService);
  private inventoryService = inject(InventoryService);
  private gameNavigator = inject(GameNavigatorService);
  private activeCharacter = inject(ActiveCharacterService);

  inventoryItems: (InventoryItem | null)[] = [];
  equippedItems: Partial<Record<EquipmentSlotType, InventoryItem>> = {};
  vault: VaultData | null = null;
  loading = false;
  error = '';

  // Modal state for withdrawal confirmation
  showWithdrawModal = false;
  pendingWithdrawSlotIndex: number | null = null;
  pendingWithdrawItem: InventoryItem | null = null;

  get characterId(): string {
    return this.activeCharacter.characterId ?? '';
  }

  get characterGold(): number {
    return this.activeCharacter.character?.gold ?? 0;
  }

  get vaultGold(): number {
    return this.vault?.gold ?? 0;
  }

  get vaultSlots(): (InventoryItem | null)[] {
    const slots = new Array<InventoryItem | null>(VAULT_GRID_SIZE).fill(null);
    if (this.vault?.slots) {
      this.vault.slots.forEach(s => {
        if (s.slotIndex >= 0 && s.slotIndex < VAULT_GRID_SIZE) {
          slots[s.slotIndex] = s.item as InventoryItem | null;
        }
      });
    }
    return slots;
  }

  readonly withdrawFee = this.vaultService.VAULT_ITEM_FEE;

  get canConfirmWithdraw(): boolean {
    return this.characterGold >= this.vaultService.VAULT_ITEM_FEE;
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    if (!this.characterId) return;
    this.loading = true;
    this.error = '';

    forkJoin({
      inventory: this.inventoryService.getInventory(this.characterId),
      vault: this.vaultService.getVault(),
    }).subscribe({
      next: ({ inventory, vault }) => {
        const equipped: Partial<Record<EquipmentSlotType, InventoryItem>> = {};
        const bag: (InventoryItem | null)[] = [];
        for (const item of inventory) {
          if (item.equipped_slot) {
            equipped[item.equipped_slot as EquipmentSlotType] = item;
          } else {
            bag.push(item);
          }
        }
        this.equippedItems = equipped;
        this.inventoryItems = bag;
        this.vault = vault;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar dados. Tente novamente.';
        this.loading = false;
      },
    });
  }

  /** Click on equipped slot → unequip item back to bag */
  onUnequip(event: { slot: EquipmentSlotType }): void {
    const item = this.equippedItems[event.slot];
    if (!item) return;
    this.inventoryService.unequipItem(this.characterId, item.id).subscribe({
      next: () => this.loadAll(),
      error: () => { this.error = 'Erro ao desequipar item.'; },
    });
  }

  /** Drag from inventory slot → vault slot: deposit item */
  onDropToVault(event: { fromIndex: number; toIndex: number }): void {
    const item = this.inventoryItems[event.fromIndex];
    if (!item) return;

    this.vaultService.depositItem(this.characterId, item.id, event.toIndex).subscribe({
      next: () => this.loadAll(),
      error: (err: any) => {
        this.error = err?.error?.message || 'Erro ao depositar item no cofre.';
      },
    });
  }

  /** Drag from vault slot → inventory: show confirmation modal */
  onDropToInventory(event: { fromIndex: number; toIndex: number }): void {
    const item = this.vaultSlots[event.fromIndex];
    if (!item) return;

    this.pendingWithdrawSlotIndex = event.fromIndex;
    this.pendingWithdrawItem = item;
    this.showWithdrawModal = true;
  }

  confirmWithdraw(): void {
    if (this.pendingWithdrawSlotIndex === null) return;

    this.vaultService.withdrawItem(this.characterId, this.pendingWithdrawSlotIndex, -1).subscribe({
      next: () => {
        this.closeModal();
        this.loadAll();
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Erro ao retirar item do cofre.';
        this.closeModal();
      },
    });
  }

  cancelWithdraw(): void {
    this.closeModal();
  }

  private closeModal(): void {
    this.showWithdrawModal = false;
    this.pendingWithdrawSlotIndex = null;
    this.pendingWithdrawItem = null;
  }

  close(): void {
    this.gameNavigator.goTo('hub');
  }
}
