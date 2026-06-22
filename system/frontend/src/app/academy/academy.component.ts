import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AcademyConfigPanelComponent } from './academy-config-panel.component';
import { AcademyConfig } from './academy-config';
import { ActiveCharacterService } from '../shared/services/active-character.service';
import { GameNavigatorService } from '../shared/services/game-navigator.service';
import { InventoryService } from '../shared/services/inventory.service';
import { EquipmentSlotType, InventoryItem } from '../shared/game-core/types';
import { buildAcademyBattleConfig } from '../shared/services/battle-config.factory';

@Component({
  selector: 'app-academy',
  standalone: true,
  imports: [CommonModule, RouterModule, AcademyConfigPanelComponent],
  templateUrl: './academy.component.html',
  styleUrls: ['./academy.component.scss'],
})
export class AcademyComponent implements OnInit {
  private equippedItems: Partial<Record<EquipmentSlotType, InventoryItem>> = {};

  constructor(
    private readonly activeCharacter: ActiveCharacterService,
    private readonly inventoryService: InventoryService,
    private readonly navigator: GameNavigatorService,
  ) {}

  ngOnInit(): void {
    const characterId = this.activeCharacter.characterId;
    if (!characterId) return;
    this.inventoryService.getInventory(characterId).subscribe(items => {
      const equipped: Partial<Record<EquipmentSlotType, InventoryItem>> = {};
      for (const item of items) {
        if (item.equipped_slot) {
          equipped[item.equipped_slot as EquipmentSlotType] = item;
        }
      }
      this.equippedItems = equipped;
    });
  }

  onStartTraining(cfg: AcademyConfig): void {
    this.navigator.launchBattle(
      buildAcademyBattleConfig(cfg, this.activeCharacter.character, this.equippedItems),
    );
  }

  leaveAcademy(): void {
    this.navigator.goTo('hub');
  }
}
