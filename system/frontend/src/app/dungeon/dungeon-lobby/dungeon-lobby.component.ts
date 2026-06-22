import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DungeonPhase, PlayerState } from '../../shared/game-core/dungeon-types';
import { WeaponDefinition } from '../../shared/game-core/weapon-definition';
import { SecondaryItem } from '../../shared/game-core/secondary-item-system';
import { Consumable } from '../../shared/game-core/consumable-system';
import { DungeonRoom, DungeonStorageService } from '../../shared/services/dungeon-storage.service';
import { ActiveCharacterService } from '../../shared/services/active-character.service';
import { GameNavigatorService } from '../../shared/services/game-navigator.service';

@Component({
  selector: 'app-dungeon-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dungeon-lobby.component.html',
  styleUrls: ['./dungeon-lobby.component.scss'],
})
export class DungeonLobbyComponent implements OnInit, OnDestroy {
  @Input() nextPhase: DungeonPhase | null = null;
  @Input() player: PlayerState | null = null;
  @Input() weapons: WeaponDefinition[] = [];
  @Input() secondaryItems: SecondaryItem[] = [];
  @Input() consumables: Consumable[] = [];
  @Input() earnedXp = 0;
  @Input() earnedGold = 0;
  @Input() lives = 3;

  @Output() continueDungeon = new EventEmitter<Pick<PlayerState, 'weaponId' | 'secondaryItemId' | 'consumableIds'>>();
  @Output() abandon = new EventEmitter<void>();

  selectedWeaponId = 'cannon';
  selectedSecondaryId = 'shield';
  selectedConsumableId = 'heal';
  rooms: DungeonRoom[] = [];
  error = '';
  loading = false;

  private poll: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly storage: DungeonStorageService,
    private readonly activeCharacter: ActiveCharacterService,
    public readonly navigator: GameNavigatorService,
  ) {}

  ngOnInit(): void {
    if (this.nextPhase) return;
    this.loadRooms();
    this.poll = setInterval(() => this.loadRooms(), 5000);
  }

  ngOnDestroy(): void {
    if (this.poll) clearInterval(this.poll);
  }

  get prepMode(): boolean {
    return !!this.nextPhase && !!this.player;
  }

  ngOnChanges(): void {
    this.selectedWeaponId = this.player?.weaponId ?? 'cannon';
    this.selectedSecondaryId = this.player?.secondaryItemId ?? 'shield';
    this.selectedConsumableId = this.player?.consumableIds?.[0] ?? 'heal';
  }

  continue(): void {
    if (!this.player) return;
    this.continueDungeon.emit({
      weaponId: this.selectedWeaponId,
      secondaryItemId: this.selectedSecondaryId,
      consumableIds: this.selectedConsumableId ? [this.selectedConsumableId] : [],
    });
  }

  loadRooms(): void {
    this.storage.listRooms().subscribe({
      next: rooms => {
        this.rooms = rooms.filter(room => room.status !== 'completed' && room.status !== 'failed');
        this.error = '';
      },
      error: err => this.error = err.error?.message || 'Erro ao carregar salas.',
    });
  }

  createRoom(): void {
    const characterId = this.activeCharacter.characterId;
    if (!characterId) {
      this.error = 'Personagem ativo nao encontrado.';
      return;
    }
    this.loading = true;
    this.storage.createRoom(characterId, 1, 'easy').subscribe({
      next: room => {
        this.loading = false;
        this.navigator.setRoomId(room.id, true);
        this.navigator.goTo('dungeon-room');
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || 'Erro ao criar sala.';
      },
    });
  }

  joinRoom(room: DungeonRoom): void {
    if (room.status === 'in_battle' || room.status === 'portal' || room.member_character_ids.length >= room.max_members) return;
    const characterId = this.activeCharacter.characterId;
    if (!characterId) {
      this.error = 'Personagem ativo nao encontrado.';
      return;
    }
    this.storage.joinRoom(room.id, characterId).subscribe({
      next: joined => {
        this.navigator.setRoomId(joined.id, joined.leader_character_id === characterId);
        this.navigator.goTo('dungeon-room');
      },
      error: err => this.error = err.error?.message || 'Erro ao entrar na sala.',
    });
  }

  goHub(): void {
    this.navigator.goTo('hub');
  }
}
