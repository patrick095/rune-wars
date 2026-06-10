# Sub-spec — Agente 003: Reescrever terrain-engine.ts

## Objetivo exato
Reescrever os internals de `terrain-engine.ts` substituindo o `grid: TerrainMaterial[][]` por um `Uint8Array` flat (bitmap, 1 byte/pixel). Implementar `fromImageData()` estático, preservar toda a API pública existente, e adaptar `drawRunicLine` e `placeRunicBlock` para coordenadas de pixel.

## Contexto mínimo necessário

### Arquivo atual
`system/frontend/src/app/shared/game-core/terrain-engine.ts` (222 linhas)
- Internals: `grid: TerrainMaterial[][]`, `GRID_COLS = 450`, `GRID_ROWS = 160`
- API pública a PRESERVAR obrigatoriamente:
  - `getMaterialAt(wx, wy): TerrainMaterial`
  - `explode(cx, cy, radius): ExplosionResult`
  - `getFloorBelow(wx, wy): number | null`
  - `drawRunicLine(x1, y1, x2, y2, playerId): DrawResult | null`
  - `placeRunicBlock(wx, wy, playerId): boolean`
- `MapMeta` interface: manter mas atualizar `spawnPoints` para `{x, y}` pixels

### Novos internals
```typescript
export const WORLD_WIDTH = 1672;   // de terrain-types.ts
export const WORLD_HEIGHT = 941;   // de terrain-types.ts

export class TerrainEngine {
  private bitmap: Uint8Array; // 1 byte/pixel: 1=sólido, 0=vazio
  private width: number;
  private height: number;

  static fromImageData(data: ImageData): TerrainEngine
  static empty(width: number, height: number): TerrainEngine // fallback

  getMaterialAt(wx, wy): TerrainMaterial        // lê bitmap
  explode(cx, cy, radius): ExplosionResult       // zera pixels no círculo
  getFloorBelow(wx, wy): number | null           // scan vertical
  drawRunicLine(x1, y1, x2, y2, playerId)       // adaptar para pixels
  placeRunicBlock(wx, wy, playerId): boolean     // adaptar para pixels
}
```

### Lógica de explosão (bitmap)
```typescript
explode(cx, cy, radius) {
  const r2 = radius * radius;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx*dx + dy*dy <= r2) {
        const px = Math.floor(cx + dx);
        const py = Math.floor(cy + dy);
        if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
          this.bitmap[py * this.width + px] = 0;
        }
      }
    }
  }
  return { center: {x: cx, y: cy}, radius };
}
```

### ATENÇÃO: runic builder
`drawRunicLine` e `placeRunicBlock` atualmente trabalham com células (col/row). Devem ser adaptados para coordenadas de pixel (x/y inteiros). A lógica de limite `MAX_CONSTRUCTED_PER_PLAYER = 20` deve ser preservada. O material `CONSTRUCTED = 3` deve ser setado no bitmap (valor 3, não apenas 1).

## Arquivos que pode alterar
- `system/frontend/src/app/shared/game-core/terrain-engine.ts`

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/terrain-types.ts` — para imports (após Agente 002 modificá-lo)

## O que NÃO deve mexer
- `terrain-types.ts` — apenas importar
- `terrain-renderer.ts`, `battle.scene.ts`, JSONs de mapa

## Dependências obrigatórias
- Agente 002 (terrain-types.ts) deve ter concluído antes

## Critérios de aceite
- [ ] `TerrainEngine.fromImageData(ImageData)` implementado
- [ ] `getMaterialAt(wx, wy)` usa bitmap `Uint8Array`
- [ ] `explode(cx, cy, r)` zera pixels circulares e retorna `{center, radius}`
- [ ] `getFloorBelow(wx, wy)` retorna y em pixels (não row)
- [ ] `drawRunicLine` e `placeRunicBlock` funcionam em coordenadas pixel
- [ ] `MapMeta.spawnPoints` usa `{x, y}` pixels
- [ ] Nenhum import de `GRID_COLS`, `GRID_ROWS` ou lógica de grid restante
- [ ] Compila sem erros TypeScript

## Instrução exata para execução
```
Você é o Agente 003. Leia .ai-orchestration/agents/003-terrain-engine.md para seu escopo completo.

Pré-requisito: confirme que Agente 002 concluiu (arquivo .ai-orchestration/agents/002-terrain-types-resumo.md existe com status Concluído).

Sua tarefa:
1. Ler system/frontend/src/app/shared/game-core/terrain-engine.ts (222 linhas)
2. Ler system/frontend/src/app/shared/game-core/terrain-types.ts (versão atualizada pelo Agente 002)
3. Reescrever o arquivo conforme o sub-spec (internals Uint8Array, API preservada)
4. Criar .ai-orchestration/agents/003-terrain-engine-resumo.md com status
```

---

## Memory — Agente 003: Reescrever terrain-engine.ts

### Objetivo
Substituir internals de grade por Uint8Array bitmap pixel-perfect. Preservar API pública completa incluindo runic builder.

### Contexto permitido
- terrain-engine.ts (222 linhas) — reescrever
- terrain-types.ts — apenas importar

### Arquivos autorizados
- Modificar: `system/frontend/src/app/shared/game-core/terrain-engine.ts`

### Dependências
- Agente 002 deve ter concluído (terrain-types.ts atualizado)

### Restrições
- NÃO alterar terrain-types.ts
- NÃO alterar terrain-renderer.ts
- NÃO alterar battle.scene.ts
- Preservar: getMaterialAt, explode, getFloorBelow, drawRunicLine, placeRunicBlock

### Critérios de aceite
- fromImageData() implementado
- Internals sem nenhuma referência a grid[][] ou GRID_COLS/GRID_ROWS
- Runic builder adaptado para pixels
- Compila sem erros
