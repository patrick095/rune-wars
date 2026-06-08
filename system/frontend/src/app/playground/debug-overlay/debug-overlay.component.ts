import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Phaser from 'phaser';
import { BattleScene } from '../../../game/scenes/battle.scene';
import { WeaponSystem } from '../../shared/game-core/weapon-system';
import { WeaponDefinition } from '../../shared/game-core/weapon-definition';

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

      <hr class="debug-divider" />

      <!-- v0.3.0 Terrain Controls -->
      <div class="debug-section-title">Terreno v0.3.0</div>

      <div class="debug-section">
        <label class="debug-label">Mapa</label>
        <select
          [(ngModel)]="selectedMap"
          (ngModelChange)="onMapChange($event)"
          class="debug-select"
        >
          <option value="plains">Planícies</option>
          <option value="castle">Castelo</option>
        </select>
      </div>

      <div class="debug-section">
        <label class="debug-label">Material (pintar)</label>
        <select
          [(ngModel)]="paintMaterial"
          class="debug-select"
        >
          <option value="0">Vazio (EMPTY)</option>
          <option value="1">Destrutível</option>
          <option value="2">Indestrutível</option>
        </select>
      </div>

      <div class="debug-section">
        <label class="debug-label">Raio Explosão: {{ explosionRadius }}</label>
        <input
          type="range" min="10" max="80" step="5"
          [(ngModel)]="explosionRadius"
          class="debug-range"
        />
      </div>

      <button class="debug-btn-terrain" (click)="onDebugExplode()">Explodir no Centro</button>
      <button class="debug-btn-terrain" (click)="onResetTerrain()">Resetar Mapa</button>

      <hr class="debug-divider" />

      <!-- v0.4.0 Weapon Controls -->
      <div class="debug-section-title">Armas v0.4.0</div>

      <div class="debug-section">
        <label class="debug-label">Arma do Jogador</label>
        <select
          [(ngModel)]="playerWeaponId"
          (ngModelChange)="onPlayerWeaponChange($event)"
          class="debug-select"
        >
          <option *ngFor="let w of weapons" [value]="w.id">{{ w.name }}</option>
        </select>
      </div>

      <div class="debug-section">
        <label class="debug-label">Arma da IA</label>
        <select
          [(ngModel)]="aiWeaponId"
          (ngModelChange)="onAiWeaponChange($event)"
          class="debug-select"
        >
          <option *ngFor="let w of weapons" [value]="w.id">{{ w.name }}</option>
        </select>
      </div>

      <div class="debug-section weapon-info">
        <div class="debug-label">Info: {{ selectedWeaponInfo.name }}</div>
        <div class="debug-value">Dano: {{ selectedWeaponInfo.baseDamage }}</div>
        <div class="debug-value">Raio impacto: {{ selectedWeaponInfo.impactRadius }}</div>
        <div class="debug-value">Raio escavação: {{ selectedWeaponInfo.excavationRadius }}</div>
      </div>

      <hr class="debug-divider" />

      <!-- v0.6.0 Effects Controls -->
      <div class="debug-section-title">Efeitos v0.6.0</div>

      <div class="debug-section">
        <label class="debug-label">Sorte do Jogador (0-100)</label>
        <input
          type="number" min="0" max="100"
          [(ngModel)]="playerLuck"
          (ngModelChange)="onPlayerLuckChange($event)"
          class="debug-input"
        />
      </div>

      <div class="debug-section">
        <label class="debug-label">Aplicar Efeito ao Jogador</label>
        <select [(ngModel)]="effectTargetPlayer" class="debug-select">
          <option *ngFor="let e of effectTypes" [value]="e">{{ e }}</option>
        </select>
        <button class="debug-btn-effect" (click)="onApplyEffect('player', effectTargetPlayer)">Aplicar</button>
      </div>

      <div class="debug-section">
        <label class="debug-label">Aplicar Efeito à IA</label>
        <select [(ngModel)]="effectTargetAi" class="debug-select">
          <option *ngFor="let e of effectTypes" [value]="e">{{ e }}</option>
        </select>
        <button class="debug-btn-effect" (click)="onApplyEffect('ai', effectTargetAi)">Aplicar</button>
      </div>

      <div class="debug-section">
        <div class="debug-label">Efeitos Ativos — Jogador</div>
        <div *ngFor="let ef of activeEffects.player" class="debug-value effect-tag">
          {{ ef.type }} ({{ ef.duration }}t)
        </div>
        <div *ngIf="activeEffects.player.length === 0" class="debug-value">Nenhum</div>
      </div>

      <div class="debug-section">
        <div class="debug-label">Efeitos Ativos — IA</div>
        <div *ngFor="let ef of activeEffects.ai" class="debug-value effect-tag">
          {{ ef.type }} ({{ ef.duration }}t)
        </div>
        <div *ngIf="activeEffects.ai.length === 0" class="debug-value">Nenhum</div>
      </div>
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

    .debug-section-title {
      color: #ffaa44;
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
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

    .debug-btn-terrain {
      background: #225588;
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

    .debug-btn-terrain:hover {
      background: #3377aa;
    }

    .weapon-info {
      background: rgba(255,255,255,0.05);
      border: 1px solid #444;
      border-radius: 3px;
      padding: 4px 6px;
      gap: 3px;
    }

    .debug-btn-effect {
      background: #226644;
      color: #ffffff;
      border: none;
      padding: 4px 8px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 11px;
      cursor: pointer;
      margin-top: 3px;
    }

    .debug-btn-effect:hover {
      background: #338855;
    }

    .effect-tag {
      background: rgba(255,255,255,0.05);
      border-left: 2px solid #cc44ff;
      padding: 1px 4px;
      margin: 1px 0;
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

  // v0.3.0 terrain controls
  selectedMap: 'plains' | 'castle' = 'plains';
  paintMaterial = '1';
  explosionRadius = 40;

  // v0.4.0 weapon controls
  private _weaponSystem = new WeaponSystem();
  weapons: WeaponDefinition[] = this._weaponSystem.getAll();
  playerWeaponId = 'cannon';
  aiWeaponId = 'cannon';

  get selectedWeaponInfo(): WeaponDefinition {
    return this._weaponSystem.getById(this.playerWeaponId) ?? this._weaponSystem.getDefault();
  }

  // v0.6.0 effects controls
  readonly effectTypes = [
    'BLEED', 'FREEZE', 'BLIND', 'WEAK_SHOT', 'ITEM_BLOCK', 'RANDOM_TELEPORT', 'VULNERABILITY',
  ] as const;
  effectTargetPlayer: string = 'BLEED';
  effectTargetAi: string = 'BLEED';
  playerLuck = 10;
  activeEffects: { player: Array<{ type: string; duration: number }>; ai: Array<{ type: string; duration: number }> } = {
    player: [],
    ai: [],
  };

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private effectsIntervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      if (this.game) {
        this.fps = Math.round(this.game.loop.actualFps);
        this.width = this.game.scale.width;
        this.height = this.game.scale.height;
      }
    }, 500);

    // Poll active effects every 500ms
    this.effectsIntervalId = setInterval(() => {
      const scene = this.getBattleScene();
      if (scene) {
        const effects = scene.getActiveEffects();
        this.activeEffects = effects as { player: Array<{ type: string; duration: number }>; ai: Array<{ type: string; duration: number }> };
      }
    }, 500);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.effectsIntervalId) clearInterval(this.effectsIntervalId);
  }

  private getBattleScene(): BattleScene | null {
    return ((window as unknown as Record<string, unknown>)['battleScene'] as BattleScene) ?? null;
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

  // v0.3.0 terrain handlers
  onMapChange(mapName: 'plains' | 'castle'): void {
    this.getBattleScene()?.switchMap(mapName);
  }

  onDebugExplode(): void {
    this.getBattleScene()?.debugExplode(this.explosionRadius);
  }

  onResetTerrain(): void {
    this.getBattleScene()?.resetTerrain();
  }

  // v0.4.0 weapon handlers
  onPlayerWeaponChange(id: string): void {
    this.getBattleScene()?.setPlayerWeapon(id);
  }

  onAiWeaponChange(id: string): void {
    this.getBattleScene()?.setAiWeapon(id);
  }

  // v0.6.0 effects handlers
  onApplyEffect(target: 'player' | 'ai', type: string): void {
    this.getBattleScene()?.applyDebugEffect(target, type);
  }

  onPlayerLuckChange(value: number): void {
    this.getBattleScene()?.setPlayerLuck(value);
  }
}
