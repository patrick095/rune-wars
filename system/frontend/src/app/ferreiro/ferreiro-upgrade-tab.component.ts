import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { Character } from '../shared/models/character.model';
import { InventoryItem } from '../shared/game-core/types';
import { normalizeRarity, RARITY_COLORS } from '../shared/game-core/rarity';
import { ApiService } from '../shared/services/api.service';
import { ItemSlotComponent } from '../shared/components/item-slot/item-slot.component';
import { ItemTooltipComponent } from '../shared/components/item-tooltip/item-tooltip.component';

interface ChanceInfo {
  target: 'item' | 'stone';
  level: number;
  targetLevel: number;
  chanceFinal: number;
  baseChance: number;
  luckBonus: number;
  goldCost: number;
  requiredStoneLevel: number;
}

interface UpgradeResult {
  success: boolean;
  newLevel?: number;
  newStoneLevel?: number;
  goldSpent: number;
}

@Component({
  selector: 'app-ferreiro-upgrade-tab',
  standalone: true,
  imports: [CommonModule, ItemSlotComponent, ItemTooltipComponent],
  templateUrl: './ferreiro-upgrade-tab.component.html',
  styleUrls: ['./ferreiro-tab.scss'],
})
export class FerreiroUpgradeTabComponent implements OnChanges {
  private readonly api = inject(ApiService);

  @Input({ required: true }) character!: Character;
  @Input() inventory: InventoryItem[] = [];
  @Output() changed = new EventEmitter<void>();

  stones: Array<InventoryItem | null> = [null, null, null];
  selectedItem: InventoryItem | null = null;
  chance: ChanceInfo | null = null;
  result: UpgradeResult | null = null;
  loading = false;
  message = '';
  hoveredItem: InventoryItem | null = null;
  tooltipX = 0;
  tooltipY = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['character'] || changes['inventory']) this.loadChance();
  }

  get stoneItems(): InventoryItem[] {
    return this.inventory.filter(item => item.item_base_id === 'enhancement_stone');
  }

  get upgradeItems(): InventoryItem[] {
    return this.inventory.filter(item =>
      item.item_base_id !== 'enhancement_stone' &&
      !item.item_base_id?.startsWith('fragment_') &&
      (item.upgrade_level ?? 0) < 10,
    );
  }

  get mode(): 'item' | 'stone' {
    return this.selectedItem ? 'item' : 'stone';
  }

  get currentLevel(): number {
    if (this.selectedItem) return this.selectedItem.upgrade_level ?? 0;
    const firstStone = this.stones.find(Boolean);
    return firstStone?.upgrade_level ?? 0;
  }

  get validationError(): string {
    const selectedStones = this.stones.filter(Boolean) as InventoryItem[];
    if (selectedStones.length < 1) return 'Selecione ao menos 1 pedra.';
    if (!this.selectedItem && selectedStones.every(s => (s.upgrade_level ?? 0) >= 5)) return 'Pedra ja esta no maximo.';
    if (this.selectedItem && (this.selectedItem.upgrade_level ?? 0) >= 10) return 'Item ja esta no maximo.';
    if (this.chance && this.character.gold < this.chance.goldCost) return 'Ouro insuficiente.';
    return '';
  }

  get canSubmit(): boolean {
    return !this.loading && !!this.chance && this.validationError === '';
  }

  selectStone(item: InventoryItem): void {
    if (this.stones.some(stone => stone?.id === item.id)) return;
    const index = this.stones.findIndex(stone => !stone);
    if (index === -1) return;
    this.stones[index] = item;
    this.result = null;
    this.message = '';
    this.loadChance();
  }

  selectItem(item: InventoryItem): void {
    this.selectedItem = item;
    this.result = null;
    this.message = '';
    this.loadChance();
  }

  clearStone(index: number): void {
    this.stones[index] = null;
    this.loadChance();
  }

  clearItem(): void {
    this.selectedItem = null;
    this.loadChance();
  }

  loadChance(): void {
    const selectedStones = this.stones.filter(Boolean) as InventoryItem[];
    if (selectedStones.length === 0) {
      this.chance = null;
      return;
    }
    const level = this.currentLevel;
    const stoneLevelsParam = selectedStones.map(s => s.upgrade_level ?? 0).join(',');
    const url = `/upgrade/chance?target=${this.mode}&level=${level}&luck=${this.character?.luck ?? 0}&stoneLevels=${stoneLevelsParam}`;
    this.api.get<ChanceInfo>(url).subscribe({
      next: chance => this.chance = chance,
      error: () => this.chance = null,
    });
  }

  upgrade(): void {
    if (!this.canSubmit) return;
    this.loading = true;
    this.message = '';
    const stoneInstanceIds = (this.stones.filter(Boolean) as InventoryItem[]).map(stone => stone.id);
    const request = this.selectedItem
      ? this.api.post<UpgradeResult>('/upgrade/item', {
          characterId: this.character.id,
          itemInstanceId: this.selectedItem.id,
          stoneInstanceIds,
          luck: this.character.luck ?? 0,
        })
      : this.api.post<UpgradeResult>('/upgrade/stone', {
          characterId: this.character.id,
          stoneInstanceIds,
          luck: this.character.luck ?? 0,
        });

    request.subscribe({
      next: result => {
        this.result = result;
        this.message = result.success ? 'Sucesso.' : 'Falhou.';
        this.loading = false;
        this.stones = [null, null, null];
        this.selectedItem = null;
        this.changed.emit();
      },
      error: err => {
        this.message = err.error?.message || 'Falha ao aprimorar.';
        this.loading = false;
      },
    });
  }

  color(item: InventoryItem): string {
    return RARITY_COLORS[normalizeRarity(item.rarity ?? 'common')];
  }

  showTooltip(item: InventoryItem, event: MouseEvent): void {
    this.hoveredItem = item;
    this.moveTooltip(event);
  }

  moveTooltip(event: MouseEvent): void {
    const width = 280;
    const height = 180;
    const offset = 14;
    this.tooltipX = Math.min(event.clientX + offset, window.innerWidth - width - offset);
    this.tooltipY = Math.min(event.clientY + offset, window.innerHeight - height - offset);
  }

  hideTooltip(): void {
    this.hoveredItem = null;
  }

  focusTooltip(item: InventoryItem): void {
    this.hoveredItem = item;
    this.tooltipX = 24;
    this.tooltipY = 24;
  }
}
