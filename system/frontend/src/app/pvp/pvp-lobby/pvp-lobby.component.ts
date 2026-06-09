import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { GameNavigatorService } from '../../shared/services/game-navigator.service';
import { ActiveCharacterService } from '../../shared/services/active-character.service';

interface PvpRoom {
  id: string;
  name: string;
  mapName: string;
  playerCount: number;
  maxPlayers: number;
}

@Component({
  selector: 'app-pvp-lobby',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pvp-lobby.component.html',
  styleUrls: ['./pvp-lobby.component.scss'],
})
export class PvpLobbyComponent implements OnInit, OnDestroy {
  rooms: PvpRoom[] = [];
  error: string | null = null;

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private api: ApiService,
    private activeCharacter: ActiveCharacterService,
    public navigator: GameNavigatorService,
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.pollInterval = setInterval(() => this.loadRooms(), 5000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  loadRooms(): void {
    this.api.get<PvpRoom[]>('/pvp/rooms').subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.error = null;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Erro ao carregar salas.';
      },
    });
  }

  createRoom(): void {
    const characterId = this.activeCharacter.characterId;
    if (!characterId) {
      this.error = 'Personagem ativo não encontrado.';
      return;
    }

    this.api.post<{ roomId: string; name: string; mapName: string }>('/pvp/rooms', { characterId }).subscribe({
      next: (res) => {
        this.navigator.setRoomId(res.roomId, true);
        this.navigator.goTo('pvp-room');
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Erro ao criar sala.';
      },
    });
  }

  joinRoom(id: string): void {
    const characterId = this.activeCharacter.characterId;
    if (!characterId) {
      this.error = 'Personagem ativo não encontrado.';
      return;
    }

    this.api.post<unknown>(`/pvp/rooms/${id}/join`, { characterId }).subscribe({
      next: () => {
        this.navigator.setRoomId(id);
        this.navigator.goTo('pvp-room');
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Erro ao entrar na sala.';
      },
    });
  }

  goHub(): void {
    this.navigator.goTo('hub');
  }
}
