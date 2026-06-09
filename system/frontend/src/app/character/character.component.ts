import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttributeCalculator } from '../shared/game-core/attribute-calculator';
import { WeaponSystem } from '../shared/game-core/weapon-system';
import { canUseWeapon } from '../shared/game-core/weapon-requirements';
import { PlayerBaseStats, PlayerStats } from '../shared/game-core/player-stats';
import { WeaponDefinition } from '../shared/game-core/weapon-definition';
import { CharacterStorageService } from '../shared/services/character-storage.service';
import { InventoryService } from '../shared/services/inventory.service';
import { ActiveCharacterService } from '../shared/services/active-character.service';
import { BuildPreset, CHARACTER_PRESETS } from './character-presets';
import { InventoryItem, EquipmentSlotType } from '../shared/game-core/types';
import { EquipmentSlotsComponent } from '../shared/components/equipment-slots/equipment-slots.component';
import { InventoryGridComponent } from '../shared/components/inventory-grid/inventory-grid.component';
import { VaultGridComponent } from '../shared/components/vault-grid/vault-grid.component';

interface WeaponEntry {
  weapon: WeaponDefinition;
  canUse: boolean;
}

@Component({
  selector: 'app-character',
  standalone: true,
  imports: [CommonModule, FormsModule, EquipmentSlotsComponent, InventoryGridComponent, VaultGridComponent],
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
})
export class CharacterComponent implements OnInit {
  private readonly calculator = new AttributeCalculator();
  private readonly weaponSystem = new WeaponSystem();

  base: PlayerBaseStats = { level: 1, strength: 0, agility: 0, vitality: 0, luck: 0 };
  presets: BuildPreset[] = CHARACTER_PRESETS;
  saveMessage = '';
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  // ── Inventory state ───────────────────────────────────────────────────────
  activeTab: 'character' | 'inventory' | 'vault' = 'character';
  inventoryItems: (InventoryItem | null)[] = [];
  equippedItems: Partial<Record<EquipmentSlotType, InventoryItem>> = {};
  inventoryLoading = false;

  private activeCharacter = inject(ActiveCharacterService);

  /** UUID of the active character, used when calling the backend. */
  get characterId(): string | null {
    return this.activeCharacter.characterId;
  }

  constructor(
    private storageService: CharacterStorageService,
    private inventoryService: InventoryService,
  ) {}

  ngOnInit(): void {
    const saved = this.storageService.load();
    if (saved) {
      this.base = { ...saved };
    }
  }

  // ── Existing character logic ──────────────────────────────────────────────

  get stats(): PlayerStats {
    return this.calculator.calculate(this.base);
  }

  get weapons(): WeaponEntry[] {
    const currentStats = this.stats;
    return this.weaponSystem.getAll().map((weapon) => ({
      weapon,
      canUse: canUseWeapon(currentStats, weapon),
    }));
  }

  get availablePoints(): number {
    return this.stats.totalPoints - this.stats.usedPoints;
  }

  increment(attr: 'strength' | 'agility' | 'vitality' | 'luck'): void {
    if (this.availablePoints > 0) {
      this.base = { ...this.base, [attr]: this.base[attr] + 1 };
    }
  }

  decrement(attr: 'strength' | 'agility' | 'vitality' | 'luck'): void {
    if (this.base[attr] > 0) {
      this.base = { ...this.base, [attr]: this.base[attr] - 1 };
    }
  }

  incrementLevel(): void {
    if (this.base.level < 100) {
      this.base = { ...this.base, level: this.base.level + 1 };
    }
  }

  decrementLevel(): void {
    if (this.base.level > 1) {
      const newLevel = this.base.level - 1;
      const newTotal = (newLevel - 1) * 4;
      const used = this.base.strength + this.base.agility + this.base.vitality + this.base.luck;
      if (used <= newTotal) {
        this.base = { ...this.base, level: newLevel };
      }
    }
  }

  applyPreset(preset: BuildPreset): void {
    this.base = { ...preset.stats };
  }

  save(): void {
    this.storageService.save(this.base);
    this.saveMessage = 'Salvo!';
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => { this.saveMessage = ''; }, 2000);
  }

  // ── Tab navigation ────────────────────────────────────────────────────────

  setTab(tab: 'character' | 'inventory' | 'vault'): void {
    this.activeTab = tab;
    if (tab === 'inventory') {
      this.loadInventory();
    }
  }

  // ── Inventory logic ───────────────────────────────────────────────────────

  loadInventory(): void {
    const charId = this.characterId;
    if (this.inventoryLoading) return;
    if (!charId) {
      this.inventoryItems = [];
      return;
    }
    this.inventoryLoading = true;
    this.inventoryService.getInventory(charId).subscribe({
      next: (items) => {
        this.inventoryItems = items;
        this.inventoryLoading = false;
      },
      error: () => {
        this.inventoryItems = [];
        this.inventoryLoading = false;
      },
    });
  }

  onEquip(event: { slot: EquipmentSlotType; item: InventoryItem }): void {
    const charId = this.characterId;
    // Optimistic update
    this.equippedItems = { ...this.equippedItems, [event.slot]: event.item };
    // Remove item from inventory grid
    this.inventoryItems = this.inventoryItems.map((it) =>
      it?.id === event.item.id ? null : it,
    );
    if (!charId) return;
    this.inventoryService
      .equipItem(charId, event.item.id, event.slot)
      .subscribe();
  }

  onUnequip(event: { slot: EquipmentSlotType }): void {
    const charId = this.characterId;
    const item = this.equippedItems[event.slot];
    if (!item) return;
    // Optimistic update — return item to first empty slot in inventory
    const updated = [...this.inventoryItems];
    const emptyIdx = updated.indexOf(null);
    if (emptyIdx !== -1) {
      updated[emptyIdx] = item;
    } else {
      updated.push(item);
    }
    this.inventoryItems = updated;
    const next = { ...this.equippedItems };
    delete next[event.slot];
    this.equippedItems = next;
    if (!charId) return;
    this.inventoryService.unequipItem(charId, event.slot).subscribe();
  }

  onItemMove(event: { fromIndex: number; toIndex: number }): void {
    const charId = this.characterId;
    const items = [...this.inventoryItems];
    // Pad with nulls if needed
    while (items.length <= Math.max(event.fromIndex, event.toIndex)) {
      items.push(null);
    }
    const temp = items[event.fromIndex];
    items[event.fromIndex] = items[event.toIndex];
    items[event.toIndex] = temp;
    this.inventoryItems = items;
    if (!charId) return;
    this.inventoryService
      .moveItem(charId, event.fromIndex, event.toIndex)
      .subscribe();
  }

  onItemClick(event: { item: InventoryItem; index: number }): void {
    // TODO: open context menu or detail panel
    console.log('[CharacterComponent] item clicked', event.item.name, 'at index', event.index);
  }
}
