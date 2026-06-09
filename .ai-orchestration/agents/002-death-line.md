# Agent-002 — Death Line (Fix A2: Tiro Durante Queda + Linha de Morte)

## Status
Pendente

## Objetivo
Dois fixes relacionados à queda do personagem:
1. Impedir que o player atire enquanto estiver em queda (`isFalling === true`)
2. Implementar death line: quando `sprite.y > worldHeight * 1.05`, o personagem morre imediatamente

## Memory

### Objetivo
Fix A2 do spec v1.4.0: impedir tiro durante queda e implementar death line.

### Contexto permitido
- `character-fall.ts`: arquivo principal (death line no `update()`)
- `battle.scene.ts`: adicionar guard em `startChargingPower()`
- `terrain-engine.ts`: consultar apenas para entender `worldHeight`

### Arquivos autorizados a alterar
- `src/app/shared/game-core/character-fall.ts`
- `src/app/shared/game-core/battle.scene.ts` (apenas guard em `startChargingPower`)

### Arquivos apenas consulta
- `src/app/shared/game-core/terrain-engine.ts`

### O que NÃO alterar
- Sistema de HP ou tela de game over (apenas retornar 'dead' para o fluxo existente)
- Qualquer outra lógica de `battle.scene.ts` além do guard em startChargingPower

### Dependências
- Nenhuma (paralelo com Agent-001, 003, 004)

### Critérios de aceite
- `character-fall.ts`: no método `update()`, antes do movimento, verificar `if (sprite.y > engine.worldHeight * 1.05) return 'dead'`
- `battle.scene.ts`: em `startChargingPower`, adicionar `if (this.playerFall.isFalling) return;` no início
- O retorno `'dead'` deve ser tratado pelo fluxo existente de morte (verificar como outros retornos de `update()` são tratados)
- Console.warn: `[Fall] Player cruzou death line em y=${sprite.y}`
- TypeScript sem erros

### Instrução de execução
```
Implemente o Fix A2 do spec v1.4.0.
Em character-fall.ts, no método update(), adicionar verificação: se sprite.y > engine.worldHeight * 1.05, logar [Fall] no console e retornar 'dead'.
Em battle.scene.ts, localizar o método startChargingPower e adicionar no início: if (this.playerFall.isFalling) return;
Verificar como o retorno 'dead' de character-fall.update() é tratado — garantir que dispara a tela de derrota.
Atualizar .ai-orchestration/ após cada arquivo alterado.
Criar resumo em .ai-orchestration/agents/002-death-line.md ao finalizar.
```

## O que foi feito
(pendente)

## Bugs encontrados
(pendente)

## Riscos ou pendências
- O retorno `'dead'` pode não estar tipado — verificar interface do CharacterFall
- Verificar se `isFalling` é uma propriedade pública em CharacterFall
