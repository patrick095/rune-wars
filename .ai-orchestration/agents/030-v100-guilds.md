# Agent 030 — v1.0.0 Guildas + PvP de Guildas + Chat

## Objetivo
Implementar `GuildModule` com criação, membros, cargos, XP de guilda, banco de guilda, chat em tempo real (WebSocket), e PvP de guildas (até 2v2 MVP, 4v4 stretch).

## Contexto mínimo necessário

### Funcionalidades:
- Criação: nome único, mínimo 3 membros para criar
- Cargos: Lider, Oficial, Membro
- XP de guilda: ganho em dungeons quando há membros suficientes
- Nível de guilda: aumenta limite de membros
- Banco da guilda: depósito/saque de itens e ouro por cargos autorizados
- Chat de guilda: WebSocket em tempo real, somente membros
- Bônus PvE: +% XP/drop em dungeon com membros de guilda
- PvP de guildas 2v2 (ranking separado)

## Arquivos autorizados a criar/alterar
```
system/backend/src/
  guild/
    guild.module.ts
    guild.service.ts
    guild.controller.ts
    guild.gateway.ts (chat WS)
    entities/
      guild.entity.ts
      guild-member.entity.ts
      guild-bank-transaction.entity.ts
    dto/
  migrations/ (guild, guild_member, guild_bank_transaction)
```

## Arquivos apenas para consulta
```
system/backend/src/
  character/character.service.ts
  battle/battle.gateway.ts
  ranking/elo.service.ts
```

## O que NÃO mexer
- AuthModule, InventoryModule, MarketModule

## Dependências obrigatórias
- Agentes 019+025 concluídos

## Critérios de aceite
- Guilda criada com nome único
- Membros de guilda recebem bônus de XP em dungeon
- Chat de guilda funciona em tempo real via WebSocket
- Banco da guilda aceita depósito/saque com controle de cargo
- PvP de guildas 2v2 cria lobby e registra resultado no ranking de guildas

## Memory

### Objetivo
GuildModule completo com XP, banco, chat WS, PvP guildas.

### Contexto permitido
Lista de funcionalidades + spec de cargos + bônus PvE.

### Arquivos autorizados
Os listados.

### Dependências
019+025 concluídos.

### Restrições
- Chat de guilda: mensagens não persistidas (somente em memória/Redis, TTL 24h).
- Limite de membros por nível de guilda: nível 1=20, nível 2=30, etc. (definir tabela simples).
- Bônus de guilda não interfere no ranqueado individual.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-030.md`.

## Limpeza pós-versão
Após v1.0.0 completa: deletar `v1.0.0.md` da raiz.
