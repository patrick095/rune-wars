# Sub-spec — Agent 009: Status Effect Manager + Shot Modifier System

## Objetivo
Portar `status-effect-manager.ts` e `shot-modifier-system.ts` do frontend para o backend. Status effects (FREEZE, WEAK_SHOT, ITEM_BLOCK) são rastreados no servidor e aplicados antes de processar ações (RN11).

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/items/status-effect-manager.ts` (CRIAR)
- `system/backend/src/game-engine/items/shot-modifier-system.ts` (CRIAR)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/status-effect-manager.ts`
- `system/frontend/src/app/shared/game-core/shot-modifier-system.ts`
- `system/backend/src/game-engine/game-state.interface.ts`

## Dependências obrigatórias
- Agent 001, Agent 002

## Critérios de aceite
- [ ] `hasEffect(player, effectType): boolean`
- [ ] `applyEffect(player, effectEntry): void`
- [ ] `tickEffects(player): void` — decrementa turnsRemaining
- [ ] FREEZE bloqueia shoot, ITEM_BLOCK bloqueia consumíveis
- [ ] Sem Phaser

## Instrução para execução

```
Porte status-effect-manager.ts e shot-modifier-system.ts do frontend para backend/src/game-engine/items/.

1. Leia: system/frontend/src/app/shared/game-core/status-effect-manager.ts
2. Leia: system/frontend/src/app/shared/game-core/shot-modifier-system.ts
3. Leia: system/backend/src/game-engine/game-state.interface.ts (StatusEffectEntry)
4. Crie os arquivos no backend.

Sem Phaser. FREEZE bloqueia shoot. ITEM_BLOCK bloqueia consumíveis.

Resumo: # Resumo — Agent 009: Status + Shot Modifier
## Status / O que foi feito / Arquivos alterados / Bugs encontrados
```

## Memory — Agent 009

### Arquivos autorizados
- CRIAR: items/status-effect-manager.ts, items/shot-modifier-system.ts

### Dependências
- Agent 001, Agent 002
