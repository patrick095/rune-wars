export interface Consumable {
  id: string;
  name: string;
  usesTurn: boolean;
  description: string;
}

export const MAX_CONSUMABLES_PER_BATTLE = 5;

export class ConsumableSystem {
  private static readonly CONSUMABLES: Consumable[] = [
    {
      id: 'teleport',
      name: 'Teleporte',
      usesTurn: true,
      description: 'Arma o próximo disparo para teleportar o jogador onde ele bater no mapa.',
    },
    {
      id: 'heal',
      name: 'Cura Rápida',
      usesTurn: false,
      description: 'Cura 25% do HP máximo imediatamente.',
    },
    {
      id: 'ice-throw',
      name: 'Lançamento de Gelo',
      usesTurn: false,
      description: 'Arma o próximo disparo com gelo: acertando o alvo aplica FREEZE por 1 turno.',
    },
    {
      id: 'invisibility',
      name: 'Invisibilidade',
      usesTurn: false,
      description: 'O jogador fica invisível por 1 turno.',
    },
    {
      id: 'calibration-shot',
      name: 'Tiro de Calibração',
      usesTurn: true,
      description: 'Mostra uma linha de referência extra para auxiliar na mira.',
    },
  ];

  private _equipped: Consumable[] = [];

  getAll(): Consumable[] {
    return ConsumableSystem.CONSUMABLES.map(c => ({ ...c }));
  }

  getById(id: string): Consumable | undefined {
    const consumable = ConsumableSystem.CONSUMABLES.find(c => c.id === id);
    return consumable ? { ...consumable } : undefined;
  }

  /**
   * Equipa um consumível na lista da partida.
   * Retorna false se já atingiu o limite de MAX_CONSUMABLES_PER_BATTLE
   * ou se o consumível já está equipado.
   */
  equip(id: string): boolean {
    if (this._equipped.length >= MAX_CONSUMABLES_PER_BATTLE) return false;
    const consumable = this.getById(id);
    if (!consumable) return false;
    this._equipped.push(consumable);
    return true;
  }

  /**
   * Remove um consumível da lista equipada.
   */
  unequip(id: string): void {
    this._equipped = this._equipped.filter(c => c.id !== id);
  }

  /**
   * Retorna cópia dos consumíveis atualmente equipados.
   */
  getEquipped(): Consumable[] {
    return this._equipped.map(c => ({ ...c }));
  }

  /**
   * Indica se ainda é possível equipar mais consumíveis.
   */
  canEquipMore(): boolean {
    return this._equipped.length < MAX_CONSUMABLES_PER_BATTLE;
  }
}
