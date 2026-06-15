# Sub-spec — Agent 011: Action Validator + Violation Tracker

## Objetivo
Criar `action-validator.ts` e `violation-tracker.ts` — as camadas de segurança do motor autoritativo. Implementam as regras de negócio RN03–RN07.

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/validation/action-validator.ts` (CRIAR)
- `system/backend/src/game-engine/validation/violation-tracker.ts` (CRIAR)

## Arquivos que deve apenas consultar
- `system/backend/src/game-engine/game-state.interface.ts`

## Dependências obrigatórias
- Agent 001, Agent 002

## Regras de negócio a implementar

**ActionValidator:**
- Valida `force`: deve estar entre 5 e 100
- Valida `angle`: dentro dos limites da arma
- Valida tipo de ação permitido no estado atual
- Retorna `{ ok: boolean, reason?: string }`

**ViolationTracker:**
- Rastreia `violationCount` por jogador no `ServerPlayerState`
- N=3 → chama `passTurn(state, characterId)`
- N=6 → chama `declareLoser(state, characterId)`
- Constantes exportadas: `VIOLATION_TURN_SKIP = 3`, `VIOLATION_MAX = 6`
- Log obrigatório: `[GameEngine] Violação detectada [char]: REASON (desvio: Xpx) [N/3]`

**POSITION_TOLERANCE_PX = 80**

## Critérios de aceite
- [ ] `ActionValidator.validate(dto, state): { ok: boolean, reason?: string }`
- [ ] `ViolationTracker.record(state, characterId, reason): PenaltyResult`
- [ ] `PenaltyResult.penaltyApplied?: 'TURN_SKIP' | 'DEFEAT'`
- [ ] Sem Phaser
- [ ] Constantes exportadas para uso no GameEngineService

## Instrução para execução

```
Você é um desenvolvedor TypeScript sênior no projeto Rune Wars.

Crie dois arquivos de segurança para o motor autoritativo v1.8.0:

1. Leia: system/backend/src/game-engine/game-state.interface.ts

2. Crie: system/backend/src/game-engine/validation/action-validator.ts
   - Classe ou funções que validam o payload de ação
   - Valida force (5-100), angle (limites da arma), tipo de ação
   - Retorna { ok: boolean, reason?: string }
   - Exportar: POSITION_TOLERANCE_PX = 80

3. Crie: system/backend/src/game-engine/validation/violation-tracker.ts
   - Função record(state, characterId, reason) que:
     - Incrementa violationCount
     - Se count === 3: aplica TURN_SKIP
     - Se count === 6: aplica DEFEAT
   - Exportar: VIOLATION_TURN_SKIP = 3, VIOLATION_MAX = 6
   - Tipo PenaltyResult: { penaltyApplied?: 'TURN_SKIP' | 'DEFEAT' }

Resumo: # Resumo — Agent 011: Validator + Tracker
## Status / O que foi feito / Arquivos criados / Bugs encontrados
```

## Memory — Agent 011

### Arquivos autorizados
- CRIAR: validation/action-validator.ts, validation/violation-tracker.ts

### Dependências
- Agent 001, Agent 002

### Restrições
- Sem Phaser
- POSITION_TOLERANCE_PX = 80, VIOLATION_TURN_SKIP = 3, VIOLATION_MAX = 6
