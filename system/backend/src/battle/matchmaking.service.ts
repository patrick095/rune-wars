import { Injectable } from '@nestjs/common';
import { BattleState, BattlePlayer } from './battle-room.interface';

@Injectable()
export class MatchmakingService {
  private queue: Array<{ characterId: string; socketId: string; joinedAt: number }> = [];
  private rooms = new Map<string, BattleState>();
  private playerRoom = new Map<string, string>(); // characterId → roomId

  enqueue(characterId: string, socketId: string): BattleState | null {
    this.queue = this.queue.filter(e => e.characterId !== characterId);
    this.queue.push({ characterId, socketId, joinedAt: Date.now() });

    if (this.queue.length >= 2) {
      const [p1, p2] = this.queue.splice(0, 2);
      return this.createRoom(p1, p2);
    }
    return null;
  }

  dequeue(characterId: string) {
    this.queue = this.queue.filter(e => e.characterId !== characterId);
  }

  getRoom(roomId: string): BattleState | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByPlayer(characterId: string): BattleState | undefined {
    const roomId = this.playerRoom.get(characterId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  saveRoom(room: BattleState) {
    this.rooms.set(room.roomId, room);
  }

  removeRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.players.forEach(p => this.playerRoom.delete(p.characterId));
      this.rooms.delete(roomId);
    }
  }

  updateSocketId(characterId: string, socketId: string) {
    const room = this.getRoomByPlayer(characterId);
    if (room) {
      const player = room.players.find(p => p.characterId === characterId);
      if (player) {
        player.socketId = socketId;
        player.connected = true;
        this.saveRoom(room);
      }
    }
  }

  private createRoom(
    p1: { characterId: string; socketId: string },
    p2: { characterId: string; socketId: string },
  ): BattleState {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const wind = (Math.random() - 0.5) * 20;
    const room: BattleState = {
      roomId,
      players: [
        { characterId: p1.characterId, socketId: p1.socketId, hp: 100, connected: true },
        { characterId: p2.characterId, socketId: p2.socketId, hp: 100, connected: true },
      ],
      currentTurnPlayerId: p1.characterId,
      turnNumber: 1,
      wind,
      terrain: [],
      phase: 'active',
      eventLog: [],
    };
    this.rooms.set(roomId, room);
    this.playerRoom.set(p1.characterId, roomId);
    this.playerRoom.set(p2.characterId, roomId);
    return room;
  }
}
