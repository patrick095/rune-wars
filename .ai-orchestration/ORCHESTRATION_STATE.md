# Estado da Orquestração

## Status geral
Não iniciado

## Spec original
`docs/implementations/2026-06-15-v1.8.0-spec.md`

## Objetivo geral
Migrar toda a lógica crítica de partida para o backend NestJS (motor autoritativo). Cliente passa a ser thin client: envia intenções, anima resultados.

## Última ação concluída
Criação do plano de orquestração (IMPLEMENTAR_TUDO.md, ORCHESTRATION_STATE.md, AGENTS_QUEUE.md, DECISIONS_LOG.md, BUGS_AND_BLOCKERS.md, FILES_CHANGED.md, sub-specs de todos os agentes).

## Próxima ação recomendada
Executar Agent 001 (Interfaces e Types) e Agent 002 (Estrutura do Módulo) em paralelo.

## Fase atual
Fase 0 — Plano criado, aguardando início da execução

## Agente atual
Nenhum

## Agentes concluídos
- (nenhum)

## Agentes pendentes
- 001 — Interfaces e Types
- 002 — Estrutura do Módulo
- 003 — Projectile Physics
- 004 — Damage Calculator
- 005 — Wind System
- 006 — Terrain Engine + Loader
- 007 — Weapon Definition
- 008 — Consumable System
- 009 — Status Effect + Shot Modifier
- 010 — AI Engine
- 011 — Action Validator + Violation Tracker
- 012 — GameEngineService
- 013 — BattleGateway Refactor
- 014 — BattleSocketService (Frontend)
- 015 — BattleScene Thin Client
- 016 — Validação Final (typecheck + build)

## Agentes bloqueados
- (nenhum ainda)

## Dependências liberadas
- (nenhuma ainda)

## Bugs críticos
- (nenhum)

## Decisões tomadas
- N=3 violações → perde turno; N=6 → derrota (conforme spec)
- Tolerância posição: ±80px (conforme spec)
- Violações apenas em memória no v1.8.0
- Compartilhamento de código: copiar para backend/src/game-engine/ (sem monorepo)
- Terreno: carregar PNG com `sharp`
- IA: rodar no servidor para vsAI e Dungeon

## Decisões pendentes
- Confirmar N de violações com PO (spec sugere N=3 e N=6 — usar esses valores)
- Verificar compatibilidade de `sharp` no ambiente de deploy antes da Fase 6

## Arquivos alterados até agora
- (nenhum ainda — apenas arquivos de orquestração criados)

## Como retomar
Para continuar esta implementação, leia primeiro:

1. `.ai-orchestration/ORCHESTRATION_STATE.md`
2. `.ai-orchestration/AGENTS_QUEUE.md`
3. `.ai-orchestration/BUGS_AND_BLOCKERS.md`
4. `.ai-orchestration/FILES_CHANGED.md`
5. Os resumos em `.ai-orchestration/agents/`

Depois continue exatamente da seção "Próxima ação recomendada".
