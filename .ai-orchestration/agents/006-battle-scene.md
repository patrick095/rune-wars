# Sub-spec — Agente 006: Atualizar battle.scene.ts

## Objetivo exato
Atualizar `battle.scene.ts` para: (1) renomear `castle` → `mystic_castle`, (2) carregar `background.png` e `terrain.png` dos assets reais, (3) inicializar `TerrainEngine.fromImageData()` em vez de carregar grid JSON, (4) instanciar `TerrainRenderer` com os novos keys, (5) chamar `terrainRenderer.applyExplosion()` em vez de `updateCells()`, (6) ajustar camera bounds para `WORLD_WIDTH × WORLD_HEIGHT`.

## Contexto mínimo necessário

### Arquivo
Localização: `system/frontend/src/game/scenes/battle.scene.ts` (**3138 linhas**)

**ATENÇÃO:** Este é um arquivo muito grande. Leia apenas as seções relevantes:
- Busque por: `castle`, `terrain`, `TerrainEngine`, `TerrainRenderer`, `preload`, `create`, `CELL_SIZE`, `terrain-textures`, `updateCells`, `spawnPoints`, `camera`, `worldBounds`

### Mudanças específicas

#### 1. Renomear castle → mystic_castle
- No type `MapName` (ou string union equivalente): trocar `'castle'` por `'mystic_castle'`
- No array `BATTLE_MAPS` (ou equivalente): trocar `castle` por `mystic_castle`
- Em qualquer switch/case ou if que use `castle` como mapa PVP

#### 2. Adicionar mapeamento MAP_ASSET_FOLDER
```typescript
const MAP_ASSET_FOLDER: Record<string, string> = {
  plains:         'plains',
  mystic_castle:  'mystic-castle',
  deep_mines:     'deep-mines',
  arcane_ruins:   'arcane-ruins',
  runic_forest:   'runic-forest',
};
```

#### 3. Atualizar preload()
```typescript
preload(): void {
  const folder = MAP_ASSET_FOLDER[this.currentMap];
  this.load.image(`map_${this.currentMap}_bg`,      `assets/maps/${folder}/background.png`);
  this.load.image(`map_${this.currentMap}_terrain`,  `assets/maps/${folder}/terrain.png`);
  // ... demais assets (manter os existentes)
}
```
- REMOVER: import e uso de `terrain-textures.ts`

#### 4. Atualizar create() — inicializar motor
```typescript
create(): void {
  // Ler pixel data da textura de terrain carregada
  const terrainKey = `map_${this.currentMap}_terrain`;
  const bgKey = `map_${this.currentMap}_bg`;
  const imgData = this.getTerrainImageData(terrainKey);
  this.terrainEngine = TerrainEngine.fromImageData(imgData);
  this.terrainRenderer = new TerrainRenderer(this, bgKey, terrainKey);
  // ...
}

private getTerrainImageData(key: string): ImageData {
  const source = this.textures.get(key).getSourceImage() as HTMLImageElement;
  const canvas = document.createElement('canvas');
  canvas.width = source.naturalWidth;
  canvas.height = source.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
```
- REMOVER: loading de map JSON com grid
- REMOVER: passagem de grid para TerrainEngine constructor

#### 5. Atualizar explosão
Buscar por `updateCells` ou qualquer método do renderer que receba células afetadas:
```typescript
// Substituir:
// this.terrainRenderer.updateCells(explosionResult.cellsDestroyed);
// Por:
this.terrainRenderer.applyExplosion(cx, cy, radius);
```
Onde `cx, cy, radius` vêm do `ExplosionResult` (novo formato: `{center: {x, y}, radius}`).

#### 6. Atualizar camera bounds
```typescript
this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
// Se havia: setBounds baseado em GRID_COLS * CELL_SIZE, substituir
```

#### 7. Atualizar spawn points
Os spawn points dos JSONs agora são `{x, y}`. Qualquer código que lia `spawnPoint.col`/`spawnPoint.row` e multiplicava por `CELL_SIZE` deve ser atualizado para usar `spawnPoint.x`/`spawnPoint.y` diretamente.

## Arquivos que pode alterar
- `system/frontend/src/game/scenes/battle.scene.ts`

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/terrain-types.ts` — imports atualizados
- `system/frontend/src/app/shared/game-core/terrain-engine.ts` — nova API
- `system/frontend/src/game/terrain/terrain-renderer.ts` — nova API
- `system/frontend/src/game/terrain/spawn-selector.ts` — nova API
- `.ai-orchestration/agents/003-terrain-engine-resumo.md` — confirmar API disponível
- `.ai-orchestration/agents/004-terrain-renderer-resumo.md` — confirmar API disponível
- `.ai-orchestration/agents/005-spawn-selector-resumo.md` — confirmar API disponível

## O que NÃO deve mexer
- `terrain-engine.ts`, `terrain-renderer.ts`, `terrain-types.ts`, `spawn-selector.ts`
- JSONs de mapa (Agente 007 cuida)
- Nenhuma funcionalidade de dungeon, academy ou outros modes

## Dependências obrigatórias
- Agentes 003, 004, 005 devem ter concluído

## Critérios de aceite
- [ ] `castle` → `mystic_castle` em todo o arquivo
- [ ] `preload()` carrega `background.png` e `terrain.png` de `assets/maps/{folder}/`
- [ ] `create()` chama `TerrainEngine.fromImageData()` e `new TerrainRenderer(scene, bgKey, terrainKey)`
- [ ] `terrainRenderer.applyExplosion(cx, cy, r)` chamado após explosão
- [ ] Camera bounds usa `WORLD_WIDTH` e `WORLD_HEIGHT`
- [ ] Sem import de `terrain-textures.ts`
- [ ] Spawn points lidos como `{x, y}` (sem col/row)
- [ ] Funcionalidades de dungeon/academy não quebradas

## Instrução exata para execução
```
Você é o Agente 006. Leia .ai-orchestration/agents/006-battle-scene.md para seu escopo completo.

Pré-requisitos: confirme que Agentes 003, 004 e 005 concluíram (arquivos -resumo.md com status Concluído).

Este arquivo tem 3138 linhas. Use grep/search para localizar as seções relevantes:
- grep para: castle, TerrainEngine, TerrainRenderer, preload(), updateCells, spawnPoints, worldBounds, CELL_SIZE, terrain-textures

Realize apenas as alterações listadas no sub-spec. NÃO refatore código fora do escopo.

Criar .ai-orchestration/agents/006-battle-scene-resumo.md com status e lista de alterações.
```

---

## Memory — Agente 006: Atualizar battle.scene.ts

### Objetivo
Integrar o novo motor bitmap na BattleScene: preload com assets reais, TerrainEngine.fromImageData(), TerrainRenderer com novos keys, explosão via applyExplosion().

### Contexto permitido
- battle.scene.ts (3138 linhas) — modificar apenas seções relevantes ao terrain
- terrain-types.ts, terrain-engine.ts, terrain-renderer.ts, spawn-selector.ts — apenas consultar

### Arquivos autorizados
- Modificar: `system/frontend/src/game/scenes/battle.scene.ts`

### Dependências
- Agentes 003, 004, 005 devem ter concluído

### Restrições
- NÃO alterar engine, renderer, types ou selector
- NÃO alterar JSONs (Agente 007)
- NÃO refatorar código fora do escopo de terrain/mapa
- NÃO quebrar dungeon/academy

### Critérios de aceite
- castle → mystic_castle
- preload com assets reais
- TerrainEngine.fromImageData()
- applyExplosion() em vez de updateCells()
- Camera bounds WORLD_WIDTH × WORLD_HEIGHT
- Compila
