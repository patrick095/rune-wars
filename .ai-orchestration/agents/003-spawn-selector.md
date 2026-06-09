# Agent-003 — Spawn Selector (Fix A3: Spawn Points Inválidos)

## Status
Pendente

## Objetivo
Corrigir spawns que iniciam o player em queda imediata. A função `selectSpawns` deve receber opcionalmente o `TerrainEngine` e filtrar pontos sem chão sólido dentro de 3 células abaixo do spawn. Fallback se zero spawns válidos.

## Memory

### Objetivo
Fix A3: validar spawn points usando `getFloorBelow` antes de usá-los.

### Contexto permitido
- `spawn-selector.ts`: arquivo principal a modificar
- `terrain-engine.ts`: consultar `getFloorBelow`, `CELL_SIZE`
- `battle.scene.ts`: consultar para entender a chamada de `selectSpawns` e passar `terrainEngine`

### Arquivos autorizados a alterar
- `src/app/shared/game-core/spawn-selector.ts`
- `src/app/shared/game-core/battle.scene.ts` (apenas a chamada de `selectSpawns` para passar `this.terrainEngine`)

### Arquivos apenas consulta
- `src/app/shared/game-core/terrain-engine.ts`

### O que NÃO alterar
- Lógica de posicionamento do player após spawn
- Qualquer outra parte de `battle.scene.ts`

### Dependências
- Nenhuma (paralelo com Agent-001, 002, 004)

### Critérios de aceite
- Nova assinatura: `selectSpawns(spawnPoints, count, engine?: TerrainEngine)`
- Se `engine` presente: filtrar spawns onde `getFloorBelow(x, spawnY + 3*CELL_SIZE)` retorna null
- Embaralhar os válidos e pegar `count` deles
- Se zero válidos, retornar array vazio (battle.scene usa fallback fixo de 10% e 90% horizontal)
- Console.warn para cada spawn descartado: `[Spawn] Ponto (col, row) descartado: sem chão próximo`
- TypeScript sem erros

### Instrução de execução
```
Implemente o Fix A3 do spec v1.4.0.
Em spawn-selector.ts, adicionar parâmetro opcional engine?: TerrainEngine na assinatura de selectSpawns.
Quando engine for fornecido, filtrar spawns onde getFloorBelow(x, spawnY + 3 * CELL_SIZE) retorna null.
Logar cada descarte com [Spawn].
Se nenhum spawn válido, retornar array vazio.
Em battle.scene.ts, localizar chamada de selectSpawns e passar this.terrainEngine.
Verificar se existe lógica de fallback para array vazio; se não existir, implementar: usar posição x=10% e x=90% do worldWidth com getFloorBelow a partir do centro vertical.
Atualizar .ai-orchestration/ após cada arquivo alterado.
```

## Riscos ou pendências
- Verificar a assinatura atual de `getFloorBelow` para entender os parâmetros corretos
- O fallback precisa ser robusto — crash em produção se não existir
