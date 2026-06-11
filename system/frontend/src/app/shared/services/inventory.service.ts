import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { InventoryItem, EquipmentSlotType } from '../game-core/types';
import { getItemDefinition } from '../game-core/item-catalog';
import { environment } from '../../../environments/environment';

const BASE = environment.apiUrl;

/** Raw shape returned by the backend GET /api/characters/:id/inventory */
export interface ItemInstance {
  id: string;
  owner_id: string;
  item_base_id: string;
  rarity: string;
  upgrade_level: number;
  equipped_slot: string | null;
  created_at: string;
}

/** Category → default equipment slot mapping (RN03–RN05) */
const CATEGORY_DEFAULT_SLOT: Partial<Record<string, EquipmentSlotType>> = {
  weapon: 'mainHand',
  secondary: 'offHand',
  armor: 'chest',
  head: 'head',
  legs: 'legs',
  accessory: 'accessory1',
};

export { CATEGORY_DEFAULT_SLOT };

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);

  /**
   * Loads the inventory for a character from the correct backend endpoint.
   * Resolves item metadata (name, iconPath, etc.) via ITEM_CATALOG.
   */
  getInventory(characterId: string): Observable<InventoryItem[]> {
    return this.http
      .get<ItemInstance[]>(`${BASE}/characters/${characterId}/inventory`)
      .pipe(
        map(instances => instances.map(i => this.resolveItem(i))),
        catchError(() => of([])),
      );
  }

  /**
   * Equips an item into a slot via PUT /api/characters/:id/inventory/:itemId/equip.
   */
  equipItem(characterId: string, itemId: string, slot: EquipmentSlotType): Observable<unknown> {
    return this.http
      .put(`${BASE}/characters/${characterId}/inventory/${itemId}/equip`, { slot })
      .pipe(catchError(() => of(null)));
  }

  /**
   * Unequips an item via PUT /api/characters/:id/inventory/:itemId/unequip.
   */
  unequipItem(characterId: string, itemId: string): Observable<unknown> {
    return this.http
      .put(`${BASE}/characters/${characterId}/inventory/${itemId}/unequip`, {})
      .pipe(catchError(() => of(null)));
  }

  /**
   * Moves an item between two inventory positions.
   * Falls back gracefully when the endpoint is unavailable.
   */
  moveItem(characterId: string, fromIndex: number, toIndex: number): Observable<unknown> {
    return this.http
      .post(`${BASE}/characters/${characterId}/inventory/move`, { fromIndex, toIndex })
      .pipe(catchError(() => of(null)));
  }

  /**
   * Resolves a raw ItemInstance into an InventoryItem by merging catalog metadata.
   * Unknown item_base_id falls back to "Item Desconhecido" without breaking UI.
   */
  private resolveItem(instance: ItemInstance): InventoryItem {
    const def = getItemDefinition(instance.item_base_id);
    return {
      id: instance.id,
      item_base_id: instance.item_base_id,
      equipped_slot: instance.equipped_slot,
      rarity: instance.rarity,
      upgrade_level: instance.upgrade_level,
      // From ITEM_CATALOG:
      name: def.name,
      category: def.category,
      iconPath: def.iconPath,
      description: def.description,
      stats: def.stats as InventoryItem['stats'],
      // Legacy alias kept for backward compat with components using `definitionId`
      definitionId: def.id,
    };
  }

  /**
   * Determines the default equipment slot for a given item category (RN03–RN05).
   * For accessories, prefers accessory1 but caller can override to accessory2.
   */
  getDefaultSlot(category: string): EquipmentSlotType | null {
    return CATEGORY_DEFAULT_SLOT[category] ?? null;
  }
}
