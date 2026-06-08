# Agent 018 — v0.9.0 DevOps (Full Stack Docker)

## Objetivo
Atualizar o docker-compose para stack completo (frontend + backend + PostgreSQL + Redis), criar Dockerfile para o backend NestJS, e documentar variáveis de ambiente.

## Contexto mínimo necessário
- PostgreSQL 16-alpine, db=runewars, user=rw_user, pass=rw_pass
- Redis 7-alpine, porta 6379
- Backend NestJS na porta 3000 (depende de postgres + redis)
- Frontend Angular na porta 4200

## Arquivos autorizados a criar/alterar
```
devops/
  docker-compose.yml (atualizar com backend, postgres, redis)
  backend/
    Dockerfile
  .env.example
```

## Arquivos apenas para consulta
- `devops/frontend/Dockerfile` (padrão para o backend Dockerfile)
- `devops/docker-compose.yml` (versão atual)

## O que NÃO mexer
- Qualquer arquivo em `system/`
- `devops/frontend/Dockerfile`

## Dependências obrigatórias
- Agente 017 concluído (pode rodar em paralelo com 019 e 021)

## docker-compose.yml esperado:
```yaml
services:
  frontend: { build: ./frontend, ports: ["4200:80"] }
  backend: { build: ./backend, ports: ["3000:3000"], env_file: .env, depends_on: [postgres,redis] }
  postgres: { image: postgres:16-alpine, environment: {POSTGRES_DB:runewars, POSTGRES_USER:rw_user, POSTGRES_PASSWORD:rw_pass}, volumes: [pg_data:/var/lib/postgresql/data] }
  redis: { image: redis:7-alpine, ports: ["6379:6379"] }
volumes: { pg_data: }
```

## .env.example mínimo:
```
DATABASE_URL=postgresql://rw_user:rw_pass@postgres:5432/runewars
REDIS_URL=redis://redis:6379
JWT_SECRET=change-me-in-production
PORT=3000
```

## Critérios de aceite
- `docker-compose up` sobe todos os 4 serviços sem erro
- Backend faz healthcheck em postgres e redis antes de iniciar
- `.env.example` documentado com todos os valores necessários

## Memory

### Objetivo
docker-compose full stack + Dockerfile NestJS backend.

### Contexto permitido
Tabela de serviços + .env.example acima.

### Arquivos autorizados
Os listados.

### Dependências
017 concluído (pode ser paralelo com 019).

### Restrições
- Backend Dockerfile: node:20-alpine, multi-stage build.
- Não alterar `devops/frontend/Dockerfile`.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-018.md`.

## Limpeza pós-versão
Após v0.9.0 completa (018+019+020+021+022): deletar `v0.9.0.md` da raiz.
