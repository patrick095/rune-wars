# Agent 002 — New Helper Files

## Objetivo
Criar três novos arquivos com lógica de suporte ao sistema de movimentação: colisão horizontal com step climbing, seletor aleatório de spawn points, e HUD de orçamento de movimento. Estes são arquivos novos — sem conflito com outros agentes.

## Contexto
Projeto: Rune Wars — Angular 17 + Phaser 3.
Raiz: `/Users/patrickchaves/projetos/pessoal/rune-wars/system/frontend/src`

Dependências do Agent 001 já concluídas:
- `TerrainEngine` agora tem `worldWidth`, `worldHeight`, `MapMeta`
- `GRID_COLS = 300`, `GRID_ROWS = 80`
- `CharacterFall` retorna `'alive' | 'dead'`

## Arquivos autorizados para CRIAR (novos)
- `src/game/terrain/terrain-collision.ts`
- `src/game/terrain/spawn-selector.ts`
- `src/game/hud/movement-budget-hud.ts`

## Arquivos para consultar (somente leitura)
- `src/app/shared/game-core/terrain-engine.ts`
- `src/app/shared/game-core/terrain-types.ts`
- `src/game/hud/power-meter-hud.ts` (para entender padrão de HUD Phaser)

## O que NÃO alterar
- Nenhum arquivo existente

## Dependências
- Agent 001 concluído

## Tarefas exatas

### 1. terrain-collision.ts
Lógica de colisão horizontal e step climbing:

```typescript
import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import { TerrainMaterial } from '../../app/shared/game-core/terrain-types';

const CHAR_HALF_WIDTH = 20;  // metade da largura do sprite
const CHAR_HEIGHT = 60;       // altura do sprite
const MAX_STEP_HEIGHT = 12;   // 20% de CHAR_HEIGHT

export interface MoveResult {
  canMove: boolean;
  newX: number;
  newY: number;
}

/**
 * Tenta mover o personagem horizontalmente, respeitando colisão e step climbing.
 * Retorna a nova posição (ou posição atual se bloqueado).
 */
export function tryHorizontalMove(
  currentX: number,
  currentY: number,
  deltaX: number,
  engine: TerrainEngine
): MoveResult {
  const direction = Math.sign(deltaX);
  const targetX = currentX + deltaX;

  // Verificar colisão de parede: checar 3 pontos verticais no lado de destino
  const checkX = targetX + direction * CHAR_HALF_WIDTH;
  const checkPoints = [
    currentY - CHAR_HEIGHT / 2 + 4,  // topo
    currentY,                          // meio
    currentY + CHAR_HEIGHT / 2 - 4,  // base
  ];

  const hitWall = checkPoints.some(cy => {
    const mat = engine.getMaterialAt(checkX, cy);
    return mat !== TerrainMaterial.EMPTY;
  });

  if (hitWall) {
    return { canMove: false, newX: currentX, newY: currentY };
  }

  // Verificar floor na nova posição (step climbing)
  const currentFeetY = currentY + CHAR_HEIGHT / 2;
  const nextFloorY = engine.getFloorBelow(targetX, currentFeetY);

  if (nextFloorY === null) {
    // Abismo — deixar mover (personagem vai cair; CharacterFall cuida da morte)
    return { canMove: true, newX: targetX, newY: currentY };
  }

  const currentFloorY = engine.getFloorBelow(currentX, currentFeetY) ?? currentFeetY;
  const heightDiff = nextFloorY - currentFloorY; // negativo = subida, positivo = descida

  if (heightDiff < -MAX_STEP_HEIGHT) {
    // Subida muito íngreme — bloqueado
    return { canMove: false, newX: currentX, newY: currentY };
  }

  // Descida ou subida suave → mover e ajustar Y
  const newY = nextFloorY - CHAR_HEIGHT / 2;
  return { canMove: true, newX: targetX, newY };
}
```

### 2. spawn-selector.ts
Seleção aleatória de spawn points:

```typescript
export interface SpawnPoint {
  col: number;
  row: number;
}

/**
 * Embaralha os spawn points e retorna os N primeiros.
 * A aleatoriedade garante que cada partida tenha posições diferentes.
 */
export function selectSpawns(
  spawnPoints: SpawnPoint[],
  count: number
): SpawnPoint[] {
  const shuffled = [...spawnPoints];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Converte spawn point (col, row) para coordenadas de mundo em pixels.
 * Posiciona o sprite com os pés no topo da célula de spawn.
 */
export function spawnToWorld(
  spawn: SpawnPoint,
  cellSize: number,
  charHeight: number
): { x: number; y: number } {
  return {
    x: (spawn.col + 0.5) * cellSize,
    y: spawn.row * cellSize - charHeight / 2,
  };
}
```

### 3. movement-budget-hud.ts
Barra visual de orçamento de movimento:

```typescript
import Phaser from 'phaser';

const BAR_WIDTH = 160;
const BAR_HEIGHT = 14;
const LABEL_OFFSET_Y = -18;

export class MovementBudgetHUD {
  private bar!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;
  private container!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.bar = scene.add.graphics().setDepth(16);
    this.label = scene.add.text(x, y + LABEL_OFFSET_Y, 'MOV', {
      fontSize: '11px',
      color: '#aaffcc',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(16);

    this._x = x;
    this._y = y;
    this.update(1, 1); // full bar on start
  }

  private _x: number;
  private _y: number;

  /**
   * Atualiza a barra. used/total em pixels.
   */
  update(used: number, total: number): void {
    const pct = total > 0 ? Math.max(0, 1 - used / total) : 0;
    this.bar.clear();

    // Background
    this.bar.fillStyle(0x222233, 0.85);
    this.bar.fillRect(this._x - BAR_WIDTH / 2, this._y - BAR_HEIGHT / 2, BAR_WIDTH, BAR_HEIGHT);

    // Fill
    const color = pct > 0.5 ? 0x44ff88 : pct > 0.25 ? 0xffdd44 : 0xff4444;
    this.bar.fillStyle(color, 1);
    this.bar.fillRect(this._x - BAR_WIDTH / 2, this._y - BAR_HEIGHT / 2, BAR_WIDTH * pct, BAR_HEIGHT);

    // Border
    this.bar.lineStyle(1, 0x446655, 0.8);
    this.bar.strokeRect(this._x - BAR_WIDTH / 2, this._y - BAR_HEIGHT / 2, BAR_WIDTH, BAR_HEIGHT);

    const pctDisplay = Math.round(pct * 100);
    this.label.setText(`MOV ${pctDisplay}%`);
  }

  setVisible(visible: boolean): void {
    this.bar.setVisible(visible);
    this.label.setVisible(visible);
  }

  destroy(): void {
    this.bar.destroy();
    this.label.destroy();
  }
}
```

## Fórmulas de movimento (para uso pelo Agent 007)
Documentar aqui para referência:

```typescript
// Velocidade em px/s
export function moveSpeed(agility: number): number {
  return 40 + (420 - 40) * (agility / 500);
}

// Orçamento total em pixels por turno
export function moveBudget(agility: number): number {
  return 120 + (2100 - 120) * (agility / 500);
}
```
Adicionar estas funções no final do arquivo `spawn-selector.ts` ou em arquivo separado `movement-formulas.ts`. Escolher a opção que parece mais organizada.

## Critérios de aceite
- [ ] `terrain-collision.ts` criado com `tryHorizontalMove()` e `MoveResult`
- [ ] `spawn-selector.ts` criado com `selectSpawns()` e `spawnToWorld()`
- [ ] `movement-budget-hud.ts` criado com `MovementBudgetHUD` class
- [ ] Fórmulas `moveSpeed()` e `moveBudget()` disponíveis
- [ ] Sem erros de TypeScript (importações corretas)

## Resumo final obrigatório
Criar `.ai-orchestration/agents/002-new-helper-files-DONE.md`
