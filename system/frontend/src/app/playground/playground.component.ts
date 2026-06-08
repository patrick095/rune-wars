import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Phaser from 'phaser';
import { PhaserContainerComponent } from './phaser-container/phaser-container.component';
import { DebugOverlayComponent } from './debug-overlay/debug-overlay.component';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, PhaserContainerComponent, DebugOverlayComponent],
  template: `
    <div class="playground-wrapper">
      <app-phaser-container (gameReady)="onGameReady($event)" />
      <app-debug-overlay [game]="game" />
    </div>
  `,
  styles: [`
    .playground-wrapper {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class PlaygroundComponent {
  game: Phaser.Game | null = null;

  onGameReady(game: Phaser.Game) {
    this.game = game;
  }
}
