# Agent 001 — Engine Foundation

## Objetivo
Atualizar as constantes do grid de terreno para o novo tamanho (300×80) e modificar o sistema de queda para suportar morte por abismo. Esta é a fundação de que todos os outros agentes dependem.

## Contexto
Projeto: Rune Wars — jogo turn-based artillery em Angular 17 + Phaser 3.
Raiz do frontend: `/Users/patrickchaves/projetos/pessoal/rune-wars/system/frontend`

O `TerrainEngine` usa uma grid de células para representar o terreno. Atualmente:
- `GRID_COLS = 100`, `GRID_ROWS = 40`, `CELL_SIZE = 20px` → mundo 2000×800px
- Novo tamanho: `GRID_COLS = 300`, `GRID_ROWS = 80` → mundo 6000×1600px

O `CharacterFall` atualmente para o personagem quando não há chão. Precisamos que ele continue caindo e retorne um status de morte.

## Arquivos autorizados para alterar
- `src/app/shared/game-core/terrain-engine.ts`
- `src/game/terrain/character-fall.ts`

## Arquivos para consultar (somente leitura)
- `src/app/shared/game-core/terrain-types.ts` (verificar exports)
- `src/game/scenes/battle.scene.ts` (entender como CharacterFall é usado)

## O que NÃO alterar
- Nenhum outro arquivo além dos dois listados acima
- Não modificar lógica de explosão, getMaterialAt, getFloorBelow (apenas adicionar getters)
- Não alterar CELL_SIZE (mantém 20px)

## Dependências
- Nenhuma (este é o primeiro agente)

## Tarefas exatas

### terrain-engine.ts
1. Alterar `export const GRID_COLS = 100` → `export const GRID_COLS = 300`
2. Alterar `export const GRID_ROWS = 40` → `export const GRID_ROWS = 80`
3. Adicionar getter `get worldWidth(): number { return GRID_COLS * CELL_SIZE; }`
4. Adicionar getter `get worldHeight(): number { return GRID_ROWS * CELL_SIZE; }`
5. Modificar `buildGrid` para ser tolerante a JSON com menos linhas/colunas:
   ```typescript
   private buildGrid(gridData: number[][]): TerrainMaterial[][] {
     const result: TerrainMaterial[][] = [];
     for (let row = 0; row < GRID_ROWS; row++) {
       result[row] = [];
       for (let col = 0; col < GRID_COLS; col++) {
         const value = gridData[row]?.[col] ?? 0;
         result[row][col] = value as TerrainMaterial;
       }
     }
     return result;
   }
   ```
   (Este comportamento já existe — confirmar que está tolerante. Se já estiver, apenas documentar.)

6. Adicionar método `getSpawnPoints(meta?: MapMeta): Array<{col: number; row: number}>`:
   ```typescript
   getSpawnPoints(meta?: { spawnPoints?: Array<{col: number; row: number}> }): Array<{col: number; row: number}> {
     return meta?.spawnPoints ?? [];
   }
   ```

7. Adicionar interface `MapMeta` antes da classe:
   ```typescript
   export interface MapMeta {
     name?: string;
     cols?: number;
     rows?: number;
     spawnPoints?: Array<{ col: number; row: number }>;
   }
   ```

### character-fall.ts
Reescrever o método `update` para:
- Retornar `'alive' | 'dead'` (não void)
- Continuar aplicando queda quando `floorY === null` (não parar)
- Acumular tempo de queda e retornar 'dead' após 3000ms sem chão OU quando Y > worldHeight
- Resetar contador de queda quando encontrar chão

```typescript
import Phaser from 'phaser';
import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';

const FALL_SPEED = 300; // px/s (aumentar de 200 para queda mais dramática)
const FALL_DEATH_MS = 3000;

export class CharacterFall {
  isFalling = false;
  private fallDurationMs = 0;

  update(
    sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
    engine: TerrainEngine,
    dt: number
  ): 'alive' | 'dead' {
    const feetY = sprite.y + sprite.height / 2;
    const floorY = engine.getFloorBelow(sprite.x, feetY);

    if (floorY === null) {
      this.isFalling = true;
      this.fallDurationMs += dt;
      sprite.setY(sprite.y + FALL_SPEED * (dt / 1000));

      if (sprite.y > engine.worldHeight + 200 || this.fallDurationMs >= FALL_DEATH_MS) {
        return 'dead';
      }
      return 'alive';
    }

    this.fallDurationMs = 0;
    const targetY = floorY - sprite.height / 2;

    if (sprite.y < targetY - 0.5) {
      this.isFalling = true;
      const step = FALL_SPEED * (dt / 1000);
      sprite.setY(Math.min(sprite.y + step, targetY));
      if (sprite.y >= targetY - 0.5) {
        sprite.setY(targetY);
        this.isFalling = false;
      }
    } else if (sprite.y > targetY + 0.5) {
      sprite.setY(targetY);
      this.isFalling = false;
    } else {
      this.isFalling = false;
    }
    return 'alive';
  }
}
```

**ATENÇÃO:** O tipo do parâmetro `sprite` deve aceitar tanto `Rectangle` quanto `Image` porque battle.scene.ts ainda usa Rectangle. Usar union type ou `Phaser.GameObjects.GameObject & { x: number; y: number; height: number; setY(y: number): void }`. Checar o que funciona melhor com TypeScript sem quebrar o build.

## Critérios de aceite
- [ ] `GRID_COLS = 300` e `GRID_ROWS = 80` definidos em terrain-engine.ts
- [ ] `worldWidth` e `worldHeight` getters existem e retornam 6000 e 1600
- [ ] `MapMeta` interface exportada
- [ ] `CharacterFall.update()` retorna `'alive' | 'dead'`
- [ ] Queda continua quando `getFloorBelow = null`
- [ ] Morte por queda após 3s ou Y > worldHeight + 200
- [ ] Sem erros de TypeScript nos arquivos alterados

## Resumo final obrigatório
Criar arquivo `.ai-orchestration/agents/001-engine-foundation-DONE.md` com:
- Status (Concluído/Parcial/Bloqueado)
- O que foi feito
- Arquivos alterados
- Bugs encontrados (CRÍTICO/IMPORTANTE/BAIXO)
- Impacto em outros agentes
