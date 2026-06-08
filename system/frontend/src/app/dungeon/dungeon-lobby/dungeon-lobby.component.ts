import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DungeonPhase, PlayerState } from '../../shared/game-core/dungeon-types';
import { WeaponDefinition } from '../../shared/game-core/weapon-definition';
import { SecondaryItem } from '../../shared/game-core/secondary-item-system';
import { Consumable } from '../../shared/game-core/consumable-system';

@Component({
  selector: 'app-dungeon-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dungeon-lobby.component.html',
})
export class DungeonLobbyComponent {
  @Input({ required: true }) nextPhase!: DungeonPhase;
  @Input({ required: true }) player!: PlayerState;
  @Input({ required: true }) weapons: WeaponDefinition[] = [];
  @Input({ required: true }) secondaryItems: SecondaryItem[] = [];
  @Input({ required: true }) consumables: Consumable[] = [];
  @Input() earnedXp = 0;
  @Input() earnedGold = 0;
  @Input() lives = 3;

  @Output() continueDungeon = new EventEmitter<Pick<PlayerState, 'weaponId' | 'secondaryItemId' | 'consumableIds'>>();
  @Output() abandon = new EventEmitter<void>();

  selectedWeaponId = 'cannon';
  selectedSecondaryId = 'shield';
  selectedConsumableId = 'heal';

  ngOnChanges(): void {
    this.selectedWeaponId = this.player?.weaponId ?? 'cannon';
    this.selectedSecondaryId = this.player?.secondaryItemId ?? 'shield';
    this.selectedConsumableId = this.player?.consumableIds?.[0] ?? 'heal';
  }

  continue(): void {
    this.continueDungeon.emit({
      weaponId: this.selectedWeaponId,
      secondaryItemId: this.selectedSecondaryId,
      consumableIds: this.selectedConsumableId ? [this.selectedConsumableId] : [],
    });
  }
}
