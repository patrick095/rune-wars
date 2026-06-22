import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem } from '../../game-core/types';
import {
  DisplayStatEntry,
  getItemDisplayStats,
} from '../../game-core/weapon-display-stats';
import {
  ItemRarity,
  RARITY_COLORS,
  RARITY_LABEL,
  formatItemName,
  normalizeRarity,
} from '../../game-core/rarity';

@Component({
  selector: 'app-item-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-tooltip.component.html',
  styleUrls: ['./item-tooltip.component.scss'],
})
export class ItemTooltipComponent {
  @Input() item: InventoryItem | null = null;

  get statEntries(): DisplayStatEntry[] {
    return getItemDisplayStats(this.item);
  }

  get itemRarity(): ItemRarity {
    return normalizeRarity(this.item?.rarity ?? 'common');
  }

  get rarityColor(): string {
    return RARITY_COLORS[this.itemRarity];
  }

  get rarityLabel(): string {
    return RARITY_LABEL[this.itemRarity];
  }

  get formattedName(): string {
    if (!this.item) return '';
    return formatItemName(this.item.name, this.itemRarity);
  }

  get isEnhancementStone(): boolean {
    return (this.item?.item_base_id ?? this.item?.definitionId) === 'enhancement_stone';
  }

  get enhancementStoneLevel(): number {
    return this.item?.upgrade_level ?? 0;
  }

  get hasStackQuantity(): boolean {
    return (this.item?.quantity ?? 0) > 1;
  }
}
