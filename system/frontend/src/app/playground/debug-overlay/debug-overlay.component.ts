import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Phaser from 'phaser';

@Component({
  selector: 'app-debug-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-overlay" *ngIf="game">
      <div>FPS: {{ fps }}</div>
      <div>Resolução: {{ width }}×{{ height }}</div>
    </div>
  `,
  styles: [`
    .debug-overlay {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(0,0,0,0.6);
      color: #00ff88;
      font-family: monospace;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 4px;
      pointer-events: none;
      z-index: 100;
    }
  `]
})
export class DebugOverlayComponent implements OnInit, OnDestroy {
  @Input() game: Phaser.Game | null = null;

  fps = 0;
  width = window.innerWidth;
  height = window.innerHeight;

  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      if (this.game) {
        this.fps = Math.round(this.game.loop.actualFps);
        this.width = this.game.scale.width;
        this.height = this.game.scale.height;
      }
    }, 500);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
