# Agente 012 — TypeScript QA

## Objetivo
Executar typecheck em backend e frontend, reportar todos os erros encontrados, classificar como crítico/importante/baixo, e corrigir erros simples de tipo se possível sem alterar lógica de negócio.

## Contexto mínimo necessário
- Backend: NestJS em `system/backend/` — comando: `npx tsc --noEmit`
- Frontend: Angular em `system/frontend/` — comando: `npx tsc --noEmit` (ou `ng build --configuration=development`)
- Todos os agentes 001-011 devem ter sido concluídos

## Comandos a executar

```bash
# Backend
cd system/backend && npx tsc --noEmit 2>&1

# Frontend
cd system/frontend && npx tsc --noEmit 2>&1
```

## Arquivos que pode alterar
- Qualquer arquivo com erro de tipo, desde que a correção seja trivial (tipo errado, import faltando, interface desatualizada)
- NÃO alterar lógica de negócio — se o erro exigir mudança de lógica, registrar como bug e escalar para o orquestrador

## O que NÃO deve mexer
- Lógica de batalha, validações de negócio, fluxo de autenticação
- Arquivos sem erro de tipo

## Dependências obrigatórias
- **Todos os agentes 001-011** concluídos

## Critérios de aceite
- [ ] Backend compila sem erros (`npx tsc --noEmit` retorna 0)
- [ ] Frontend compila sem erros (`npx tsc --noEmit` retorna 0)
- [ ] Todos os erros encontrados documentados no resumo
- [ ] Erros críticos (que impedem compilação) classificados e reportados

## Classificação de erros
- **CRÍTICO**: compilação falha completamente, funcionalidade principal quebrada
- **IMPORTANTE**: warning de tipo que pode causar bug em runtime
- **BAIXO**: tipo `any` implícito, import não usado, warning sem impacto funcional

## Memory

### Objetivo
Executar `npx tsc --noEmit` em backend e frontend, reportar e corrigir erros de tipo simples.

### Contexto permitido
- `system/backend/` (executar tsc, ler arquivos com erro)
- `system/frontend/` (executar tsc, ler arquivos com erro)

### Arquivos autorizados
- Qualquer arquivo com erro de tipo (apenas correções de tipo, sem mudança de lógica)

### Dependências
- Agentes 001 a 011 concluídos

### Restrições
- Não alterar lógica de negócio
- Se erro exigir mudança de lógica: registrar como bug e escalar

### Critérios de aceite
- `npx tsc --noEmit` retorna 0 em backend e frontend

## Formato do resumo final
Criar `.ai-orchestration/agents/012-typescript-qa-DONE.md` seguindo o formato padrão de resumo.
