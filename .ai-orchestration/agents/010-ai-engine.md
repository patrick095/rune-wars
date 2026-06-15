# Sub-spec — Agent 010: AI Engine

## Objetivo
Portar os arquivos de IA do frontend para o backend. A IA deve rodar integralmente no servidor para os modos vsAI e Dungeon, sem aguardar input do cliente (RN10). Isso inclui: `ai-local.ts`, `ai-strategy.ts`, `ai-decision-maker.ts`, `ai-action-generator.ts`, `ai-battle-types.ts`, `ai-ballistic-simulator.ts`, `ai-terrain-analyzer.ts`, `ai-utility-scorer.ts`, `ai-difficulty-profile.ts`.

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/ai/ai-local.ts` (CRIAR)
- `system/backend/src/game-engine/ai/ai-strategy.ts` (CRIAR)
- `system/backend/src/game-engine/ai/ai-decision-maker.ts` (CRIAR)
- `system/backend/src/game-engine/ai/ai-action-generator.ts` (CRIAR)
- `system/backend/src/game-engine/ai/ai-battle-types.ts` (CRIAR)
- `system/backend/src/game-engine/ai/ai-ballistic-simulator.ts` (CRIAR)
- `system/backend/src/game-engine/ai/ai-terrain-analyzer.ts` (CRIAR)
- `system/backend/src/game-engine/ai/ai-utility-scorer.ts` (CRIAR)
- `system/backend/src/game-engine/ai/ai-difficulty-profile.ts` (CRIAR)
- `system/backend/src/game-engine/ai/ai-debug-logger.ts` (CRIAR — adaptado para usar `console.log`)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/ai-local.ts`
- `system/frontend/src/app/shared/game-core/ai-strategy.ts`
- `system/frontend/src/app/shared/game-core/ai-decision-maker.ts`
- `system/frontend/src/app/shared/game-core/ai-action-generator.ts`
- `system/frontend/src/app/shared/game-core/ai-battle-types.ts`
- `system/frontend/src/app/shared/game-core/ai-ballistic-simulator.ts`
- `system/frontend/src/app/shared/game-core/ai-terrain-analyzer.ts`
- `system/frontend/src/app/shared/game-core/ai-utility-scorer.ts`
- `system/frontend/src/app/shared/game-core/ai-difficulty-profile.ts`
- `system/frontend/src/app/shared/game-core/ai-debug-logger.ts`
- `system/backend/src/game-engine/game-state.interface.ts`
- `system/backend/src/game-engine/physics/projectile-physics.ts` (para AIBallisticSimulator)

## O que NÃO deve mexer
- Arquivos de frontend
- Arquivos de physics/ que já foram criados por outros agentes

## Dependências obrigatórias
- Agent 001 (interfaces)
- Agent 002 (pasta ai/)
- Agent 003 (projectile-physics — AIBallisticSimulator pode precisar)
- Agent 005 (wind-system)
- Agent 006 (terrain-engine)

## Critérios de aceite
- [ ] `AiDecisionMaker.decide(state, aiPlayerId): BattleActionDto` — retorna ação completa para o servidor processar
- [ ] Sem Phaser
- [ ] Se o cálculo de IA demorar > 50ms, registrar log de aviso (risco de event loop)
- [ ] Fallback: se IA não conseguir calcular, retornar `{ type: 'pass_turn' }` + log de aviso

## Atenção sobre event loop
Se o AiDecisionMaker usar loops pesados (ex: simulação de múltiplas trajetórias), avaliar se deve ser executado com `setImmediate` ou em worker thread. No v1.8.0, usar `setImmediate` se o cálculo exceder 50ms detectado com `Date.now()`.

## Instrução para execução

```
Você é um desenvolvedor TypeScript sênior no projeto Rune Wars.

Sua tarefa é portar TODOS os arquivos de IA do frontend para o backend (game-engine/ai/).

1. Leia todos os arquivos de IA do frontend em system/frontend/src/app/shared/game-core/:
   ai-local.ts, ai-strategy.ts, ai-decision-maker.ts, ai-action-generator.ts,
   ai-battle-types.ts, ai-ballistic-simulator.ts, ai-terrain-analyzer.ts,
   ai-utility-scorer.ts, ai-difficulty-profile.ts, ai-debug-logger.ts

2. Leia as interfaces já criadas:
   system/backend/src/game-engine/game-state.interface.ts
   system/backend/src/game-engine/physics/projectile-physics.ts (se existir)

3. Porte TODOS para system/backend/src/game-engine/ai/

REGRAS OBRIGATÓRIAS:
- ZERO imports de Phaser
- AiDecisionMaker.decide(state, aiPlayerId) deve retornar objeto compatível com BattleActionDto
- Se IA não conseguir calcular: retornar { type: 'pass_turn' } + console.warn
- ai-debug-logger.ts: substituir qualquer logger de Phaser por console.log
- Se detectar cálculo pesado (> 50ms), marcar como risco no resumo

Ao terminar, crie resumo:
# Resumo — Agent 010: AI Engine
## Status
## O que foi feito
## Arquivos alterados (liste todos)
## Decisões tomadas
## Bugs encontrados
## Riscos ou pendências
## Recomendações para o orquestrador
```

## Memory — Agent 010

### Objetivo
Portar 9-10 arquivos de IA do frontend para backend/game-engine/ai/, sem Phaser.

### Arquivos autorizados
- CRIAR: ai-local.ts, ai-strategy.ts, ai-decision-maker.ts, ai-action-generator.ts, ai-battle-types.ts, ai-ballistic-simulator.ts, ai-terrain-analyzer.ts, ai-utility-scorer.ts, ai-difficulty-profile.ts, ai-debug-logger.ts

### Dependências
- Agent 001, 002, 003, 005, 006 devem estar concluídos

### Restrições
- Sem Phaser
- Fallback obrigatório para falha de cálculo
- Avaliar risco de event loop

### Critérios de aceite
- decide() retorna BattleActionDto-compatível
- Todos os 10 arquivos portados
