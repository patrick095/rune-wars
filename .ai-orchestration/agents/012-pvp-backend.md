# Agent-012 — PvP Backend (Feat B5 Backend: Entidade PvpRoom + Endpoints + Job)

## Status
Pendente

## Objetivo
Implementar backend NestJS para o lobby PvP: entidade `PvpRoom`, migration, controller com 4 endpoints REST e cron job de limpeza de salas vazias a cada 30s.

## Memory

### Objetivo
Criar o backend PvP: entity + migration + controller + service + cron job.

### Contexto permitido
- Backend NestJS (pasta `backend/` ou `server/` — verificar estrutura real)
- Consultar entidades existentes para seguir padrão (TypeORM, decorators)

### Arquivos autorizados a alterar/criar
- `[backend]/src/pvp/pvp-room.entity.ts` (criar)
- `[backend]/src/pvp/pvp.controller.ts` (criar)
- `[backend]/src/pvp/pvp.service.ts` (criar)
- `[backend]/src/pvp/pvp.module.ts` (criar)
- `[backend]/src/app.module.ts` (importar PvpModule)
- Migration de banco de dados para `pvp_rooms`

### Arquivos apenas consulta
- Qualquer entidade existente para entender o padrão TypeORM
- `[backend]/src/app.module.ts`

### O que NÃO alterar
- Autenticação/JWT existente (apenas aplicar o guard existente)
- Qualquer outra entidade ou módulo

### Dependências
- Independente dos outros agentes — pode rodar em paralelo com tudo

### Critérios de aceite
- Entidade `PvpRoom` com campos: id(uuid), name, mapName(default:'plains'), playerCount(default:1), maxPlayers(default:2), status('waiting'|'active'|'closed'), createdAt, updatedAt
- `GET /pvp/rooms`: retorna lista de salas waiting/active
- `POST /pvp/rooms`: cria sala com `{ name?, mapName? }`, retorna `{ roomId, name, mapName }`
- `DELETE /pvp/rooms/:id`: deleta sala (apenas criador ou admin)
- `POST /pvp/rooms/:id/join`: entra na sala, incrementa playerCount
- Todos os endpoints protegidos por JWT guard existente
- Cron job a cada 30s deleta salas com playerCount === 0 por mais de 30s
- Log: `[Lobby] Sala ${id} deletada por TTL`
- Migration funcional

### Instrução de execução
```
Implemente a Feat B5 Backend do spec v1.4.0.
Primeiro, localizar a estrutura do backend (pasta backend/ ou server/) e verificar como outros módulos são estruturados.
Criar PvpRoom entity com TypeORM conforme spec.
Criar PvpService com métodos: findAll(), create(dto), delete(id, userId), join(id, characterId).
Criar PvpController com os 4 endpoints, aplicando JWT guard existente.
Criar PvpModule e importar em AppModule.
Criar migration para a tabela pvp_rooms com index em updatedAt.
Implementar cron job (NestJS @Cron) no PvpService para deletar salas com playerCount === 0 e updatedAt há mais de 30s.
Atualizar .ai-orchestration/ após cada arquivo criado/alterado.
```

## Riscos ou pendências
- Verificar se o projeto usa TypeORM migrations automáticas ou manuais
- O campo `playerCount` pode ter race condition em múltiplas conexões simultâneas (low risk para v1.4)
- Verificar estrutura real do backend antes de criar arquivos
