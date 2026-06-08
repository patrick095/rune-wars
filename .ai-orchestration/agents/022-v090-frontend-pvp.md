# Agent 022 — v0.9.0 Frontend: WebSocket PvP + Matchmaking UI

## Objetivo
Integrar WebSocket ao frontend para PvP online, criar tela de matchmaking, adaptar BattleScene para modo multiplayer com reconexão automática.

## Contexto mínimo necessário

### Eventos WS (cliente → servidor):
- `battle:join { characterId }` — entrar na fila
- `battle:action { type, angle, force, item? }` — ação do turno
- `battle:reconnect { roomId, characterId }` — reconectar
- `battle:surrender` — render

### Eventos WS (servidor → cliente):
- `battle:matched { roomId, opponent }` — partida encontrada
- `battle:state BattleState` — estado autoritativo
- `battle:turn { playerId, timeLimit }` — início de turno
- `battle:result { winner, loser, xp, gold }` — resultado
- `battle:error { code, message }` — erro

### Reconciliação: cliente anima imediatamente; ao receber `battle:state`, se divergir → lerp para posição correta

## Arquivos autorizados a criar/alterar
```
system/frontend/src/
  app/
    matchmaking/
      matchmaking.component.ts
      matchmaking.component.html
      matchmaking.component.scss
    app.routes.ts (adicionar /matchmaking)
    shared/
      services/
        battle-socket.service.ts
        reconnect.service.ts
  game/
    scenes/
      battle.scene.ts (adaptar para aceitar estado autoritativo do servidor)
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/services/auth.service.ts
system/frontend/src/game/scenes/battle.scene.ts (versão local existente)
```

## O que NÃO mexer
- game-core TS puro
- `devops/`

## Dependências obrigatórias
- Agente 020 concluído (BattleGateway disponível)
- Agente 021 concluído (JWT disponível)

## Critérios de aceite
- Dois clientes em abas diferentes encontram partida
- Turno passa para o adversário após ação
- Ao fechar e reabrir aba, reconecta à sala ativa
- Após 60s offline, tela de derrota exibida
- Log de eventos disponível no debug

## Memory

### Objetivo
WebSocket PvP + matchmaking UI + reconexão automática.

### Contexto permitido
Eventos WS acima + spec de reconciliação.

### Arquivos autorizados
Os listados.

### Dependências
020+021 concluídos.

### Restrições
- Usar `socket.io-client`.
- BattleScene deve suportar modo `'local'` (existente) e modo `'online'` (novo).
- Reconciliação: usar lerp com fator 0.3 para suavizar correções.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-022.md`.

## Limpeza pós-versão
Após v0.9.0 completa: deletar `v0.9.0.md` da raiz.
