# Sub-spec — Agent 004: Damage Calculator

## Objetivo
Portar `damage-calculator.ts` do frontend para o backend sem dependências de Phaser.

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/physics/damage-calculator.ts` (CRIAR)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/damage-calculator.ts` — fonte original
- `system/frontend/src/app/shared/game-core/types.ts`
- `system/backend/src/game-engine/game-state.interface.ts`

## O que NÃO deve mexer
- Qualquer arquivo fora do alvo

## Dependências obrigatórias
- Agent 001, Agent 002

## Critérios de aceite
- [ ] Sem Phaser
- [ ] Calcula dano baseado em distância de impacto, atributos do personagem e arma
- [ ] Output idêntico ao frontend para inputs idênticos

## Instrução para execução

```
Você é um desenvolvedor TypeScript sênior no projeto Rune Wars.

Sua tarefa é portar o calculador de dano do frontend para o backend.

1. Leia: system/frontend/src/app/shared/game-core/damage-calculator.ts
2. Leia: system/frontend/src/app/shared/game-core/types.ts
3. Leia: system/backend/src/game-engine/game-state.interface.ts

4. Crie: system/backend/src/game-engine/physics/damage-calculator.ts

REGRAS:
- ZERO imports de Phaser
- Mesma lógica do original
- TypeScript puro

Ao terminar, crie resumo:
# Resumo — Agent 004: Damage Calculator
## Status
## O que foi feito
## Arquivos alterados
## Decisões tomadas
## Bugs encontrados
## Impacto em outros agentes
```

## Memory — Agent 004

### Objetivo
Portar damage-calculator.ts para backend/physics/, sem Phaser.

### Arquivos autorizados
- CRIAR: system/backend/src/game-engine/physics/damage-calculator.ts

### Dependências
- Agent 001, Agent 002

### Restrições
- Sem Phaser, lógica idêntica ao original
