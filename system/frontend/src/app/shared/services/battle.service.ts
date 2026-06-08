import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

export type BattlePhase = 'idle' | 'queued' | 'matched' | 'active' | 'finished';

export interface BattleState {
  roomId: string;
  players: Array<{ characterId: string; hp: number; connected: boolean }>;
  currentTurnPlayerId: string;
  turnNumber: number;
  wind: number;
  phase: string;
  winner?: string;
}

@Injectable({ providedIn: 'root' })
export class BattleService {
  phase = signal<BattlePhase>('idle');
  state = signal<BattleState | null>(null);
  matchedRoomId = signal<string | null>(null);
  opponentId = signal<string | null>(null);
  error = signal<string | null>(null);
  isMyTurn = signal(false);

  private socket: any = null;
  private currentCharacterId: string | null = null;

  constructor(private auth: AuthService) {}

  connect(characterId: string) {
    if (this.socket) this.disconnect();
    this.currentCharacterId = characterId;

    import('socket.io-client').then(({ io }) => {
      this.socket = io('http://localhost:3000/battle', {
        auth: { token: this.auth.getToken() },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        const savedRoom = localStorage.getItem('rw_battle_room');
        if (savedRoom) {
          this.socket.emit('battle:reconnect', { roomId: savedRoom, characterId });
        } else {
          this.socket.emit('battle:join', { characterId });
          this.phase.set('queued');
        }
      });

      this.socket.on('battle:matched', (data: { roomId: string; opponent: string }) => {
        localStorage.setItem('rw_battle_room', data.roomId);
        this.matchedRoomId.set(data.roomId);
        this.opponentId.set(data.opponent);
        this.phase.set('matched');
      });

      this.socket.on('battle:state', (state: BattleState) => {
        this.state.set(state);
        this.phase.set('active');
      });

      this.socket.on('battle:turn', (data: { playerId: string }) => {
        this.isMyTurn.set(data.playerId === characterId);
      });

      this.socket.on('battle:result', (data: any) => {
        this.phase.set('finished');
        localStorage.removeItem('rw_battle_room');
        const current = this.state();
        if (current) {
          this.state.set({ ...current, phase: 'finished', winner: data.winner });
        }
      });

      this.socket.on('battle:error', (data: { code: string; message: string }) => {
        this.error.set(data.message);
      });

      this.socket.on('disconnect', () => {
        if (this.phase() === 'active') {
          // Keep phase active — server holds room for 60s
        }
      });
    });
  }

  sendAction(angle: number, force: number) {
    if (!this.socket) return;
    this.socket.emit('battle:action', { type: 'shoot', angle, force });
    this.isMyTurn.set(false);
  }

  surrender() {
    if (!this.socket) return;
    this.socket.emit('battle:surrender');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.phase.set('idle');
    this.state.set(null);
    this.matchedRoomId.set(null);
    this.opponentId.set(null);
    this.isMyTurn.set(false);
    this.currentCharacterId = null;
  }
}
