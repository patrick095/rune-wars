import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InventoryItem, EquipmentSlotType } from '../game-core/types';

/** Mock data used when the backend does not have character-based inventory endpoints. */
const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'item-001',
    name: 'Espada de Ferro',
    category: 'weapon',
    icon: '⚔️',
    description: 'Uma espada forjada com ferro comum.',
    stats: { attack: 10 },
    definitionId: 'iron-sword',
  },
  {
    id: 'item-002',
    name: 'Escudo de Madeira',
    category: 'secondary',
    icon: '🛡️',
    description: 'Escudo básico de madeira reforçada.',
    stats: { defense: 5 },
    definitionId: 'wood-shield',
  },
  {
    id: 'item-003',
    name: 'Poção de Cura',
    category: 'consumable',
    icon: '🧪',
    description: 'Restaura 30 HP ao usar.',
    quantity: 3,
    usesTurn: true,
  },
  {
    id: 'item-004',
    name: 'Elmo de Couro',
    category: 'armor',
    icon: '⛑️',
    description: 'Elmo de couro curtido.',
    stats: { defense: 3 },
  },
  {
    id: 'item-005',
    name: 'Anel Rúnico',
    category: 'accessory',
    icon: '💍',
    description: 'Amplifica o poder rúnico.',
    stats: { runicChance: 0.05 },
  },
];

export interface EquipRequest {
  itemId: string;
  slot: EquipmentSlotType;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);

  /**
   * Loads the inventory for a character.
   * Falls back to mock data if the backend endpoint is unavailable.
   */
  getInventory(characterId: string): Observable<InventoryItem[]> {
    return this.http
      .get<InventoryItem[]>(`/api/inventory-slots/character/${characterId}/items`)
      .pipe(catchError(() => of(MOCK_INVENTORY)));
  }

  /**
   * Equips an item into a slot.
   * Falls back gracefully when the endpoint is unavailable.
   */
  equipItem(characterId: string, itemId: string, slot: EquipmentSlotType): Observable<unknown> {
    return this.http
      .post(`/api/inventory-slots/character/${characterId}/equip`, { itemId, slot })
      .pipe(catchError(() => of(null)));
  }

  /**
   * Unequips the item from a slot.
   * Falls back gracefully when the endpoint is unavailable.
   */
  unequipItem(characterId: string, slot: EquipmentSlotType): Observable<unknown> {
    return this.http
      .post(`/api/inventory-slots/character/${characterId}/unequip`, { slot })
      .pipe(catchError(() => of(null)));
  }

  /**
   * Moves an item between two inventory positions.
   * Falls back gracefully when the endpoint is unavailable.
   */
  moveItem(characterId: string, fromIndex: number, toIndex: number): Observable<unknown> {
    return this.http
      .post(`/api/inventory-slots/character/${characterId}/move`, { fromIndex, toIndex })
      .pipe(catchError(() => of(null)));
  }
}
