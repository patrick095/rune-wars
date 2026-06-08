import { Injectable } from '@angular/core';
import { PlayerBaseStats } from '../game-core/player-stats';

const STORAGE_KEY = 'runewars_build';

@Injectable({ providedIn: 'root' })
export class CharacterStorageService {
  save(stats: PlayerBaseStats): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  load(): PlayerBaseStats | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as PlayerBaseStats; } catch { return null; }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
