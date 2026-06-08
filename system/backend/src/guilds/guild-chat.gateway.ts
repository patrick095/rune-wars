import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GuildsService } from './guilds.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/guild-chat' })
export class GuildChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private guildsService: GuildsService) {}

  @SubscribeMessage('guild:join')
  handleJoin(@MessageBody() data: { guildId: string }, @ConnectedSocket() client: Socket) {
    client.join(`guild_${data.guildId}`);
    client.emit('guild:joined', { guildId: data.guildId });
  }

  @SubscribeMessage('guild:message')
  async handleMessage(
    @MessageBody() data: { guildId: string; characterId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const msg = await this.guildsService.saveMessage(data.guildId, data.characterId, data.content);
    this.server.to(`guild_${data.guildId}`).emit('guild:message', msg);
  }

  @SubscribeMessage('guild:leave')
  handleLeave(@MessageBody() data: { guildId: string }, @ConnectedSocket() client: Socket) {
    client.leave(`guild_${data.guildId}`);
  }
}
