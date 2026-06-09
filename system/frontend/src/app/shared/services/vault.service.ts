import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface VaultData {
  id: number;
  userId: number;
  gold: number;
  slots: VaultSlotData[];
}

export interface VaultSlotData {
  id: number;
  slotIndex: number;
  item: any | null;
}

@Injectable({ providedIn: 'root' })
export class VaultService {
  private http = inject(HttpClient);
  readonly VAULT_ITEM_FEE = 100; // taxa fixa por retirada de item

  getVault(): Observable<VaultData> {
    return this.http.get<VaultData>('/api/vault').pipe(
      catchError(() => of({ id: 0, userId: 0, gold: 0, slots: [] } as VaultData))
    );
  }

  depositItem(characterId: string, itemId: string, vaultSlotIndex: number): Observable<any> {
    return this.http.post('/api/vault/deposit/item', { characterId, itemId, slotIndex: vaultSlotIndex }).pipe(
      catchError(err => { throw err; })
    );
  }

  withdrawItem(characterId: string, vaultSlotIndex: number, inventorySlotIndex: number): Observable<any> {
    return this.http.post('/api/vault/withdraw/item', { characterId, vaultSlotIndex, inventorySlotIndex }).pipe(
      catchError(err => { throw err; })
    );
  }

  depositGold(characterId: string, amount: number): Observable<any> {
    return this.http.post('/api/vault/deposit/gold', { characterId, amount }).pipe(
      catchError(err => { throw err; })
    );
  }

  withdrawGold(characterId: string, amount: number): Observable<any> {
    return this.http.post('/api/vault/withdraw/gold', { characterId, amount }).pipe(
      catchError(err => { throw err; })
    );
  }

  calculateGoldFee(amount: number): number {
    return Math.floor(amount * 0.03);
  }
}
