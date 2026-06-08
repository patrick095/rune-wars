import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';

interface Guild {
  id: string;
  name: string;
  description: string;
  level: number;
  xp: number;
  gold_bank: number;
  leader_id: string;
}

interface GuildMember {
  character_id: string;
  role: string;
  joined_at: string;
}

interface ChatMessage {
  id: string;
  character_id: string;
  message: string;
  created_at: string;
}

@Component({
  selector: 'app-guild',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>Guilda</h2>

      <!-- Sem guilda -->
      <div *ngIf="!guild">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <!-- Criar guilda -->
          <div class="card" style="flex: 1; min-width: 260px;">
            <h3>Criar Guilda</h3>
            <div style="margin-bottom: 0.5rem;">
              <label>Leader ID (Character)</label><br>
              <input class="input" [(ngModel)]="createForm.leaderId" placeholder="Seu character ID" style="width: 100%; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 0.5rem;">
              <label>Nome da Guilda</label><br>
              <input class="input" [(ngModel)]="createForm.name" placeholder="Nome" style="width: 100%; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 0.75rem;">
              <label>Descrição</label><br>
              <textarea class="input" [(ngModel)]="createForm.description" placeholder="Descrição opcional" rows="2"
                style="width: 100%; box-sizing: border-box; resize: vertical;"></textarea>
            </div>
            <button class="btn" (click)="createGuild()" [disabled]="creating">
              {{ creating ? 'Criando...' : 'Criar Guilda' }}
            </button>
            <div *ngIf="createError" class="error" style="margin-top: 0.5rem;">{{ createError }}</div>
          </div>

          <!-- Entrar em guilda -->
          <div class="card" style="flex: 1; min-width: 260px;">
            <h3>Entrar em Guilda</h3>
            <div style="margin-bottom: 0.5rem;">
              <label>Character ID</label><br>
              <input class="input" [(ngModel)]="joinForm.characterId" placeholder="Seu character ID" style="width: 100%; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 0.75rem;">
              <label>Guild ID</label><br>
              <input class="input" [(ngModel)]="joinForm.guildId" placeholder="ID da guilda" style="width: 100%; box-sizing: border-box;">
            </div>
            <button class="btn" (click)="joinGuild()" [disabled]="joining">
              {{ joining ? 'Entrando...' : 'Entrar na Guilda' }}
            </button>
            <div *ngIf="joinError" class="error" style="margin-top: 0.5rem;">{{ joinError }}</div>
          </div>
        </div>

        <!-- Buscar guilda por ID para ver -->
        <div class="card" style="margin-top: 0;">
          <label>Carregar Guilda por ID</label>
          <div class="row">
            <input class="input" [(ngModel)]="lookupGuildId" placeholder="Guild ID">
            <button class="btn" (click)="loadGuild(lookupGuildId)">Carregar</button>
          </div>
          <div *ngIf="loadError" class="error">{{ loadError }}</div>
        </div>
      </div>

      <!-- Em guilda -->
      <div *ngIf="guild">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
          <div>
            <div style="font-size: 1.4rem; font-weight: bold; color: #c0a060;">{{ guild.name }}</div>
            <div style="color: #a0a0c0; font-size: 0.85rem;">{{ guild.description }}</div>
          </div>
          <button class="btn-sm" (click)="leaveGuild()" [disabled]="leaving">
            {{ leaving ? 'Saindo...' : 'Sair da Guilda' }}
          </button>
        </div>

        <div class="row" style="gap: 1rem; margin-bottom: 1rem;">
          <div class="stat-box">
            <div class="stat-label">Nível</div>
            <div class="stat-value">{{ guild.level }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">XP</div>
            <div class="stat-value">{{ guild.xp | number }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Gold no Banco</div>
            <div class="stat-value" style="color: #c0a060;">{{ guild.gold_bank | number }} G</div>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <!-- Membros -->
          <div class="card" style="flex: 1; min-width: 240px; margin-bottom: 0;">
            <h3>Membros</h3>
            <div *ngIf="membersLoading" style="color: #a0a0c0;">Carregando...</div>
            <div *ngFor="let m of members" style="padding: 0.3rem 0; border-bottom: 1px solid #0a1a30; font-size: 0.875rem;">
              <span style="color: #e0e0e0;">{{ m.character_id }}</span>
              <span class="tag tag-common" style="margin-left: 0.5rem;">{{ m.role }}</span>
            </div>

            <div style="margin-top: 1rem;">
              <label>Convidar Membro</label>
              <div class="row" style="margin-top: 0.25rem;">
                <input class="input" [(ngModel)]="inviteCharacterId" placeholder="Character ID">
                <button class="btn-sm" (click)="inviteMember()">Convidar</button>
              </div>
              <div *ngIf="inviteMessage" [class]="inviteSuccess ? 'success' : 'error'" style="font-size: 0.8rem; margin-top: 0.25rem;">
                {{ inviteMessage }}
              </div>
            </div>
          </div>

          <!-- Depositar ouro -->
          <div class="card" style="flex: 1; min-width: 240px; margin-bottom: 0;">
            <h3>Banco da Guilda</h3>
            <div style="margin-bottom: 0.5rem;">
              <label>Character ID</label><br>
              <input class="input" [(ngModel)]="depositForm.characterId" placeholder="Seu character ID" style="width: 100%; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 0.75rem;">
              <label>Quantidade de Gold</label><br>
              <input class="input" type="number" [(ngModel)]="depositForm.amount" placeholder="0" min="1" style="width: 100%; box-sizing: border-box;">
            </div>
            <button class="btn" (click)="depositGold()" [disabled]="depositing">
              {{ depositing ? 'Depositando...' : 'Depositar Ouro' }}
            </button>
            <div *ngIf="depositMessage" [class]="depositSuccess ? 'success' : 'error'" style="margin-top: 0.5rem; font-size: 0.85rem;">
              {{ depositMessage }}
            </div>
          </div>
        </div>

        <!-- Chat -->
        <div class="card" style="margin-top: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 style="margin: 0;">Chat da Guilda</h3>
            <span style="font-size: 0.75rem; color: #a0a0c0;">Polling a cada 5s</span>
          </div>
          <div style="background: #0a1525; border-radius: 4px; padding: 0.75rem; height: 200px; overflow-y: auto; margin-bottom: 0.75rem;" #chatBox>
            <div *ngFor="let msg of chatMessages" style="margin-bottom: 0.4rem; font-size: 0.85rem;">
              <span style="color: #c0a060;">{{ msg.character_id }}</span>
              <span style="color: #a0a0c0; font-size: 0.75rem; margin: 0 0.5rem;">{{ msg.created_at | date:'HH:mm' }}</span>
              <span>{{ msg.message }}</span>
            </div>
            <div *ngIf="chatMessages.length === 0" style="color: #a0a0c0; text-align: center; padding-top: 2rem;">
              Nenhuma mensagem ainda.
            </div>
          </div>
          <div class="row">
            <input class="input" [(ngModel)]="chatForm.characterId" placeholder="Character ID" style="width: 120px;">
            <input class="input" [(ngModel)]="chatForm.message" placeholder="Mensagem..." style="flex: 1;"
                   (keyup.enter)="sendChat()">
            <button class="btn" (click)="sendChat()" [disabled]="sendingChat">
              Enviar
            </button>
          </div>
          <div *ngIf="chatError" class="error" style="font-size: 0.8rem; margin-top: 0.25rem;">{{ chatError }}</div>
        </div>

        <div *ngIf="actionError" class="error" style="margin-top: 0.5rem;">{{ actionError }}</div>
      </div>
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
    .btn-sm { background: #0f3460; border: 1px solid #e94560; border-radius: 4px; color: #e94560; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
    .tag { display: inline-block; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.75rem; }
    .tag-common { background: #334; color: #aaa; }
    .success { color: #40e060; }
    .error { color: #e94560; }
    .row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.5rem; }
    label { font-size: 0.8rem; color: #a0a0c0; }
    .stat-box { background: #0f3460; border-radius: 4px; padding: 0.5rem 1rem; text-align: center; }
    .stat-label { font-size: 0.75rem; color: #a0a0c0; }
    .stat-value { font-size: 1.1rem; font-weight: bold; color: #e0e0e0; }
  `]
})
export class GuildComponent implements OnInit, OnDestroy {
  guild: Guild | null = null;
  members: GuildMember[] = [];
  membersLoading = false;
  chatMessages: ChatMessage[] = [];
  chatError = '';
  sendingChat = false;
  actionError = '';
  loadError = '';

  // Forms
  createForm = { leaderId: '', name: '', description: '' };
  creating = false;
  createError = '';

  joinForm = { characterId: '', guildId: '' };
  joining = false;
  joinError = '';

  lookupGuildId = '';

  inviteCharacterId = '';
  inviteMessage = '';
  inviteSuccess = false;

  depositForm = { characterId: '', amount: null as number | null };
  depositing = false;
  depositMessage = '';
  depositSuccess = false;

  chatForm = { characterId: '', message: '' };

  leaving = false;

  private pollingInterval: any;

  constructor(private api: ApiService) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.stopPolling();
  }

  loadGuild(guildId: string) {
    if (!guildId) return;
    this.loadError = '';
    this.api.get<Guild>(`/guilds/${guildId}`).subscribe({
      next: (data) => {
        this.guild = data;
        this.loadMembers();
        this.loadChat();
        this.startPolling();
      },
      error: (err) => { this.loadError = err.error?.message || 'Guilda não encontrada'; }
    });
  }

  loadMembers() {
    if (!this.guild) return;
    this.membersLoading = true;
    this.api.get<GuildMember[]>(`/guilds/${this.guild.id}/members`).subscribe({
      next: (data) => { this.members = data; this.membersLoading = false; },
      error: () => { this.membersLoading = false; }
    });
  }

  loadChat() {
    if (!this.guild) return;
    this.api.get<ChatMessage[]>(`/guilds/${this.guild.id}/chat`).subscribe({
      next: (data) => { this.chatMessages = data; },
      error: () => {}
    });
  }

  startPolling() {
    this.stopPolling();
    this.pollingInterval = setInterval(() => this.loadChat(), 5000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  createGuild() {
    if (!this.createForm.leaderId || !this.createForm.name) return;
    this.creating = true;
    this.createError = '';
    this.api.post<Guild>('/guilds', this.createForm).subscribe({
      next: (data) => {
        this.guild = data;
        this.creating = false;
        this.loadMembers();
        this.startPolling();
      },
      error: (err) => { this.createError = err.error?.message || 'Erro ao criar guilda'; this.creating = false; }
    });
  }

  joinGuild() {
    if (!this.joinForm.characterId || !this.joinForm.guildId) return;
    this.joining = true;
    this.joinError = '';
    this.api.post(`/guilds/${this.joinForm.guildId}/join`, { characterId: this.joinForm.characterId }).subscribe({
      next: () => {
        this.joining = false;
        this.loadGuild(this.joinForm.guildId);
      },
      error: (err) => { this.joinError = err.error?.message || 'Erro ao entrar na guilda'; this.joining = false; }
    });
  }

  inviteMember() {
    if (!this.inviteCharacterId || !this.guild) return;
    this.inviteMessage = '';
    this.api.post(`/guilds/${this.guild.id}/invite`, { characterId: this.inviteCharacterId }).subscribe({
      next: () => {
        this.inviteSuccess = true;
        this.inviteMessage = 'Convite enviado!';
        this.inviteCharacterId = '';
        this.loadMembers();
      },
      error: (err) => { this.inviteSuccess = false; this.inviteMessage = err.error?.message || 'Erro ao convidar'; }
    });
  }

  depositGold() {
    if (!this.depositForm.characterId || !this.depositForm.amount || !this.guild) return;
    this.depositing = true;
    this.depositMessage = '';
    this.api.post(`/guilds/${this.guild.id}/deposit`, {
      characterId: this.depositForm.characterId,
      amount: this.depositForm.amount
    }).subscribe({
      next: (data: any) => {
        this.depositSuccess = true;
        this.depositMessage = `${this.depositForm.amount} G depositado com sucesso!`;
        if (data?.gold_bank !== undefined && this.guild) this.guild.gold_bank = data.gold_bank;
        this.depositing = false;
        this.depositForm.amount = null;
      },
      error: (err) => {
        this.depositSuccess = false;
        this.depositMessage = err.error?.message || 'Erro ao depositar';
        this.depositing = false;
      }
    });
  }

  sendChat() {
    if (!this.chatForm.message.trim() || !this.chatForm.characterId || !this.guild) return;
    this.sendingChat = true;
    this.chatError = '';
    this.api.post(`/guilds/${this.guild.id}/chat`, {
      characterId: this.chatForm.characterId,
      message: this.chatForm.message
    }).subscribe({
      next: () => {
        this.chatForm.message = '';
        this.sendingChat = false;
        this.loadChat();
      },
      error: (err) => {
        this.chatError = err.error?.message || 'Erro ao enviar mensagem';
        this.sendingChat = false;
      }
    });
  }

  leaveGuild() {
    if (!this.guild) return;
    const characterId = this.chatForm.characterId || this.depositForm.characterId;
    if (!characterId) {
      this.actionError = 'Informe seu Character ID no campo de chat ou depósito para sair.';
      return;
    }
    this.leaving = true;
    this.actionError = '';
    this.api.post(`/guilds/${this.guild.id}/leave`, { characterId }).subscribe({
      next: () => {
        this.guild = null;
        this.members = [];
        this.chatMessages = [];
        this.leaving = false;
        this.stopPolling();
      },
      error: (err) => {
        this.actionError = err.error?.message || 'Erro ao sair da guilda';
        this.leaving = false;
      }
    });
  }
}
