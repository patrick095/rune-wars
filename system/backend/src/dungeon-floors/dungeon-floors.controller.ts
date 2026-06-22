import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { DungeonFloorsService } from "./dungeon-floors.service";
import { DifficultyTrack, DungeonDifficulty } from "./dungeon-floor.config";

@Controller()
@UseGuards(JwtAuthGuard)
export class DungeonFloorsController {
    constructor(private service: DungeonFloorsService) {}

    @Get("dungeon-floors")
    getAllFloors() {
        return this.service.getAllFloors();
    }

    @Get("dungeon-floors/:floor")
    getFloor(@Param("floor") floor: string) {
        return this.service.getFloorInfo(Number(floor));
    }

    @Post("dungeon-floors/lobbies")
    createLobby(
        @Body()
        body: {
            characterId: string;
            floor: number;
            track: DifficultyTrack;
        },
    ) {
        return this.service.createLobby(
            body.characterId,
            body.floor,
            body.track,
        );
    }

    @Post("dungeon-floors/lobbies/:id/join")
    joinLobby(@Param("id") id: string, @Body() body: { characterId: string }) {
        return this.service.joinLobby(id, body.characterId);
    }

    @Post("dungeon-floors/lobbies/:id/start")
    startDungeon(@Param("id") id: string, @Body() body: { leaderId: string }) {
        return this.service.startDungeon(id, body.leaderId);
    }

    @Post("dungeon-floors/lobbies/:id/phase-complete")
    completePhase(@Param("id") id: string) {
        return this.service.completePhase(id);
    }

    @Get("dungeon-floors/lobbies/:id")
    getLobby(@Param("id") id: string) {
        return this.service.getLobby(id);
    }

    @Get("dungeon/rooms")
    listRooms() {
        return this.service.listRooms();
    }

    @Post("dungeon/rooms")
    createRoom(
        @Body()
        body: {
            characterId: string;
            floor: number;
            difficulty?: DungeonDifficulty;
        },
    ) {
        return this.service.createRoom(
            body.characterId,
            body.floor,
            body.difficulty ?? "easy",
        );
    }

    @Post("dungeon/rooms/:id/join")
    joinRoom(@Param("id") id: string, @Body() body: { characterId: string }) {
        return this.service.joinLobby(id, body.characterId);
    }

    @Post("dungeon/rooms/:id/leave")
    leaveRoom(@Param("id") id: string, @Body() body: { characterId: string }) {
        return this.service.leaveRoom(id, body.characterId);
    }

    @Post("dungeon/rooms/:id/fail")
    failRoom(@Param("id") id: string, @Body() body: { characterId: string }) {
        return this.service.failRoom(id, body.characterId);
    }

    @Post("dungeon/rooms/:id/ready")
    ready(
        @Param("id") id: string,
        @Body()
        body: {
            characterId: string;
            ready?: boolean;
            weaponId?: string | null;
            consumableSelection?: string[];
            equippedLoadout?: Record<string, unknown> | null;
        },
    ) {
        return this.service.setReady(
            id,
            body.characterId,
            body.ready ?? true,
            body,
        );
    }

    @Post("dungeon/rooms/:id/settings")
    settings(
        @Param("id") id: string,
        @Body()
        body: {
            characterId: string;
            floor?: number;
            difficulty?: DungeonDifficulty;
        },
    ) {
        return this.service.updateSettings(id, body.characterId, body);
    }

    @Post("dungeon/rooms/:id/start")
    startRoom(@Param("id") id: string, @Body() body: { characterId: string }) {
        return this.service.startDungeon(id, body.characterId);
    }

    @Post("dungeon/rooms/:id/stage-complete")
    stageComplete(@Param("id") id: string) {
        return this.service.completePhase(id);
    }

    @Post("dungeon/rooms/:id/portals/select")
    selectPortal(
        @Param("id") id: string,
        @Body() body: { characterId: string; portalIndices?: number[] },
    ) {
        return this.service.selectPortal(
            id,
            body.characterId,
            body.portalIndices,
        );
    }

    @Post("dungeon/rooms/:id/regroup")
    regroup(@Param("id") id: string, @Body() body: { characterId: string }) {
        return this.service.regroup(id, body.characterId);
    }

    @Get("dungeon/rooms/:id")
    getRoom(@Param("id") id: string) {
        return this.service.getLobby(id);
    }

    @Post("dungeon/cleanup")
    cleanupRooms() {
        return this.service.cleanupAllRooms();
    }
}
