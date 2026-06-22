import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Character } from '../shared/models/character.model';
import { ActiveCharacterService } from '../shared/services/active-character.service';
import { ApiService } from '../shared/services/api.service';
import { GameNavigatorService } from '../shared/services/game-navigator.service';
import { InventoryService } from '../shared/services/inventory.service';
import { InventoryItem } from '../shared/game-core/types';
import { FerreiroCraftTabComponent } from './ferreiro-craft-tab.component';
import { FerreiroDismantleTabComponent } from './ferreiro-dismantle-tab.component';
import { FerreiroUpgradeTabComponent } from './ferreiro-upgrade-tab.component';

type FerreiroTab = 'craft' | 'dismantle' | 'upgrade' | 'future';

@Component({
  selector: 'app-ferreiro',
  standalone: true,
  imports: [
    CommonModule,
    FerreiroCraftTabComponent,
    FerreiroDismantleTabComponent,
    FerreiroUpgradeTabComponent,
  ],
  templateUrl: './ferreiro.component.html',
  styleUrls: ['./ferreiro.component.scss'],
})
export class FerreiroComponent implements OnInit, OnDestroy {
  private readonly activeCharacter = inject(ActiveCharacterService);
  private readonly inventoryService = inject(InventoryService);
  private readonly api = inject(ApiService);
  readonly navigator = inject(GameNavigatorService);
  private readonly sub = new Subscription();

  character: Character | null = null;
  inventory: InventoryItem[] = [];
  activeTab: FerreiroTab = 'craft';
  initialLoading = false;
  loading = false;
  error = '';
  private inventoryLoadedForCharacterId: string | null = null;

  ngOnInit(): void {
    this.sub.add(this.activeCharacter.character$.subscribe(character => {
      this.character = character;
      if (!character?.id) {
        this.inventory = [];
        this.inventoryLoadedForCharacterId = null;
        return;
      }
      if (this.inventoryLoadedForCharacterId !== character.id) {
        this.loadInventory();
      }
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get gold(): number {
    return this.character?.gold ?? 0;
  }

  setTab(tab: FerreiroTab): void {
    this.activeTab = tab;
  }

  loadInventory(force = false): void {
    if (!this.character?.id) return;
    if (!force && this.inventoryLoadedForCharacterId === this.character.id) return;
    const isFirst = this.inventoryLoadedForCharacterId !== this.character.id;
    if (isFirst) this.initialLoading = true;
    this.loading = true;
    this.error = '';
    this.sub.add(this.inventoryService.getInventory(this.character.id).subscribe({
      next: inventory => {
        this.inventory = inventory;
        this.inventoryLoadedForCharacterId = this.character?.id ?? null;
        this.initialLoading = false;
        this.loading = false;
        this.refreshCharacter();
      },
      error: () => {
        this.error = 'Falha ao carregar inventario.';
        this.initialLoading = false;
        this.loading = false;
      },
    }));
  }

  refreshAll(): void {
    this.loadInventory(true);
  }

  goBack(): void {
    this.navigator.goTo('hub');
  }

  private refreshCharacter(): void {
    if (!this.character?.id) return;
    this.sub.add(this.api.get<Character>(`/characters/${this.character.id}`).subscribe({
      next: character => this.activeCharacter.setActive(character),
      error: () => undefined,
    }));
  }
}
