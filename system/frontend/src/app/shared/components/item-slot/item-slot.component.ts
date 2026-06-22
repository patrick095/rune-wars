import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem, EquipmentSlotType } from '../../game-core/types';
import { ItemTooltipComponent } from '../item-tooltip/item-tooltip.component';
import { RARITY_COLORS, normalizeRarity } from '../../game-core/rarity';

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
  @Input() tooltipPlacement: 'above' | 'below' = 'below';

  @Output() itemDrop = new EventEmitter<{ fromIndex: number; toIndex: number }>();
  @Output() itemClick = new EventEmitter<InventoryItem>();

  showTooltip = false;
  tooltipX = 0;
  tooltipY = 0;

  /** Returns the rarity border color for the current item, or null if no item. */
  get rarityBorderColor(): string | null {
    if (!this.item) return null;
    const rarity = normalizeRarity(this.item.rarity ?? 'common');
    // Only show colored border for non-common items
    if (rarity === 'common') return null;
    return RARITY_COLORS[rarity];
  }

  onDragStart(event: DragEvent): void {
    if (!this.item || this.disabled) {
      event.preventDefault();
      return;
    }
    event.dataTransfer?.setData('slotIndex', String(this.slotIndex));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const fromIndex = Number(event.dataTransfer?.getData('slotIndex'));
    if (!Number.isInteger(fromIndex)) return;
    this.itemDrop.emit({ fromIndex, toIndex: this.slotIndex });
  }

  onClick(): void {
    if (this.item) this.itemClick.emit(this.item);
  }

  onTooltipPointer(event: MouseEvent): void {
    const width = 280;
    const height = 180;
    const offset = 14;
    this.tooltipX = Math.min(event.clientX + offset, window.innerWidth - width - offset);
    this.tooltipY = Math.min(event.clientY + offset, window.innerHeight - height - offset);
  }
}
