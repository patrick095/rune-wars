# Agent 018 — Integration QA + Validation

## Objetivo
Verificar a integração de todos os sistemas implementados, validar os critérios de aceite do v1.2.0.md, rodar typecheck + build, e produzir o resumo final da implementação.

## Contexto mínimo necessário
- Leia todos os resumos dos agents 001–017 antes de começar
- Leia o v1.2.0.md seção 27 (Critérios de Aceite) e seção 28 (Checklist Final)
- Rode: `npm run build` no frontend e backend
- Rode: TypeScript typecheck em ambos
- Verifique: todos os 49 assets presentes (sem 404)

## Arquivos a consultar
- Todos os resumos em `.ai-orchestration/agents/*-resumo.md`
- `v1.2.0.md` seções 27 e 28
- `system/frontend/` e `system/backend/`

## Arquivos autorizados a alterar
- Somente correções mínimas de TypeScript se necessário
- `.ai-orchestration/ORCHESTRATION_STATE.md` (atualizar status)
- `.ai-orchestration/FILES_CHANGED.md` (consolidar)
- `.ai-orchestration/BUGS_AND_BLOCKERS.md` (bugs pendentes)

## Arquivos autorizados a criar
- `.ai-orchestration/agents/018-integration-qa-resumo.md`
- `docs/implementations/2026-06-08-v1.2.0-assets-inventario-cofre-mapas.md` (resumo final permanente)

## Dependências obrigatórias
- Todos os agents anteriores (001–017)

## Critérios de aceite (checklist do v1.2.0.md)
- [ ] ~49 assets presentes e sem placeholder
- [ ] Barra de força cresce visualmente ao segurar
- [ ] Linha ghost aparece após disparo
- [ ] Inventário: grid 6x6 funcional, slots de equipamento
- [ ] Drag-and-drop entre inventário e equipamento
- [ ] Cofre: grid 6x10, depositar gratuito, retirar cobra taxa
- [ ] Cofre: 3% para gold, taxa fixa para item
- [ ] 5 mapas battle disponíveis
- [ ] Cada mapa novo tem área escavável
- [ ] Desktop = playground (comportamento de tiro)
- [ ] Hub POIs abrem sem navegar fora do canvas
- [ ] `npm run build` passa frontend e backend
- [ ] TypeScript sem erros

## Memory — Agent 018

### Objetivo
QA final de integração da v1.2.0.

### Contexto permitido
- Todos os resumos dos agentes
- v1.2.0.md seções 27 e 28

### Arquivos autorizados
- Correções TypeScript mínimas
- Resumo final em `docs/implementations/`
- Atualizar arquivos de orquestração

### Dependências
- Todos os agents anteriores

### Critérios de aceite
- Build passa, TypeScript limpo, todos os 15 critérios do checklist validados
