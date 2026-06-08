# Agent 003 — Terrain Renderer Rewrite

## Objetivo
Reescrever `terrain-renderer.ts` para usar `Phaser.GameObjects.RenderTexture` com tiles texturizados por tipo de material e por mapa, e aplicar ERASE blend mode nas explosões. Manter interface pública idêntica (`renderFull()` e `updateCells()`).

## Contexto
Projeto: Rune Wars — Angular 17 + Phaser 3.
Raiz: `/Users/patrickchaves/projetos/pessoal/rune-wars/system/frontend/src`

O renderer atual usa `scene.add.rectangle()` para cada célula — resultado é visual blocado.
O novo renderer deve:
1. Criar um `RenderTexture` do tamanho do mundo (6000×1600px)
2. Desenhar tiles texturizados sobre cada célula sólida
3. Ao explodir, apagar pixels via ERASE blend mode (criando buracos visuais arredondados)
4. Suportar background por mapa (imagem de fundo)

O Agent 004 criará `terrain-textures.ts` com as texturas procedurais. Este agente (003) DEVE importar e chamar as funções do Agent 004. Se o Agent 004 ainda não tiver rodado, assumir que `terrain-textures.ts` existe com a interface descrita abaixo.

## Interface esperada de terrain-textures.ts (criada pelo Agent 004)
```typescript
// Inicializa todas as texturas de tile no cache do Phaser
export function initTerrainTextures(scene: Phaser.Scene): void;

// Retorna a chave de texture Phaser para um tipo de material + mapa
export function getTileKey(material: TerrainMaterial, mapName: string): string;

// Retorna a cor de background para um mapa (fallback se sem imagem)
export function getBackgroundColor(mapName: string): number;
```

## Arquivos autorizados para alterar
- `src/game/terrain/terrain-renderer.ts` (REESCRITA COMPLETA)

## Arquivos para consultar (somente leitura)
- `src/app/shared/game-core/terrain-engine.ts` (ver GRID_COLS, GRID_ROWS, CELL_SIZE, getGrid())
- `src/app/shared/game-core/terrain-types.ts` (TerrainMaterial, TerrainCell, CELL_SIZE)
- `src/game/terrain/terrain-textures.ts` (se já existir do Agent 004)
- `src/game/scenes/battle.scene.ts` (ver como TerrainRenderer é instanciado e chamado)

## O que NÃO alterar
- Nenhum arquivo além de terrain-renderer.ts
- Não alterar a interface pública: `renderFull()` e `updateCells(cells: TerrainCell[])` devem continuar existindo com os mesmos parâmetros

## Dependências
- Agent 001 concluído (GRID_COLS=300, GRID_ROWS=80)
- Agent 004 deve ter criado terrain-textures.ts (ou criar interface compatível)

## Implementação

```typescript
import Phaser from 'phaser';
import { TerrainEngine, GRID_COLS, GRID_ROWS } from '../../app/shared/game-core/terrain-engine';
import { CELL_SIZE, TerrainCell, TerrainMaterial } from '../../app/shared/game-core/terrain-types';
import { initTerrainTextures, getTileKey, getBackgroundColor } from './terrain-textures';

export class TerrainRenderer {
  private rt!: Phaser.GameObjects.RenderTexture;
  private bg!: Phaser.GameObjects.Rectangle;
  private mapName = 'plains';

  constructor(
    private scene: Phaser.Scene,
    private engine: TerrainEngine
  ) {
    // Inicializar texturas procedurais se não existirem
    initTerrainTextures(scene);

    const worldW = GRID_COLS * CELL_SIZE;
    const worldH = GRID_ROWS * CELL_SIZE;

    // Camada 1: Background sólido (cor por mapa)
    this.bg = scene.add.rectangle(
      worldW / 2, worldH / 2, worldW, worldH,
      getBackgroundColor(this.mapName)
    ).setDepth(0);

    // Camada 2: RenderTexture para terreno destrutível
    this.rt = scene.add.renderTexture(0, 0, worldW, worldH).setDepth(2).setOrigin(0, 0);
  }

  setMapName(name: string): void {
    this.mapName = name;
    this.bg.setFillStyle(getBackgroundColor(name));
  }

  /**
   * Redesenha todo o terreno a partir do estado atual do engine.
   */
  renderFull(): void {
    this.rt.clear();
    const grid = this.engine.getGrid();

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const mat = grid[row][col];
        if (mat === TerrainMaterial.EMPTY) continue;

        const tileKey = getTileKey(mat, this.mapName);
        const px = col * CELL_SIZE;
        const py = row * CELL_SIZE;
        this.rt.drawFrame(tileKey, 0, px, py);
      }
    }
  }

  /**
   * Apaga visualmente as células destruídas do RenderTexture.
   * Usa ERASE blend para criar buracos arredondados — efeito DDTank/Gunbound.
   */
  updateCells(destroyed: TerrainCell[]): void {
    if (destroyed.length === 0) return;

    // Criar graphics de erase no RenderTexture
    // Phaser RenderTexture.erase() apaga uma área usando alpha
    // Usamos um círculo ligeiramente maior que a célula para suavizar bordas
    const eraseRadius = CELL_SIZE * 0.7;

    this.rt.beginDraw();
    for (const cell of destroyed) {
      const cx = cell.x * CELL_SIZE + CELL_SIZE / 2;
      const cy = cell.y * CELL_SIZE + CELL_SIZE / 2;
      // Desenhar usando erase: precisamos de um objeto para apagar
      // Estratégia: usar rt.erase() com um círculo gráfico
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx, cy, eraseRadius);
      this.rt.erase(g, 0, 0);
      g.destroy();
    }
    this.rt.endDraw();
  }

  destroy(): void {
    this.rt?.destroy();
    this.bg?.destroy();
  }
}
```

**NOTA IMPORTANTE:** `rt.erase()` pode ter limitações dependendo da versão do Phaser. Se não funcionar, alternativa é:
1. Usar `rt.beginDraw()` com uma textura de "buraco" circular desenhada com blendMode ERASE
2. Ou chamar `renderFull()` após cada grupo de explosões (mais simples, menos eficiente)

Implementar a opção robusta: tentar `rt.erase()`, se falhar usar re-render incremental apenas das células afetadas via `rt.draw()` com transparência.

## Critérios de aceite
- [ ] `terrain-renderer.ts` reescrito com RenderTexture
- [ ] `renderFull()` desenha todas as células com tiles texturizados
- [ ] `updateCells()` apaga visualmente células destruídas (buracos arredondados)
- [ ] Background por mapa (cor ou imagem)
- [ ] Interface pública compatível com battle.scene.ts existente
- [ ] `destroy()` limpa os GameObjects Phaser

## Resumo final obrigatório
Criar `.ai-orchestration/agents/003-terrain-renderer-DONE.md`
