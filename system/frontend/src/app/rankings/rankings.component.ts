import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';

interface RankingEntry {
  position: number;
  character_id: string;
  guild_id?: string;
  score: number;
  wins: number;
  losses: number;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'all';
type Category = 'solo' | 'duo' | 'guild';

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>Rankings</h2>

      <div style="margin-bottom: 0.5rem;">
        <div style="font-size: 0.8rem; color: #a0a0c0; margin-bottom: 0.25rem;">Período</div>
        <div class="tabs">
          <button class="tab" [class.active]="period === 'daily'" (click)="setPeriod('daily')">Diário</button>
          <button class="tab" [class.active]="period === 'weekly'" (click)="setPeriod('weekly')">Semanal</button>
          <button class="tab" [class.active]="period === 'monthly'" (click)="setPeriod('monthly')">Mensal</button>
          <button class="tab" [class.active]="period === 'all'" (click)="setPeriod('all')">Geral</button>
        </div>
      </div>

      <div>
        <div style="font-size: 0.8rem; color: #a0a0c0; margin-bottom: 0.25rem;">Categoria</div>
        <div class="tabs">
          <button class="tab" [class.active]="category === 'solo'" (click)="setCategory('solo')">Solo</button>
          <button class="tab" [class.active]="category === 'duo'" (click)="setCategory('duo')">Duplas</button>
          <button class="tab" [class.active]="category === 'guild'" (click)="setCategory('guild')">Guildas</button>
        </div>
      </div>

      <div *ngIf="loading" style="color: #a0a0c0; text-align: center; padding: 2rem;">Carregando rankings...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <table *ngIf="!loading && entries.length > 0">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>{{ category === 'guild' ? 'Guilda' : 'Personagem' }}</th>
            <th>Score</th>
            <th>Vitórias</th>
            <th>Derrotas</th>
            <th>W/L</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of entries" [style.background]="e.position <= 3 ? podiumColor(e.position) : ''">
            <td>
              <span *ngIf="e.position === 1" style="font-size: 1.1rem;">🥇</span>
              <span *ngIf="e.position === 2" style="font-size: 1.1rem;">🥈</span>
              <span *ngIf="e.position === 3" style="font-size: 1.1rem;">🥉</span>
              <span *ngIf="e.position > 3" style="color: #a0a0c0;">{{ e.position }}</span>
            </td>
            <td>
              <strong>{{ category === 'guild' ? (e.guild_id || e.character_id) : e.character_id }}</strong>
            </td>
            <td>
              <strong style="color: #c0a060;">{{ e.score | number }}</strong>
            </td>
            <td class="success">{{ e.wins }}</td>
            <td class="error">{{ e.losses }}</td>
            <td style="color: #a0a0c0; font-size: 0.8rem;">
              {{ e.wins + e.losses > 0 ? ((e.wins / (e.wins + e.losses)) * 100).toFixed(0) + '%' : '-' }}
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && entries.length === 0 && loaded" style="color: #a0a0c0; text-align: center; padding: 2rem;">
        Nenhum dado de ranking disponível.
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #1a1a2e; color: #e0e0e0; padding: 1rem; }
    .card { background: #16213e; border: 1px solid #0f3460; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
    h2 { color: #e94560; margin: 0 0 1rem; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .tab { background: #0f3460; border: 1px solid #1a4a7a; border-radius: 4px; color: #a0a0c0; padding: 0.4rem 0.8rem; cursor: pointer; font-size: 0.875rem; }
    .tab.active { border-color: #e94560; color: #e94560; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th { color: #a0a0c0; text-align: left; padding: 0.4rem 0.6rem; border-bottom: 1px solid #0f3460; }
    td { padding: 0.5rem 0.6rem; border-bottom: 1px solid #0a1a30; }
    .success { color: #40e060; }
    .error { color: #e94560; }
  `]
})
export class RankingsComponent implements OnInit {
  period: Period = 'weekly';
  category: Category = 'solo';
  entries: RankingEntry[] = [];
  loading = false;
  error = '';
  loaded = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadRankings();
  }

  setPeriod(p: Period) {
    this.period = p;
    this.loadRankings();
  }

  setCategory(c: Category) {
    this.category = c;
    this.loadRankings();
  }

  loadRankings() {
    this.loading = true;
    this.error = '';
    this.loaded = false;
    this.api.get<RankingEntry[]>(`/rankings?period=${this.period}&category=${this.category}`).subscribe({
      next: (data) => { this.entries = data; this.loading = false; this.loaded = true; },
      error: (err) => { this.error = err.error?.message || 'Erro ao carregar rankings'; this.loading = false; this.loaded = true; }
    });
  }

  podiumColor(position: number): string {
    if (position === 1) return 'rgba(255, 215, 0, 0.08)';
    if (position === 2) return 'rgba(192, 192, 192, 0.06)';
    if (position === 3) return 'rgba(205, 127, 50, 0.06)';
    return '';
  }
}
