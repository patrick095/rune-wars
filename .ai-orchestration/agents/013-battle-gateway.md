# Sub-spec — Agent 013: BattleGateway Refactor

## Objetivo
Refatorar `battle.gateway.ts` para delegar toda a lógica ao `GameEngineService`. O gateway passa a ser apenas um roteador WebSocket: recebe `battle:action`, delega ao GameEngineService, emite `battle:action_result` + `battle:ai_action` + `battle:turn`. Também atualizar `battle.module.ts` para importar `GameEngineModule`.

## Arquivos que pode criar/alterar
- `system/backend/src/battle/battle.gateway.ts` (MODIFICAR)
- `system/backend/src/battle/battle.module.ts` (MODIFICAR)
- `system/backend/src/battle/battle-room.interface.ts` (MODIFICAR se necessário)

## Arquivos que deve apenas consultar
- `system/backend/src/battle/battle.gateway.ts` — versão atual (placeholder)
- `system/backend/src/battle/matchmaking.service.ts`
- `system/backend/src/game-engine/game-engine.service.ts`
- `system/backend/src/game-engine/game-state.interface.ts`
- `system/backend/src/battle/dto/battle-action.dto.ts`

## O que NÃO deve mexer
- `game-engine.service.ts` (já criado)
- Arquivos de frontend
- Outros módulos do backend

## Dependências obrigatórias
- Agent 012 (GameEngineService deve existir)

## Eventos WebSocket a implementar

**Client → Server:**
- `battle:action` → `BattleActionDto` → `GameEngineService.processAction()`

**Server → Client:**
- `battle:action_result` — emitido para TODOS na sala após ação do jogador
- `battle:ai_action` — emitido para TODOS na sala após turno da IA (vsAI/Dungeon)
- `battle:turn` — início de turno com estado completo
- `battle:violation` — opcional, informa o cliente sobre violação
- `battle:state` — reconexão (inclui terrainDelta log + estado atual)
- `battle:error` — erros conhecidos (`NO_ROOM`, `NOT_YOUR_TURN`, etc.)

## Segurança obrigatória
- `characterId` DEVE ser extraído de `client.data` (JWT autenticado no handshake) — NUNCA do payload DTO
- Ação em sala inexistente → emitir `battle:error { code: 'NO_ROOM' }`

## Fluxo obrigatório para `battle:action`

```
1. Extrair characterId de client.data
2. Extrair roomId do cliente (ex: client.data.roomId)
3. Chamar GameEngineService.processAction(roomId, characterId, dto)
4. Emitir battle:action_result para todos na sala (server.to(roomId).emit)
5. Se result.gameOver → emitir battle:game_over
6. Se !gameOver && state.vsAI && nextTurn é IA:
   a. Chamar GameEngineService.computeAiAction(roomId)
   b. Emitir battle:ai_action para todos na sala
7. Emitir battle:turn para o próximo jogador
```

## Critérios de aceite
- [ ] `battle:action` handler implementado com pipeline completo
- [ ] characterId nunca vem do payload (sempre de client.data)
- [ ] `battle:action_result` emitido para TODOS na sala (não só o remetente)
- [ ] `battle:ai_action` emitido após turno de IA
- [ ] `battle:state` em reconexão inclui `GameEngineService.getRoomTerrainLog()`
- [ ] `battle.module.ts` importa `GameEngineModule`
- [ ] Placeholder de `calcDamage` aleatório REMOVIDO

## Instrução para execução

```
Você é um desenvolvedor NestJS/WebSocket sênior no projeto Rune Wars.

Sua tarefa é refatorar battle.gateway.ts para delegar ao GameEngineService.

1. Leia o gateway atual: system/backend/src/battle/battle.gateway.ts
2. Leia: system/backend/src/battle/matchmaking.service.ts
3. Leia: system/backend/src/game-engine/game-engine.service.ts
4. Leia: system/backend/src/game-engine/game-state.interface.ts
5. Leia: system/backend/src/battle/dto/battle-action.dto.ts
6. Leia: system/backend/src/battle/battle.module.ts

Refatore battle.gateway.ts:
- Remova o placeholder de calcDamage aleatório
- Injete GameEngineService via constructor
- Implemente handler battle:action com o fluxo completo:
  1. characterId de client.data (NUNCA do payload)
  2. GameEngineService.processAction(roomId, characterId, dto)
  3. Emitir battle:action_result para a sala
  4. Se vsAI e turno da IA: GameEngineService.computeAiAction() → battle:ai_action
  5. battle:turn para próximo jogador
- Adicione handler battle:reconnect → GameEngineService.getState() + getRoomTerrainLog()
- Adicione emissão de battle:violation quando violation detectada

Atualize battle.module.ts para importar GameEngineModule.

SEGURANÇA: characterId SEMPRE de client.data, nunca do payload.

Resumo:
# Resumo — Agent 013: BattleGateway
## Status / O que foi feito / Arquivos alterados / Decisões tomadas / Bugs encontrados / Recomendações
```

## Memory — Agent 013

### Arquivos autorizados
- MODIFICAR: battle.gateway.ts, battle.module.ts, battle-room.interface.ts

### Dependências
- Agent 012 (GameEngineService)

### Restrições
- characterId SEMPRE de client.data
- Placeholder de calcDamage aleatório REMOVIDO
- Emitir para TODA a sala (server.to(roomId)), não só para o remetente
