import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import Phaser from "phaser";
import { DungeonScene } from "../../game/scenes/dungeon.scene";
import {
    DungeonPhase,
    DungeonState,
    PlayerState,
} from "../shared/game-core/dungeon-types";
import { DUNGEON_CONTENT } from "../shared/game-core/dungeon-content";
import { WeaponSystem } from "../shared/game-core/weapon-system";
import { SecondaryItemSystem } from "../shared/game-core/secondary-item-system";
import { ConsumableSystem } from "../shared/game-core/consumable-system";
import { WeaponDefinition } from "../shared/game-core/weapon-definition";
import { DungeonLobbyComponent } from "./dungeon-lobby/dungeon-lobby.component";
import { DungeonResultComponent } from "./dungeon-result/dungeon-result.component";
import { DungeonStorageService } from "../shared/services/dungeon-storage.service";
import {
    RewardPortalsComponent,
    RewardPortal,
} from "../shared/components/reward-portals/reward-portals.component";
import { ApiService } from "../shared/services/api.service";
import {
    GameNavigatorService,
    BattleConfig,
} from "../shared/services/game-navigator.service";
import { ActiveCharacterService } from "../shared/services/active-character.service";

type DungeonView = "battle" | "lobby" | "portals" | "victory" | "defeat";

@Component({
    selector: "app-dungeon",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        DungeonLobbyComponent,
        DungeonResultComponent,
        RewardPortalsComponent,
    ],
    templateUrl: "./dungeon.component.html",
    styleUrls: ["./dungeon.component.scss"],
})
export class DungeonComponent implements AfterViewInit, OnDestroy {
    @ViewChild("gameContainer") containerRef!: ElementRef<HTMLDivElement>;

    private game: Phaser.Game | null = null;
    private readonly phaseFinished = (event: Event) =>
        this.onPhaseFinished(
            event as CustomEvent<{ state: DungeonState; phase: DungeonPhase }>,
        );
    private difficulty: "easy" | "medium" | "hard" | "heroic" = "easy";

    view: DungeonView = "battle";
    phaseIndex = 0;
    lives = 3;
    earnedXp = 0;
    earnedGold = 0;
    player: PlayerState = {
        id: "player",
        hp: 120,
        maxHp: 120,
        weaponId: "cannon",
        secondaryItemId: "shield",
        consumableIds: ["heal"],
    };

    weapons: WeaponDefinition[] = new WeaponSystem().getAll();
    secondaryItems = new SecondaryItemSystem().getAll();
    consumables = new ConsumableSystem().getAll();
    phases = DUNGEON_CONTENT;
    portalRoomId = "";
    rewardPortals: RewardPortal[] = [];
    rewardPicks = 1;

    constructor(
        private readonly cdr: ChangeDetectorRef,
        private readonly router: Router,
        private readonly storage: DungeonStorageService,
        private readonly api: ApiService,
        private readonly activeCharacter: ActiveCharacterService,
        private readonly navigator: GameNavigatorService,
    ) {}

    ngAfterViewInit(): void {
        window.addEventListener(
            "rune-wars:dungeon-phase-finished",
            this.phaseFinished,
        );
        this.applyLaunchConfig();
        this.startBattle();
    }

    ngOnDestroy(): void {
        window.removeEventListener(
            "rune-wars:dungeon-phase-finished",
            this.phaseFinished,
        );
        this.destroyGame();
    }

    get nextPhase(): DungeonPhase {
        return this.phases[Math.min(this.phaseIndex, this.phases.length - 1)];
    }

    continueFromLobby(
        loadout: Pick<
            PlayerState,
            "weaponId" | "secondaryItemId" | "consumableIds"
        >,
    ): void {
        this.player = { ...this.player, ...loadout };
        this.view = "battle";
        this.cdr.detectChanges();
        queueMicrotask(() => this.startBattle());
    }

    abandon(): void {
        if (this.navigator.roomId()) {
            this.navigator.goTo("dungeon-room");
            return;
        }
        this.router.navigateByUrl("/playground");
    }

    restart(): void {
        this.phaseIndex = 0;
        this.lives = 3;
        this.earnedXp = 0;
        this.earnedGold = 0;
        this.player = { ...this.player, hp: this.player.maxHp };
        this.view = "battle";
        this.cdr.detectChanges();
        queueMicrotask(() => this.startBattle());
    }

    private startBattle(): void {
        if (!this.containerRef?.nativeElement) return;
        this.destroyGame();
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width:
                this.containerRef.nativeElement.clientWidth ||
                window.innerWidth,
            height:
                this.containerRef.nativeElement.clientHeight ||
                window.innerHeight,
            backgroundColor: "#141725",
            parent: this.containerRef.nativeElement,
            scene: [DungeonScene],
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
        });
        this.game.scene.start("DungeonScene", {
            phaseIndex: this.phaseIndex,
            loadout: {
                weaponId: this.player.weaponId,
                secondaryItemId: this.player.secondaryItemId,
                consumableIds: this.player.consumableIds,
            },
            playerMaxHp: this.player.maxHp,
            playerHp: this.player.hp,
            playerName: this.player.id,
            difficulty: this.difficulty,
        });
    }

    private onPhaseFinished(
        event: CustomEvent<{ state: DungeonState; phase: DungeonPhase }>,
    ): void {
        const { state, phase } = event.detail;
        this.destroyGame();
        this.player = { ...state.playerState };
        this.lives = state.lives;

        if (state.status === "FAILED") {
            this.view = "defeat";
            this.cdr.detectChanges();
            return;
        }

        this.earnedXp += phase.reward.xp;
        this.earnedGold += phase.reward.gold;

        const roomId = this.navigator.roomId();
        if (roomId) {
            this.openStagePortals(roomId);
            return;
        }

        if (this.phaseIndex >= this.phases.length - 1) {
            this.storage.saveFloor1Reward(this.earnedXp, this.earnedGold);
            this.view = "victory";
            this.cdr.detectChanges();
            return;
        }

        this.phaseIndex += 1;
        this.player = { ...this.player, hp: Math.max(40, this.player.hp) };
        this.view = "lobby";
        this.cdr.detectChanges();
    }

    onPortalsClosed(): void {
        const roomId = this.navigator.roomId();
        if (roomId) {
            this.storage
                .regroup(roomId, this.activeCharacter.characterId ?? "")
                .subscribe({
                    next: () => this.navigator.goTo("dungeon-room"),
                    error: () => this.navigator.goTo("dungeon-room"),
                });
            return;
        }

        if (this.phaseIndex >= this.phases.length - 1) {
            this.storage.saveFloor1Reward(this.earnedXp, this.earnedGold);
            this.view = "victory";
            this.cdr.detectChanges();
            return;
        }
        this.phaseIndex += 1;
        this.player = { ...this.player, hp: Math.max(40, this.player.hp) };
        this.view = "lobby";
        this.cdr.detectChanges();
    }

    private openStagePortals(roomId: string): void {
        this.api
            .post<{
                portalState?: {
                    portals?: RewardPortal[];
                    picksPerCharacter?: number;
                };
            }>(`/dungeon/rooms/${roomId}/stage-complete`, {})
            .subscribe({
                next: (response) => {
                    this.portalRoomId = roomId;
                    this.rewardPortals = response.portalState?.portals ?? [];
                    this.rewardPicks =
                        response.portalState?.picksPerCharacter ?? 1;
                    this.view = "portals";
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.onPortalsClosed();
                },
            });
    }

    private destroyGame(): void {
        this.game?.destroy(true);
        this.game = null;
        if (this.containerRef?.nativeElement) {
            this.containerRef.nativeElement.innerHTML = "";
        }
    }

    private applyLaunchConfig(): void {
        const config = this.navigator.battleConfig();
        if (!config || config.mode !== "dungeon") return;
        this.difficulty = config.difficulty ?? "easy";
        this.phaseIndex = this.phaseIndexFromConfig(config);
        const maxHp = config.playerMaxHp ?? this.player.maxHp;
        this.player = {
            ...this.player,
            id: config.playerName ?? this.player.id,
            hp: maxHp,
            maxHp,
            weaponId: config.playerWeaponId ?? this.player.weaponId,
            consumableIds:
                config.playerConsumables ?? this.player.consumableIds,
        };
    }

    private phaseIndexFromConfig(config: BattleConfig): number {
        if (
            config.dungeonFloor !== undefined &&
            config.dungeonStage !== undefined
        ) {
            const index = this.phases.findIndex((phase) => {
                const stage = phase as DungeonPhase & {
                    floor?: number;
                    stage?: number;
                };
                return (
                    stage.floor === config.dungeonFloor &&
                    stage.stage === config.dungeonStage
                );
            });
            if (index !== -1) return index;
        }

        if (config.mapName === "dungeon_f1_s2") return 1;
        return 0;
    }
}
