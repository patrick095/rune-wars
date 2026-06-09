import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Character } from '../models/character.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ActiveCharacterService {
  private readonly STORAGE_KEY = 'rw_character_id';
  private _character$ = new BehaviorSubject<Character | null>(null);

  readonly character$ = this._character$.asObservable();
  get character(): Character | null { return this._character$.value; }
  get characterId(): string | null { return this._character$.value?.id ?? null; }

  setActive(char: Character): void {
    this._character$.next(char);
    localStorage.setItem(this.STORAGE_KEY, char.id);
  }

  clearActive(): void {
    this._character$.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getSavedId(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  async loadFromStorage(api: ApiService): Promise<boolean> {
    const id = this.getSavedId();
    if (!id) return false;
    try {
      const char = await firstValueFrom(api.get<Character>(`/characters/${id}`));
      this._character$.next(char);
      return true;
    } catch {
      this.clearActive();
      return false;
    }
  }
}
