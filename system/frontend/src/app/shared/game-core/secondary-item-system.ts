export interface SecondaryItem {
  id: string;
  name: string;
  usesTurn: boolean;
  description: string;
}

export class SecondaryItemSystem {
  private static readonly ITEMS: SecondaryItem[] = [
    {
      id: 'shield',
      name: 'Escudo',
      usesTurn: false,
      description: 'Reduz o próximo dano recebido em 40%.',
    },
    {
      id: 'healing-book',
      name: 'Livro de Cura',
      usesTurn: true,
      description: 'Cura 15% do HP máximo imediatamente.',
    },
    {
      id: 'camouflage-orb',
      name: 'Orbe de Camuflagem',
      usesTurn: true,
      description: 'Fica camuflado por 1 turno — a IA ignora o jogador neste turno.',
    },
    {
      id: 'protection-totem',
      name: 'Totem de Proteção',
      usesTurn: true,
      description: 'Cria uma barreira protetora por 2 turnos.',
    },
    {
      id: 'runic-builder',
      name: 'Construtor Rúnico',
      usesTurn: false,
      description: 'Constrói terreno rúnico no próximo tiro',
    },
  ];

  private static readonly MAX_CONSTRUCTED = 20;
  private _activeBuilders = new Set<string>();

  getAll(): SecondaryItem[] {
    return SecondaryItemSystem.ITEMS.map(item => ({ ...item }));
  }

  getById(id: string): SecondaryItem | undefined {
    const item = SecondaryItemSystem.ITEMS.find(i => i.id === id);
    return item ? { ...item } : undefined;
  }

  /**
   * Ativa o runic-builder para o jogador se ele não atingiu o limite de construção.
   * Retorna true se o efeito foi ativado com sucesso.
   */
  activateRunicBuilder(playerId: string, constructedCount: number): boolean {
    if (constructedCount >= SecondaryItemSystem.MAX_CONSTRUCTED) return false;
    this._activeBuilders.add(playerId);
    return true;
  }

  isRunicBuilderActive(playerId: string): boolean {
    return this._activeBuilders.has(playerId);
  }

  consumeRunicBuilder(playerId: string): void {
    this._activeBuilders.delete(playerId);
  }

  /**
   * Retorna mensagem de uso para o item.
   */
  use(id: string, playerId?: string, constructedCount = 0): string {
    if (id === 'runic-builder') {
      if (!playerId) return 'Construtor Rúnico: jogador não identificado.';
      const activated = this.activateRunicBuilder(playerId, constructedCount);
      if (!activated) return `Limite de ${SecondaryItemSystem.MAX_CONSTRUCTED} células rúnicas atingido.`;
      return 'Construtor Rúnico ativado — o próximo tiro construirá terreno rúnico.';
    }
    const item = this.getById(id);
    if (!item) return 'Item não encontrado.';
    return `${item.name} utilizado.`;
  }
}
