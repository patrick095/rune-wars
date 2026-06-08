# Agent 020 — v0.9.0 Backend: BattleGateway + Matchmaking

## Objetivo
Implementar `BattleGateway` WebSocket, `MatchmakingModule` com Redis, lógica autoritativa de batalha (turno, dano, terreno, efeitos rúnicos).

## Contexto mínimo necessário

### Eventos WebSocket:
**Cliente → Servidor:** `battle:join`, `battle:action {type,angle,force,item?}`, `battle:reconnect {roomId,characterId}`, `battle:surrender`
**Servidor → Cliente:** `battle:matched {roomId,opponent}`, `battle:state BattleState`, `battle:turn {playerId,timeLimit}`, `battle:result {winner,loser,xp,gold}`, `battle:error {code,message}`

### BattleRoom (Redis, TTL 1h): `{ id, type:'1v1', players:string[], state:BattleState, createdAt, expiresAt }`
### Matchmaking: fila Redis FIFO; match se força de combate ±20%; após 30s aceita qualquer
### Reconexão: sala ativa por 60s sem o jogador; ao 60s → adversário vence

### Fluxo de turno autoritativo:
1. Recebe `battle:action` → valida → calcula física → aplica dano → verifica rúnico → emite `battle:state` → troca turno → emite `battle:turn`

## Arquivos autorizados a criar/alterar
```
system/backend/src/
  battle/
    battle.module.ts
    battle.gateway.ts
    battle.service.ts
    battle-state.ts
    battle-room.ts
  matchmaking/
    matchmaking.module.ts
    matchmaking.service.ts
```

## Arquivos apenas para consulta
```
system/backend/src/
  auth/guards/jwt-auth.guard.ts
  character/character.service.ts
system/frontend/src/app/shared/game-core/
  projectile-physics.ts
  damage-calculator.ts
  runic-effect-system.ts
  terrain-engine.ts
```

## O que NÃO mexer
- `auth/`, `character/`, `inventory/`, `dungeon/` modules (agente 019)
- Qualquer arquivo de frontend

## Dependências obrigatórias
- Agente 019 concluído

## Critérios de aceite
- Dois clientes encontram partida via matchmaking
- Turno é validado pelo servidor (rejeita ação fora do turno)
- Dano calculado pelo servidor, não aceito do cliente
- Reconexão restaura estado completo da sala
- Após 60s offline, adversário recebe vitória

## Memory

### Objetivo
BattleGateway WS + MatchmakingModule com Redis.

### Contexto permitido
Eventos WS + fluxo de turno + spec de reconexão.

### Arquivos autorizados
Os listados.

### Dependências
019 concluído.

### Restrições
- Usar `@nestjs/websockets` com `socket.io`.
- Usar `ioredis` para Redis.
- Física autoritativa: portar `ProjectilePhysics` para o backend ou importar do `game-core` (mesma lib TS pura).
- Rate limiting: máximo de ações por segundo por jogador.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-020.md`.

## Limpeza pós-versão
Após v0.9.0 completa: deletar `v0.9.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Backend** | `agents/dev-backend.md` | NestJS WebSocket, services com regra de negócio, validação de ação |

**Instrução:** `dev-backend.md`. Regra crítica: backend é a fonte da verdade — nunca aceitar valor de dano do cliente. Toda validação de turno, item e física ocorre no servidor antes de emitir `battle:state`.
