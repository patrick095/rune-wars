# Rune Wars — Estado Atual da Implementação

## Estado do projeto
Frontend local jogável implementado até v0.8.0. O projeto já possui playground de batalha, terreno destrutível, armas, personagem customizável, efeitos rúnicos, consumíveis, Academia e Dungeon Local.

## Versão atual
v0.8.0 — Dungeon Local Simulada

## Sistemas disponíveis
- O projeto será implementado 100% com auxílio de Claude/Codex/agentes.
- Prioridade 1: o jogo precisa funcionar como esperado.
- Prioridade 2: economizar tokens.
- Cada agente deve receber somente o contexto necessário.
- Agentes não compartilham contexto diretamente; registram progresso em documentos de implementação.
- Cada alteração precisa atualizar documentação de continuidade.
- Usuários, guildas, mercado e economia persistente ficam para fases finais.
- Primeiras fases priorizam gameplay local testável.
- Personagem deve ser altamente customizável desde cedo para testes.
- Frontend-only até v0.8.0; backend entra na v0.9.0.
- Angular standalone + Phaser 3.
- Lógica de jogo compartilhável em TypeScript puro em `system/frontend/src/app/shared/game-core/`.
- Rota `/playground` com batalha local, IA, vento, armas e terreno.
- Rota `/character` com presets e atributos locais.
- Rota `/academy` com treino de tiro e alvos.
- Rota `/dungeon` com Andar 1 local, 3 fases, lobby entre fases e recompensas em `localStorage`.

## Última alteração
- Data: 2026-06-07
- Agentes: 015, 016, 017
- Tarefa: Implementar v0.8.0 Dungeon Local.
- Arquivos alterados:
  - `system/frontend/src/app/shared/game-core/dungeon-types.ts`
  - `system/frontend/src/app/shared/game-core/dungeon-engine.ts`
  - `system/frontend/src/app/shared/game-core/monster-ai.ts`
  - `system/frontend/src/app/shared/game-core/maps/dungeon-cave-*.json`
  - `system/frontend/src/game/scenes/dungeon.scene.ts`
  - `system/frontend/src/game/enemies/*`
  - `system/frontend/src/app/dungeon/**`
  - `system/frontend/src/app/shared/services/dungeon-storage.service.ts`
  - `system/frontend/src/app/app.routes.ts`
- Como testar:
- `cd system/frontend && npm run build`
- `cd system/frontend && npm start`
- Abrir `/dungeon` para jogar o Andar 1 local.
- Validar `/playground` e `/dungeon` em larguras diferentes: inimigos devem iniciar dentro do terreno/viewport.
- Estado atual:
- v0.8.0 concluída e compilando.
- Correção aplicada para spawn inicial de inimigos baseado no grid do mapa, evitando posições fora do mapa em resoluções diferentes.
- Próximo passo:
  - Iniciar v0.9.0 com backend mínimo, autenticação e PvP multiplayer.
