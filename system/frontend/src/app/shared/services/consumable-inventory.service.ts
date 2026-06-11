import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CharacterConsumable {
  id: string;
  character_id: string;
  consumable_id: string;
  quantity: number;
}

export interface ConsumableDefinition {
  id: string;
  name: string;
  iconPath: string;
  description: string;
}

export const CONSUMABLE_CATALOG: Record<string, ConsumableDefinition> = {
  'heal': {
    id: 'heal',
    name: 'Poção de Cura',
    iconPath: 'assets/items/consumables/heal.png',
    description: 'Poção medicinal que restaura pontos de vida instantaneamente ao ser consumida.',
  },
  'teleport': {
    id: 'teleport',
    name: 'Pergaminho de Teleporte',
    iconPath: 'assets/items/consumables/teleport.png',
    description: 'Pergaminho mágico que teleporta o usuário para um local seguro no mapa.',
  },
  'ice-throw': {
    id: 'ice-throw',
    name: 'Arremesso de Gelo',
    iconPath: 'assets/items/consumables/ice-throw.png',
    description: 'Cristal de gelo consumível que pode ser arremessado, congelando a área de impacto.',
  },
  'invisibility': {
    id: 'invisibility',
    name: 'Poção de Invisibilidade',
    iconPath: 'assets/items/consumables/invisibility.png',
    description: 'Poção alquímica que torna o usuário completamente invisível por alguns turnos.',
  },
  'calibration-shot': {
    id: 'calibration-shot',
    name: 'Disparo de Calibração',
    iconPath: 'assets/items/consumables/calibration-shot.png',
    description: 'Projétil especial que revela informações de trajetória, auxiliando na mira.',
  },
};

const UNKNOWN_CONSUMABLE: ConsumableDefinition = {
  id: 'unknown',
  name: 'Consumível Desconhecido',
  iconPath: 'assets/items/placeholder.png',
  description: 'Consumível não identificado.',
};

@Injectable({ providedIn: 'root' })
export class ConsumableInventoryService {
  constructor(private http: HttpClient) {}

  /**
   * Lists consumables in stock (quantity > 0) for the given character.
   * GET /api/characters/:characterId/consumables
   */
  getConsumables(characterId: string): Observable<CharacterConsumable[]> {
    return this.http.get<CharacterConsumable[]>(
      `/api/characters/${characterId}/consumables`,
    );
  }

  /**
   * Uses one unit of a consumable for the given character.
   * POST /api/characters/:characterId/consumables/use  body: { consumableId }
   */
  useConsumable(characterId: string, consumableId: string): Observable<unknown> {
    return this.http.post(
      `/api/characters/${characterId}/consumables/use`,
      { consumableId },
    );
  }

  /**
   * Adds a quantity of a consumable to the character's inventory.
   * POST /api/characters/:characterId/consumables/add  body: { consumableId, quantity }
   */
  addConsumable(
    characterId: string,
    consumableId: string,
    quantity: number,
  ): Observable<unknown> {
    return this.http.post(
      `/api/characters/${characterId}/consumables/add`,
      { consumableId, quantity },
    );
  }

  /**
   * Returns the catalog definition for the given consumableId.
   * Falls back to a generic entry for unknown ids.
   */
  getConsumableDefinition(consumableId: string): ConsumableDefinition {
    return CONSUMABLE_CATALOG[consumableId] ?? { ...UNKNOWN_CONSUMABLE, id: consumableId };
  }
}
