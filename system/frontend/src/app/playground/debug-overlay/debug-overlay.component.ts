import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Phaser from 'phaser';
import { BattleScene } from '../../../game/scenes/battle.scene';

@Component({
  selector: 'app-debug-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="debug-overlay" *ngIf="game">
      <div class="debug-section">
        <div>FPS: {{ fps }}</div>
        <div>Resolução: {{ width }}×{{ height }}</div>
      </div>

      <hr class="debug-divider" />

      <div class="debug-section">
        <label class="debug-label">Vento (-100 a 100)</label>
        <input
          type="range" min="-100" max="100" step="1"
          [(ngModel)]="windValue"
          (ngModelChange)="onWindChange($event)"
          class="debug-range"
        />
        <span class="debug-value">{{ windValue }}</span>
      </div>

      <div class="debug-section">
        <label class="debug-label">HP Jogador</label>
        <input
          type="number" min="0" max="100"
          [(ngModel)]="playerHp"
          (ngModelChange)="onPlayerHpChange($event)"
          class="debug-input"
        />
      </div>

      <div class="debug-section">
        <label class="debug-label">HP Inimigo</label>
        <input
          type="number" min="0" max="100"
          [(ngModel)]="aiHp"
          (ngModelChange)="onAiHpChange($event)"
          class="debug-input"
        />
      </div>

      <div class="debug-section">
        <label class="debug-label">Dano Base</label>
        <input
          type="number" min="1" max="200"
          [(ngModel)]="baseDamage"
          (ngModelChange)="onBaseDamageChange($event)"
          class="debug-input"
        />
      </div>

      <div class="debug-section">
        <label class="debug-label">Dificuldade</label>
        <select
          [(ngModel)]="difficulty"
          (ngModelChange)="onDifficultyChange($event)"
          class="debug-select"
        >
          <option value="easy">Fácil</option>
          <option value="medium">Médio</option>
          <option value="hard">Difícil</option>
        </select>
      </div>

      <button class="debug-btn-reset" (click)="onReset()">Resetar Partida</button>
    </div>
  `,
  styles: [`
    .debug-overlay {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(0,0,0,0.75);
      color: #00ff88;
      font-family: monospace;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 4px;
      z-index: 100;
      min-width: 180px;
      pointer-events: all;
    }

    .debug-section {
      margin-bottom: 6px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .debug-divider {
      border-color: #444;
      margin: 6px 0;
    }

    .debug-label {
      color: #aaffcc;
      font-size: 11px;
    }

    .debug-range {
      width: 100%;
      cursor: pointer;
    }

    .debug-value {
      color: #ffdd44;
      font-size: 11px;
    }

    .debug-input {
      background: #222;
      border: 1px solid #555;
      color: #00ff88;
      padding: 2px 6px;
      width: 80px;
      font-family: monospace;
      font-size: 12px;
      border-radius: 2px;
    }

    .debug-select {
      background: #222;
      border: 1px solid #555;
      color: #00ff88;
      padding: 2px 6px;
      font-family: monospace;
      font-size: 12px;
      border-radius: 2px;
      cursor: pointer;
    }

    .debug-btn-reset {
      background: #aa2200;
      color: #ffffff;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 12px;
      cursor: pointer;
      width: 100%;
      margin-top: 4px;
    }

    .debug-btn-reset:hover {
      background: #cc3300;
    }
  `]
})
export class DebugOverlayComponent implements OnInit, OnDestroy {
  @Input() game: Phaser.Game | null = null;

  fps = 0;
  width = window.innerWidth;
  height = window.innerHeight;

  // v0.2.0 debug controls
  windValue = 0;
  playerHp = 100;
  aiHp = 100;
  baseDamage = 40;
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';

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

  private getBattleScene(): BattleScene | null {
    return ((window as Record<string, unknown>)['battleScene'] as BattleScene) ?? null;
  }

  onWindChange(value: number): void {
    this.getBattleScene()?.setWindOverride(value);
  }

  onPlayerHpChange(value: number): void {
    this.getBattleScene()?.setPlayerHp(value);
  }

  onAiHpChange(value: number): void {
    this.getBattleScene()?.setAiHp(value);
  }

  onBaseDamageChange(value: number): void {
    this.getBattleScene()?.setBaseDamage(value);
  }

  onDifficultyChange(value: 'easy' | 'medium' | 'hard'): void {
    this.getBattleScene()?.setDifficulty(value);
  }

  onReset(): void {
    this.getBattleScene()?.resetBattle();
    // Reset local state
    this.windValue = 0;
    this.playerHp = 100;
    this.aiHp = 100;
    this.baseDamage = 40;
    this.difficulty = 'medium';
  }
}
