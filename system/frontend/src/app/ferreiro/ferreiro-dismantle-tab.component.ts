import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Character } from '../shared/models/character.model';
import { InventoryItem } from '../shared/game-core/types';
import { normalizeRarity, RARITY_COLORS } from '../shared/game-core/rarity';
import { ApiService } from '../shared/services/api.service';
import { ItemSlotComponent } from '../shared/components/item-slot/item-slot.component';

interface DismantleResult {
  success: boolean;
  resultFragment: InventoryItem | null;
}

@Component({
  selector: 'app-ferreiro-dismantle-tab',
  standalone: true,
  imports: [CommonModule, ItemSlotComponent],
  templateUrl: './ferreiro-dismantle-tab.component.html',
  styleUrls: ['./ferreiro-tab.scss'],
})
export class FerreiroDismantleTabComponent {
  private readonly api = inject(ApiService);

  @Input({ required: true }) character!: Character;
  @Input() inventory: InventoryItem[] = [];
  @Output() changed = new EventEmitter<void>();

  selected: InventoryItem | null = null;
  result: DismantleResult | null = null;
  loading = false;
  message = '';

  get items(): InventoryItem[] {
    return this.inventory.filter(item =>
      !item.item_base_id?.startsWith('fragment_') &&
      item.item_base_id !== 'enhancement_stone' &&
      normalizeRarity(item.rarity ?? 'common') !== 'heroic',
    );
  }

  selectItem(item: InventoryItem): void {
    this.selected = item;
    this.result = null;
    this.message = '';
  }

  dismantle(): void {
    if (!this.selected || this.loading) return;
    this.loading = true;
    this.message = '';
    this.api.post<DismantleResult>('/craft/dismantle', {
      characterId: this.character.id,
      itemInstanceId: this.selected.id,
    }).subscribe({
      next: result => {
        this.result = result;
        this.message = result.success ? 'Sucesso.' : 'Falhou.';
        this.loading = false;
        this.selected = null;
        this.changed.emit();
      },
      error: err => {
        this.message = err.error?.message || 'Falha ao desmontar.';
        this.loading = false;
      },
    });
  }

  color(item: InventoryItem): string {
    return RARITY_COLORS[normalizeRarity(item.rarity ?? 'common')];
  }
}
