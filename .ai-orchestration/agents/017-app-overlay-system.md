# Agent 017 — AppComponent Overlay System

## Objetivo
Implementar no `AppComponent` um sistema de overlay que escuta o `GameEventBusService` e renderiza componentes Angular (Character, Inventory, etc.) sobre o canvas Phaser sem trocar de rota. ESC fecha o overlay. Canvas não é destruído.

## Contexto mínimo necessário
- Stack: Angular 19 standalone + SCSS
- O `GameEventBusService` já foi criado pelo Agent 016
- O overlay é uma `<div>` com `position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 100` sobre o canvas
- O AppComponent deve escutar `openScreen$` e renderizar o componente correspondente
- Mapear screens para componentes: `'character'` → `CharacterComponent`, etc.
- Fechar ao receber `closeScreen$` ou ao pressionar ESC

## Arquivos autorizados a alterar
- `system/frontend/src/app/app.component.ts`
- `system/frontend/src/app/app.component.html`
- `system/frontend/src/app/app.component.scss`

## Arquivos a consultar
- `system/frontend/src/app/shared/services/game-event-bus.service.ts` (Agent 016)
- `system/frontend/src/app/character/character.component.ts`
- `system/frontend/src/app/app.routes.ts`

## O que NÃO mexer
- CharacterComponent (apenas importar)
- GameEventBusService (apenas consumir)
- Backend, game-core

## Dependências obrigatórias
- Agent 016 (GameEventBusService criado)

## Critérios de aceite
- AppComponent renderiza overlay sobre canvas quando recebe openScreen$
- Overlay fecha ao receber closeScreen$ ou pressionar ESC
- Canvas Phaser NÃO é destruído durante a transição
- Hub POIs abrem a tela correta sem navegar fora do canvas
- Fechar overlay retorna ao hub sem reload
- Testar fluxo: hub → character → volta → dungeon → volta
- `npm run build` passa

## Memory — Agent 017

### Objetivo
Implementar overlay system no AppComponent.

### Contexto permitido
- `app.component.ts/html/scss`
- `game-event-bus.service.ts` (Agent 016)
- Rotas existentes para mapear screens

### Arquivos autorizados
- `app.component.ts/html/scss`

### Dependências
- Agent 016 (EventBus)

### Restrições
- Não alterar CharacterComponent, EventBus, backend

### Critérios de aceite
- Overlay sobre canvas, ESC fecha, canvas não destruído
