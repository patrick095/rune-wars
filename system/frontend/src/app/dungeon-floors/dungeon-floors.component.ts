import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';

interface DungeonFloor {
  id: number;
  name: string;
  phases: number;
  boss: string;
  tracks: { name: string; rarity: string }[];
}

interface Lobby {
  id: string;
  floor: number;
  track: string;
  members: string[];
  status: string;
  current_phase: number;
}

@Component({
  selector: 'app-dungeon-floors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>Dungeon — Andares</h2>

      <div *ngIf="floorsLoading" style="color: #a0a0c0;">Carregando andares...</div>
      <div *ngIf="floorsError" class="error">{{ floorsError }}</div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
        <div *ngFor="let floor of floors"
             class="card floor-card"
             [class.selected]="createForm.floor === floor.id"
             (click)="selectFloor(floor)">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <strong style="color: #c0a060;">{{ floor.name }}</strong>
            <span class="tag tag-common">Andar {{ floor.id }}</span>
          </div>
          <div style="font-size: 0.8rem; color: #a0a0c0; margin-bottom: 0.25rem;">
            {{ floor.phases }} fases &nbsp;|&nbsp; Chefe: <strong style="color: #e94560;">{{ floor.boss }}</strong>
          </div>
          <div style="font-size: 0.75rem; margin-top: 0.5rem;">
            <span *ngFor="let t of floor.tracks" [class]="'tag tag-' + (t.rarity || 'common').toLowerCase()" style="margin-bottom: 0.15rem;">
              {{ t.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Criar Lobby -->
    <div class="card">
      <h3>Criar Lobby</h3>
      <div class="row">
        <div>
          <label>Character ID</label><br>
          <input class="input" [(ngModel)]="createForm.characterId" placeholder="Seu character ID">
        </div>
        <div>
          <label>Andar</label><br>
          <select class="input" [(ngModel)]="createForm.floor">
            <option [value]="0">Selecionar...</option>
            <option *ngFor="let f of floors" [value]="f.id">{{ f.id }} - {{ f.name }}</option>
          </select>
        </div>
        <div>
          <label>Trilha</label><br>
          <select class="input" [(ngModel)]="createForm.track">
            <option value="">Selecionar...</option>
            <option *ngFor="let t of selectedFloorTracks" [value]="t.name">{{ t.name }} ({{ t.rarity }})</option>
          </select>
        </div>
        <div style="align-self: flex-end;">
          <button class="btn" (click)="createLobby()" [disabled]="creatingLobby">
            {{ creatingLobby ? 'Criando...' : 'Criar Lobby' }}
          </button>
        </div>
      </div>
      <div *ngIf="createError" class="error">{{ createError }}</div>
    </div>

    <!-- Lobby Ativo -->
    <div class="card" *ngIf="activeLobby">
      <h3>Lobby Ativo</h3>
      <div class="row" style="gap: 1.5rem; margin-bottom: 0.75rem;">
        <div>
          <div class="stat-label">ID</div>
          <div style="font-family: monospace; font-size: 0.8rem; color: #a0a0c0;">{{ activeLobby.id }}</div>
        </div>
        <div>
          <div class="stat-label">Andar</div>
          <div class="stat-value">{{ activeLobby.floor }}</div>
        </div>
        <div>
          <div class="stat-label">Trilha</div>
          <div class="stat-value" style="color: #c0a060;">{{ activeLobby.track }}</div>
        </div>
        <div>
          <div class="stat-label">Status</div>
          <div [style.color]="activeLobby.status === 'active' ? '#40e060' : '#c0a060'" style="font-weight: bold;">
            {{ activeLobby.status }}
          </div>
        </div>
        <div>
          <div class="stat-label">Fase Atual</div>
          <div class="stat-value">{{ activeLobby.current_phase }}</div>
        </div>
      </div>

      <div style="margin-bottom: 0.75rem;">
        <div class="stat-label" style="margin-bottom: 0.25rem;">Membros</div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
          <span *ngFor="let m of activeLobby.members" class="tag tag-common" style="font-size: 0.8rem;">{{ m }}</span>
          <span *ngIf="!activeLobby.members || activeLobby.members.length === 0" style="color: #a0a0c0; font-size: 0.8rem;">Nenhum membro ainda</span>
        </div>
      </div>

      <div class="row">
        <button class="btn" (click)="startLobby()" [disabled]="startingLobby"
                *ngIf="activeLobby.status !== 'active'">
          {{ startingLobby ? 'Iniciando...' : 'Iniciar Dungeon' }}
        </button>
        <button class="btn" style="background: #0f3460; border: 1px solid #c0a060; color: #c0a060;"
                (click)="completePhase()" [disabled]="completingPhase"
                *ngIf="activeLobby.status === 'active'">
          {{ completingPhase ? 'Completando...' : 'Completar Fase ' + activeLobby.current_phase }}
        </button>
        <button class="btn-sm" (click)="activeLobby = null">Fechar</button>
      </div>

      <div *ngIf="lobbyActionMessage" [class]="lobbyActionSuccess ? 'success' : 'error'" style="margin-top: 0.5rem; font-size: 0.85rem;">
        {{ lobbyActionMessage }}
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #1a1a2e; color: #e0e0e0; padding: 1rem; }
    .card { background: #16213e; border: 1px solid #0f3460; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
    .floor-card { cursor: pointer; transition: border-color 0.15s; }
    .floor-card:hover { border-color: #c0a060; }
    .floor-card.selected { border-color: #e94560; }
    h2 { color: #e94560; margin: 0 0 1rem; }
    h3 { color: #c0a060; margin: 0 0 0.75rem; }
    .input { background: #0f3460; border: 1px solid #1a4a7a; border-radius: 4px; color: #e0e0e0; padding: 0.4rem 0.6rem; font-size: 0.9rem; }
    .btn { background: #e94560; border: none; border-radius: 4px; color: white; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.9rem; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-sm { background: #0f3460; border: 1px solid #e94560; border-radius: 4px; color: #e94560; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
    .tag { display: inline-block; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.75rem; margin-right: 0.25rem; margin-bottom: 0.15rem; }
    .tag-common { background: #334; color: #aaa; }
    .tag-uncommon { background: #133; color: #6ef; }
    .tag-rare { background: #113; color: #66f; }
    .tag-epic { background: #313; color: #f6f; }
    .tag-legendary { background: #430; color: #fa0; }
    .success { color: #40e060; }
    .error { color: #e94560; }
    .row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.5rem; }
    label { font-size: 0.8rem; color: #a0a0c0; }
    .stat-label { font-size: 0.75rem; color: #a0a0c0; }
    .stat-value { font-size: 1rem; font-weight: bold; color: #e0e0e0; }
  `]
})
export class DungeonFloorsComponent implements OnInit {
  floors: DungeonFloor[] = [];
  floorsLoading = false;
  floorsError = '';

  createForm = { characterId: '', floor: 0, track: '' };
  creatingLobby = false;
  createError = '';

  activeLobby: Lobby | null = null;
  startingLobby = false;
  completingPhase = false;
  lobbyActionMessage = '';
  lobbyActionSuccess = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadFloors();
  }

  loadFloors() {
    this.floorsLoading = true;
    this.floorsError = '';
    this.api.get<DungeonFloor[]>('/dungeon-floors').subscribe({
      next: (data) => { this.floors = data; this.floorsLoading = false; },
      error: (err) => { this.floorsError = err.error?.message || 'Erro ao carregar andares'; this.floorsLoading = false; }
    });
  }

  get selectedFloorTracks(): { name: string; rarity: string }[] {
    if (!this.createForm.floor) return [];
    const floor = this.floors.find(f => f.id === this.createForm.floor);
    return floor?.tracks || [];
  }

  selectFloor(floor: DungeonFloor) {
    this.createForm.floor = floor.id;
    this.createForm.track = '';
  }

  createLobby() {
    if (!this.createForm.characterId || !this.createForm.floor) return;
    this.creatingLobby = true;
    this.createError = '';
    this.api.post<Lobby>('/dungeon-floors/lobbies', {
      characterId: this.createForm.characterId,
      floor: this.createForm.floor,
      track: this.createForm.track
    }).subscribe({
      next: (data) => {
        this.activeLobby = data;
        this.creatingLobby = false;
        this.lobbyActionMessage = '';
      },
      error: (err) => {
        this.createError = err.error?.message || 'Erro ao criar lobby';
        this.creatingLobby = false;
      }
    });
  }

  startLobby() {
    if (!this.activeLobby) return;
    this.startingLobby = true;
    this.lobbyActionMessage = '';
    this.api.post<Lobby>(`/dungeon-floors/lobbies/${this.activeLobby.id}/start`, {}).subscribe({
      next: (data) => {
        this.activeLobby = data;
        this.startingLobby = false;
        this.lobbyActionSuccess = true;
        this.lobbyActionMessage = 'Dungeon iniciada!';
      },
      error: (err) => {
        this.lobbyActionSuccess = false;
        this.lobbyActionMessage = err.error?.message || 'Erro ao iniciar';
        this.startingLobby = false;
      }
    });
  }

  completePhase() {
    if (!this.activeLobby) return;
    this.completingPhase = true;
    this.lobbyActionMessage = '';
    this.api.post<Lobby>(`/dungeon-floors/lobbies/${this.activeLobby.id}/phase-complete`, {}).subscribe({
      next: (data) => {
        this.activeLobby = data;
        this.completingPhase = false;
        this.lobbyActionSuccess = true;
        this.lobbyActionMessage = `Fase completada! Fase atual: ${data.current_phase}`;
      },
      error: (err) => {
        this.lobbyActionSuccess = false;
        this.lobbyActionMessage = err.error?.message || 'Erro ao completar fase';
        this.completingPhase = false;
      }
    });
  }
}
