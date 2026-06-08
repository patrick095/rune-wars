# Agent 025 — v1.0.0 PvP Ranqueado + ELO

## Objetivo
Implementar o sistema de pontos ELO simplificado, fila de matchmaking ranqueada separada da casual, e divisões de rank.

## Contexto mínimo necessário

### ELO:
```ts
const K = 32;
const expectedWinRate = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
// Ganho: K * (1 - expectedWinRate); Perda: K * expectedWinRate
```

### Divisões:
Bronze=0–999, Prata=1000–1999, Ouro=2000–2999, Platina=3000–3999, Diamante=4000–4999, Campeão=5000+

### Modos ranqueados: `1v1` (solo) e `2v2` (duplas)

### Rating inicial: 1000 (Prata)

## Arquivos autorizados a criar/alterar
```
system/backend/src/
  ranking/
    ranking.module.ts
    elo.service.ts
    ranked-queue.service.ts
  character/
    entities/character.entity.ts (adicionar solo_rating, duo_rating)
  matchmaking/
    matchmaking.service.ts (adicionar fila ranqueada separada)
  migrations/ (nova migration para solo_rating, duo_rating)
```

## Arquivos apenas para consulta
- `system/backend/src/matchmaking/matchmaking.service.ts`
- `system/backend/src/battle/battle.service.ts`

## O que NÃO mexer
- AuthModule, InventoryModule, BattleGateway
- Frontend

## Dependências obrigatórias
- Agentes 018+019+020 concluídos

## Critérios de aceite
- `EloService.calculate(winner, loser)` retorna novos ratings
- Rating inicial = 1000 para novos personagens
- Fila ranqueada separada da casual no matchmaking
- `character.solo_rating` atualizado após cada partida ranqueada
- Divisão calculada corretamente baseada no rating

## Memory

### Objetivo
ELO, divisões, fila ranqueada separada.

### Contexto permitido
Fórmula ELO + tabela de divisões + spec de matchmaking.

### Arquivos autorizados
Os listados.

### Dependências
019+020 concluídos.

### Restrições
- Não misturar fila casual com ranqueada no Redis.
- Rating nunca vai abaixo de 0.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-025.md`.

## Limpeza pós-versão
Após v1.0.0 completa: deletar `v1.0.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Backend** | `agents/dev-backend.md` | EloService puro, RankedQueueService com Redis, fila separada |

**Instrução:** `dev-backend.md`. `EloService` é pura lógica de domínio (domain layer). Fila ranqueada Redis deve ter key separada da casual: `queue:ranked:1v1` ≠ `queue:casual:1v1`.
