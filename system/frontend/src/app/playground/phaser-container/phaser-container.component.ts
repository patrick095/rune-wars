import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter, inject } from '@angular/core';
import Phaser from 'phaser';
import { BootScene } from '../../../game/scenes/boot.scene';
import { PlaygroundScene } from '../../../game/scenes/playground.scene';
import { BattleScene } from '../../../game/scenes/battle.scene';
import { ActiveCharacterService } from '../../shared/services/active-character.service';

@Component({
  selector: 'app-phaser-container',
  standalone: true,
  template: '<div #gameContainer class="game-container"></div>',
  styles: [`
    .game-container {
      width: 100%;
      height: 100%;
    }
  `]
})
export class PhaserContainerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameContainer') containerRef!: ElementRef<HTMLDivElement>;
  @Output() gameReady = new EventEmitter<Phaser.Game>();

  private activeCharacter = inject(ActiveCharacterService);
  private game: Phaser.Game | null = null;

  ngAfterViewInit() {
    const playerRace = this.activeCharacter.character?.race ?? 'human';
    (window as unknown as Record<string, unknown>)['rwPlayerRace'] = playerRace; // eslint-disable-line

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#1a1a2e',
      parent: this.containerRef.nativeElement,
      scene: [BootScene, BattleScene, PlaygroundScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    this.game = new Phaser.Game(config);
    this.gameReady.emit(this.game);
  }

  ngOnDestroy() {
    this.game?.destroy(true);
    this.game = null;
  }
}
