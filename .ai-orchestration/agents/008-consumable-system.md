# Sub-spec — Agent 008: Consumable System + Secondary Item System

## Objetivo
Portar `consumable-system.ts` e `secondary-item-system.ts` do frontend para o backend. O servidor é a única autoridade sobre uso de consumíveis (RN06).

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/items/consumable-system.ts` (CRIAR)
- `system/backend/src/game-engine/items/secondary-item-system.ts` (CRIAR)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/consumable-system.ts`
- `system/frontend/src/app/shared/game-core/secondary-item-system.ts`
- `system/frontend/src/app/shared/game-core/item-catalog.ts`
- `system/backend/src/game-engine/game-state.interface.ts`

## Dependências obrigatórias
- Agent 001, Agent 002

## Critérios de aceite
- [ ] `canUseConsumable(state, characterId, consumableId): boolean` — valida se pode usar
- [ ] `applyConsumable(state, characterId, consumableId): void` — aplica efeito e marca como usado
- [ ] `consumablesUsed` rastreado no `ServerPlayerState`
- [ ] Sem Phaser

## Instrução para execução

```
Porte consumable-system.ts e secondary-item-system.ts do frontend para backend/src/game-engine/items/.

1. Leia: system/frontend/src/app/shared/game-core/consumable-system.ts
2. Leia: system/frontend/src/app/shared/game-core/secondary-item-system.ts
3. Leia: system/frontend/src/app/shared/game-core/item-catalog.ts
4. Leia: system/backend/src/game-engine/game-state.interface.ts
5. Crie os arquivos no backend sem Phaser.

Atenção: O servidor deve rastrear quais consumíveis foram usados (RN06: 1 uso por partida).

Resumo: # Resumo — Agent 008: Consumable System
## Status / O que foi feito / Arquivos alterados / Bugs encontrados / Impacto em outros agentes
```

## Memory — Agent 008

### Arquivos autorizados
- CRIAR: items/consumable-system.ts, items/secondary-item-system.ts

### Dependências
- Agent 001, Agent 002

### Restrições
- Sem Phaser
- Rastrear consumíveis usados no ServerPlayerState
