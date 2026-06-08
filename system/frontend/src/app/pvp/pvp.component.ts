import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BattleService } from '../shared/services/battle.service';

@Component({
  selector: 'app-pvp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pvp-container">
      @switch (battle.phase()) {
        @case ('idle') {
          <div class="card">
            <h2>PvP 1v1</h2>
            <p class="sub">Selecione um personagem para entrar na fila</p>
            <input class="input" [(value)]="characterId" placeholder="Character ID" (input)="onInput($event)" />
            <button class="btn" (click)="joinQueue()">Entrar na Fila</button>
          </div>
        }
        @case ('queued') {
          <div class="card">
            <h2>Procurando adversário...</h2>
            <div class="spinner"></div>
            <p class="sub">Aguarde, conectando à partida</p>
            <button class="btn-outline" (click)="leave()">Cancelar</button>
          </div>
        }
        @case ('matched') {
          <div class="card">
            <h2>Adversário encontrado!</h2>
            <p class="sub">Sala: <strong>{{ battle.matchedRoomId() }}</strong></p>
            <p class="sub">vs <strong>{{ battle.opponentId() }}</strong></p>
            <div class="spinner"></div>
            <p class="hint">Carregando batalha...</p>
          </div>
        }
        @case ('active') {
          <div class="battle-hud">
            <div class="hud-top">
              <span>Sala: {{ battle.state()?.roomId }}</span>
              <span>Turno #{{ battle.state()?.turnNumber }}</span>
              <span>Vento: {{ battle.state()?.wind | number:'1.1-1' }}</span>
            </div>
            <div class="players">
              @for (player of battle.state()?.players; track player.characterId) {
                <div class="player-card" [class.active]="battle.state()?.currentTurnPlayerId === player.characterId">
                  <div class="player-name">{{ player.characterId.slice(0, 8) }}...</div>
                  <div class="hp-bar">
                    <div class="hp-fill" [style.width.%]="player.hp"></div>
                  </div>
                  <div class="hp-label">{{ player.hp }} HP</div>
                </div>
              }
            </div>
            @if (battle.isMyTurn()) {
              <div class="action-panel">
                <p class="turn-label">Seu turno!</p>
                <div class="controls">
                  <label>Ângulo: {{ angle }}°</label>
                  <input type="range" min="-90" max="90" [(ngModel)]="angle" class="slider" />
                  <label>Força: {{ force }}%</label>
                  <input type="range" min="10" max="100" [(ngModel)]="force" class="slider" />
                  <button class="btn" (click)="shoot()">Disparar</button>
                </div>
              </div>
            } @else {
              <div class="waiting-panel">
                <p>Aguardando adversário...</p>
              </div>
            }
            <button class="btn-danger" (click)="surrender()">Render</button>
            @if (battle.error()) {
              <div class="error">{{ battle.error() }}</div>
            }
          </div>
        }
        @case ('finished') {
          <div class="card">
            @if (battle.state()?.winner === characterId) {
              <h2 class="win">Vitória!</h2>
              <p class="sub">+100 XP, +50 Gold</p>
            } @else {
              <h2 class="lose">Derrota</h2>
              <p class="sub">+30 XP, +10 Gold</p>
            }
            <button class="btn" (click)="restart()">Jogar Novamente</button>
            <button class="btn-outline" (click)="goHome()">Voltar ao Início</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .pvp-container {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #1a1a2e; color: #e0e0e0;
    }
    .card {
      background: #16213e; border: 1px solid #0f3460; border-radius: 8px;
      padding: 2rem; width: 100%; max-width: 420px; text-align: center;
    }
    h2 { color: #e94560; margin: 0 0 0.5rem; }
    .sub { color: #a0a0c0; margin: 0.25rem 0 1rem; }
    .hint { color: #606080; font-size: 0.8rem; }
    .input {
      width: 100%; box-sizing: border-box; padding: 0.5rem 0.75rem; margin-bottom: 1rem;
      background: #0f3460; border: 1px solid #1a4a7a; border-radius: 4px;
      color: #e0e0e0; font-size: 1rem;
    }
    .btn {
      padding: 0.75rem 2rem; background: #e94560; border: none; border-radius: 4px;
      color: white; font-size: 1rem; cursor: pointer; margin: 0.25rem;
    }
    .btn-outline {
      padding: 0.75rem 2rem; background: transparent; border: 1px solid #e94560;
      border-radius: 4px; color: #e94560; font-size: 1rem; cursor: pointer; margin: 0.25rem;
    }
    .btn-danger {
      padding: 0.5rem 1rem; background: #601020; border: none; border-radius: 4px;
      color: #ffa0a0; font-size: 0.875rem; cursor: pointer; margin-top: 1rem;
    }
    .spinner {
      width: 40px; height: 40px; margin: 1rem auto;
      border: 3px solid #0f3460; border-top-color: #e94560;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .battle-hud {
      width: 100%; max-width: 600px; padding: 1rem; background: #16213e;
      border: 1px solid #0f3460; border-radius: 8px;
    }
    .hud-top {
      display: flex; justify-content: space-between;
      font-size: 0.8rem; color: #a0a0c0; margin-bottom: 1rem;
    }
    .players { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .player-card {
      flex: 1; padding: 0.75rem; background: #0f1a30; border-radius: 6px;
      border: 1px solid #1a3060;
    }
    .player-card.active { border-color: #e94560; }
    .player-name { font-size: 0.8rem; color: #a0a0c0; margin-bottom: 0.5rem; }
    .hp-bar { height: 8px; background: #0f3460; border-radius: 4px; overflow: hidden; }
    .hp-fill { height: 100%; background: #40e060; transition: width 0.3s; }
    .hp-label { font-size: 0.75rem; color: #80d090; margin-top: 0.25rem; }
    .action-panel { background: #0f1a30; border-radius: 6px; padding: 1rem; margin-bottom: 0.5rem; }
    .turn-label { color: #e94560; font-weight: bold; margin: 0 0 0.75rem; }
    .controls { display: flex; flex-direction: column; gap: 0.5rem; }
    .controls label { font-size: 0.875rem; color: #a0a0c0; }
    .slider { width: 100%; }
    .waiting-panel { padding: 1rem; color: #606080; font-style: italic; }
    .error { color: #e94560; font-size: 0.875rem; margin-top: 0.5rem; }
    .win { color: #40e060; }
    .lose { color: #e06040; }
  `]
})
export class PvpComponent implements OnInit, OnDestroy {
  characterId = '';
  angle = 45;
  force = 50;

  constructor(public battle: BattleService, private router: Router) {}

  ngOnInit() {
    const saved = localStorage.getItem('rw_character_id');
    if (saved) this.characterId = saved;
  }

  ngOnDestroy() {
    if (this.battle.phase() !== 'active') {
      this.battle.disconnect();
    }
  }

  onInput(e: Event) {
    this.characterId = (e.target as HTMLInputElement).value;
  }

  joinQueue() {
    if (!this.characterId.trim()) return;
    localStorage.setItem('rw_character_id', this.characterId);
    this.battle.connect(this.characterId);
  }

  leave() {
    this.battle.disconnect();
  }

  shoot() {
    this.battle.sendAction(this.angle, this.force);
  }

  surrender() {
    this.battle.surrender();
  }

  restart() {
    this.battle.disconnect();
  }

  goHome() {
    this.battle.disconnect();
    this.router.navigate(['/playground']);
  }
}
