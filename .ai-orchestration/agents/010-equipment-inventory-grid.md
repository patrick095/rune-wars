# Agent 010 — Equipment Slots + Inventory Grid

## Objetivo
Criar `EquipmentSlotsComponent` (silhueta do personagem com 10 slots posicionados) e `InventoryGridComponent` (grid 6x6 com drag-and-drop).

## Contexto mínimo necessário
- Stack: Angular 19 standalone + SCSS
- `EquipmentSlotsComponent`: silhueta de personagem no centro, com 10 slots ao redor posicionados por CSS absolute (Mão Principal, Mão Secundária, Armadura, Capacete, Botas, Anel 1, Anel 2, Colar, Brinco, Pulseira)
- `InventoryGridComponent`: grid CSS 6x6 usando `ItemSlotComponent` (do Agent 009)
- Validação de tipo: só permite equipar item no slot compatível (ex: espada em Mão Principal, não em Capacete)
- Os 10 slots de equipamento vêm de `equipment-slot.enum.ts` no backend (consultar)

## Arquivos autorizados a criar
- `system/frontend/src/app/shared/components/equipment-slots/equipment-slots.component.ts`
- `system/frontend/src/app/shared/components/equipment-slots/equipment-slots.component.html`
- `system/frontend/src/app/shared/components/equipment-slots/equipment-slots.component.scss`
- `system/frontend/src/app/shared/components/inventory-grid/inventory-grid.component.ts`
- `system/frontend/src/app/shared/components/inventory-grid/inventory-grid.component.html`
- `system/frontend/src/app/shared/components/inventory-grid/inventory-grid.component.scss`

## Arquivos a consultar
- `system/frontend/src/app/shared/components/item-slot/` (Agent 009 — usar ItemSlotComponent)
- `system/backend/src/inventory-slots/equipment-slot.enum.ts` (slots de equipamento)
- `system/frontend/src/app/shared/game-core/types.ts`

## O que NÃO mexer
- Backend
- game-core
- ItemSlotComponent (apenas usar, não modificar)

## Dependências obrigatórias
- Agent 009 concluído (ItemSlotComponent disponível)

## Critérios de aceite
- EquipmentSlotsComponent: 10 slots posicionados ao redor de silhueta de personagem
- InventoryGridComponent: grid 6x6 funcional com drag-drop entre slots
- Validação de tipo de slot (ex: arma → Mão Principal)
- Limite de 36 slots respeitado
- TypeScript sem erros

## Memory — Agent 010

### Objetivo
Criar EquipmentSlotsComponent (10 slots) e InventoryGridComponent (6x6).

### Contexto permitido
- ItemSlotComponent do Agent 009
- equipment-slot.enum.ts do backend
- types.ts

### Arquivos autorizados
- `shared/components/equipment-slots/` (criar)
- `shared/components/inventory-grid/` (criar)

### Dependências
- Agent 009 (ItemSlotComponent)

### Restrições
- Não alterar ItemSlotComponent, backend, game-core

### Critérios de aceite
- 10 slots de equipamento posicionados, grid 6x6 com validação de tipo
