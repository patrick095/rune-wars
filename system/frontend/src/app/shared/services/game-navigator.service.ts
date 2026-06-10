import { Injectable, signal } from '@angular/core';

export type GameScreen =
  | 'hub'
  | 'playground'
  | 'pvp-lobby'
  | 'pvp-room'
  | 'battle'
  | 'dungeon'
  | 'character'
  | 'craft'
  | 'upgrade'
  | 'market'
  | 'guild'
  | 'rankings'
  | 'academy';

export interface BattleConfig {
  mapName: string;
  vsAI: boolean;
  roomName?: string;
  playerName?: string;
  opponentName?: string;
}

@Injectable({ providedIn: 'root' })
export class GameNavigatorService {
  private _screen = signal<GameScreen>('hub');
  readonly screen = this._screen.asReadonly();

  private _roomId = signal<string | null>(null);
  readonly roomId = this._roomId.asReadonly();

  private _isRoomOwner = signal<boolean>(false);
  readonly isRoomOwner = this._isRoomOwner.asReadonly();

  private _battleConfig = signal<BattleConfig | null>(null);
  readonly battleConfig = this._battleConfig.asReadonly();

  goTo(screen: GameScreen): void {
    this._screen.set(screen);
  }

  setRoomId(id: string | null, isOwner = false): void {
    this._roomId.set(id);
    this._isRoomOwner.set(isOwner);
  }

  launchBattle(config: BattleConfig): void {
    this._battleConfig.set(config);
    this._screen.set('battle');
  }
}
