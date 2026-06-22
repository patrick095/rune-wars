import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActiveCharacterService } from '../../shared/services/active-character.service';
import { AuthService } from '../../shared/services/auth.service';
import { CONSUMABLE_CATALOG, ConsumableInventoryService } from '../../shared/services/consumable-inventory.service';
import { DungeonRoom, DungeonStorageService } from '../../shared/services/dungeon-storage.service';
import { DungeonPresenceService } from '../../shared/services/dungeon-presence.service';
import { GameNavigatorService } from '../../shared/services/game-navigator.service';
import { InventoryService } from '../../shared/services/inventory.service';
import { EquipmentSlotsComponent } from '../../shared/components/equipment-slots/equipment-slots.component';
import { InventoryGridComponent } from '../../shared/components/inventory-grid/inventory-grid.component';
import { EquipmentSlotType, InventoryItem } from '../../shared/game-core/types';
import { environment } from '../../../environments/environment';
import { EMPTY } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { buildDungeonBattleConfig, mapNameForDungeonRoom, opponentNameForDungeonRoom } from '../../shared/services/battle-config.factory';

interface DungeonSlotState {
  playerId: string | null;
  playerName: string;
  ready: boolean;
  consumableSelection: string[];
}

interface DungeonFloorOption {
  floor: number;
  name: string;
  mapName: 'dungeon_f1_s1' | 'dungeon_f1_s2' | 'dungeon_cave_hall';
  thumbnail: string;
}

interface ConsumableInventoryItem {
  id: string;
  name: string;
  iconPath: string;
}

@Component({
  selector: 'app-dungeon-room',
  standalone: true,
  imports: [CommonModule, EquipmentSlotsComponent, InventoryGridComponent],
  templateUrl: './dungeon-room.component.html',
  styleUrls: ['./dungeon-room.component.scss'],
})
export class DungeonRoomComponent implements OnInit, OnDestroy {
  room: DungeonRoom | null = null;
  error = '';
  selectedFloorIndex = 0;
  selectedDifficulty: DungeonRoom['difficulty'] = 'easy';
  slots: DungeonSlotState[] = Array(4).fill(null).map(() => ({
    playerId: null,
    playerName: 'Aguardando...',
    ready: false,
    consumableSelection: [],
  }));

  readonly floors: DungeonFloorOption[] = [
    {
      floor: 1,
      name: 'Andar 1',
      mapName: 'dungeon_f1_s1',
      thumbnail: 'assets/dungeon/floor1/stage1/map/background.png',
    },
    {
      floor: 2,
      name: 'Andar 2',
      mapName: 'dungeon_cave_hall',
      thumbnail: 'assets/terrain/dungeon_bg.png',
    },
  ];

  readonly difficulties: Array<{ id: DungeonRoom['difficulty']; label: string }> = [
    { id: 'easy', label: 'FÁCIL' },
    { id: 'medium', label: 'MÉDIO' },
    { id: 'hard', label: 'DIFÍCIL' },
    { id: 'heroic', label: 'HERÓICO' },
  ];

  consumableSelection: (string | null)[] = Array(5).fill(null);
  consumableInventory: ConsumableInventoryItem[] = [];
  consumableSlotsFull = false;

  showInventory = false;
  inventoryItems: (InventoryItem | null)[] = [];
  equippedItems: Partial<Record<EquipmentSlotType, InventoryItem>> = {};
  inventoryLoading = false;
  readyLoading = false;

  private poll: ReturnType<typeof setInterval> | null = null;
  private skipLeaveOnDestroy = false;
  private readonly pageLeave = () => this.sendLeaveBeacon();

  constructor(
    private readonly storage: DungeonStorageService,
    private readonly activeCharacter: ActiveCharacterService,
    private readonly auth: AuthService,
    private readonly consumableInventoryService: ConsumableInventoryService,
    private readonly inventoryService: InventoryService,
    private readonly dungeonPresence: DungeonPresenceService,
    public readonly navigator: GameNavigatorService,
  ) {}

  ngOnInit(): void {
    this.restoreConsumableSelection();
    this.loadRoom();
    this.loadConsumables();
    this.loadInventory();
    this.poll = setInterval(() => this.loadRoom(), 3000);
    window.addEventListener('pagehide', this.pageLeave);
    window.addEventListener('beforeunload', this.pageLeave);
  }

  ngOnDestroy(): void {
    if (this.poll) clearInterval(this.poll);
    window.removeEventListener('pagehide', this.pageLeave);
    window.removeEventListener('beforeunload', this.pageLeave);
    if (!this.skipLeaveOnDestroy) {
      this.dungeonPresence.leave();
      this.leaveRoom().subscribe();
    }
  }

  get characterId(): string {
    return this.activeCharacter.characterId ?? '';
  }

  get isOwner(): boolean {
    return !!this.room && this.room.leader_character_id === this.characterId;
  }

  get selectedFloor(): DungeonFloorOption {
    return this.floors[this.selectedFloorIndex] ?? this.floors[0];
  }

  get stageLabel(): string {
    if (!this.room) return '';
    return `Estágio ${this.room.current_stage}/${this.room.stage_count}`;
  }

  get canStart(): boolean {
    return !!this.room && this.isOwner && this.room.status !== 'in_battle' && this.room.status !== 'portal';
  }

  nextFloor(): void {
    if (!this.isOwner) return;
    this.selectedFloorIndex = (this.selectedFloorIndex + 1) % this.floors.length;
    this.saveSettings();
  }

  prevFloor(): void {
    if (!this.isOwner) return;
    this.selectedFloorIndex = (this.selectedFloorIndex - 1 + this.floors.length) % this.floors.length;
    this.saveSettings();
  }

  selectDifficulty(difficulty: DungeonRoom['difficulty']): void {
    if (!this.isOwner) return;
    this.selectedDifficulty = difficulty;
    this.saveSettings();
  }

  selectConsumable(consumableId: string): void {
    const nextSlot = this.consumableSelection.findIndex(slot => slot === null);
    if (nextSlot === -1) {
      this.consumableSlotsFull = true;
      setTimeout(() => this.consumableSlotsFull = false, 2500);
      return;
    }
    this.consumableSlotsFull = false;
    this.consumableSelection[nextSlot] = consumableId;
    this.saveConsumableSelection();
  }

  removeConsumable(slotIndex: number): void {
    this.consumableSelection[slotIndex] = null;
    this.consumableSlotsFull = false;
    this.saveConsumableSelection();
  }

  getConsumableDef(consumableId: string | null) {
    if (!consumableId) return null;
    return this.consumableInventoryService.getConsumableDefinition(consumableId);
  }

  ready(): void {
    if (!this.room || !this.characterId) return;
    this.readyLoading = true;
    const playerConsumables = this.consumableSelection.filter(Boolean) as string[];
    const mainHand = this.equippedItems.mainHand ?? null;
    this.storage.ready(this.room.id, this.characterId, true, playerConsumables, {
      weaponId: mainHand?.item_base_id ?? null,
      equippedLoadout: this.serializeEquippedLoadout(),
    }).subscribe({
      next: room => {
        this.readyLoading = false;
        this.syncRoom(room);
      },
      error: err => {
        this.readyLoading = false;
        this.error = err.error?.message || 'Erro ao ficar pronto.';
      },
    });
  }

  start(): void {
    if (!this.room || !this.canStart || !this.characterId) return;
    const roomId = this.room.id;
    this.readyLoading = true;
    this.refreshEquipmentSnapshot().pipe(
      switchMap(equippedItems => this.storage.start(roomId, this.characterId).pipe(
        map(room => ({ room, equippedItems })),
      )),
    ).subscribe({
      next: ({ room, equippedItems }) => {
        this.readyLoading = false;
        this.syncRoom(room);
        this.skipLeaveOnDestroy = true;
        this.navigator.setRoomId(room.id, true);
        this.navigator.launchDungeon(
          buildDungeonBattleConfig(
            room,
            this.activeCharacter.character,
            equippedItems,
            this.consumableSelection,
          ),
        );
      },
      error: err => {
        this.readyLoading = false;
        this.error = err.error?.message || 'Erro ao iniciar.';
      },
    });
  }

  regroup(): void {
    if (!this.room) return;
    this.storage.regroup(this.room.id, this.characterId).subscribe({
      next: room => this.syncRoom(room),
      error: err => this.error = err.error?.message || 'Erro ao reagrupar.',
    });
  }

  goLobby(): void {
    const navigate = () => {
      this.dungeonPresence.leave();
      this.navigator.setRoomId(null);
      this.navigator.goTo('dungeon-lobby');
    };
    this.skipLeaveOnDestroy = true;
    this.leaveRoom().subscribe({
      next: navigate,
      error: navigate,
    });
  }

  openInventory(): void {
    this.showInventory = true;
    this.loadInventory();
  }

  closeInventory(): void {
    this.showInventory = false;
  }

  onEquip(event: { slot: EquipmentSlotType; item: InventoryItem }): void {
    if (!this.characterId) return;
    this.inventoryService.equipItem(this.characterId, event.item.id, event.slot).subscribe({
      next: () => this.loadInventory(),
    });
  }

  onUnequip(event: { slot: EquipmentSlotType }): void {
    if (!this.characterId) return;
    const item = this.equippedItems[event.slot];
    if (!item) return;
    this.inventoryService.unequipItem(this.characterId, item.id).subscribe({
      next: () => this.loadInventory(),
    });
  }

  onItemDroppedToSlot(event: { fromInventoryIndex: number; targetSlot: EquipmentSlotType }): void {
    const item = this.inventoryItems[event.fromInventoryIndex];
    if (!item) return;
    this.onEquip({ slot: event.targetSlot, item });
  }

  private loadRoom(): void {
    const roomId = this.navigator.roomId();
    if (!roomId) {
      this.navigator.goTo('dungeon-lobby');
      return;
    }
    this.storage.getRoom(roomId).subscribe({
      next: room => this.syncRoom(room),
      error: err => {
        this.error = err.error?.message || 'Erro ao carregar sala.';
        this.navigator.setRoomId(null);
        this.navigator.goTo('dungeon-lobby');
      },
    });
  }

  private saveSettings(): void {
    if (!this.room || !this.isOwner) return;
    this.storage.updateSettings(this.room.id, this.characterId, this.selectedFloor.floor, this.selectedDifficulty).subscribe({
      next: room => this.syncRoom(room),
      error: err => this.error = err.error?.message || 'Erro ao alterar sala.',
    });
  }

  private syncRoom(room: DungeonRoom): void {
    this.room = room;
    if (this.characterId) {
      this.dungeonPresence.connect(room.id, this.characterId);
    }
    const idx = this.floors.findIndex(floor => floor.floor === room.floor);
    this.selectedFloorIndex = idx === -1 ? 0 : idx;
    this.selectedDifficulty = room.difficulty;
    this.slots = Array.from({ length: room.max_members }, (_, index) => {
      const slot = room.slots[index];
      return slot
        ? {
            playerId: slot.playerId,
            playerName: slot.playerName,
            ready: slot.ready,
            consumableSelection: slot.consumableSelection ?? [],
          }
        : {
            playerId: null,
            playerName: 'Aguardando...',
            ready: false,
            consumableSelection: [],
          };
    });
    const mySlot = room.slots.find(slot => slot.playerId === this.characterId);
    const slotConsumables = mySlot?.consumableSelection ?? [];
    if (slotConsumables.length > 0 && this.consumableSelection.every(item => item === null)) {
      const selected: (string | null)[] = slotConsumables.slice(0, this.consumableSelection.length);
      while (selected.length < this.consumableSelection.length) selected.push(null);
      this.consumableSelection = selected;
    }
    this.error = '';
  }

  private loadConsumables(): void {
    this.consumableInventory = Object.values(CONSUMABLE_CATALOG).map(def => ({
      id: def.id,
      name: def.name,
      iconPath: def.iconPath,
    }));
  }

  private loadInventory(): void {
    if (!this.characterId) return;
    this.inventoryLoading = true;
    this.inventoryService.getInventory(this.characterId).subscribe({
      next: items => {
        this.applyInventorySnapshot(items);
        this.inventoryLoading = false;
      },
      error: () => {
        this.equippedItems = {};
        this.inventoryItems = [];
        this.inventoryLoading = false;
      },
    });
  }

  private refreshEquipmentSnapshot() {
    if (!this.characterId) return EMPTY;
    this.inventoryLoading = true;
    return this.inventoryService.getInventory(this.characterId).pipe(
      map(items => {
        const equipped = this.applyInventorySnapshot(items);
        this.inventoryLoading = false;
        return equipped;
      }),
    );
  }

  private applyInventorySnapshot(items: InventoryItem[]): Partial<Record<EquipmentSlotType, InventoryItem>> {
    const equipped: Partial<Record<EquipmentSlotType, InventoryItem>> = {};
    const bag: (InventoryItem | null)[] = [];
    for (const item of items) {
      if (item.equipped_slot) {
        equipped[item.equipped_slot as EquipmentSlotType] = item;
      } else {
        bag.push(item);
      }
    }
    this.equippedItems = equipped;
    this.inventoryItems = bag;
    return equipped;
  }

  private leaveRoom() {
    const roomId = this.navigator.roomId();
    if (!roomId || !this.characterId) return EMPTY;
    return this.storage.leaveRoom(roomId, this.characterId);
  }

  private sendLeaveBeacon(): void {
    const roomId = this.navigator.roomId();
    const token = this.auth.getToken();
    if (this.skipLeaveOnDestroy || !roomId || !this.characterId || !token) return;
    fetch(`${environment.apiUrl}/dungeon/rooms/${roomId}/leave`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ characterId: this.characterId }),
    }).catch(() => undefined);
  }

  private saveConsumableSelection(): void {
    if (!this.characterId) return;
    try {
      localStorage.setItem(`rw_dungeon_consumables_${this.characterId}`, JSON.stringify(this.consumableSelection));
    } catch {
      // storage unavailable
    }
  }

  private restoreConsumableSelection(): void {
    if (!this.characterId) return;
    try {
      const raw = localStorage.getItem(`rw_dungeon_consumables_${this.characterId}`);
      const parsed = raw ? JSON.parse(raw) as (string | null)[] : null;
      if (Array.isArray(parsed) && parsed.length === this.consumableSelection.length) {
        this.consumableSelection = parsed;
      }
    } catch {
      // ignore invalid cache
    }
  }

  private serializeEquippedLoadout(): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(this.equippedItems).map(([slot, item]) => [slot, item ? {
        id: item.id,
        item_base_id: item.item_base_id,
        rarity: item.rarity,
        upgrade_level: item.upgrade_level,
      } : null]),
    );
  }

  private mapNameForRoom(room: DungeonRoom): 'dungeon_f1_s1' | 'dungeon_f1_s2' | 'dungeon_cave_hall' {
    return mapNameForDungeonRoom(room);
  }

  private opponentNameForRoom(room: DungeonRoom): string {
    return opponentNameForDungeonRoom(room);
  }
}
