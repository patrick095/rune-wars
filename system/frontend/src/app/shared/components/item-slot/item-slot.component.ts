import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem, EquipmentSlotType } from '../../game-core/types';
import { ItemTooltipComponent } from '../item-tooltip/item-tooltip.component';

@Component({
  selector: 'app-item-slot',
  standalone: true,
  imports: [CommonModule, ItemTooltipComponent],
  templateUrl: './item-slot.component.html',
  styleUrls: ['./item-slot.component.scss'],
})
export class ItemSlotComponent {
  @Input() item: InventoryItem | null = null;
  @Input() slotIndex: number = 0;
  @Input() isEquipmentSlot: boolean = false;
  @Input() equipmentType: EquipmentSlotType | '' = '';
  @Input() disabled: boolean = false;

  @Output() itemDrop = new EventEmitter<{ fromIndex: number; toIndex: number }>();
  @Output() itemClick = new EventEmitter<InventoryItem>();

  showTooltip = false;

  onDragStart(event: DragEvent): void {
    if (!this.item) return;
    event.dataTransfer?.setData('slotIndex', String(this.slotIndex));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const fromIndex = Number(event.dataTransfer?.getData('slotIndex'));
    this.itemDrop.emit({ fromIndex, toIndex: this.slotIndex });
  }

  onClick(): void {
    if (this.item) this.itemClick.emit(this.item);
  }
}
