import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import Phaser from 'phaser';
import { BattleScene, BattleMode, MapName } from '../../game/scenes/battle.scene';
import { ActiveCharacterService } from '../shared/services/active-character.service';
import { GameNavigatorService } from '../shared/services/game-navigator.service';

class BattleLaunchScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleLaunchScene' });
  }

  create(): void {
    const data = (window as unknown as Record<string, unknown>)['rwBattleConfig'] ?? {};
    this.scene.start('BattleScene', data);
  }
}

@Component({
  selector: 'app-battle-host',
  standalone: true,
  template: '<div #gameContainer class="battle-host"></div>',
  styles: [`
    :host,
    .battle-host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 0;
      overflow: hidden;
      background: #1a1a2e;
    }
  `],
})
export class BattleHostComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameContainer') containerRef!: ElementRef<HTMLDivElement>;

  private readonly activeCharacter = inject(ActiveCharacterService);
  private readonly navigator = inject(GameNavigatorService);
  private game: Phaser.Game | null = null;
  private readonly onBattleExit = () => this.returnToPvpRoom();

  ngAfterViewInit(): void {
    window.addEventListener('rune-wars:battle-exit', this.onBattleExit);
    window.addEventListener('rune-wars:battle-finished', this.onBattleExit);

    const config = this.navigator.battleConfig();
    const playerRace = this.activeCharacter.character?.race ?? 'human';

    (window as unknown as Record<string, unknown>)['rwPlayerRace'] = playerRace;
    (window as unknown as Record<string, unknown>)['rwBattleConfig'] = {
      isPlayground: false,
      mode: 'pvp' satisfies BattleMode,
      mapName: (config?.mapName ?? 'plains') as MapName,
      playerRace,
    };

    const host = this.containerRef.nativeElement;
    const frame = document.getElementById('game-frame');
    const width = host.clientWidth || frame?.clientWidth || window.innerWidth;
    const height = host.clientHeight || frame?.clientHeight || window.innerHeight;

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width,
      height,
      backgroundColor: '#1a1a2e',
      parent: host,
      scene: [BattleLaunchScene, BattleScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('rune-wars:battle-exit', this.onBattleExit);
    window.removeEventListener('rune-wars:battle-finished', this.onBattleExit);
    this.game?.destroy(true);
    this.game = null;
    delete (window as unknown as Record<string, unknown>)['rwBattleConfig'];
  }

  private returnToPvpRoom(): void {
    this.navigator.goTo('pvp-room');
  }
}
