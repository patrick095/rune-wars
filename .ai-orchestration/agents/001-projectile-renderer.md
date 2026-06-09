# Agent-001 — Projectile Renderer (Fix A1: Explosão Instantânea)

## Status
Pendente

## Objetivo
Corrigir o delay de explosão do projétil. Atualmente `animateAlongPath` em `projectile-renderer.ts` usa timer de 16ms × N pontos sem verificar colisão durante a animação, causando delay de 3+ segundos. O fix é adicionar `checkImpact` callback que interrompe a animação imediatamente ao detectar terreno.

## Memory

### Objetivo
Adicionar parâmetro `checkImpact?: (x: number, y: number) => boolean` em `animateAlongPath`. Durante cada passo do timer, se `checkImpact(point.x, point.y)` retornar `true`, chamar `event.remove()` e `onComplete()` imediatamente.

### Contexto permitido
- projectile-renderer.ts: arquivo principal a modificar
- battle.scene.ts: consultar apenas para entender como `animateAlongPath` é chamado e passar `checkImpact`
- terrain-engine.ts: consultar apenas para entender `getMaterialAt` e `TerrainMaterial.EMPTY`

### Arquivos autorizados a alterar
- `src/app/shared/game-core/projectile-renderer.ts`
- `src/app/shared/game-core/battle.scene.ts` (apenas a chamada de `animateAlongPath` + passar checkImpact)

### Arquivos apenas consulta
- `src/app/shared/game-core/terrain-engine.ts`

### O que NÃO alterar
- Lógica de `ProjectilePhysics.simulate()` — o cálculo de trajetória está correto
- Qualquer outro sistema além do `animateAlongPath`

### Dependências
- Nenhuma (pode rodar em paralelo com Agent-002, 003, 004)

### Critérios de aceite
- Nova assinatura: `animateAlongPath(projectile, path, onComplete, checkImpact?)`
- Durante cada iteração do timer: verificar se `checkImpact` existe e se o ponto atual é terreno
- Se sim: parar timer + reposicionar projétil + chamar onComplete
- Em battle.scene.ts: passar `(x, y) => this.terrainEngine.getMaterialAt(x, y) !== TerrainMaterial.EMPTY`
- TypeScript sem erros

### Instrução de execução
```
Implemente o Fix A1 de explosão instantânea no arquivo projectile-renderer.ts.
Adicione o parâmetro checkImpact?: (x: number, y: number) => boolean na assinatura de animateAlongPath.
Durante o timer de animação, a cada passo, verificar se checkImpact retorna true para o ponto atual.
Se sim, parar o timer imediatamente, posicionar o projétil no ponto de impacto e chamar onComplete.
Em battle.scene.ts, localizar a chamada de animateAlongPath e passar o callback: (x, y) => this.terrainEngine.getMaterialAt(x, y) !== TerrainMaterial.EMPTY.
Garantir que TypeScript compile sem erros.
Atualizar o estado em .ai-orchestration/ORCHESTRATION_STATE.md, AGENTS_QUEUE.md e FILES_CHANGED.md após cada arquivo alterado.
Ao finalizar, criar .ai-orchestration/agents/001-projectile-renderer.md com o resumo.
```

## O que foi feito
(pendente)

## Arquivos alterados
(pendente)

## Arquivos consultados
(pendente)

## Decisões tomadas
(pendente)

## Bugs encontrados
(pendente)

## Riscos ou pendências
- Se `battle.scene.ts` tiver múltiplas chamadas de `animateAlongPath`, todas precisam receber o callback.

## Impacto em outros agentes
- Agent-010 (shot-modifier-system): quando x3 ou +1 forem implementados, `animateAlongPath` será chamado múltiplas vezes — a assinatura nova deve ser compatível.

## Próximos agentes afetados
- Agent-010, Agent-011

## Recomendações para o orquestrador
Verificar se há mais de uma chamada a `animateAlongPath` em `battle.scene.ts` antes de liberar Agent-010.
