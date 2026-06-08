# Agent 026 — v1.0.0 Rankings

## Objetivo
Implementar sistema de rankings com 4 períodos (diário, semanal, mensal, geral) e 3 modalidades (solo, duplas, guildas).

## Contexto mínimo necessário

### Períodos e resets:
- Diário: reset 0h todo dia → prêmio: ouro, materiais
- Semanal: reset segunda-feira → prêmio: itens raros
- Mensal: reset dia 1 do mês → prêmio: cosméticos, títulos
- Geral: nunca reseta → prêmio: título permanente, moldura

### Armazenamento: Redis sorted sets para ranking em tempo real; PostgreSQL para histórico

## Arquivos autorizados a criar/alterar
```
system/backend/src/
  ranking/
    ranking.module.ts (expandir)
    ranking.service.ts
    ranking.controller.ts
    entities/ranking-entry.entity.ts
    ranking-cron.service.ts
  migrations/ (nova migration para ranking_entry)
```

## Arquivos apenas para consulta
- `system/backend/src/character/entities/character.entity.ts`
- `system/backend/src/ranking/elo.service.ts` (agente 025)

## O que NÃO mexer
- AuthModule, BattleGateway, Frontend

## Dependências obrigatórias
- Agente 025 concluído (ELO disponível)

## Critérios de aceite
- `GET /ranking/daily/solo` retorna top 100 do dia
- `GET /ranking/all-time/solo` retorna ranking geral
- Cron job reseta ranking diário à meia-noite
- Redis sorted set atualizado após cada partida
- PostgreSQL persiste snapshots após cada reset

## Memory

### Objetivo
Rankings com 4 períodos, Redis + PostgreSQL, cron de reset.

### Contexto permitido
Tabela de períodos + spec de armazenamento.

### Arquivos autorizados
Os listados.

### Dependências
025 concluído.

### Restrições
- Usar `@nestjs/schedule` para crons.
- Redis key pattern: `ranking:{period}:{mode}` (ex: `ranking:daily:solo`).

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-026.md`.

## Limpeza pós-versão
Após v1.0.0 completa: deletar `v1.0.0.md` da raiz.
