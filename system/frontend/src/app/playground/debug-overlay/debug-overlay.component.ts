import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Phaser from 'phaser';
import { BATTLE_MAPS, BattleMode, BattleScene, MapName } from '../../../game/scenes/battle.scene';
import { WeaponSystem } from '../../shared/game-core/weapon-system';
import { WeaponDefinition } from '../../shared/game-core/weapon-definition';
import { ConsumableSystem } from '../../shared/game-core/consumable-system';
import { SecondaryItemSystem } from '../../shared/game-core/secondary-item-system';

interface Section {
  label: string;
  key: string;
  collapsed: boolean;
}

@Component({
  selector: 'app-debug-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="debug-overlay" #panel [style.left.px]="posX" [style.top.px]="posY" *ngIf="game">

      <!-- Header (drag handle) -->
      <div class="debug-header"
           (mousedown)="startDrag($event)"
           (touchstart)="startDragTouch($event)">
        <span>🛠 Debug</span>
        <span class="debug-header-hint">drag</span>
      </div>

      <!-- Performance -->
      <div class="section-header" (click)="toggle('perf')">
        <span>{{ collapsed('perf') ? '▶' : '▼' }} Performance</span>
      </div>
      <div *ngIf="!collapsed('perf')" class="section-body">
        <div>FPS: {{ fps }}</div>
        <div>Resolução: {{ width }}×{{ height }}</div>
      </div>

      <!-- Combate -->
      <div class="section-header" (click)="toggle('combat')">
        <span>{{ collapsed('combat') ? '▶' : '▼' }} Combate</span>
      </div>
      <div *ngIf="!collapsed('combat')" class="section-body">
        <label class="debug-label">Vento (-100 a 100)</label>
        <input type="range" min="-100" max="100" step="1"
          [(ngModel)]="windValue" (ngModelChange)="onWindChange($event)" class="debug-range" />
        <span class="debug-value">{{ windValue }}</span>

        <label class="debug-label">HP Jogador</label>
        <input type="number" min="0" max="100" [(ngModel)]="playerHp"
          (ngModelChange)="onPlayerHpChange($event)" class="debug-input" />

        <label class="debug-label">HP Inimigo</label>
        <input type="number" min="0" max="100" [(ngModel)]="aiHp"
          (ngModelChange)="onAiHpChange($event)" class="debug-input" />

        <label class="debug-label">Dano Base</label>
        <input type="number" min="1" max="200" [(ngModel)]="baseDamage"
          (ngModelChange)="onBaseDamageChange($event)" class="debug-input" />

        <label class="debug-label">Dificuldade</label>
        <select [(ngModel)]="difficulty" (ngModelChange)="onDifficultyChange($event)" class="debug-select">
          <option value="easy">Fácil</option>
          <option value="medium">Médio</option>
          <option value="hard">Difícil</option>
        </select>

        <label class="debug-label">Agilidade Jogador (0-500)</label>
        <input type="range" min="0" max="500" step="10"
          [(ngModel)]="playerAgility" (ngModelChange)="onPlayerAgilityChange($event)" class="debug-range" />
        <span class="debug-value">{{ playerAgility }}</span>

        <button class="debug-btn danger" (click)="onReset()">Resetar Partida</button>
      </div>

      <!-- Terreno -->
      <div class="section-header" (click)="toggle('terrain')">
        <span>{{ collapsed('terrain') ? '▶' : '▼' }} Terreno</span>
      </div>
      <div *ngIf="!collapsed('terrain')" class="section-body">
        <label class="debug-label">Modo</label>
        <select [(ngModel)]="battleMode" (ngModelChange)="onBattleModeChange($event)" class="debug-select">
          <option value="pvp">PvP final</option>
          <option value="dungeon">Dungeon</option>
        </select>

        <label class="debug-label">Mapa</label>
        <select [(ngModel)]="selectedMap" (ngModelChange)="onMapChange($event)" class="debug-select">
          <option *ngFor="let map of filteredMaps" [value]="map.id">{{ map.label }}</option>
        </select>

        <label class="debug-label">Material (pintar)</label>
        <select [(ngModel)]="paintMaterial" class="debug-select">
          <option value="0">Vazio</option>
          <option value="1">Destrutível</option>
          <option value="2">Indestrutível</option>
          <option value="3">Construído Rúnico</option>
        </select>

        <label class="debug-label">Raio Explosão: {{ explosionRadius }}</label>
        <input type="range" min="10" max="80" step="5"
          [(ngModel)]="explosionRadius" class="debug-range" />

        <button class="debug-btn" (click)="onDebugExplode()">Explodir no Centro</button>
        <button class="debug-btn" (click)="onResetTerrain()">Resetar Mapa</button>
      </div>

      <!-- Itens -->
      <div class="section-header" (click)="toggle('items')">
        <span>{{ collapsed('items') ? '▶' : '▼' }} Itens</span>
      </div>
      <div *ngIf="!collapsed('items')" class="section-body">
        <label class="debug-label">Consumível</label>
        <select [(ngModel)]="selectedConsumableId" class="debug-select">
          <option *ngFor="let item of consumables" [value]="item.id">{{ item.name }}</option>
        </select>
        <div class="row-gap">
          <button class="debug-btn-sm" (click)="onUseConsumable('player')">Jogador</button>
          <button class="debug-btn-sm" (click)="onUseConsumable('ai')">IA</button>
        </div>

        <label class="debug-label">Item secundário</label>
        <select [(ngModel)]="selectedSecondaryItemId" class="debug-select">
          <option *ngFor="let item of secondaryItems" [value]="item.id">{{ item.name }}</option>
        </select>
        <div class="row-gap">
          <button class="debug-btn-sm" (click)="onUseSecondaryItem('player')">Jogador</button>
          <button class="debug-btn-sm" (click)="onUseSecondaryItem('ai')">IA</button>
        </div>
      </div>

      <!-- Armas -->
      <div class="section-header" (click)="toggle('weapons')">
        <span>{{ collapsed('weapons') ? '▶' : '▼' }} Armas</span>
      </div>
      <div *ngIf="!collapsed('weapons')" class="section-body">
        <label class="debug-label">Arma do Jogador</label>
        <select [(ngModel)]="playerWeaponId" (ngModelChange)="onPlayerWeaponChange($event)" class="debug-select">
          <option *ngFor="let w of weapons" [value]="w.id">{{ w.name }}</option>
        </select>

        <label class="debug-label">Arma da IA</label>
        <select [(ngModel)]="aiWeaponId" (ngModelChange)="onAiWeaponChange($event)" class="debug-select">
          <option *ngFor="let w of weapons" [value]="w.id">{{ w.name }}</option>
        </select>

        <div class="weapon-info">
          <div class="debug-label">{{ selectedWeaponInfo.name }}</div>
          <div class="debug-value">Dano: {{ selectedWeaponInfo.baseDamage }}</div>
          <div class="debug-value">Impacto: {{ selectedWeaponInfo.impactRadius }}px</div>
          <div class="debug-value">Escavação: {{ selectedWeaponInfo.excavationRadius }}px</div>
        </div>
      </div>

      <!-- Efeitos -->
      <div class="section-header" (click)="toggle('effects')">
        <span>{{ collapsed('effects') ? '▶' : '▼' }} Efeitos Rúnicos</span>
      </div>
      <div *ngIf="!collapsed('effects')" class="section-body">
        <label class="debug-label">Sorte do Jogador (0-100)</label>
        <input type="number" min="0" max="100" [(ngModel)]="playerLuck"
          (ngModelChange)="onPlayerLuckChange($event)" class="debug-input" />

        <label class="debug-label">Efeito → Jogador</label>
        <div class="row-gap">
          <select [(ngModel)]="effectTargetPlayer" class="debug-select">
            <option *ngFor="let e of effectTypes" [value]="e">{{ e }}</option>
          </select>
          <button class="debug-btn-sm" (click)="onApplyEffect('player', effectTargetPlayer)">+</button>
        </div>

        <label class="debug-label">Efeito → IA</label>
        <div class="row-gap">
          <select [(ngModel)]="effectTargetAi" class="debug-select">
            <option *ngFor="let e of effectTypes" [value]="e">{{ e }}</option>
          </select>
          <button class="debug-btn-sm" (click)="onApplyEffect('ai', effectTargetAi)">+</button>
        </div>

        <label class="debug-label">Ativos — Jogador</label>
        <div *ngFor="let ef of activeEffects.player" class="effect-tag">{{ ef.type }} {{ ef.duration }}t</div>
        <div *ngIf="activeEffects.player.length === 0" class="debug-value dim">—</div>

        <label class="debug-label">Ativos — IA</label>
        <div *ngFor="let ef of activeEffects.ai" class="effect-tag">{{ ef.type }} {{ ef.duration }}t</div>
        <div *ngIf="activeEffects.ai.length === 0" class="debug-value dim">—</div>
      </div>

    </div>
  `,
  styles: [`
    .debug-overlay {
      position: fixed;
      background: rgba(10,10,20,0.92);
      color: #00ff88;
      font-family: monospace;
      font-size: 12px;
      border-radius: 6px;
      z-index: 1000;
      min-width: 190px;
      max-width: 220px;
      border: 1px solid #335544;
      user-select: none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.6);
    }

    .debug-header {
      background: rgba(0,255,136,0.12);
      padding: 6px 10px;
      border-radius: 6px 6px 0 0;
      cursor: grab;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #335544;
      touch-action: none;
    }
    .debug-header:active { cursor: grabbing; }
    .debug-header-hint { font-size: 10px; color: #557766; }

    .section-header {
      padding: 5px 10px;
      cursor: pointer;
      background: rgba(255,255,255,0.04);
      border-bottom: 1px solid #223333;
      font-size: 11px;
      color: #ffaa44;
      font-weight: bold;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-header:hover { background: rgba(255,170,68,0.1); }

    .section-body {
      padding: 6px 10px 8px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      border-bottom: 1px solid #1a2a22;
    }

    .debug-label { color: #aaffcc; font-size: 11px; margin-top: 4px; }
    .debug-value { color: #ffdd44; font-size: 11px; }
    .debug-value.dim { color: #556655; }

    .debug-range { width: 100%; cursor: pointer; }

    .debug-input {
      background: #111;
      border: 1px solid #446655;
      color: #00ff88;
      padding: 2px 6px;
      width: 80px;
      font-family: monospace;
      font-size: 12px;
      border-radius: 2px;
    }

    .debug-select {
      background: #111;
      border: 1px solid #446655;
      color: #00ff88;
      padding: 2px 4px;
      font-family: monospace;
      font-size: 11px;
      border-radius: 2px;
      cursor: pointer;
      width: 100%;
    }

    .debug-btn {
      background: #225588;
      color: #fff;
      border: none;
      padding: 4px 8px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 11px;
      cursor: pointer;
      margin-top: 3px;
    }
    .debug-btn:hover { background: #3377aa; }
    .debug-btn.danger { background: #882200; }
    .debug-btn.danger:hover { background: #aa3300; }

    .row-gap { display: flex; gap: 4px; align-items: center; }

    .debug-btn-sm {
      background: #226644;
      color: #fff;
      border: none;
      padding: 3px 10px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 13px;
      cursor: pointer;
      flex-shrink: 0;
    }
    .debug-btn-sm:hover { background: #338855; }

    .weapon-info {
      background: rgba(255,255,255,0.04);
      border: 1px solid #334;
      border-radius: 3px;
      padding: 4px 6px;
      margin-top: 4px;
    }

    .effect-tag {
      background: rgba(204,68,255,0.12);
      border-left: 2px solid #cc44ff;
      padding: 1px 5px;
      font-size: 11px;
      color: #ffaaff;
      margin: 1px 0;
    }
  `]
})
export class DebugOverlayComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() game: Phaser.Game | null = null;
  @ViewChild('panel') panelRef!: ElementRef<HTMLDivElement>;

  fps = 0;
  width = window.innerWidth;
  height = window.innerHeight;

  posX = 8;
  posY = 8;

  private _sections: Record<string, boolean> = {
    perf: false,
    combat: false,
    terrain: true,
    items: true,
    weapons: true,
    effects: true,
  };

  // v0.2.0
  windValue = 0;
  playerHp = 100;
  aiHp = 100;
  baseDamage = 40;
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  playerAgility = 50;

  // v0.3.0
  battleMode: BattleMode = 'pvp';
  selectedMap: MapName = 'plains';
  readonly maps = BATTLE_MAPS;
  paintMaterial = '1';
  explosionRadius = 40;

  get filteredMaps() {
    return this.maps.filter(map => map.mode === this.battleMode);
  }

  // v0.4.0
  private _weaponSystem = new WeaponSystem();
  private _consumableSystem = new ConsumableSystem();
  private _secondaryItemSystem = new SecondaryItemSystem();
  weapons: WeaponDefinition[] = this._weaponSystem.getAll();
  playerWeaponId = 'cannon';
  aiWeaponId = 'cannon';
  consumables = this._consumableSystem.getAll();
  secondaryItems = this._secondaryItemSystem.getAll();
  selectedConsumableId = this.consumables[0]?.id ?? 'heal';
  selectedSecondaryItemId = this.secondaryItems[0]?.id ?? 'shield';

  get selectedWeaponInfo(): WeaponDefinition {
    return this._weaponSystem.getById(this.playerWeaponId) ?? this._weaponSystem.getDefault();
  }

  // v0.6.0
  readonly effectTypes = ['BLEED','FREEZE','BLIND','WEAK_SHOT','ITEM_BLOCK','RANDOM_TELEPORT','VULNERABILITY'] as const;
  effectTargetPlayer: string = 'BLEED';
  effectTargetAi: string = 'BLEED';
  playerLuck = 10;
  activeEffects: { player: Array<{ type: string; duration: number }>; ai: Array<{ type: string; duration: number }> } = { player: [], ai: [] };

  // drag state
  private _dragging = false;
  private _dragOffX = 0;
  private _dragOffY = 0;
  private _onMouseMove = (e: MouseEvent) => this._onDragMove(e);
  private _onMouseUp = () => this._stopDrag();
  private _onTouchMove = (e: TouchEvent) => this._onDragMoveTouch(e);
  private _onTouchEnd = () => this._stopDrag();

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
    this.effectsIntervalId = setInterval(() => {
      const scene = this._scene();
      if (scene) {
        const effects = scene.getActiveEffects();
        this.activeEffects = effects as typeof this.activeEffects;
      }
    }, 500);

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('touchmove', this._onTouchMove, { passive: false });
    document.addEventListener('touchend', this._onTouchEnd);
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.effectsIntervalId) clearInterval(this.effectsIntervalId);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('touchend', this._onTouchEnd);
  }

  collapsed(key: string): boolean { return this._sections[key] ?? false; }
  toggle(key: string): void { this._sections[key] = !this._sections[key]; }

  startDrag(e: MouseEvent): void {
    this._dragging = true;
    this._dragOffX = e.clientX - this.posX;
    this._dragOffY = e.clientY - this.posY;
    e.preventDefault();
  }

  startDragTouch(e: TouchEvent): void {
    const t = e.touches[0];
    this._dragging = true;
    this._dragOffX = t.clientX - this.posX;
    this._dragOffY = t.clientY - this.posY;
  }

  private _onDragMove(e: MouseEvent): void {
    if (!this._dragging) return;
    this.posX = e.clientX - this._dragOffX;
    this.posY = e.clientY - this._dragOffY;
  }

  private _onDragMoveTouch(e: TouchEvent): void {
    if (!this._dragging) return;
    const t = e.touches[0];
    this.posX = t.clientX - this._dragOffX;
    this.posY = t.clientY - this._dragOffY;
    e.preventDefault();
  }

  private _stopDrag(): void { this._dragging = false; }

  private _scene(): BattleScene | null {
    return ((window as unknown as Record<string, unknown>)['battleScene'] as BattleScene) ?? null;
  }

  onWindChange(v: number): void { this._scene()?.setWindOverride(v); }
  onPlayerHpChange(v: number): void { this._scene()?.setPlayerHp(v); }
  onAiHpChange(v: number): void { this._scene()?.setAiHp(v); }
  onBaseDamageChange(v: number): void { this._scene()?.setBaseDamage(v); }
  onDifficultyChange(v: 'easy'|'medium'|'hard'): void { this._scene()?.setDifficulty(v); }
  onReset(): void {
    this._scene()?.resetBattle();
    this.windValue = 0; this.playerHp = 100; this.aiHp = 100; this.baseDamage = 40; this.difficulty = 'medium'; this.playerAgility = 50;
  }
  onPlayerAgilityChange(v: number): void { this._scene()?.setPlayerAgility(v); }
  onBattleModeChange(mode: BattleMode): void {
    this.battleMode = mode;
    this.selectedMap = mode === 'dungeon' ? 'dungeon_cave_entrance' : 'plains';
    this._scene()?.setBattleMode(mode);
  }
  onMapChange(m: MapName): void { this._scene()?.switchMap(m); }
  onDebugExplode(): void { this._scene()?.debugExplode(this.explosionRadius); }
  onResetTerrain(): void { this._scene()?.resetTerrain(); }
  onPlayerWeaponChange(id: string): void { this._scene()?.setPlayerWeapon(id); }
  onAiWeaponChange(id: string): void { this._scene()?.setAiWeapon(id); }
  onUseConsumable(target: 'player'|'ai'): void { this._scene()?.useDebugConsumable(target, this.selectedConsumableId); }
  onUseSecondaryItem(target: 'player'|'ai'): void { this._scene()?.useDebugSecondaryItem(target, this.selectedSecondaryItemId); }
  onApplyEffect(target: 'player'|'ai', type: string): void { this._scene()?.applyDebugEffect(target, type); }
  onPlayerLuckChange(v: number): void { this._scene()?.setPlayerLuck(v); }
}
