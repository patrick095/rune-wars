import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { GameNavigatorService } from '../../shared/services/game-navigator.service';
import { ActiveCharacterService } from '../../shared/services/active-character.service';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';
import { EMPTY } from 'rxjs';

interface PvpRoomDetails {
  id: string;
  name: string;
  mapName: string;
  playerCount: number;
  maxPlayers: number;
  status: string;
  playerIds?: string[];
  ownerCharacterId?: string;
}

@Component({
  selector: 'app-pvp-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pvp-room.component.html',
  styleUrls: ['./pvp-room.component.scss'],
})
export class PvpRoomComponent implements OnInit, OnDestroy {
  room: PvpRoomDetails | null = null;
  selectedMap = 'plains';
  error: string | null = null;

  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private skipLeaveOnDestroy = false;
  private readonly pageLeave = () => this.sendLeaveBeacon();

  get isOwner(): boolean {
    return this.navigator.isRoomOwner();
  }

  get playerName(): string {
    return this.activeCharacter.character?.name ?? 'Você';
  }

  get secondSlotLabel(): string {
    const count = this.room?.playerIds?.length ?? this.room?.playerCount ?? 0;
    return count >= 2 ? 'Jogador 2' : 'Aguardando...';
  }

  constructor(
    private api: ApiService,
    private activeCharacter: ActiveCharacterService,
    private auth: AuthService,
    public navigator: GameNavigatorService,
  ) {}

  ngOnInit(): void {
    this.loadRoom();
    this.pollInterval = setInterval(() => this.loadRoom(), 3000);
    this.heartbeatInterval = setInterval(() => this.heartbeat(), 10000);
    window.addEventListener('pagehide', this.pageLeave);
    window.addEventListener('beforeunload', this.pageLeave);
  }

  ngOnDestroy(): void {
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

  loadRoom(): void {
    const roomId = this.navigator.roomId();
    if (!roomId) {
      this.error = 'ID de sala não encontrado.';
      return;
    }
    this.api.get<PvpRoomDetails[]>('/pvp/rooms').subscribe({
      next: (rooms) => {
        const found = rooms.find((r) => r.id === roomId);
        if (found) {
          this.room = found;
          // Keep map in sync with server value if we are the owner
          if (this.isOwner && this.room.mapName && this.selectedMap !== this.room.mapName) {
            // Only sync on first load (room is being freshly set)
          }
          this.error = null;
        } else {
          // Room no longer exists — go back to lobby
          this.navigator.setRoomId(null);
          this.navigator.goTo('pvp-lobby');
        }
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Erro ao carregar sala.';
      },
    });
  }

  vsAI(): void {
    this.skipLeaveOnDestroy = true;
    this.navigator.launchBattle({ mapName: this.selectedMap, vsAI: true });
  }

  waitForPlayer(): void {
    this.skipLeaveOnDestroy = true;
    this.navigator.launchBattle({ mapName: this.selectedMap, vsAI: false });
  }

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

  private heartbeat(): void {
    const roomId = this.navigator.roomId();
    const characterId = this.activeCharacter.characterId;
    if (!roomId || !characterId) return;

    this.api.post<unknown>(`/pvp/rooms/${roomId}/heartbeat`, { characterId }).subscribe({
      error: () => undefined,
    });
  }

  private leaveRoom() {
    const roomId = this.navigator.roomId();
    const characterId = this.activeCharacter.characterId;
    if (!roomId || !characterId) {
      return EMPTY;
    }

    return this.api.post<unknown>(`/pvp/rooms/${roomId}/leave`, { characterId });
  }

  private sendLeaveBeacon(): void {
    const roomId = this.navigator.roomId();
    const characterId = this.activeCharacter.characterId;
    const token = this.auth.getToken();
    if (this.skipLeaveOnDestroy || !roomId || !characterId || !token) return;

    fetch(`${environment.apiUrl}/pvp/rooms/${roomId}/leave`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ characterId }),
    }).catch(() => undefined);
  }
}
