# Sub-spec — Agent 007: Weapon Definition + Weapon System

## Objetivo
Portar as definições de armas e o sistema de armas do frontend para o backend.

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/items/weapon-definition.ts` (CRIAR)
- `system/backend/src/game-engine/items/weapon-system.ts` (CRIAR)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/weapon-definition.ts`
- `system/frontend/src/app/shared/game-core/weapon-system.ts`
- `system/frontend/src/app/shared/game-core/weapon-requirements.ts`
- `system/backend/src/game-engine/game-state.interface.ts`

## Dependências obrigatórias
- Agent 001, Agent 002

## Critérios de aceite
- [ ] Todas as definições de armas portadas (configs de dano, ângulo, força, tipo)
- [ ] Sem Phaser
- [ ] Exporta `getWeaponDefinition(weaponId: string): WeaponDefinition`

## Instrução para execução

```
Porte weapon-definition.ts e weapon-system.ts do frontend para backend/src/game-engine/items/.

1. Leia: system/frontend/src/app/shared/game-core/weapon-definition.ts
2. Leia: system/frontend/src/app/shared/game-core/weapon-system.ts
3. Leia: system/frontend/src/app/shared/game-core/weapon-requirements.ts
4. Crie: system/backend/src/game-engine/items/weapon-definition.ts
5. Crie: system/backend/src/game-engine/items/weapon-system.ts

Sem Phaser. Mesma lógica.

Resumo: # Resumo — Agent 007: Weapon Definition
## Status / O que foi feito / Arquivos alterados / Bugs encontrados
```

## Memory — Agent 007

### Arquivos autorizados
- CRIAR: items/weapon-definition.ts, items/weapon-system.ts

### Dependências
- Agent 001, Agent 002
