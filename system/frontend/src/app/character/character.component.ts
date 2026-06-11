import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AttributeCalculator } from '../shared/game-core/attribute-calculator';
import { PlayerBaseStats, PlayerStats } from '../shared/game-core/player-stats';
import { CharacterStorageService } from '../shared/services/character-storage.service';
import { InventoryService } from '../shared/services/inventory.service';
import { ActiveCharacterService } from '../shared/services/active-character.service';
import { GameNavigatorService } from '../shared/services/game-navigator.service';
import { InventoryItem, EquipmentSlotType } from '../shared/game-core/types';
import { EquipmentSlotsComponent } from '../shared/components/equipment-slots/equipment-slots.component';
import { InventoryGridComponent } from '../shared/components/inventory-grid/inventory-grid.component';
import { VaultGridComponent } from '../shared/components/vault-grid/vault-grid.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-character',
  standalone: true,
  imports: [CommonModule, FormsModule, EquipmentSlotsComponent, InventoryGridComponent, VaultGridComponent],
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
})
export class CharacterComponent implements OnInit {
  private readonly calculator = new AttributeCalculator();
  private readonly http = inject(HttpClient);

  base: PlayerBaseStats = { level: 1, strength: 0, agility: 0, vitality: 0, luck: 0 };
  saveMessage = '';
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  showVault = false;
  inventoryItems: (InventoryItem | null)[] = [];
  equippedItems: Partial<Record<EquipmentSlotType, InventoryItem>> = {};
  inventoryLoading = false;

  private activeCharacter = inject(ActiveCharacterService);

  get characterId(): string | null {
    return this.activeCharacter.characterId;
  }

  private navigator = inject(GameNavigatorService);

  constructor(
    private storageService: CharacterStorageService,
    private inventoryService: InventoryService,
  ) {}

  goBack(): void {
    this.navigator.goTo('hub');
  }

  ngOnInit(): void {
    // Prefer real character stats from backend; fall back to local storage
    const char = this.activeCharacter.character;
    if (char) {
      this.base = {
        level: char.level ?? 1,
        strength: char.strength ?? 0,
        agility: char.agility ?? 0,
        vitality: char.vitality ?? 0,
        luck: char.luck ?? 0,
      };
    } else {
      const saved = this.storageService.load();
      if (saved) this.base = { ...saved };
    }
    this.loadInventory();
  }

  // ── Base stats ────────────────────────────────────────────────────────────

  get stats(): PlayerStats {
    return this.calculator.calculate(this.base);
  }

  get availablePoints(): number {
    return this.stats.totalPoints - this.stats.usedPoints;
  }

  // ── Derived stats with equipment bonuses ──────────────────────────────────

  get equipmentBonusHp(): number {
    return Object.values(this.equippedItems).reduce(
      (sum, item) => sum + ((item?.stats?.['hp'] as number | undefined) ?? 0), 0,
    );
  }

  get equipmentBonusAttack(): number {
    return Object.values(this.equippedItems).reduce(
      (sum, item) => sum + ((item?.stats?.['attack'] as number | undefined) ?? 0), 0,
    );
  }

  get equipmentBonusDefense(): number {
    return Object.values(this.equippedItems).reduce(
      (sum, item) => sum + ((item?.stats?.['defense'] as number | undefined) ?? 0), 0,
    );
  }

  get equipmentBonusSpeed(): number {
    return Object.values(this.equippedItems).reduce(
      (sum, item) => sum + ((item?.stats?.['speed'] as number | undefined) ?? 0), 0,
    );
  }

  get effectiveMaxHp(): number {
    return this.stats.maxHp + this.equipmentBonusHp;
  }

  get effectiveDamage(): number {
    return this.stats.damage + this.equipmentBonusAttack * 0.02;
  }

  get effectiveDefense(): number {
    return Math.min(this.stats.defense + this.equipmentBonusDefense * 0.01, 0.6);
  }

  get effectiveMobility(): number {
    return this.stats.mobility + this.equipmentBonusSpeed * 2;
  }

  get hasEquipmentBonuses(): boolean {
    return (
      this.equipmentBonusHp > 0 ||
      this.equipmentBonusAttack > 0 ||
      this.equipmentBonusDefense > 0 ||
      this.equipmentBonusSpeed > 0
    );
  }

  // ── Attribute editing ─────────────────────────────────────────────────────

  increment(attr: 'strength' | 'agility' | 'vitality' | 'luck'): void {
    if (this.availablePoints > 0) {
      this.base = { ...this.base, [attr]: this.base[attr] + 1 };
      this.saveStats();
    }
  }

  decrement(attr: 'strength' | 'agility' | 'vitality' | 'luck'): void {
    if (this.base[attr] > 0) {
      this.base = { ...this.base, [attr]: this.base[attr] - 1 };
      this.saveStats();
    }
  }

  incrementLevel(): void {
    if (this.base.level < 100) {
      this.base = { ...this.base, level: this.base.level + 1 };
      this.saveStats();
    }
  }

  decrementLevel(): void {
    if (this.base.level > 1) {
      const newLevel = this.base.level - 1;
      const newTotal = (newLevel - 1) * 4;
      const used = this.base.strength + this.base.agility + this.base.vitality + this.base.luck;
      if (used <= newTotal) {
        this.base = { ...this.base, level: newLevel };
        this.saveStats();
      }
    }
  }

  save(): void {
    this.saveStats();
  }

  private saveStats(): void {
    const charId = this.characterId;
    if (!charId) return;
    this.storageService.save(this.base);
    this.http.put(`${environment.apiUrl}/characters/${charId}`, {
      level: this.base.level,
      strength: this.base.strength,
      agility: this.base.agility,
      vitality: this.base.vitality,
      luck: this.base.luck,
    }).subscribe({
      next: () => {
        this.saveMessage = 'Salvo!';
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => { this.saveMessage = ''; }, 1500);
      },
      error: () => {
        this.saveMessage = 'Erro ao salvar';
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => { this.saveMessage = ''; }, 2000);
      },
    });
  }

  // ── Inventory ─────────────────────────────────────────────────────────────

  loadInventory(force = false): void {
    const charId = this.characterId;
    if (this.inventoryLoading && !force) return;
    if (!charId) {
      this.inventoryItems = [];
      this.equippedItems = {};
      return;
    }
    this.inventoryLoading = true;
    this.inventoryService.getInventory(charId).subscribe({
      next: (items) => {
        const equipped: Partial<Record<EquipmentSlotType, InventoryItem>> = {};
        const bag: (InventoryItem | null)[] = [];
        for (const item of items) {
          if (item.equipped_slot) {
            equipped[item.equipped_slot as EquipmentSlotType] = item;
          } else {
            bag.push(item);
          }
        }
        this.equippedItems = equipped;
        this.inventoryItems = bag;
        this.inventoryLoading = false;
      },
      error: () => {
        this.inventoryItems = [];
        this.equippedItems = {};
        this.inventoryLoading = false;
      },
    });
  }

  onEquip(event: { slot: EquipmentSlotType; item: InventoryItem }): void {
    const charId = this.characterId;
    if (!charId) return;
    this.inventoryService.equipItem(charId, event.item.id, event.slot).subscribe({
      next: () => this.loadInventory(true),
    });
  }

  onUnequip(event: { slot: EquipmentSlotType }): void {
    const charId = this.characterId;
    if (!charId) return;
    const item = this.equippedItems[event.slot];
    if (!item) return;
    this.inventoryService.unequipItem(charId, item.id).subscribe({
      next: () => this.loadInventory(true),
    });
  }

  onItemMove(event: { fromIndex: number; toIndex: number }): void {
    const charId = this.characterId;
    const items = [...this.inventoryItems];
    while (items.length <= Math.max(event.fromIndex, event.toIndex)) items.push(null);
    const temp = items[event.fromIndex];
    items[event.fromIndex] = items[event.toIndex];
    items[event.toIndex] = temp;
    this.inventoryItems = items;
    if (!charId) return;
    this.inventoryService.moveItem(charId, event.fromIndex, event.toIndex).subscribe();
  }

  onItemDroppedToSlot(event: { fromInventoryIndex: number; targetSlot: EquipmentSlotType }): void {
    const item = this.inventoryItems[event.fromInventoryIndex];
    if (!item) return;
    this.onEquip({ slot: event.targetSlot, item });
  }

  onItemClick(_event: { item: InventoryItem; index: number }): void { /* no-op */ }
}
