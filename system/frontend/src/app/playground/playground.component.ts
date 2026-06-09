import { Component, HostListener } from '@angular/core';
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
      <app-debug-overlay [game]="game" [visible]="debugVisible" />
      @if (!debugVisible) {
        <div class="debug-hint" title="Debug (tecla O)" (click)="debugVisible = true">🛠</div>
      }
    </div>
  `,
  styles: [`
    .playground-wrapper {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    .debug-hint {
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0.3;
      font-size: 18px;
      cursor: pointer;
      z-index: 300;
      &:hover { opacity: 0.8; }
    }
  `]
})
export class PlaygroundComponent {
  game: Phaser.Game | null = null;
  debugVisible = false;

  onGameReady(game: Phaser.Game) {
    this.game = game;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'o' || e.key === 'O') {
      this.debugVisible = !this.debugVisible;
    }
  }
}
