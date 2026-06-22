import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemSlotComponent } from '../item-slot/item-slot.component';
import { InventoryItem } from '../../game-core/types';

const GRID_SIZE = 36; // 6 × 6

const STACKABLE_PREFIXES = ['fragment_', 'enhancement_stone'];

function isStackable(item: InventoryItem): boolean {
  const baseId = item.item_base_id ?? item.definitionId ?? '';
  return STACKABLE_PREFIXES.some(p => baseId === p || baseId.startsWith(p));
}

function stackKey(item: InventoryItem): string {
  const baseId = item.item_base_id ?? item.definitionId ?? '';
  const levelPart = baseId === 'enhancement_stone' ? `__level_${item.upgrade_level ?? 0}` : '';
  return `${baseId}__${item.rarity ?? 'common'}${levelPart}`;
}

@Component({
  selector: 'app-inventory-grid',
  standalone: true,
  imports: [CommonModule, ItemSlotComponent],
  templateUrl: './inventory-grid.component.html',
  styleUrls: ['./inventory-grid.component.scss'],
})
export class InventoryGridComponent {
  @Input() set items(value: (InventoryItem | null)[]) {
    this._items = value;
  }

  @Output() itemMove = new EventEmitter<{ fromIndex: number; toIndex: number }>();
  @Output() itemClick = new EventEmitter<{ item: InventoryItem; index: number }>();

  private _items: (InventoryItem | null)[] = [];

  get slots(): (InventoryItem | null)[] {
    const stacked = this.stackItems(this._items.filter((i): i is InventoryItem => i !== null));
    const result = new Array<InventoryItem | null>(GRID_SIZE).fill(null);
    stacked.slice(0, GRID_SIZE).forEach((item, i) => (result[i] = item));
    return result;
  }

  private stackItems(items: InventoryItem[]): InventoryItem[] {
    const grouped = new Map<string, InventoryItem>();
    const nonStackable: InventoryItem[] = [];

    for (const item of items) {
      if (isStackable(item)) {
        const key = stackKey(item);
        if (grouped.has(key)) {
          const existing = grouped.get(key)!;
          grouped.set(key, { ...existing, quantity: (existing.quantity ?? 1) + 1 });
        } else {
          grouped.set(key, { ...item, quantity: 1 });
        }
      } else {
        nonStackable.push(item);
      }
    }

    return [...nonStackable, ...grouped.values()];
  }

  onDrop(event: { fromIndex: number; toIndex: number }): void {
    this.itemMove.emit(event);
  }

  onItemClick(item: InventoryItem, index: number): void {
    this.itemClick.emit({ item, index });
  }
}
