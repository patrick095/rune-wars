# Agent 009 — ItemSlot + Tooltip Components

## Objetivo
Criar os componentes Angular reutilizáveis `ItemSlotComponent` e `ItemTooltipComponent` — blocos fundamentais do sistema de inventário. Estes componentes são usados tanto no inventário quanto no cofre.

## Contexto mínimo necessário
- Stack: Angular 19 standalone components + SCSS
- `ItemSlotComponent`: célula individual de inventário com suporte a drag-and-drop nativo HTML5
- `ItemTooltipComponent`: popup ao hover com nome, tipo e stats do item
- Seguir o estilo visual do jogo: fundo escuro com borda rúnica dourada, tema fantasy
- Estados visuais necessários:
  - Slot vazio: fundo cinza escuro, borda sutil
  - Slot com item: ícone centralizado
  - Slot hover: borda iluminada + tooltip
  - Item equipado: borda dourada destacada
  - Arrastar item: cursor com item, slot destino iluminado
  - Cofre sem gold: botão desabilitado + mensagem

## Arquivos autorizados a criar
- `system/frontend/src/app/shared/components/item-slot/item-slot.component.ts`
- `system/frontend/src/app/shared/components/item-slot/item-slot.component.html`
- `system/frontend/src/app/shared/components/item-slot/item-slot.component.scss`
- `system/frontend/src/app/shared/components/item-tooltip/item-tooltip.component.ts`
- `system/frontend/src/app/shared/components/item-tooltip/item-tooltip.component.html`
- `system/frontend/src/app/shared/components/item-tooltip/item-tooltip.component.scss`

## Arquivos a consultar
- `system/frontend/src/app/shared/game-core/types.ts` (tipos de item existentes)
- `system/frontend/src/app/character/character.component.ts` (entender estrutura existente)
- CSS/SCSS existentes para consistência visual

## O que NÃO mexer
- Backend
- game-core (lógica de jogo)
- Rotas Angular existentes

## Dependências obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de aceite
- `ItemSlotComponent` aceita `[item]` input (ItemInstance | null)
- `ItemSlotComponent` emite `(itemDrop)` e `(itemClick)` outputs
- Drag-and-drop nativo HTML5 funcionando entre slots
- `ItemTooltipComponent` exibe nome, tipo e stats no hover
- Acessibilidade: `title` e `aria-label` em todos os slots
- ESC fecha tooltip/modal
- TypeScript sem erros, `npm run build` passa

## Memory — Agent 009

### Objetivo
Criar ItemSlotComponent e ItemTooltipComponent reutilizáveis.

### Contexto permitido
- `game-core/types.ts` (tipos)
- `character.component.ts` (estrutura)

### Arquivos autorizados
- `shared/components/item-slot/` (criar)
- `shared/components/item-tooltip/` (criar)

### Dependências
- Nenhuma

### Restrições
- Não alterar backend, game-core, rotas

### Critérios de aceite
- Componentes funcionais com drag-drop, tooltip, e acessibilidade
