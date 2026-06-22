import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Character } from '../shared/models/character.model';
import { InventoryItem } from '../shared/game-core/types';
import { normalizeRarity, RARITY_COLORS } from '../shared/game-core/rarity';
import { ApiService } from '../shared/services/api.service';
import { ItemSlotComponent } from '../shared/components/item-slot/item-slot.component';

interface CombineResult {
  success: boolean;
  resultItem: InventoryItem | null;
}

@Component({
  selector: 'app-ferreiro-craft-tab',
  standalone: true,
  imports: [CommonModule, ItemSlotComponent],
  templateUrl: './ferreiro-craft-tab.component.html',
  styleUrls: ['./ferreiro-tab.scss'],
})
export class FerreiroCraftTabComponent {
  private readonly api = inject(ApiService);

  @Input({ required: true }) character!: Character;
  @Input() inventory: InventoryItem[] = [];
  @Output() changed = new EventEmitter<void>();

  slots: Array<InventoryItem | null> = [null, null, null];
  result: CombineResult | null = null;
  loading = false;

  toast: { message: string; type: 'success' | 'error' } | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly COMBINE_CHANCES: Record<string, number> = {
    common: 0.30,
    uncommon: 0.20,
    rare: 0.10,
    heroic: 0.05,
  };

  get fragments(): InventoryItem[] {
    return this.inventory.filter(item => item.item_base_id?.startsWith('fragment_'));
  }

  get canSubmit(): boolean {
    return this.compatibilityError === '' && this.slots.every(Boolean) && !this.loading;
  }

  get successChance(): number | null {
    const selected = this.slots.filter(Boolean) as InventoryItem[];
    if (selected.length < 3 || this.compatibilityError) return null;
    const rarity = normalizeRarity(selected[0].rarity ?? 'common');
    return (this.COMBINE_CHANCES[rarity] ?? 0) * 100;
  }

  get compatibilityError(): string {
    const selected = this.slots.filter(Boolean) as InventoryItem[];
    if (selected.length === 0) return '';
    if (selected.length < 3) return 'Selecione 3 fragmentos.';
    const categories = new Set(selected.map(item => item.item_base_id));
    if (categories.size !== 1) return 'Fragmentos devem ser da mesma categoria.';
    const rarities = new Set(selected.map(item => normalizeRarity(item.rarity ?? 'common')));
    if (rarities.size !== 1) return 'Fragmentos devem ter a mesma raridade.';
    return '';
  }

  selectFragment(item: InventoryItem): void {
    if (this.slots.some(slot => slot?.id === item.id)) return;
    const index = this.slots.findIndex(slot => !slot);
    if (index === -1) return;
    this.slots[index] = item;
    this.result = null;
  }

  clearSlot(index: number): void {
    this.slots[index] = null;
    this.result = null;
  }

  combine(): void {
    if (!this.canSubmit) return;
    this.loading = true;
    this.api.post<CombineResult>('/craft/combine', {
      characterId: this.character.id,
      fragmentInstanceIds: this.slots.map(slot => slot!.id),
    }).subscribe({
      next: result => {
        this.result = result;
        this.loading = false;
        this.slots = [null, null, null];
        this.showToast(
          result.success ? 'Sucesso!' : 'Falhou...',
          result.success ? 'success' : 'error',
        );
        this.changed.emit();
      },
      error: err => {
        this.loading = false;
        this.showToast(err.error?.message || 'Falha ao combinar.', 'error');
      },
    });
  }

  color(item: InventoryItem): string {
    return RARITY_COLORS[normalizeRarity(item.rarity ?? 'common')];
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = { message, type };
    this.toastTimer = setTimeout(() => { this.toast = null; }, 2800);
  }
}
