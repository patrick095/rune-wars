import { Injectable } from '@angular/core';

export interface DungeonProgress {
  floor1Completed: boolean;
  localXp: number;
  localGold: number;
  lastCompletedAt: string | null;
}

const STORAGE_KEY = 'dungeon_progress';

@Injectable({ providedIn: 'root' })
export class DungeonStorageService {
  load(): DungeonProgress {
    const fallback: DungeonProgress = {
      floor1Completed: false,
      localXp: 0,
      localGold: 0,
      lastCompletedAt: null,
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
    } catch {
      return fallback;
    }
  }

  saveFloor1Reward(xp: number, gold: number): DungeonProgress {
    const current = this.load();
    const next: DungeonProgress = {
      floor1Completed: true,
      localXp: current.localXp + xp,
      localGold: current.localGold + gold,
      lastCompletedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }
}
