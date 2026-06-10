# Sub-spec — Agente 002: Atualizar terrain-types.ts

## Objetivo exato
Atualizar o arquivo `terrain-types.ts` para suportar o novo motor bitmap: adicionar `WORLD_WIDTH`/`WORLD_HEIGHT`, deprecar `CELL_SIZE` como alias = 1, remover `cellsDestroyed` de `ExplosionResult`, e remover `TerrainCell` e `TERRAIN_MATERIAL_CONFIGS` (não mais usados pelo novo motor).

## Contexto mínimo necessário
- Arquivo atual: `system/frontend/src/app/shared/game-core/terrain-types.ts` (24 linhas)
- `CELL_SIZE = 8` → manter como `CELL_SIZE = 1` (alias para compatibilidade, mas deprecado)
- `WORLD_WIDTH = 1672`, `WORLD_HEIGHT = 941` → novos exports
- `ExplosionResult` → remover campo `cellsDestroyed: TerrainCell[]`; manter apenas `center` e `radius`
- `TerrainMaterial` enum → manter (ainda usado por API pública do engine)
- `TerrainCell` interface → remover (não usada no novo sistema)
- `TERRAIN_MATERIAL_CONFIGS` → remover (tiles coloridos não são mais renderizados)

## Arquivos que pode alterar
- `system/frontend/src/app/shared/game-core/terrain-types.ts`

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/terrain-engine.ts` — para entender quais tipos são importados

## O que NÃO deve mexer
- Nenhum outro arquivo TypeScript
- Nenhum arquivo de renderer, scene ou JSON

## Dependências obrigatórias
- Nenhuma

## Critérios de aceite
- [ ] `WORLD_WIDTH = 1672` exportado
- [ ] `WORLD_HEIGHT = 941` exportado
- [ ] `CELL_SIZE = 1` mantido (deprecado, alias)
- [ ] `ExplosionResult` contém apenas `center: {x, y}` e `radius: number`
- [ ] `TerrainMaterial` enum preservado
- [ ] Arquivo compila sem erros isoladamente

## Instrução exata para execução
```
Você é o Agente 002. Leia .ai-orchestration/agents/002-terrain-types.md para seu escopo completo.

Sua tarefa:
1. Ler system/frontend/src/app/shared/game-core/terrain-types.ts (arquivo atual, 24 linhas)
2. Aplicar as mudanças descritas no sub-spec
3. Criar .ai-orchestration/agents/002-terrain-types-resumo.md com status e diff resumido

Mudanças específicas:
- Adicionar: export const WORLD_WIDTH = 1672;
- Adicionar: export const WORLD_HEIGHT = 941;
- Alterar: CELL_SIZE de 8 para 1 (manter export, valor deprecado)
- Remover: interface TerrainCell
- Remover: TERRAIN_MATERIAL_CONFIGS (e seu tipo TerrainMaterialConfig se existir)
- Modificar: ExplosionResult — remover campo cellsDestroyed, manter center e radius
- Manter: enum TerrainMaterial
```

## Formato obrigatório do resumo final
Criar `.ai-orchestration/agents/002-terrain-types-resumo.md` com:
- Status, arquivos alterados, decisões tomadas, bugs encontrados

---

## Memory — Agente 002: Atualizar terrain-types.ts

### Objetivo
Atualizar terrain-types.ts para o novo motor bitmap: WORLD_WIDTH/HEIGHT, CELL_SIZE deprecado, ExplosionResult sem cellsDestroyed.

### Contexto permitido
- Arquivo terrain-types.ts (24 linhas)
- Arquivo terrain-engine.ts (apenas consulta para entender imports)

### Arquivos autorizados
- Modificar: `system/frontend/src/app/shared/game-core/terrain-types.ts`

### Dependências
- Nenhuma

### Restrições
- NÃO alterar terrain-engine.ts, terrain-renderer.ts ou qualquer outro arquivo
- NÃO remover TerrainMaterial enum — ainda usado pela API pública

### Critérios de aceite
- WORLD_WIDTH = 1672, WORLD_HEIGHT = 941 exportados
- CELL_SIZE = 1 mantido
- ExplosionResult: apenas {center: {x,y}, radius}
- TerrainMaterial preservado
