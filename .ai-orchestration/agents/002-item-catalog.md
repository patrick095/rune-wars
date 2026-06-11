# Sub-spec — Agent 002: ITEM_CATALOG

## Objetivo
Criar a constante TypeScript `ITEM_CATALOG` com definições de todos os itens do jogo, mapeando `item_base_id` para nome, ícone, categoria, descrição e stats.

## Dependências
Nenhuma — pode rodar em paralelo com Agent 001.

## Contexto mínimo necessário
- Frontend Angular 17 em `system/frontend/src/app/`
- Assets de itens em `system/frontend/src/assets/items/` e `system/frontend/src/assets/rune-wars/items/`
- O `item_base_id` é uma string livre — o catálogo desacopla a instância da definição
- Será usado pelo `InventoryService` (Agent 006) para resolver nome/ícone

## Arquivos autorizados a alterar
- `system/frontend/src/app/shared/game-core/item-catalog.ts` (criar novo)

## Arquivos a consultar
- `system/frontend/src/assets/items/` — listar PNGs disponíveis para descobrir todos os item_base_ids
- `system/frontend/src/assets/rune-wars/items/` — idem
- `system/backend/src/inventory/item-instance.entity.ts` — ver campos do ItemInstance
- Qualquer arquivo que referencie `item_base_id` para entender os IDs existentes: `grep -r "item_base_id" system/backend/src --include="*.ts" -l`

## O que NÃO mexer
- Nenhum arquivo existente deve ser modificado nesta etapa

## Interface a implementar

```typescript
export type ItemCategory = 'weapon' | 'armor' | 'accessory' | 'head' | 'legs' | 'secondary' | 'consumable';

export interface ItemStats {
  attack?: number;
  defense?: number;
  speed?: number;
  hp?: number;
  mana?: number;
  [key: string]: number | undefined;
}

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  iconPath: string;        // relativo a assets/, ex: 'assets/items/weapons/iron-sword.png'
  description: string;
  stats?: ItemStats;
}

export const ITEM_CATALOG: Record<string, ItemDefinition> = {
  // preencher com todos os itens encontrados nos assets
};

// Fallback para item_base_id desconhecido
export const UNKNOWN_ITEM: ItemDefinition = {
  id: 'unknown',
  name: 'Item Desconhecido',
  category: 'weapon',
  iconPath: 'assets/items/placeholder.png',
  description: 'Item não identificado.',
};

export function getItemDefinition(itemBaseId: string): ItemDefinition {
  return ITEM_CATALOG[itemBaseId] ?? { ...UNKNOWN_ITEM, id: itemBaseId };
}
```

## Regras
- Incluir TODOS os itens encontrados nos assets (listar PNGs e criar entrada para cada um)
- Usar o nome do arquivo PNG (sem extensão) como `id`
- Inferir categoria pelo diretório do asset
- Se algum PNG não tiver nome legível, usar nome genérico descritivo
- Consumíveis: 'heal', 'teleport', 'ice-throw', 'invisibility', 'calibration-shot' (já conhecidos do spec)

## Critérios de aceite
- [ ] Arquivo criado em `system/frontend/src/app/shared/game-core/item-catalog.ts`
- [ ] Interface `ItemDefinition` exportada corretamente
- [ ] Função `getItemDefinition()` com fallback para item desconhecido
- [ ] Pelo menos os 5 consumíveis cobertos
- [ ] Todos os assets de itens encontrados no diretório cobertos
- [ ] TypeScript compila sem erros

## Formato do resumo final
Criar `.ai-orchestration/agents/002-item-catalog-result.md` com status, quantidade de itens mapeados e lista dos item_base_ids incluídos.

## Memory

### Objetivo
Criar ITEM_CATALOG TypeScript estático com definições de todos os itens do jogo.

### Contexto permitido
Frontend Angular. Diretório system/frontend/src/.

### Arquivos autorizados
system/frontend/src/app/shared/game-core/item-catalog.ts (criar novo)

### Dependências
Nenhuma

### Restrições
NÃO modificar arquivos existentes. NÃO criar arquivos além do especificado.

### Critérios de aceite
Arquivo criado, interface exportada, função getItemDefinition() com fallback, todos os assets de itens cobertos.
