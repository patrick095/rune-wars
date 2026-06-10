# Sub-spec — Agente 005: Atualizar spawn-selector.ts

## Objetivo exato
Atualizar `spawn-selector.ts` para usar coordenadas de pixel `{x: number, y: number}` em vez de `{col: number, row: number}`. A lógica de seleção de spawns deve trabalhar diretamente com coordenadas de pixel do mundo.

## Contexto mínimo necessário

### Arquivo atual
Localização: `system/frontend/src/game/terrain/spawn-selector.ts` (54 linhas)
Atual: `SpawnPoint` = `{col: number, row: number}`, `spawnToWorld()` converte col/row para pixels multiplicando por CELL_SIZE.

### Nova estrutura
```typescript
import { WORLD_WIDTH, WORLD_HEIGHT } from '../../app/shared/game-core/terrain-types';

export interface SpawnPoint {
  x: number;  // coordenada de pixel no espaço de mundo
  y: number;
}

// spawnToWorld() pode ser simplificado ou eliminado:
// No novo sistema, SpawnPoint já é {x, y} no espaço de mundo.
// Se mantido, retorna {x, y} diretamente.

export function selectSpawns(
  spawnPoints: SpawnPoint[],
  playerCount: number
): SpawnPoint[]
```

### Lógica de selectSpawns
- Recebe array de SpawnPoint (já em pixels)
- Retorna `playerCount` pontos distribuídos
- Manter a lógica de distribuição existente (ou simplificação se a atual era baseada em grid)

## Arquivos que pode alterar
- `system/frontend/src/game/terrain/spawn-selector.ts`

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/terrain-types.ts` — para imports
- `system/frontend/src/game/scenes/battle.scene.ts` — para entender como spawn-selector é usado (APENAS LEITURA; não alterar)

## O que NÃO deve mexer
- `battle.scene.ts`
- JSONs de mapa
- `terrain-engine.ts`

## Dependências obrigatórias
- Agente 002 (terrain-types.ts com WORLD_WIDTH/WORLD_HEIGHT)

## Critérios de aceite
- [ ] `SpawnPoint` = `{x: number, y: number}`
- [ ] Sem referência a `col`, `row`, `CELL_SIZE` na lógica de conversão
- [ ] `selectSpawns()` funcional com coordenadas pixel
- [ ] Compila sem erros TypeScript

## Instrução exata para execução
```
Você é o Agente 005. Leia .ai-orchestration/agents/005-spawn-selector.md para seu escopo completo.

Pré-requisito: confirme que Agente 002 concluiu (arquivo .ai-orchestration/agents/002-terrain-types-resumo.md existe com status Concluído).

Sua tarefa:
1. Ler system/frontend/src/game/terrain/spawn-selector.ts (54 linhas)
2. Ler (apenas) system/frontend/src/game/scenes/battle.scene.ts — buscar como SpawnPoint e selectSpawns() são usados
3. Atualizar spawn-selector.ts conforme o sub-spec
4. Criar .ai-orchestration/agents/005-spawn-selector-resumo.md com status
```

---

## Memory — Agente 005: Atualizar spawn-selector.ts

### Objetivo
Migrar SpawnPoint de {col, row} para {x, y} em pixels. Atualizar selectSpawns().

### Contexto permitido
- spawn-selector.ts (54 linhas) — modificar
- terrain-types.ts — apenas importar
- battle.scene.ts — apenas consultar como spawn-selector é usado

### Arquivos autorizados
- Modificar: `system/frontend/src/game/terrain/spawn-selector.ts`

### Dependências
- Agente 002 deve ter concluído

### Restrições
- NÃO alterar battle.scene.ts (Agente 006 cuida)
- NÃO alterar JSONs

### Critérios de aceite
- SpawnPoint = {x, y}
- Sem col/row/CELL_SIZE
- selectSpawns() funcional
- Compila
