# Sub-spec — Agent 005: Wind System

## Objetivo
Portar `wind-system.ts` do frontend para o backend. O WindSystem gera valores de vento aleatórios no início de cada turno. No backend, o servidor é a única autoridade sobre o vento (RN09).

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/physics/wind-system.ts` (CRIAR)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/wind-system.ts`
- `system/backend/src/game-engine/game-state.interface.ts`

## Dependências obrigatórias
- Agent 001, Agent 002

## Critérios de aceite
- [ ] Sem Phaser
- [ ] `WindSystem.generate(): WindState` — gera novo vento
- [ ] `WindSystem.current(): WindState` — retorna vento atual
- [ ] Usa `WindState` da interface do backend

## Instrução para execução

```
Você é um desenvolvedor TypeScript no projeto Rune Wars.

Porte wind-system.ts do frontend para o backend.

1. Leia: system/frontend/src/app/shared/game-core/wind-system.ts
2. Leia: system/backend/src/game-engine/game-state.interface.ts
3. Crie: system/backend/src/game-engine/physics/wind-system.ts

REGRAS: Sem Phaser. Sem modificar outros arquivos.

Resumo final:
# Resumo — Agent 005: Wind System
## Status / O que foi feito / Arquivos alterados / Bugs encontrados / Impacto em outros agentes
```

## Memory — Agent 005

### Objetivo
Portar wind-system.ts para backend/physics/.

### Arquivos autorizados
- CRIAR: system/backend/src/game-engine/physics/wind-system.ts

### Dependências
- Agent 001, Agent 002
