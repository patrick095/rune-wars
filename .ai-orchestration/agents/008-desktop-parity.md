# Agent 008 — Desktop Parity (Desktop = Playground)

## Objetivo
Auditar o InputController (ou equivalente) e identificar por que desktop e playground têm comportamentos de tiro diferentes. Unificar o handler de input para que desktop e playground se comportem identicamente.

## Contexto mínimo necessário
- O playground já funciona corretamente — é a referência
- Desktop pode ter bifurcação de plataforma no InputController ou na BattleScene
- Stack: Angular 19 + Phaser 3.80, TypeScript
- Foco: handler de teclado/mouse para: mover personagem, ajustar ângulo, disparar (segurar para força), usar itens

## Arquivos a consultar
- `system/frontend/src/app/shared/game-core/` (todos)
- `system/frontend/src/app/` (encontrar BattleScene e PlaygroundScene)
- Procurar por `platform`, `isMobile`, `isDesktop`, ou bifurcações de input

## Arquivos autorizados a alterar
- InputController ou equivalente (somente unificação)
- BattleScene: substituir handler desktop pelo handler do playground se necessário

## O que NÃO mexer
- Lógica de armas
- Backend
- Assets

## Dependências obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de aceite
- Desktop: comportamento de tiro idêntico ao playground
- Pressionar e segurar disparo → barra de força cresce (mesmo comportamento)
- Movimento de personagem igual em ambas as plataformas
- `npm run build` passa

## Memory — Agent 008

### Objetivo
Unificar InputController para paridade desktop=playground.

### Contexto permitido
- Toda a pasta `game-core/`
- BattleScene e PlaygroundScene

### Arquivos autorizados
- InputController (ou equivalente) — somente unificação
- BattleScene se necessário

### Dependências
- Nenhuma

### Restrições
- Não alterar lógica de armas ou backend

### Critérios de aceite
- Comportamento de tiro idêntico desktop vs playground
