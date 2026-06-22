import {
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { DungeonFloorsService } from "./dungeon-floors.service";

interface DungeonPresencePayload {
    roomId: string;
    characterId: string;
}

@WebSocketGateway({ cors: { origin: "*" }, namespace: "/dungeon" })
export class DungeonPresenceGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private presences = new Map<string, DungeonPresencePayload>();

    constructor(private readonly dungeonFloors: DungeonFloorsService) {}

    @SubscribeMessage("dungeon:presence")
    async handlePresence(
        @MessageBody() data: DungeonPresencePayload,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        if (!data?.roomId || !data?.characterId) {
            client.emit("dungeon:error", {
                code: "INVALID_PRESENCE",
                message: "roomId and characterId are required",
            });
            return;
        }

        const previous = this.presences.get(client.id);
        if (previous) {
            client.leave(this.roomChannel(previous.roomId));
        }

        client.data.roomId = data.roomId;
        client.data.characterId = data.characterId;
        this.presences.set(client.id, data);
        client.join(this.roomChannel(data.roomId));
        client.emit("dungeon:presence-ok", data);
    }

    @SubscribeMessage("dungeon:leave")
    async handleLeave(
        @MessageBody() data: Partial<DungeonPresencePayload> | undefined,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const presence = this.presences.get(client.id) ?? {
            roomId: data?.roomId ?? client.data.roomId,
            characterId: data?.characterId ?? client.data.characterId,
        };
        await this.removePresence(client.id, presence);
        client.disconnect(true);
    }

    async handleDisconnect(client: Socket): Promise<void> {
        const presence = this.presences.get(client.id);
        if (!presence) return;
        await this.removePresence(client.id, presence);
    }

    private async removePresence(
        socketId: string,
        presence: Partial<DungeonPresencePayload>,
    ): Promise<void> {
        this.presences.delete(socketId);
        if (!presence.roomId || !presence.characterId) return;

        try {
            const result = await this.dungeonFloors.leaveRoom(
                presence.roomId,
                presence.characterId,
            );
            this.server.to(this.roomChannel(presence.roomId)).emit(
                result.deleted ? "dungeon:room-deleted" : "dungeon:room-updated",
                result.deleted ? { roomId: presence.roomId } : result.lobby,
            );
        } catch {
            this.server
                .to(socketId)
                .emit("dungeon:error", { code: "LEAVE_FAILED" });
        }
    }

    private roomChannel(roomId: string): string {
        return `dungeon:${roomId}`;
    }
}
