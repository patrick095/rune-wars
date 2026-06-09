# Agent-015 — Grid Expansion (Fix A6: GRID_COLS=450, GRID_ROWS=160)

## Status
Pendente

## Objetivo
Expandir o grid de 300×80 para 450×160. Atualizar `terrain-engine.ts`, ajustar zoom da câmera para 0.7 em `battle.scene.ts`. Atualizar todos os mapas JSON existentes para ter `meta.cols=450, meta.rows=160` (ou pelo menos plains e castle com novo design de ilhas flutuantes).

## Memory

### Objetivo
Fix A6: expandir grid e redesenhar mapas plains e castle.

### Contexto permitido
- `src/app/shared/game-core/terrain-engine.ts`: alterar GRID_COLS e GRID_ROWS
- `src/app/shared/game-core/battle.scene.ts`: ajustar zoom de 0.9 para 0.7
- Mapas JSON em `src/assets/maps/` ou equivalente (verificar path real)

### Arquivos autorizados a alterar
- `src/app/shared/game-core/terrain-engine.ts`
- `src/app/shared/game-core/battle.scene.ts` (apenas zoom)
- Todos os mapas JSON (atualizar meta.cols e meta.rows)
- `map-plains.json` e `map-castle.json`: redesenhar com estrutura de ilhas flutuantes 450×160

### O que NÃO alterar
- Lógica de física ou colisão
- CELL_SIZE (mantém 8)

### Dependências
- Após Fase 1 (Agents 001-004) para não conflitar em battle.scene.ts e terrain-engine.ts

### Critérios de aceite
- `GRID_COLS = 450` e `GRID_ROWS = 160` em terrain-engine.ts
- Zoom inicial da câmera = 0.7 em battle.scene.ts
- Todos os mapas JSON têm `meta.cols=450, meta.rows=160`
- `map-plains.json`: novo layout com ilhas flutuantes, spawns válidos nos platos
- `map-castle.json`: novo layout com ilhas flutuantes, spawns válidos
- Outros mapas: atualizar meta mas manter grid existente (expandido com espaço vazio)
- Mundo = 3600×1280px (450×8 × 160×8)
- Nenhum crash ao carregar qualquer mapa
- TypeScript sem erros

### Instrução de execução
```
Implemente o Fix A6 do spec v1.4.0 (Grid Expansion).
Em terrain-engine.ts, alterar GRID_COLS de 300 para 450 e GRID_ROWS de 80 para 160.
Em battle.scene.ts, localizar onde o zoom da câmera é definido e alterar de 0.9 para 0.7.
Localizar a pasta de mapas JSON (assets/maps/ ou similar).
Para cada mapa JSON, atualizar meta.cols e meta.rows para 450 e 160.
Para map-plains.json e map-castle.json: redesenhar completamente com layout de ilhas flutuantes (3-5 ilhas em diferentes alturas, terreno acidentado, múltiplas plataformas). Os spawn points devem ficar nas superfícies das ilhas.
Para os outros 6 mapas: manter o terreno existente centrado/adaptado e preencher o espaço novo com células EMPTY.
AVISO: os JSONs podem ser grandes. Gerar programaticamente a partir do layout desenhado.
Atualizar .ai-orchestration/ após cada arquivo alterado.
```

## Riscos ou pendências
- Mapas 450×160 = 72.000 células por mapa. JSON pode ser > 5MB — considerar formato RLE ou comprimir
- O redesenho de plains e castle com ilhas flutuantes requer julgamento de game design — seguir referência de Worms/Terraria
- Outros mapas além de plains e castle podem ser expandidos trivialmente (padding com EMPTY)
