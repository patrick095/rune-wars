import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Request,
    UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PvpService } from "./pvp.service";

@Controller("pvp")
@UseGuards(JwtAuthGuard)
export class PvpController {
    constructor(private readonly pvpService: PvpService) {}

    @Get("rooms")
    listRooms() {
        return this.pvpService.listRooms();
    }

    @Get("rooms/:id")
    getRoom(@Param("id") id: string) {
        return this.pvpService.findRoom(id);
    }

    @Post("rooms")
    createRoom(
        @Request() req: any,
        @Body() body: { name?: string; mapName?: string; characterId: string },
    ) {
        return this.pvpService.createRoom(
            req.user.userId,
            body.characterId,
            body.name,
            body.mapName,
        );
    }

    @Delete("rooms/:id")
    deleteRoom(@Param("id") id: string) {
        return this.pvpService.deleteRoom(id);
    }

    @Post("rooms/:id/join")
    joinRoom(
        @Param("id") id: string,
        @Request() req: any,
        @Body() body: { characterId: string },
    ) {
        return this.pvpService.joinRoom(id, req.user.userId, body.characterId);
    }

    @Post("rooms/:id/leave")
    leaveRoom(
        @Param("id") id: string,
        @Request() req: any,
        @Body() body: { characterId: string },
    ) {
        return this.pvpService.leaveRoom(id, req.user.userId, body.characterId);
    }

    @Post("rooms/:id/heartbeat")
    heartbeat(
        @Param("id") id: string,
        @Request() req: any,
        @Body() body: { characterId: string },
    ) {
        return this.pvpService.touchRoom(id, req.user.userId, body.characterId);
    }

    @Post("rooms/:id/slots/:slotIndex/close")
    closeSlot(
        @Param("id") id: string,
        @Param("slotIndex", ParseIntPipe) slotIndex: number,
        @Request() req: any,
        @Body() body: { characterId: string },
    ) {
        return this.pvpService.closeSlot(id, slotIndex, body.characterId);
    }

    @Post("rooms/:id/slots/:slotIndex/kick")
    kickPlayer(
        @Param("id") id: string,
        @Param("slotIndex", ParseIntPipe) slotIndex: number,
        @Request() req: any,
        @Body() body: { characterId: string },
    ) {
        return this.pvpService.kickPlayer(id, slotIndex, body.characterId);
    }

    @Patch("rooms/:id/settings")
    updateSettings(
        @Param("id") id: string,
        @Request() req: any,
        @Body() body: { characterId: string; map_slug?: string; mode?: string },
    ) {
        return this.pvpService.updateSettings(id, body.characterId, {
            map_slug: body.map_slug,
            mode: body.mode,
        });
    }

    @Get("rooms/:id/find-match")
    findMatch(@Param("id") id: string) {
        return this.pvpService.findMatch(id);
    }

    @Post("rooms/:id/start-battle")
    startBattle(
        @Param("id") id: string,
        @Request() req: any,
        @Body() body: { characterId?: string },
    ) {
        return this.pvpService.startBattle(id, body.characterId);
    }

    @Post("rooms/:id/complete-battle")
    completeBattle(
        @Param("id") id: string,
        @Body() body: { winnerId?: string },
    ) {
        return this.pvpService.completeBattle(id, body.winnerId);
    }

    @Post("rooms/:id/rewards")
    rewards(
        @Param("id") id: string,
        @Body()
        body: {
            characterId?: string;
            portalIndices?: number[];
            completeBattle?: boolean;
            winnerId?: string;
        },
    ) {
        return this.pvpService.rewards(id, body);
    }

    @Post("rooms/:id/rewards/select")
    selectReward(
        @Param("id") id: string,
        @Body() body: { characterId: string; portalIndices?: number[] },
    ) {
        return this.pvpService.selectReward(
            id,
            body.characterId,
            body.portalIndices,
        );
    }

    @Post("rooms/:id/ready")
    setReady(
        @Param("id") id: string,
        @Request() req: any,
        @Body()
        body: {
            characterId: string;
            consumableSelection: string[];
            vs_cpu?: boolean;
        },
    ) {
        return this.pvpService.setReady(
            id,
            body.characterId,
            body.consumableSelection ?? [],
            body.vs_cpu ?? false,
        );
    }

    @Post("cleanup")
    cleanupRooms() {
        return this.pvpService.cleanupAllRooms();
    }
}
