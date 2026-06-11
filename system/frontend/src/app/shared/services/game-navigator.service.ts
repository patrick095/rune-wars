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
  | 'academy'
  | 'vault';

export interface BattleConfig {
  mapName: string;
  vsAI: boolean;
  roomName?: string;
  playerName?: string;
  playerRace?: string;
  playerMaxHp?: number;
  playerAgility?: number;
  playerWeaponId?: string;
  playerConsumables?: string[];
  playerStrength?: number;
  playerLuck?: number;
  opponentName?: string;
  opponentRace?: string;
  aiMaxHp?: number;
  aiAgility?: number;
  aiWeaponId?: string;
  aiStrength?: number;
  aiLuck?: number;
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

  private _showAdminPanel = signal<boolean>(false);
  readonly showAdminPanel = this._showAdminPanel.asReadonly();

  openAdminPanel(): void { this._showAdminPanel.set(true); }
  closeAdminPanel(): void { this._showAdminPanel.set(false); }

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
