import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DungeonProgress {
  floor1Completed: boolean;
  localXp: number;
  localGold: number;
  lastCompletedAt: string | null;
}

export interface DungeonSlot {
  playerId: string;
  playerName: string;
  ready: boolean;
  weaponId?: string | null;
  consumableSelection?: string[];
  equippedLoadout?: Record<string, unknown> | null;
  hp?: number;
  maxHp?: number;
}

export interface DungeonRoom {
  id: string;
  leader_character_id: string;
  member_character_ids: string[];
  floor: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'heroic';
  max_members: number;
  slots: DungeonSlot[];
  status: 'waiting' | 'in_battle' | 'portal' | 'regroup' | 'completed' | 'failed';
  current_stage: number;
  stage_count: number;
  portal_state?: unknown;
}

const STORAGE_KEY = 'dungeon_progress';

@Injectable({ providedIn: 'root' })
export class DungeonStorageService {
  constructor(private readonly api: ApiService) {}

  listRooms(): Observable<DungeonRoom[]> {
    return this.api.get<DungeonRoom[]>('/dungeon/rooms');
  }

  createRoom(characterId: string, floor: number, difficulty: DungeonRoom['difficulty']): Observable<DungeonRoom> {
    return this.api.post<DungeonRoom>('/dungeon/rooms', { characterId, floor, difficulty });
  }

  joinRoom(roomId: string, characterId: string): Observable<DungeonRoom> {
    return this.api.post<DungeonRoom>(`/dungeon/rooms/${roomId}/join`, { characterId });
  }

  getRoom(roomId: string): Observable<DungeonRoom> {
    return this.api.get<DungeonRoom>(`/dungeon/rooms/${roomId}`);
  }

  ready(
    roomId: string,
    characterId: string,
    ready = true,
    consumableSelection: string[] = [],
    options: { weaponId?: string | null; equippedLoadout?: Record<string, unknown> | null } = {},
  ): Observable<DungeonRoom> {
    return this.api.post<DungeonRoom>(`/dungeon/rooms/${roomId}/ready`, {
      characterId,
      ready,
      consumableSelection,
      ...options,
    });
  }

  leaveRoom(roomId: string, characterId: string): Observable<{ deleted: boolean; lobby?: DungeonRoom }> {
    return this.api.post<{ deleted: boolean; lobby?: DungeonRoom }>(`/dungeon/rooms/${roomId}/leave`, { characterId });
  }

  failRoom(roomId: string, characterId: string): Observable<DungeonRoom> {
    return this.api.post<DungeonRoom>(`/dungeon/rooms/${roomId}/fail`, { characterId });
  }

  updateSettings(roomId: string, characterId: string, floor: number, difficulty: DungeonRoom['difficulty']): Observable<DungeonRoom> {
    return this.api.post<DungeonRoom>(`/dungeon/rooms/${roomId}/settings`, { characterId, floor, difficulty });
  }

  start(roomId: string, characterId: string): Observable<DungeonRoom> {
    return this.api.post<DungeonRoom>(`/dungeon/rooms/${roomId}/start`, { characterId });
  }

  regroup(roomId: string, characterId: string): Observable<DungeonRoom> {
    return this.api.post<DungeonRoom>(`/dungeon/rooms/${roomId}/regroup`, { characterId });
  }

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
