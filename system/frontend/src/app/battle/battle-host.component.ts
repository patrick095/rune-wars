import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    ViewChild,
    inject,
} from "@angular/core";
import Phaser from "phaser";
import {
    BattleScene,
    BattleMode,
    MapName,
} from "../../game/scenes/battle.scene";
import { ActiveCharacterService } from "../shared/services/active-character.service";
import { ApiService } from "../shared/services/api.service";
import { AuthService } from "../shared/services/auth.service";
import { DungeonPresenceService } from "../shared/services/dungeon-presence.service";
import { DungeonRoom, DungeonStorageService } from "../shared/services/dungeon-storage.service";
import { GameNavigatorService, GameScreen } from "../shared/services/game-navigator.service";
import { DebugOverlayComponent } from "../playground/debug-overlay/debug-overlay.component";
import { RewardPortalsComponent } from "../shared/components/reward-portals/reward-portals.component";
import { environment } from "../../environments/environment";

class BattleLaunchScene extends Phaser.Scene {
    constructor() {
        super({ key: "BattleLaunchScene" });
    }

    create(): void {
        const data =
            (window as unknown as Record<string, unknown>)["rwBattleConfig"] ??
            {};
        this.scene.start("BattleScene", data);
    }
}

type BattleFinishedDetail = {
    victory?: boolean;
    reason?: "victory" | "defeat" | "surrender";
};

@Component({
    selector: "app-battle-host",
    standalone: true,
    imports: [DebugOverlayComponent, RewardPortalsComponent],
    template: `
        <div #gameContainer class="battle-host"></div>
        <app-debug-overlay [game]="game" [visible]="debugVisible" />
        @if (showRewards && rewardRoomId) {
            <app-reward-portals
                [mode]="rewardMode"
                [roomId]="rewardRoomId"
                [completeBattle]="completeBattle"
                (close)="closeRewards()"
            />
        }
    `,
    styles: [
        `
            :host,
            .battle-host {
                display: block;
                position: relative;
                width: 100%;
                height: 100%;
                min-height: 0;
                overflow: hidden;
                background: #1a1a2e;
            }

            :host ::ng-deep .battle-host canvas {
                position: absolute;
                inset: 0;
                display: block;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }
        `,
    ],
})
export class BattleHostComponent implements AfterViewInit, OnDestroy {
    @ViewChild("gameContainer") containerRef!: ElementRef<HTMLDivElement>;

    private readonly activeCharacter = inject(ActiveCharacterService);
    private readonly api = inject(ApiService);
    private readonly auth = inject(AuthService);
    private readonly dungeonPresence = inject(DungeonPresenceService);
    private readonly dungeonStorage = inject(DungeonStorageService);
    private readonly navigator = inject(GameNavigatorService);
    game: Phaser.Game | null = null;
    debugVisible = false;
    showRewards = false;
    rewardRoomId = "";
    rewardMode: "pvp" | "dungeon" = "pvp";
    completeBattle = true;
    private returnScreen: GameScreen = "pvp-room";
    private dungeonRoomLeft = false;
    private battleFinished = false;
    private readonly onBattleExit = () => this.handleBattleExit();
    private readonly onBattleFinished = (event: Event) => this.openRewards(event as CustomEvent<BattleFinishedDetail>);
    private readonly onPageLeave = () => this.sendDungeonLeaveBeacon();

    @HostListener("window:keydown.o", ["$event"])
    onDebugKey(e: Event): void {
        if (((e as KeyboardEvent).target as HTMLElement).tagName === "INPUT") return;
        this.debugVisible = !this.debugVisible;
    }

    ngAfterViewInit(): void {
        window.addEventListener("rune-wars:battle-exit", this.onBattleExit);
        window.addEventListener("rune-wars:battle-finished", this.onBattleFinished);
        window.addEventListener("pagehide", this.onPageLeave);
        window.addEventListener("beforeunload", this.onPageLeave);

        const config = this.navigator.battleConfig();
        this.rewardRoomId = config?.roomId ?? this.navigator.roomId() ?? "";
        this.rewardMode = config?.rewardMode === "dungeon" ? "dungeon" : "pvp";
        this.completeBattle = config?.completeBattle ?? this.rewardMode === "pvp";
        this.returnScreen = config?.returnScreen ?? (config?.mode === "dungeon" ? "dungeon-room" : "pvp-room");
        if (this.rewardMode === "dungeon" && this.rewardRoomId && this.activeCharacter.characterId) {
            this.dungeonPresence.connect(this.rewardRoomId, this.activeCharacter.characterId);
        }
        const playerRace = this.activeCharacter.character?.race ?? "human";
        const playerName =
            config?.playerName ??
            this.activeCharacter.character?.name ??
            "Jogador";

        (window as unknown as Record<string, unknown>)["rwPlayerRace"] =
            playerRace;
        (window as unknown as Record<string, unknown>)["rwBattleConfig"] = {
            isPlayground: false,
            mode: (config?.mode ?? "pvp") satisfies BattleMode,
            mapName: (config?.mapName ?? "plains") as MapName,
            playerRace,
            playerName,
            agility: config?.playerAgility,
            playerMaxHp: config?.playerMaxHp,
            playerWeaponId: config?.playerWeaponId,
            playerWeaponUpgradeLevel: config?.playerWeaponUpgradeLevel ?? 0,
            playerWeaponRarity: config?.playerWeaponRarity ?? 'common',
            playerConsumables: config?.playerConsumables ?? [],
            playerStrength: config?.playerStrength,
            playerDefense: config?.playerDefense,
            playerLuck: config?.playerLuck,
            opponentName: config?.opponentName,
            opponentRace: config?.opponentRace,
            aiMaxHp: config?.aiMaxHp,
            aiAgility: config?.aiAgility,
            aiWeaponId: config?.aiWeaponId,
            aiWeaponUpgradeLevel: config?.aiWeaponUpgradeLevel ?? 0,
            aiWeaponRarity: config?.aiWeaponRarity ?? 'common',
            aiStrength: config?.aiStrength,
            aiDefense: config?.aiDefense,
            aiLuck: config?.aiLuck,
            roomName: config?.roomName,
            vsAI: config?.vsAI ?? true,
            difficulty: config?.difficulty,
            dungeonFloor: config?.dungeonFloor,
            dungeonStage: config?.dungeonStage,
        };

        const host = this.containerRef.nativeElement;
        const frame = document.getElementById("game-frame");
        const width =
            host.clientWidth || frame?.clientWidth || window.innerWidth;
        const height =
            host.clientHeight || frame?.clientHeight || window.innerHeight;
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width,
            height,
            backgroundColor: "#1a1a2e",
            parent: host,
            scene: [BattleLaunchScene, BattleScene],
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
        });
    }

    ngOnDestroy(): void {
        window.removeEventListener("rune-wars:battle-exit", this.onBattleExit);
        window.removeEventListener(
            "rune-wars:battle-finished",
            this.onBattleFinished,
        );
        window.removeEventListener("pagehide", this.onPageLeave);
        window.removeEventListener("beforeunload", this.onPageLeave);
        this.game?.destroy(true);
        this.game = null;
        delete (window as unknown as Record<string, unknown>)["rwBattleConfig"];
    }

    private returnToRoom(): void {
        this.navigator.goTo(this.returnScreen);
    }

    private handleBattleExit(): void {
        if (this.rewardMode === "dungeon") {
            this.leaveDungeonRoomToLobby();
            return;
        }
        this.returnToRoom();
    }

    private openRewards(event?: CustomEvent<BattleFinishedDetail>): void {
        this.battleFinished = true;
        const config = this.navigator.battleConfig();
        const victory = event?.detail?.victory ?? true;
        if (this.rewardMode === "dungeon" && !victory) {
            this.handleDungeonLoss(event?.detail?.reason ?? "defeat");
            return;
        }
        if (config?.rewardMode === "none" || !this.rewardRoomId) {
            this.returnToRoom();
            return;
        }
        if (this.rewardMode === "dungeon") {
            this.api.post<unknown>(`/dungeon/rooms/${this.rewardRoomId}/stage-complete`, {}).subscribe({
                next: () => this.showRewards = true,
                error: () => this.returnToRoom(),
            });
            return;
        }
        this.showRewards = true;
    }

    private handleDungeonLoss(reason: BattleFinishedDetail["reason"]): void {
        if (reason !== "surrender") {
            this.failDungeonRoomToRoom();
            return;
        }

        const roomId = this.rewardRoomId;
        if (!roomId) {
            this.returnToRoom();
            return;
        }

        this.dungeonStorage.getRoom(roomId).subscribe({
            next: (room) => {
                if (this.hasOtherRealPlayers(room)) {
                    this.leaveDungeonRoomToLobby();
                    return;
                }
                this.failDungeonRoomToRoom();
            },
            error: () => this.returnToRoom(),
        });
    }

    private failDungeonRoomToRoom(): void {
        const roomId = this.rewardRoomId;
        const characterId = this.activeCharacter.characterId;
        const goRoom = () => {
            if (roomId) this.navigator.setRoomId(roomId, true);
            this.navigator.goTo("dungeon-room");
        };

        if (!roomId || !characterId) {
            goRoom();
            return;
        }

        this.dungeonStorage.failRoom(roomId, characterId).subscribe({
            next: goRoom,
            error: goRoom,
        });
    }

    private leaveDungeonRoomToLobby(): void {
        const roomId = this.rewardRoomId;
        const characterId = this.activeCharacter.characterId;
        const goLobby = () => {
            this.dungeonPresence.leave();
            this.navigator.setRoomId(null);
            this.navigator.goTo("dungeon-lobby");
        };

        if (!roomId || !characterId) {
            goLobby();
            return;
        }

        this.dungeonRoomLeft = true;
        this.dungeonStorage.leaveRoom(roomId, characterId).subscribe({
            next: goLobby,
            error: goLobby,
        });
    }

    private hasOtherRealPlayers(room: DungeonRoom): boolean {
        const characterId = this.activeCharacter.characterId;
        return room.member_character_ids.some((id) => id !== characterId);
    }

    private sendDungeonLeaveBeacon(): void {
        if (
            this.rewardMode !== "dungeon" ||
            this.battleFinished ||
            this.dungeonRoomLeft
        ) return;
        const roomId = this.rewardRoomId;
        const characterId = this.activeCharacter.characterId;
        const token = this.auth.getToken();
        if (!roomId || !characterId || !token) return;

        this.dungeonRoomLeft = true;
        fetch(`${environment.apiUrl}/dungeon/rooms/${roomId}/leave`, {
            method: "POST",
            keepalive: true,
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ characterId }),
        }).catch(() => undefined);
    }

    closeRewards(): void {
        this.showRewards = false;
        if (this.rewardMode === "dungeon" && this.rewardRoomId) {
            this.api.post<unknown>(`/dungeon/rooms/${this.rewardRoomId}/regroup`, {
                characterId: this.activeCharacter.characterId,
            }).subscribe({
                next: () => this.returnToRoom(),
                error: () => this.returnToRoom(),
            });
            return;
        }
        this.returnToRoom();
    }
}
