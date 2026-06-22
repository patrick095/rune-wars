import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActiveCharacterService } from '../../services/active-character.service';
import { getItemDefinition } from '../../game-core/item-catalog';

export interface RewardPortal {
  index: number;
  kind: 'gold' | 'item' | 'stone';
  amount?: number;
  itemBaseId?: string;
  rarity?: string;
  stoneLevel?: number;
}

interface RewardStateCarrier {
  reward_state?: {
    portals?: RewardPortal[];
    picksPerCharacter?: number;
  };
  portal_state?: {
    portals?: RewardPortal[];
    picksPerCharacter?: number;
  };
}

interface PortalGain {
  portalIndex: number;
  kind: 'gold' | 'item' | 'stone';
  amount?: number;
  itemBaseId?: string;
  rarity?: string;
  stoneLevel?: number;
}

interface SelectionResult {
  selectedIndices: number[];
  reveal: RewardPortal[];
  gains: PortalGain[];
}

const PORTAL_REWARD_COLOR = '#76d4e8';

@Component({
  selector: 'app-reward-portals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reward-portals.component.html',
  styleUrls: ['./reward-portals.component.scss'],
})
export class RewardPortalsComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly activeCharacter = inject(ActiveCharacterService);
  private timerId: ReturnType<typeof setInterval> | null = null;

  @Input({ required: true }) mode: 'pvp' | 'dungeon' = 'pvp';
  @Input({ required: true }) roomId = '';
  @Input() portals: RewardPortal[] | null = null;
  @Input() picks = 1;
  @Input() seconds = 10;
  @Input() completeBattle = false;
  @Output() done = new EventEmitter<SelectionResult>();
  @Output() close = new EventEmitter<void>();

  loading = false;
  error = '';
  selected = new Set<number>();
  reveal: RewardPortal[] = [];
  gains: PortalGain[] = [];
  remaining = 10;

  ngOnInit(): void {
    this.remaining = this.seconds;
    if (this.portals?.length) {
      this.startTimer();
      return;
    }
    this.loadPortals();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  get portalList(): RewardPortal[] {
    return this.portals ?? [];
  }

  get progress(): number {
    return Math.max(0, Math.min(100, (this.remaining / this.seconds) * 100));
  }

  get selectionComplete(): boolean {
    return this.selected.size === this.picks;
  }

  togglePortal(portal: RewardPortal): void {
    if (this.gains.length > 0 || this.loading) return;
    if (this.selected.has(portal.index)) {
      this.selected.delete(portal.index);
      return;
    }
    if (this.selected.size >= this.picks) return;
    this.selected.add(portal.index);
    if (this.selectionComplete) this.submit();
  }

  submit(): void {
    if (!this.selectionComplete || this.loading) return;
    this.clearTimer();
    this.loading = true;
    this.error = '';
    const path = this.mode === 'pvp'
      ? `/pvp/rooms/${this.roomId}/rewards/select`
      : `/dungeon/rooms/${this.roomId}/portals/select`;

    this.api.post<SelectionResult>(path, {
      characterId: this.activeCharacter.characterId,
      portalIndices: [...this.selected],
    }).subscribe({
      next: result => {
        this.reveal = result.reveal;
        this.gains = result.gains;
        this.loading = false;
        this.done.emit(result);
      },
      error: err => {
        this.error = err.error?.message || 'Falha ao selecionar portal.';
        this.loading = false;
      },
    });
  }

  autoPick(): void {
    if (this.portalList.length === 0) return;
    this.selected.clear();
    const indices = [...this.portalList.map(portal => portal.index)];
    while (this.selected.size < this.picks && indices.length > 0) {
      const next = Math.floor(Math.random() * indices.length);
      this.selected.add(indices.splice(next, 1)[0]);
    }
    this.submit();
  }

  portalLabel(portal: RewardPortal): string {
    if (portal.kind === 'gold') return `${portal.amount ?? 0} ouro`;
    if (portal.kind === 'stone') return `Pedra +${portal.stoneLevel ?? 0}`;
    return getItemDefinition(portal.itemBaseId ?? 'unknown').name;
  }

  portalColor(): string {
    return PORTAL_REWARD_COLOR;
  }

  gainLabel(gain: PortalGain): string {
    if (gain.kind === 'gold') return `${gain.amount ?? 0} ouro`;
    if (gain.kind === 'stone') return `Pedra de Aprimoramento +${gain.stoneLevel ?? 0}`;
    return getItemDefinition(gain.itemBaseId ?? 'unknown').name;
  }

  private loadPortals(): void {
    if (!this.roomId) {
      this.error = 'Sala nao encontrada.';
      return;
    }
    this.loading = true;
    const request = this.mode === 'pvp'
      ? this.api.post<RewardStateCarrier>(`/pvp/rooms/${this.roomId}/rewards`, { completeBattle: this.completeBattle })
      : this.api.get<RewardStateCarrier>(`/dungeon/rooms/${this.roomId}`);
    request.subscribe({
      next: response => {
        const state = response.reward_state ?? response.portal_state;
        this.portals = state?.portals ?? [];
        this.picks = state?.picksPerCharacter ?? this.picks;
        this.loading = false;
        this.startTimer();
      },
      error: err => {
        this.error = err.error?.message || 'Falha ao carregar portais.';
        this.loading = false;
      },
    });
  }

  private startTimer(): void {
    this.clearTimer();
    this.timerId = setInterval(() => {
      this.remaining -= 1;
      if (this.remaining <= 0) this.autoPick();
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
