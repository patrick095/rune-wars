import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem } from '../../game-core/types';

@Component({
  selector: 'app-item-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-tooltip.component.html',
  styleUrls: ['./item-tooltip.component.scss'],
})
export class ItemTooltipComponent {
  @Input() item: InventoryItem | null = null;

  get statEntries(): { key: string; value: number | string }[] {
    if (!this.item?.stats) return [];
    return Object.entries(this.item.stats).map(([key, value]) => ({ key, value }));
  }
}
