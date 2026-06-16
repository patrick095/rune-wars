export interface BattlePlayer {
  characterId: string;
  socketId: string;
  hp: number;
  connected: boolean;
  teamId?: string;
}

export interface BattleState {
  roomId: string;
  players: BattlePlayer[];
  currentTurnPlayerId: string;
  turnNumber: number;
  wind: number;
  terrain: number[];
  phase: 'waiting' | 'active' | 'finished';
  winner?: string;
  eventLog: Array<{ type: string; data: any; at: number }>;
}
