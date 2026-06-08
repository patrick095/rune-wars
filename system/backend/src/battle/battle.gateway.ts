import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchmakingService } from './matchmaking.service';
import { BattleState } from './battle-room.interface';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/battle' })
export class BattleGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private matchmaking: MatchmakingService) {}

  handleDisconnect(client: Socket) {
    const characterId = client.data.characterId as string | undefined;
    if (!characterId) return;

    const room = this.matchmaking.getRoomByPlayer(characterId);
    if (!room || room.phase !== 'active') return;

    const player = room.players.find(p => p.characterId === characterId);
    if (player) player.connected = false;
    this.matchmaking.saveRoom(room);

    const timer = setTimeout(() => {
      const current = this.matchmaking.getRoom(room.roomId);
      if (!current || current.phase !== 'active') return;
      const opponent = current.players.find(p => p.characterId !== characterId);
      if (opponent) {
        current.phase = 'finished';
        current.winner = opponent.characterId;
        this.matchmaking.saveRoom(current);
        this.server.to(opponent.socketId).emit('battle:result', {
          winner: opponent.characterId,
          loser: characterId,
          xp: 50,
          gold: 20,
        });
        this.matchmaking.removeRoom(room.roomId);
      }
    }, 60_000);

    this.disconnectTimers.set(characterId, timer);
  }

  @SubscribeMessage('battle:join')
  handleJoin(@MessageBody() data: { characterId: string }, @ConnectedSocket() client: Socket) {
    client.data.characterId = data.characterId;

    const existingRoom = this.matchmaking.getRoomByPlayer(data.characterId);
    if (existingRoom && existingRoom.phase === 'active') {
      client.emit('battle:state', existingRoom);
      return;
    }

    const room = this.matchmaking.enqueue(data.characterId, client.id);
    if (!room) return;

    const [p1, p2] = room.players;
    const opponent1 = room.players.find(p => p.characterId !== p1.characterId);
    const opponent2 = room.players.find(p => p.characterId !== p2.characterId);

    this.server.to(p1.socketId).emit('battle:matched', { roomId: room.roomId, opponent: opponent1?.characterId });
    this.server.to(p2.socketId).emit('battle:matched', { roomId: room.roomId, opponent: opponent2?.characterId });

    setTimeout(() => {
      this.server.to(p1.socketId).emit('battle:turn', { playerId: room.currentTurnPlayerId, timeLimit: 30 });
      this.server.to(p2.socketId).emit('battle:turn', { playerId: room.currentTurnPlayerId, timeLimit: 30 });
    }, 1000);
  }

  @SubscribeMessage('battle:reconnect')
  handleReconnect(
    @MessageBody() data: { roomId: string; characterId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.data.characterId = data.characterId;

    const timer = this.disconnectTimers.get(data.characterId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(data.characterId);
    }

    this.matchmaking.updateSocketId(data.characterId, client.id);
    const room = this.matchmaking.getRoom(data.roomId);
    if (!room) {
      client.emit('battle:error', { code: 'ROOM_NOT_FOUND', message: 'Room expired or not found' });
      return;
    }

    client.emit('battle:state', room);
    client.emit('battle:turn', { playerId: room.currentTurnPlayerId, timeLimit: 30 });
  }

  @SubscribeMessage('battle:action')
  handleAction(
    @MessageBody() data: { type: string; angle: number; force: number; item?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const characterId = client.data.characterId as string;
    const room = this.matchmaking.getRoomByPlayer(characterId);

    if (!room || room.phase !== 'active') {
      client.emit('battle:error', { code: 'NO_ROOM', message: 'Not in an active battle' });
      return;
    }

    if (room.currentTurnPlayerId !== characterId) {
      client.emit('battle:error', { code: 'NOT_YOUR_TURN', message: 'Not your turn' });
      return;
    }

    const damage = this.calcDamage(data.angle, data.force);
    const opponent = room.players.find(p => p.characterId !== characterId);
    if (opponent) {
      opponent.hp = Math.max(0, opponent.hp - damage);
    }

    room.eventLog.push({ type: 'action', data: { ...data, characterId, damage }, at: Date.now() });

    const nextPlayer = room.players.find(p => p.characterId !== characterId);
    room.currentTurnPlayerId = nextPlayer?.characterId ?? characterId;
    room.turnNumber += 1;
    room.wind = (Math.random() - 0.5) * 20;

    if (opponent && opponent.hp <= 0) {
      room.phase = 'finished';
      room.winner = characterId;
      this.matchmaking.saveRoom(room);
      room.players.forEach(p => {
        const isWinner = p.characterId === characterId;
        this.server.to(p.socketId).emit('battle:result', {
          winner: characterId,
          loser: opponent.characterId,
          xp: isWinner ? 100 : 30,
          gold: isWinner ? 50 : 10,
        });
      });
      this.matchmaking.removeRoom(room.roomId);
      return;
    }

    this.matchmaking.saveRoom(room);
    room.players.forEach(p => {
      this.server.to(p.socketId).emit('battle:state', room);
    });
    room.players.forEach(p => {
      this.server.to(p.socketId).emit('battle:turn', { playerId: room.currentTurnPlayerId, timeLimit: 30 });
    });
  }

  @SubscribeMessage('battle:surrender')
  handleSurrender(@ConnectedSocket() client: Socket) {
    const characterId = client.data.characterId as string;
    const room = this.matchmaking.getRoomByPlayer(characterId);
    if (!room || room.phase !== 'active') return;

    const opponent = room.players.find(p => p.characterId !== characterId);
    room.phase = 'finished';
    room.winner = opponent?.characterId;
    this.matchmaking.saveRoom(room);

    room.players.forEach(p => {
      const isWinner = p.characterId !== characterId;
      this.server.to(p.socketId).emit('battle:result', {
        winner: opponent?.characterId,
        loser: characterId,
        xp: isWinner ? 100 : 10,
        gold: isWinner ? 50 : 5,
      });
    });
    this.matchmaking.removeRoom(room.roomId);
  }

  private calcDamage(angle: number, force: number): number {
    return Math.round((force / 100) * 30 * (0.8 + Math.random() * 0.4));
  }
}
