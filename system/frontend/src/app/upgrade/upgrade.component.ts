import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';

interface UpgradeChance {
  chance: number;
  level: number;
  luck: number;
}

interface UpgradeResult {
  success: boolean;
  previousLevel: number;
  newLevel: number;
  message?: string;
}

interface UpgradeHistory {
  id: string;
  item_instance_id: string;
  previous_level: number;
  new_level: number;
  success: boolean;
  created_at: string;
}

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>Upgrade de Itens</h2>

      <div class="row">
        <div>
          <label>Character ID</label><br>
          <input class="input" [(ngModel)]="characterId" placeholder="ID do personagem" (ngModelChange)="resetResult()">
        </div>
        <div>
          <label>Item Instance ID</label><br>
          <input class="input" [(ngModel)]="itemInstanceId" placeholder="ID da instância do item" (ngModelChange)="resetResult()">
        </div>
        <div>
          <label>Nível Atual</label><br>
          <input class="input" type="number" [(ngModel)]="currentLevel" placeholder="0" min="0" (ngModelChange)="onParamChange()">
        </div>
        <div>
          <label>Sorte (luck)</label><br>
          <input class="input" type="number" [(ngModel)]="luck" placeholder="0" min="0" (ngModelChange)="onParamChange()">
        </div>
      </div>

      <div *ngIf="chanceInfo" class="card" style="margin-top: 0.5rem; padding: 0.75rem;">
        <span style="color: #a0a0c0; font-size: 0.85rem;">Chance de sucesso: </span>
        <strong [style.color]="chanceColor">{{ (chanceInfo.chance * 100).toFixed(1) }}%</strong>
      </div>

      <div style="margin-top: 1rem;">
        <button class="btn" (click)="doUpgrade()" [disabled]="upgrading || !characterId || !itemInstanceId">
          {{ upgrading ? 'Fazendo Upgrade...' : 'Fazer Upgrade' }}
        </button>
        <button class="btn" style="margin-left: 0.5rem; background: #0f3460; border: 1px solid #1a4a7a;"
                (click)="loadHistory()" [disabled]="!characterId">
          Ver Histórico
        </button>
      </div>

      <div *ngIf="upgradeResult" class="card" style="margin-top: 1rem;">
        <h3>Resultado</h3>
        <div [class]="upgradeResult.success ? 'success' : 'error'" style="font-size: 1.1rem; margin-bottom: 0.5rem;">
          {{ upgradeResult.success ? 'Sucesso!' : 'Falhou!' }}
        </div>
        <div style="color: #a0a0c0;">
          Nível:
          <strong style="color: #e0e0e0;">{{ upgradeResult.previousLevel }}</strong>
          <span style="margin: 0 0.5rem; color: #c0a060;">→</span>
          <strong [style.color]="upgradeResult.success ? '#40e060' : '#e94560'">{{ upgradeResult.newLevel }}</strong>
        </div>
        <div *ngIf="upgradeResult.message" style="color: #a0a0c0; font-size: 0.85rem; margin-top: 0.25rem;">
          {{ upgradeResult.message }}
        </div>
      </div>
    </div>

    <div class="card" *ngIf="history.length > 0">
      <h3>Histórico de Upgrades</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Nível Anterior</th>
            <th>Nível Novo</th>
            <th>Resultado</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let h of history">
            <td style="font-family: monospace; font-size: 0.75rem; color: #a0a0c0;">{{ h.item_instance_id }}</td>
            <td>{{ h.previous_level }}</td>
            <td>{{ h.new_level }}</td>
            <td [class]="h.success ? 'success' : 'error'">{{ h.success ? 'Sucesso' : 'Falhou' }}</td>
            <td style="font-size: 0.75rem; color: #a0a0c0;">{{ h.created_at | date:'dd/MM/yy HH:mm' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div *ngIf="historyLoading" class="card">
      <span style="color: #a0a0c0;">Carregando histórico...</span>
    </div>
    <div *ngIf="historyError" class="card">
      <span class="error">{{ historyError }}</span>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #1a1a2e; color: #e0e0e0; padding: 1rem; }
    .card { background: #16213e; border: 1px solid #0f3460; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
    h2 { color: #e94560; margin: 0 0 1rem; }
    h3 { color: #c0a060; margin: 0 0 0.5rem; }
    .input { background: #0f3460; border: 1px solid #1a4a7a; border-radius: 4px; color: #e0e0e0; padding: 0.4rem 0.6rem; font-size: 0.9rem; }
    .btn { background: #e94560; border: none; border-radius: 4px; color: white; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.9rem; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .success { color: #40e060; }
    .error { color: #e94560; }
    .row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.5rem; }
    label { font-size: 0.8rem; color: #a0a0c0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th { color: #a0a0c0; text-align: left; padding: 0.4rem; border-bottom: 1px solid #0f3460; }
    td { padding: 0.4rem; border-bottom: 1px solid #0a1a30; }
  `]
})
export class UpgradeComponent implements OnInit {
  characterId = '';
  itemInstanceId = '';
  currentLevel = 0;
  luck = 0;

  chanceInfo: UpgradeChance | null = null;
  upgrading = false;
  upgradeResult: UpgradeResult | null = null;

  history: UpgradeHistory[] = [];
  historyLoading = false;
  historyError = '';

  private chanceTimer: any;

  constructor(private api: ApiService) {}

  ngOnInit() {}

  get chanceColor(): string {
    if (!this.chanceInfo) return '#e0e0e0';
    const c = this.chanceInfo.chance;
    if (c >= 0.7) return '#40e060';
    if (c >= 0.4) return '#c0a060';
    return '#e94560';
  }

  onParamChange() {
    clearTimeout(this.chanceTimer);
    this.chanceTimer = setTimeout(() => this.loadChance(), 400);
  }

  loadChance() {
    if (this.currentLevel < 0) return;
    this.api.get<UpgradeChance>(`/upgrade/chance?level=${this.currentLevel}&luck=${this.luck}`).subscribe({
      next: (data) => { this.chanceInfo = data; },
      error: () => { this.chanceInfo = null; }
    });
  }

  resetResult() {
    this.upgradeResult = null;
  }

  doUpgrade() {
    if (!this.characterId || !this.itemInstanceId) return;
    this.upgrading = true;
    this.upgradeResult = null;
    this.api.post<UpgradeResult>('/upgrade/attempt', {
      characterId: this.characterId,
      itemInstanceId: this.itemInstanceId,
      currentLevel: this.currentLevel,
      luck: this.luck
    }).subscribe({
      next: (data) => {
        this.upgradeResult = data;
        this.upgrading = false;
        if (data.success) this.currentLevel = data.newLevel;
        this.loadChance();
      },
      error: (err) => {
        this.upgradeResult = {
          success: false,
          previousLevel: this.currentLevel,
          newLevel: this.currentLevel,
          message: err.error?.message || err.message || 'Erro ao fazer upgrade'
        };
        this.upgrading = false;
      }
    });
  }

  loadHistory() {
    if (!this.characterId) return;
    this.historyLoading = true;
    this.historyError = '';
    this.api.get<UpgradeHistory[]>(`/upgrade/history?characterId=${this.characterId}`).subscribe({
      next: (data) => { this.history = data; this.historyLoading = false; },
      error: (err) => { this.historyError = err.error?.message || 'Erro ao carregar histórico'; this.historyLoading = false; }
    });
  }
}
