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
      description: 'Em breve: v0.7.0',
    },
  ];

  getAll(): SecondaryItem[] {
    return SecondaryItemSystem.ITEMS.map(item => ({ ...item }));
  }

  getById(id: string): SecondaryItem | undefined {
    const item = SecondaryItemSystem.ITEMS.find(i => i.id === id);
    return item ? { ...item } : undefined;
  }

  /**
   * Retorna mensagem de uso para o item.
   * O item 'runic-builder' é apenas placeholder.
   */
  use(id: string): string {
    if (id === 'runic-builder') {
      return 'Em breve: v0.7.0';
    }
    const item = this.getById(id);
    if (!item) return 'Item não encontrado.';
    return `${item.name} utilizado.`;
  }
}
