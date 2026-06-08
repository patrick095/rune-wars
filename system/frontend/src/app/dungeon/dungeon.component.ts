import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Phaser from 'phaser';
import { DungeonScene } from '../../game/scenes/dungeon.scene';
import { DungeonPhase, DungeonState, PlayerState } from '../shared/game-core/dungeon-types';
import { FLOOR_1_PHASES } from '../shared/game-core/dungeon-engine';
import { WeaponSystem } from '../shared/game-core/weapon-system';
import { SecondaryItemSystem } from '../shared/game-core/secondary-item-system';
import { ConsumableSystem } from '../shared/game-core/consumable-system';
import { WeaponDefinition } from '../shared/game-core/weapon-definition';
import { DungeonLobbyComponent } from './dungeon-lobby/dungeon-lobby.component';
import { DungeonResultComponent } from './dungeon-result/dungeon-result.component';
import { DungeonStorageService } from '../shared/services/dungeon-storage.service';

type DungeonView = 'battle' | 'lobby' | 'victory' | 'defeat';

@Component({
  selector: 'app-dungeon',
  standalone: true,
  imports: [CommonModule, RouterModule, DungeonLobbyComponent, DungeonResultComponent],
  templateUrl: './dungeon.component.html',
  styleUrls: ['./dungeon.component.scss'],
})
export class DungeonComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameContainer') containerRef!: ElementRef<HTMLDivElement>;

  private game: Phaser.Game | null = null;
  private readonly phaseFinished = (event: Event) => this.onPhaseFinished(event as CustomEvent<{ state: DungeonState; phase: DungeonPhase }>);

  view: DungeonView = 'battle';
  phaseIndex = 0;
  lives = 3;
  earnedXp = 0;
  earnedGold = 0;
  player: PlayerState = {
    id: 'player',
    hp: 120,
    maxHp: 120,
    weaponId: 'cannon',
    secondaryItemId: 'shield',
    consumableIds: ['heal'],
  };

  weapons: WeaponDefinition[] = new WeaponSystem().getAll();
  secondaryItems = new SecondaryItemSystem().getAll();
  consumables = new ConsumableSystem().getAll();
  phases = FLOOR_1_PHASES;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private readonly storage: DungeonStorageService,
  ) {}

  ngAfterViewInit(): void {
    window.addEventListener('rune-wars:dungeon-phase-finished', this.phaseFinished);
    this.startBattle();
  }

  ngOnDestroy(): void {
    window.removeEventListener('rune-wars:dungeon-phase-finished', this.phaseFinished);
    this.destroyGame();
  }

  get nextPhase(): DungeonPhase {
    return this.phases[Math.min(this.phaseIndex, this.phases.length - 1)];
  }

  continueFromLobby(loadout: Pick<PlayerState, 'weaponId' | 'secondaryItemId' | 'consumableIds'>): void {
    this.player = { ...this.player, ...loadout };
    this.view = 'battle';
    this.cdr.detectChanges();
    queueMicrotask(() => this.startBattle());
  }

  abandon(): void {
    this.router.navigateByUrl('/playground');
  }

  restart(): void {
    this.phaseIndex = 0;
    this.lives = 3;
    this.earnedXp = 0;
    this.earnedGold = 0;
    this.player = { ...this.player, hp: this.player.maxHp };
    this.view = 'battle';
    this.cdr.detectChanges();
    queueMicrotask(() => this.startBattle());
  }

  private startBattle(): void {
    if (!this.containerRef?.nativeElement) return;
    this.destroyGame();
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: this.containerRef.nativeElement.clientWidth || window.innerWidth,
      height: this.containerRef.nativeElement.clientHeight || window.innerHeight,
      backgroundColor: '#141725',
      parent: this.containerRef.nativeElement,
      scene: [DungeonScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });
    this.game.scene.start('DungeonScene', {
      phaseIndex: this.phaseIndex,
      loadout: {
        weaponId: this.player.weaponId,
        secondaryItemId: this.player.secondaryItemId,
        consumableIds: this.player.consumableIds,
      },
    });
  }

  private onPhaseFinished(event: CustomEvent<{ state: DungeonState; phase: DungeonPhase }>): void {
    const { state, phase } = event.detail;
    this.destroyGame();
    this.player = { ...state.playerState };
    this.lives = state.lives;

    if (state.status === 'FAILED') {
      this.view = 'defeat';
      this.cdr.detectChanges();
      return;
    }

    this.earnedXp += phase.reward.xp;
    this.earnedGold += phase.reward.gold;

    if (this.phaseIndex >= this.phases.length - 1) {
      this.storage.saveFloor1Reward(this.earnedXp, this.earnedGold);
      this.view = 'victory';
      this.cdr.detectChanges();
      return;
    }

    this.phaseIndex += 1;
    this.player = { ...this.player, hp: Math.max(40, this.player.hp) };
    this.view = 'lobby';
    this.cdr.detectChanges();
  }

  private destroyGame(): void {
    this.game?.destroy(true);
    this.game = null;
    if (this.containerRef?.nativeElement) {
      this.containerRef.nativeElement.innerHTML = '';
    }
  }
}
