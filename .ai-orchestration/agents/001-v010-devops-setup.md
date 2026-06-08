# Agent 001 — v0.1.0 DevOps Setup

## Objetivo
Criar toda a configuração de infraestrutura Docker para o frontend Angular na v0.1.0.

## Contexto mínimo necessário
- Stack: Angular 19+ frontend (sem backend ainda)
- Porta frontend: 4200
- Node 20 Alpine para build; nginx para servir em produção
- Hot reload via volume bind mount em desenvolvimento

## Arquivos autorizados a criar/alterar
- `devops/frontend/Dockerfile`
- `devops/docker-compose.yml`
- `devops/.env.example`

## Arquivos apenas para consulta
- `README.md` (ver pasta system/frontend/)

## O que NÃO mexer
- Qualquer arquivo em `system/`
- Qualquer outro arquivo existente

## Dependências obrigatórias
Nenhuma (pode executar imediatamente)

## Critérios de aceite
- `devops/frontend/Dockerfile` funcional com build Angular multi-stage
- `devops/docker-compose.yml` com serviço `frontend` na porta 4200
- Volume bind mount para hot reload em dev
- Variável `ANGULAR_ENV=development` configurada
- `docker-compose up` deve subir o frontend sem erro (validar após agente 002 criar o projeto Angular)

## Memory

### Objetivo
Infraestrutura Docker mínima para frontend Angular.

### Contexto permitido
Apenas a estrutura de pastas esperada: `system/frontend/` (Angular), `devops/` (infra).

### Arquivos autorizados
- `devops/frontend/Dockerfile`
- `devops/docker-compose.yml`
- `devops/.env.example`

### Dependências
Nenhuma.

### Restrições
- Não criar nenhum código Angular.
- Não alterar arquivos fora de `devops/`.
- Dockerfile deve ter estágio `builder` (node:20-alpine) e `runner` (nginx:alpine).

### Critérios de aceite
- docker-compose up sobe frontend na porta 4200
- Hot reload funciona com volume montado

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-001.md` com status, arquivos criados, decisões.

## Limpeza pós-versão
Após v0.1.0 completa (001 + 002 concluídos): deletar `v0.1.0.md` da raiz.
