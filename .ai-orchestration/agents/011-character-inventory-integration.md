# Agent 011 — Character Inventory Integration

## Objetivo
Integrar o sistema de inventário no `CharacterComponent` existente: adicionar abas (Personagem / Inventário), conectar ao `InventoryService` backend, implementar drag-and-drop entre inventário e slots de equipamento, e criar o modal de "Selecionar Loadout" para entrada na partida.

## Contexto mínimo necessário
- Stack: Angular 19 standalone + SCSS
- `CharacterComponent` já existe em `system/frontend/src/app/character/character.component.ts`
- Adicionar abas sem quebrar a aba existente (Personagem)
- Conectar ao endpoint do backend: GET `/inventory-slots` (verificar rota real em `inventory-slots.controller.ts`)
- Estado de drag global: `draggingItem: ItemInstance | null`
- Validações frontend: tipo de item × slot correto, limite 36 slots

## Arquivos autorizados a alterar
- `system/frontend/src/app/character/character.component.ts`
- `system/frontend/src/app/character/character.component.html`
- `system/frontend/src/app/character/character.component.scss`

## Arquivos autorizados a criar
- `system/frontend/src/app/shared/services/inventory.service.ts` (se não existir)
- `system/frontend/src/app/shared/components/loadout-modal/` (modal de seleção de loadout)

## Arquivos a consultar
- `system/backend/src/inventory-slots/inventory-slots.controller.ts` (endpoints reais)
- `system/backend/src/inventory-slots/inventory-slots.service.ts`
- `system/frontend/src/app/shared/components/equipment-slots/` (Agent 010)
- `system/frontend/src/app/shared/components/inventory-grid/` (Agent 010)
- `system/frontend/src/app/shared/services/` (serviços existentes)

## O que NÃO mexer
- Backend
- game-core
- EquipmentSlotsComponent e InventoryGridComponent (usar, não modificar)

## Dependências obrigatórias
- Agent 009 (ItemSlotComponent)
- Agent 010 (EquipmentSlotsComponent + InventoryGridComponent)

## Critérios de aceite
- CharacterComponent tem abas: Personagem | Inventário
- Aba Inventário: InventoryGridComponent (6x6) + EquipmentSlotsComponent lado a lado
- Drag-and-drop funcional entre inventário e slots de equipamento
- ESC fecha modal
- Erro de inventário cheio exibe mensagem correta
- Modal de Loadout: aparece antes de entrar na partida, mostra inventário, permite selecionar itens
- `npm run build` passa

## Memory — Agent 011

### Objetivo
Integrar inventário no CharacterComponent com abas e modal de loadout.

### Contexto permitido
- `character.component.ts` (existente)
- Componentes dos Agents 009 e 010
- `inventory-slots.controller.ts` (endpoints)

### Arquivos autorizados
- `character.component.ts/html/scss`
- `shared/services/inventory.service.ts`
- `shared/components/loadout-modal/`

### Dependências
- Agents 009 e 010

### Restrições
- Não alterar backend, game-core, ou componentes dos agentes anteriores

### Critérios de aceite
- Abas funcionando, drag-drop inventário↔equipamento, modal de loadout
