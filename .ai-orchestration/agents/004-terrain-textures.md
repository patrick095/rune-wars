# Agent 004 — Terrain Textures

## Objetivo
Criar `terrain-textures.ts` que gera texturas procedurais de tile via Phaser Graphics para cada tipo de material e mapa. Sem dependência de PNGs externos — tudo gerado em runtime.

## Contexto
Projeto: Rune Wars — Angular 17 + Phaser 3.
Raiz: `/Users/patrickchaves/projetos/pessoal/rune-wars/system/frontend/src`

Para v1.2.0, o estilo visual é placeholder mas arquitetado para substituição fácil por arte real na v1.3.0.
Cada tile tem 20×20px (CELL_SIZE). As texturas são geradas uma vez e armazenadas no cache do Phaser.

Mapas PvP: 'plains', 'castle', 'deep_mines', 'arcane_ruins', 'runic_forest'
Materiais: DESTRUCTIBLE (1), INDESTRUCTIBLE (2), CONSTRUCTED (3)

## Arquivos autorizados para CRIAR
- `src/game/terrain/terrain-textures.ts` (novo)

## Arquivos para consultar (somente leitura)
- `src/app/shared/game-core/terrain-types.ts` (TerrainMaterial enum)
- `src/app/shared/game-core/terrain-engine.ts` (CELL_SIZE, GRID_COLS, GRID_ROWS)

## O que NÃO alterar
- Nenhum arquivo existente

## Dependências
- Agent 001 concluído (CELL_SIZE confirmado em 20px)

## Implementação

```typescript
import Phaser from 'phaser';
import { CELL_SIZE } from '../../app/shared/game-core/terrain-types';
import { TerrainMaterial } from '../../app/shared/game-core/terrain-types';

// Paleta de cores por mapa e material
const MAP_COLORS: Record<string, { destructible: number; indestructible: number; bg: number }> = {
  plains:       { destructible: 0x6b8e3a, indestructible: 0x4a5e28, bg: 0x87ceeb },
  castle:       { destructible: 0x8a7a6a, indestructible: 0x4a4035, bg: 0x1a1a3a },
  deep_mines:   { destructible: 0x7a6a55, indestructible: 0x3a3028, bg: 0x0d0d1a },
  arcane_ruins: { destructible: 0x6a4a8a, indestructible: 0x3a2050, bg: 0x1a0a2a },
  runic_forest: { destructible: 0x4a7a3a, indestructible: 0x2a4a1a, bg: 0x0a1a0a },
  dungeon:      { destructible: 0x5a5a6a, indestructible: 0x2a2a3a, bg: 0x080808 },
};

const CONSTRUCTED_COLOR = 0x44aaff;
const CONSTRUCTED_GLOW  = 0x2266aa;

let _initialized = false;

/**
 * Gera todas as texturas de tile no cache do Phaser.
 * Idempotente — pode ser chamada múltiplas vezes sem problema.
 */
export function initTerrainTextures(scene: Phaser.Scene): void {
  if (_initialized) return;
  _initialized = true;

  const size = CELL_SIZE;

  // Gerar tiles para cada mapa
  for (const [mapName, colors] of Object.entries(MAP_COLORS)) {
    // Tile destrutível: cor base + borda escura + detalhe de textura
    generateTile(scene, `tile_${mapName}_destructible`, size, colors.destructible, colors.destructible - 0x111111);

    // Tile indestrutível: cor mais escura + borda muito escura
    generateTile(scene, `tile_${mapName}_indestructible`, size, colors.indestructible, colors.indestructible - 0x0a0a0a, true);
  }

  // Tile construído (igual para todos os mapas)
  generateConstructedTile(scene, 'tile_constructed', size);
}

function generateTile(
  scene: Phaser.Scene,
  key: string,
  size: number,
  fillColor: number,
  borderColor: number,
  hard = false
): void {
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(fillColor, 1);
  g.fillRect(0, 0, size, size);

  // Detalhe de textura: linhas leves para imitar rocha/terra
  if (!hard) {
    g.fillStyle(fillColor - 0x0a0a0a, 0.4);
    g.fillRect(2, 2, size - 4, 2);
    g.fillRect(2, size - 4, size - 4, 2);
  } else {
    // Rocha mais dura: padrão de linhas cruzadas
    g.lineStyle(1, borderColor, 0.5);
    g.strokeRect(1, 1, size - 2, size - 2);
    g.lineBetween(0, size / 2, size, size / 2);
  }

  // Borda
  g.lineStyle(1, borderColor, 0.6);
  g.strokeRect(0, 0, size, size);

  g.generateTexture(key, size, size);
  g.destroy();
}

function generateConstructedTile(scene: Phaser.Scene, key: string, size: number): void {
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(CONSTRUCTED_COLOR, 0.8);
  g.fillRect(0, 0, size, size);
  g.lineStyle(1, CONSTRUCTED_GLOW, 1);
  g.strokeRect(0, 0, size, size);
  g.lineStyle(1, 0x88ddff, 0.3);
  g.lineBetween(0, 0, size, size);
  g.lineBetween(size, 0, 0, size);
  g.generateTexture(key, size, size);
  g.destroy();
}

/**
 * Retorna a chave Phaser de textura para um material + mapa.
 */
export function getTileKey(material: TerrainMaterial, mapName: string): string {
  if (material === TerrainMaterial.CONSTRUCTED) return 'tile_constructed';

  // Mapas de dungeon compartilham paleta 'dungeon'
  const palette = mapName.startsWith('dungeon') ? 'dungeon' : mapName;
  const suffix = material === TerrainMaterial.INDESTRUCTIBLE ? 'indestructible' : 'destructible';
  const key = `tile_${palette}_${suffix}`;

  // Fallback se o mapa não tiver paleta definida
  return MAP_COLORS[palette] ? key : `tile_plains_${suffix}`;
}

/**
 * Retorna cor de background para o mapa.
 */
export function getBackgroundColor(mapName: string): number {
  const palette = mapName.startsWith('dungeon') ? 'dungeon' : mapName;
  return MAP_COLORS[palette]?.bg ?? 0x1a1a2e;
}
```

## Critérios de aceite
- [ ] `terrain-textures.ts` criado
- [ ] `initTerrainTextures(scene)` funciona sem erro
- [ ] `getTileKey(material, mapName)` retorna string válida para cada combinação
- [ ] `getBackgroundColor(mapName)` retorna cor hex válida
- [ ] Tiles procedurais visualmente distintos por mapa e por material
- [ ] Tile CONSTRUCTED tem visual de energia/rúnico
- [ ] Sem erros de TypeScript

## Resumo final obrigatório
Criar `.ai-orchestration/agents/004-terrain-textures-DONE.md`
