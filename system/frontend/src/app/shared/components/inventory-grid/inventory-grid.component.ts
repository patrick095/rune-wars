import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemSlotComponent } from '../item-slot/item-slot.component';
import { InventoryItem } from '../../game-core/types';

const GRID_SIZE = 36; // 6 × 6

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
    const result = new Array<InventoryItem | null>(GRID_SIZE).fill(null);
    this._items.slice(0, GRID_SIZE).forEach((item, i) => (result[i] = item));
    return result;
  }

  onDrop(event: { fromIndex: number; toIndex: number }): void {
    this.itemMove.emit(event);
  }

  onItemClick(item: InventoryItem, index: number): void {
    this.itemClick.emit({ item, index });
  }
}
