import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemSlotComponent } from '../item-slot/item-slot.component';
import { InventoryItem, EquipmentSlotType } from '../../game-core/types';
import { RARITY_COLORS, normalizeRarity, formatItemName } from '../../game-core/rarity';

interface EquipmentSlot {
  type: EquipmentSlotType;
  label: string;
  cssClass: string;
  item: InventoryItem | null;
}

@Component({
  selector: 'app-equipment-slots',
  standalone: true,
  imports: [CommonModule, ItemSlotComponent],
  templateUrl: './equipment-slots.component.html',
  styleUrls: ['./equipment-slots.component.scss'],
})
export class EquipmentSlotsComponent {
  @Input() set equippedItems(items: Partial<Record<EquipmentSlotType, InventoryItem>>) {
    this.slots = this.slots.map(slot => ({
      ...slot,
      item: items[slot.type] ?? null,
    }));
  }

  @Output() equip = new EventEmitter<{ slot: EquipmentSlotType; item: InventoryItem }>();
  @Output() unequip = new EventEmitter<{ slot: EquipmentSlotType }>();

  slots: EquipmentSlot[] = [
    { type: 'head', label: 'Capacete', cssClass: 'slot-head', item: null },
    { type: 'earring', label: 'Brinco', cssClass: 'slot-earring', item: null },
    { type: 'necklace', label: 'Colar', cssClass: 'slot-necklace', item: null },
    { type: 'chest', label: 'Armadura', cssClass: 'slot-chest', item: null },
    { type: 'accessory1', label: 'Anel 1', cssClass: 'slot-accessory1', item: null },
    { type: 'accessory2', label: 'Anel 2', cssClass: 'slot-accessory2', item: null },
    { type: 'mainHand', label: 'Mão Principal', cssClass: 'slot-main-hand', item: null },
    { type: 'offHand', label: 'Mão Secundária', cssClass: 'slot-off-hand', item: null },
    { type: 'legs', label: 'Botas', cssClass: 'slot-legs', item: null },
    { type: 'bracelet', label: 'Pulseira', cssClass: 'slot-bracelet', item: null },
  ];

  /** Emitted when an item is dragged from the inventory grid onto an equipment slot. */
  @Output() itemDropped = new EventEmitter<{ fromInventoryIndex: number; targetSlot: EquipmentSlotType }>();

  onSlotClick(slot: EquipmentSlot): void {
    if (slot.item) {
      this.unequip.emit({ slot: slot.type });
    }
  }

  onDrop(event: { fromIndex: number; toIndex: number }, slot: EquipmentSlot): void {
    // Drag-drop from inventory grid into an equipment slot — emit so parent can perform equip
    this.itemDropped.emit({ fromInventoryIndex: event.fromIndex, targetSlot: slot.type });
  }

  /** Returns the rarity color for a slot's equipped item, or null if no item / common. */
  rarityColorForSlot(slot: EquipmentSlot): string | null {
    if (!slot.item) return null;
    const rarity = normalizeRarity(slot.item.rarity ?? 'common');
    if (rarity === 'common') return null;
    return RARITY_COLORS[rarity];
  }

  /** Returns formatted item name with rarity suffix for a slot's equipped item. */
  formattedSlotItemName(slot: EquipmentSlot): string {
    if (!slot.item) return slot.label;
    const rarity = normalizeRarity(slot.item.rarity ?? 'common');
    return formatItemName(slot.item.name, rarity);
  }
}
