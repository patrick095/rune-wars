import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem } from '../../game-core/types';
import {
  DisplayStatEntry,
  getItemDisplayStats,
} from '../../game-core/weapon-display-stats';

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
}
