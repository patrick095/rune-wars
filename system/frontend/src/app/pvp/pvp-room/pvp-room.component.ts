import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { GameNavigatorService } from '../../shared/services/game-navigator.service';
import { ActiveCharacterService } from '../../shared/services/active-character.service';
import { AuthService } from '../../shared/services/auth.service';
import { ConsumableInventoryService, CONSUMABLE_CATALOG } from '../../shared/services/consumable-inventory.service';
import { InventoryService } from '../../shared/services/inventory.service';
import { EquipmentSlotsComponent } from '../../shared/components/equipment-slots/equipment-slots.component';
import { InventoryGridComponent } from '../../shared/components/inventory-grid/inventory-grid.component';
import { InventoryItem, EquipmentSlotType } from '../../shared/game-core/types';
import { environment } from '../../../environments/environment';
import { EMPTY } from 'rxjs';

interface BattlePlayerConfig {
  characterId: string;
  name: string;
  race: string;
  maxHp: number;
  agility: number;
  weaponId: string;
  strength?: number;
  luck?: number;
  consumables?: string[];
}

interface BattleStartResult {
  matched: boolean;
  mapName: string;
  roomName: string;
  mode: string;
  vsAI: boolean;
  players: BattlePlayerConfig[];
  opponents: BattlePlayerConfig[];
}

interface SlotPlayer {
  characterId: string;
  name: string;
  level?: number;
  rating?: number;
}

interface SlotState {
  player: SlotPlayer | null;
  closed: boolean;
  ready?: boolean;
  consumableSelection?: string[];
}

interface ConsumableInventoryItem {
  id: string;
  name: string;
  iconPath: string;
}

@Component({
  selector: 'app-pvp-room',
  standalone: true,
  imports: [CommonModule, EquipmentSlotsComponent, InventoryGridComponent],
  templateUrl: './pvp-room.component.html',
  styleUrls: ['./pvp-room.component.scss'],
})
export class PvpRoomComponent implements OnInit, OnDestroy {
  // Slots
  slots: SlotState[] = Array(4).fill(null).map(() => ({ player: null, closed: false }));

  // Map carousel
  selectedMapIndex = 0;
  readonly MAPS = [
    { slug: 'plains', name: 'Planícies' },
    { slug: 'mystic-castle', name: 'Castelo Místico' },
    { slug: 'deep-mines', name: 'Minas Profundas' },
    { slug: 'arcane-ruins', name: 'Ruínas Arcanas' },
    { slug: 'runic-forest', name: 'Floresta Rúnica' },
  ];

  // Mode selection
  selectedMode: 'ranked' | 'free' | 'guild' = 'ranked';

  // Consumables
  consumableSelection: (string | null)[] = Array(5).fill(null);
  consumableInventory: ConsumableInventoryItem[] = [];
  consumableSlotsFull = false;

  // State
  isOwner = false;
  currentCharacterId = '';
  error: string | null = null;
  confirmKickSlot: number | null = null;

  // Inventory overlay
  showInventory = false;
  inventoryItems: (InventoryItem | null)[] = [];
  equippedItems: Partial<Record<EquipmentSlotType, InventoryItem>> = {};
  inventoryLoading = false;

  // Battle start flow
  countdownActive = false;
  countdownSeconds = 5;
  searchingMatch = false;
  searchSeconds = 10;

  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private searchTimer: ReturnType<typeof setInterval> | null = null;
  private searchPollTimer: ReturnType<typeof setInterval> | null = null;

  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private skipLeaveOnDestroy = false;
  private readonly pageLeave = () => this.sendLeaveBeacon();

  get selectedMap() {
    return this.MAPS[this.selectedMapIndex];
  }

  get mapThumbnailUrl(): string {
    return `assets/maps/${this.selectedMap.slug}/background.png`;
  }

  get playerName(): string {
    return this.activeCharacter.character?.name ?? 'Você';
  }

  get kickTargetName(): string {
    if (this.confirmKickSlot === null) return 'o jogador';
    const slot = this.slots[this.confirmKickSlot];
    return slot?.player?.name ?? 'o jogador';
  }

  get hasGuild(): boolean {
    // Character model doesn't have a guild field — disable Guild mode as safe fallback (RN21)
    return false;
  }

  get isSoloFreeModeReady(): boolean {
    return this.selectedMode === 'free' &&
           this.slots.filter(s => s.player !== null).length === 1;
  }

  constructor(
    private api: ApiService,
    private activeCharacter: ActiveCharacterService,
    private auth: AuthService,
    private consumableInventoryService: ConsumableInventoryService,
    private inventoryService: InventoryService,
    public navigator: GameNavigatorService,
  ) {}

  ngOnInit(): void {
    this.currentCharacterId = this.activeCharacter.characterId ?? '';
    this.isOwner = this.navigator.isRoomOwner();
    this.restoreConsumableSelection();
    this.loadRoom();
    this.loadConsumables();
    this.pollInterval = setInterval(() => this.loadRoom(), 3000);
    this.heartbeatInterval = setInterval(() => this.heartbeat(), 10000);
    window.addEventListener('pagehide', this.pageLeave);
    window.addEventListener('beforeunload', this.pageLeave);
  }

  ngOnDestroy(): void {
    this.cancelCountdown();
    this.cancelSearch();
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    window.removeEventListener('pagehide', this.pageLeave);
    window.removeEventListener('beforeunload', this.pageLeave);
    if (!this.skipLeaveOnDestroy) {
      this.leaveRoom().subscribe();
    }
  }

  // ── Map carousel ──────────────────────────────────────────────────────────

  nextMap(): void {
    this.selectedMapIndex = (this.selectedMapIndex + 1) % this.MAPS.length;
  }

  prevMap(): void {
    this.selectedMapIndex = (this.selectedMapIndex - 1 + this.MAPS.length) % this.MAPS.length;
  }

  // ── Mode selection ────────────────────────────────────────────────────────

  selectMode(mode: 'ranked' | 'free' | 'guild'): void {
    if (mode === 'guild' && !this.hasGuild) return;
    this.selectedMode = mode;
  }

  // ── Consumables ───────────────────────────────────────────────────────────

  selectConsumable(consumableId: string): void {
    const nextSlot = this.consumableSelection.findIndex((s) => s === null);
    if (nextSlot === -1) {
      this.consumableSlotsFull = true;
      setTimeout(() => (this.consumableSlotsFull = false), 2500);
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

  // ── Slot management (owner only) ──────────────────────────────────────────

  closeSlot(slotIndex: number): void {
    const roomId = this.navigator.roomId();
    if (!roomId) return;
    this.api.post<unknown>(`/pvp/rooms/${roomId}/slots/${slotIndex}/close`, { characterId: this.currentCharacterId }).subscribe({
      next: () => this.loadRoom(),
      error: (err) => (this.error = err?.error?.message ?? 'Erro ao fechar vaga.'),
    });
  }

  requestKick(slotIndex: number): void {
    const slot = this.slots[slotIndex];
    // Cannot kick yourself
    if (!slot?.player || slot.player.characterId === this.currentCharacterId) return;
    this.confirmKickSlot = slotIndex;
  }

  cancelKick(): void {
    this.confirmKickSlot = null;
  }

  confirmKick(): void {
    const slotIndex = this.confirmKickSlot;
    if (slotIndex === null) return;
    this.confirmKickSlot = null;
    const roomId = this.navigator.roomId();
    if (!roomId) return;
    this.api.post<unknown>(`/pvp/rooms/${roomId}/slots/${slotIndex}/kick`, { characterId: this.currentCharacterId }).subscribe({
      next: () => this.loadRoom(),
      error: (err) => (this.error = err?.error?.message ?? 'Erro ao chutar jogador.'),
    });
  }

  // ── Ready / Battle start ──────────────────────────────────────────────────

  onReady(): void {
    this.startCountdown();
  }

  onReadyVsCpu(): void {
    this.startCountdown();
  }

  startCountdown(): void {
    if (this.countdownActive || this.searchingMatch) return;
    this.countdownActive = true;
    this.countdownSeconds = 5;
    this.error = null;

    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        this.cancelCountdown();
        this.beginMatchSearch();
      }
    }, 1000);
  }

  cancelCountdown(): void {
    if (this.countdownTimer !== null) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.countdownActive = false;
  }

  cancelSearch(): void {
    if (this.searchTimer !== null) { clearInterval(this.searchTimer); this.searchTimer = null; }
    if (this.searchPollTimer !== null) { clearInterval(this.searchPollTimer); this.searchPollTimer = null; }
    this.searchingMatch = false;
  }

  private beginMatchSearch(): void {
    const roomId = this.navigator.roomId();
    if (!roomId) return;

    this.searchingMatch = true;
    this.searchSeconds = 10;

    // Poll for match every 2 seconds
    this.searchPollTimer = setInterval(() => {
      this.api.get<{ matched: boolean }>(`/pvp/rooms/${roomId}/find-match`).subscribe({
        next: (res) => {
          if (res.matched) {
            this.cancelSearch();
            this.launchBattle(roomId);
          }
        },
        error: () => undefined,
      });
    }, 2000);

    // Countdown display ticker
    this.searchTimer = setInterval(() => {
      this.searchSeconds--;
      if (this.searchSeconds <= 0) {
        this.cancelSearch();
        this.launchBattle(roomId);
      }
    }, 1000);
  }

  private launchBattle(roomId: string): void {
    this.api.post<BattleStartResult>(`/pvp/rooms/${roomId}/start-battle`, { characterId: this.currentCharacterId }).subscribe({
      next: (result) => {
        // Backend always returns callerPlayers[0] as `me` when characterId is sent,
        // but do a fallback find-by-id in case of a stale client.
        const me = result.players.find(p => p.characterId === this.currentCharacterId) ?? result.players[0];
        const opp = result.opponents[0];
        this.skipLeaveOnDestroy = true;
        const playerConsumables = (me?.consumables ?? []).length > 0
          ? me!.consumables!
          : (this.consumableSelection.filter(Boolean) as string[]);
        this.navigator.launchBattle({
          mapName: result.mapName,
          vsAI: result.vsAI,
          roomName: result.roomName,
          playerName: me?.name,
          playerRace: me?.race,
          playerMaxHp: me?.maxHp,
          playerAgility: me?.agility,
          playerWeaponId: me?.weaponId,
          playerConsumables,
          playerStrength: me?.strength,
          playerLuck: me?.luck,
          opponentName: opp?.name,
          opponentRace: opp?.race,
          aiMaxHp: opp?.maxHp,
          aiAgility: opp?.agility,
          aiWeaponId: opp?.weaponId,
          aiStrength: opp?.strength,
          aiLuck: opp?.luck,
        });
      },
      error: (err) => {
        this.searchingMatch = false;
        this.error = err?.error?.message ?? 'Erro ao iniciar batalha.';
      },
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  goLobby(): void {
    const navigateToLobby = () => {
      this.navigator.setRoomId(null);
      this.navigator.goTo('pvp-lobby');
    };
    this.skipLeaveOnDestroy = true;
    this.leaveRoom().subscribe({
      next: () => navigateToLobby(),
      error: () => navigateToLobby(),
    });
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private loadRoom(): void {
    const roomId = this.navigator.roomId();
    if (!roomId) {
      this.error = 'ID de sala não encontrado.';
      return;
    }
    this.api.get<RoomApiResponse>(`/pvp/rooms/${roomId}`).subscribe({
      next: (room) => {
        this.error = null;
        this.syncRoomState(room);
      },
      error: () => {
        // Try listing rooms as fallback
        this.api.get<RoomApiResponse[]>('/pvp/rooms').subscribe({
          next: (rooms) => {
            const found = rooms.find((r) => r.id === roomId);
            if (found) {
              this.syncRoomState(found);
              this.error = null;
            } else {
              this.navigator.setRoomId(null);
              this.navigator.goTo('pvp-lobby');
            }
          },
          error: (err) => {
            this.error = err?.error?.message ?? 'Erro ao carregar sala.';
          },
        });
      },
    });
  }

  private syncRoomState(room: RoomApiResponse): void {
    // Refresh characterId on every sync — may not be set at ngOnInit yet
    if (!this.currentCharacterId) {
      this.currentCharacterId = this.activeCharacter.characterId ?? '';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawSlots: any[] = Array.isArray(room.slots) ? room.slots : [];

    this.slots = Array(4).fill(null).map((_, i) => {
      const raw = rawSlots[i];
      if (!raw) return { player: null, closed: false };

      // Backend sends { playerId, playerName } — map to frontend { player: { characterId, name } }
      let player: SlotPlayer | null = null;
      if (raw.player) {
        player = raw.player;
      } else if (raw.playerId) {
        player = { characterId: raw.playerId, name: raw.playerName ?? '' };
      }

      return {
        player,
        closed: raw.closed ?? false,
        ready: raw.ready ?? false,
        consumableSelection: raw.consumableSelection ?? [],
      };
    });

    // Update ownership on every poll — use navigator flag as fallback
    if (room.ownerCharacterId && this.currentCharacterId) {
      this.isOwner = room.ownerCharacterId === this.currentCharacterId;
    }

    if (room.map_slug) {
      const idx = this.MAPS.findIndex((m) => m.slug === room.map_slug);
      if (idx !== -1) this.selectedMapIndex = idx;
    }

    if (room.mode && ['ranked', 'free', 'guild'].includes(room.mode)) {
      this.selectedMode = room.mode as 'ranked' | 'free' | 'guild';
    }

    // Restore own consumable selection from slot if local state is empty and slot has data
    const mySlot = this.slots.find(s => s.player?.characterId === this.currentCharacterId);
    const slotConsumables = mySlot?.consumableSelection ?? [];
    if (slotConsumables.length > 0 && this.consumableSelection.every(s => s === null)) {
      const len = this.consumableSelection.length;
      const filled: (string | null)[] = slotConsumables.slice(0, len);
      while (filled.length < len) filled.push(null);
      this.consumableSelection = filled;
    }
  }

  private loadConsumables(): void {
    // Consumables are infinite catalog items — no backend stock needed
    this.consumableInventory = Object.values(CONSUMABLE_CATALOG).map(def => ({
      id: def.id,
      name: def.name,
      iconPath: def.iconPath,
    }));
  }

  private saveConsumableSelection(): void {
    if (!this.currentCharacterId) return;
    try {
      localStorage.setItem(
        `rw_consumables_${this.currentCharacterId}`,
        JSON.stringify(this.consumableSelection),
      );
    } catch { /* storage unavailable */ }
  }

  private restoreConsumableSelection(): void {
    const charId = this.activeCharacter.characterId ?? '';
    if (!charId) return;
    try {
      const saved = localStorage.getItem(`rw_consumables_${charId}`);
      if (saved) {
        const parsed = JSON.parse(saved) as (string | null)[];
        if (Array.isArray(parsed) && parsed.length === this.consumableSelection.length) {
          this.consumableSelection = parsed;
        }
      }
    } catch { /* ignore */ }
  }

  private heartbeat(): void {
    const roomId = this.navigator.roomId();
    if (!roomId || !this.currentCharacterId) return;
    this.api
      .post<unknown>(`/pvp/rooms/${roomId}/heartbeat`, { characterId: this.currentCharacterId })
      .subscribe({ error: () => undefined });
  }

  private leaveRoom() {
    const roomId = this.navigator.roomId();
    if (!roomId || !this.currentCharacterId) return EMPTY;
    return this.api.post<unknown>(`/pvp/rooms/${roomId}/leave`, {
      characterId: this.currentCharacterId,
    });
  }

  // ── Inventory overlay ───────────────────────────────────────────────────

  openInventory(): void {
    this.showInventory = true;
    this.loadInventory();
  }

  closeInventory(): void {
    this.showInventory = false;
  }

  private loadInventory(): void {
    const charId = this.currentCharacterId;
    if (!charId) return;
    this.inventoryLoading = true;
    this.inventoryService.getInventory(charId).subscribe({
      next: (items) => {
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
        this.inventoryLoading = false;
      },
      error: () => {
        this.inventoryItems = [];
        this.equippedItems = {};
        this.inventoryLoading = false;
      },
    });
  }

  onEquip(event: { slot: EquipmentSlotType; item: InventoryItem }): void {
    const charId = this.currentCharacterId;
    if (!charId) return;
    this.inventoryService.equipItem(charId, event.item.id, event.slot).subscribe({
      next: () => this.loadInventory(),
    });
  }

  onUnequip(event: { slot: EquipmentSlotType }): void {
    const charId = this.currentCharacterId;
    if (!charId) return;
    const item = this.equippedItems[event.slot];
    if (!item) return;
    this.inventoryService.unequipItem(charId, item.id).subscribe({
      next: () => this.loadInventory(),
    });
  }

  onItemDroppedToSlot(event: { fromInventoryIndex: number; targetSlot: EquipmentSlotType }): void {
    const item = this.inventoryItems[event.fromInventoryIndex];
    if (!item) return;
    this.onEquip({ slot: event.targetSlot, item });
  }

  private sendLeaveBeacon(): void {
    const roomId = this.navigator.roomId();
    const token = this.auth.getToken();
    if (this.skipLeaveOnDestroy || !roomId || !this.currentCharacterId || !token) return;
    fetch(`${environment.apiUrl}/pvp/rooms/${roomId}/leave`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ characterId: this.currentCharacterId }),
    }).catch(() => undefined);
  }
}

// Shape returned by the backend — loosely typed to be forward-compatible
interface RoomApiResponse {
  id: string;
  name?: string;
  map_slug?: string;
  mode?: string;
  ownerCharacterId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slots?: any[];
  [key: string]: unknown;
}
