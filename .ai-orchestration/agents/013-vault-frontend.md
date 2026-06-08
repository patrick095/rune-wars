# Agent 013 — Vault Frontend

## Objetivo
Criar o `VaultGridComponent` (grid 6x10) e integrá-lo como aba no `CharacterComponent`. Implementar os fluxos de depósito (gratuito) e retirada (cobra taxa) com feedback visual.

## Contexto mínimo necessário
- Stack: Angular 19 standalone + SCSS
- `VaultGridComponent`: grid 6×10 usando `ItemSlotComponent` (Agent 009)
- Adicionar aba "Cofre" no `CharacterComponent` (ao lado de Personagem e Inventário)
- Exibir saldo de gold do cofre em tempo real
- Retirada de item: mostrar custo (VAULT_ITEM_FEE) antes de confirmar, desabilitar se gold insuficiente
- Retirada de gold: campo de valor, mostrar 3% de taxa, confirmar
- Depositar: drag-and-drop inventário→cofre gratuito

## Arquivos autorizados a criar
- `system/frontend/src/app/shared/components/vault-grid/vault-grid.component.ts`
- `system/frontend/src/app/shared/components/vault-grid/vault-grid.component.html`
- `system/frontend/src/app/shared/components/vault-grid/vault-grid.component.scss`
- `system/frontend/src/app/shared/services/vault.service.ts`

## Arquivos autorizados a alterar
- `system/frontend/src/app/character/character.component.ts` (adicionar aba Cofre)
- `system/frontend/src/app/character/character.component.html`
- `system/frontend/src/app/character/character.component.scss`

## Arquivos a consultar
- `system/frontend/src/app/shared/components/item-slot/` (Agent 009)
- `system/frontend/src/app/character/character.component.ts` (estado após Agent 011)
- Endpoints do backend: GET `/vault`, POST `/vault/deposit/item`, POST `/vault/withdraw/item`, POST `/vault/deposit/gold`, POST `/vault/withdraw/gold`

## O que NÃO mexer
- Backend (já implementado pelo Agent 012)
- game-core
- ItemSlotComponent, InventoryGridComponent

## Dependências obrigatórias
- Agent 012 (backend vault)
- Agent 011 (CharacterComponent com abas de inventário)

## Critérios de aceite
- Aba "Cofre" visível no CharacterComponent
- Grid 6x10 renderiza 60 slots corretamente
- Saldo de gold exibido em tempo real
- Depósito (drag inv→cofre): gratuito, funciona
- Retirada de item: custo exibido, botão desabilitado se gold insuficiente
- Retirada de gold: campo com preview de taxa (3%)
- Mensagens de erro adequadas (cofre cheio, gold insuficiente)
- `npm run build` passa

## Memory — Agent 013

### Objetivo
Criar VaultGridComponent e integrar aba Cofre no CharacterComponent.

### Contexto permitido
- ItemSlotComponent (Agent 009)
- CharacterComponent (após Agent 011)
- Endpoints do vault backend (Agent 012)

### Arquivos autorizados
- `shared/components/vault-grid/` (criar)
- `shared/services/vault.service.ts` (criar)
- `character.component.ts/html/scss` (adicionar aba)

### Dependências
- Agents 012 e 011

### Restrições
- Não alterar backend, game-core

### Critérios de aceite
- Aba cofre com grid 6x10, saldo gold, depósito gratuito, retirada com taxa
