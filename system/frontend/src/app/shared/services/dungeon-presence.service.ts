import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

interface DungeonPresenceSocket {
  connected: boolean;
  emit(event: string, payload?: unknown): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  disconnect(): void;
}

@Injectable({ providedIn: 'root' })
export class DungeonPresenceService {
  private socket: DungeonPresenceSocket | null = null;
  private roomId: string | null = null;
  private characterId: string | null = null;

  constructor(private readonly auth: AuthService) {}

  connect(roomId: string, characterId: string): void {
    if (!roomId || !characterId) return;
    if (this.socket && this.roomId === roomId && this.characterId === characterId) {
      this.emitPresence();
      return;
    }

    this.disconnectSocket();
    this.roomId = roomId;
    this.characterId = characterId;

    import('socket.io-client').then(({ io }) => {
      if (this.roomId !== roomId || this.characterId !== characterId) return;
      this.socket = io(`${environment.wsUrl}/dungeon`, {
        auth: { token: this.auth.getToken() },
        transports: ['websocket'],
      }) as DungeonPresenceSocket;
      this.socket.on('connect', () => this.emitPresence());
    });
  }

  leave(): void {
    if (this.socket && this.roomId && this.characterId) {
      this.socket.emit('dungeon:leave', {
        roomId: this.roomId,
        characterId: this.characterId,
      });
    }
    this.disconnectSocket();
  }

  private emitPresence(): void {
    if (!this.socket || !this.roomId || !this.characterId) return;
    this.socket.emit('dungeon:presence', {
      roomId: this.roomId,
      characterId: this.characterId,
    });
  }

  private disconnectSocket(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.roomId = null;
    this.characterId = null;
  }
}
