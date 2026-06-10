# Sub-spec — Agente 004: Reescrever terrain-renderer.ts + Deletar terrain-textures.ts

## Objetivo exato
Reescrever `terrain-renderer.ts` para usar `RenderTexture.erase()` com um `Graphics` circular como brush, em vez de chunks de tiles coloridos. Deletar `terrain-textures.ts` (tiles gerados não são mais necessários).

## Contexto mínimo necessário

### terrain-renderer.ts atual
Localização: `system/frontend/src/game/terrain/terrain-renderer.ts` (205 linhas)
Atual: renderiza terrain em chunks de RenderTextures usando tiles coloridos de `terrain-textures.ts`.

### Nova arquitetura
```typescript
import { WORLD_WIDTH, WORLD_HEIGHT } from '../../app/shared/game-core/terrain-types';

export class TerrainRenderer {
  private bg: Phaser.GameObjects.Image;
  private rt: Phaser.GameObjects.RenderTexture;
  private eraseBrush: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, bgKey: string, terrainKey: string) {
    this.bg = scene.add.image(WORLD_WIDTH/2, WORLD_HEIGHT/2, bgKey)
      .setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT)
      .setDepth(-1);

    this.rt = scene.add.renderTexture(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
      .setDepth(0)
      .setOrigin(0, 0);
    this.rt.draw(terrainKey, 0, 0);

    this.eraseBrush = scene.make.graphics({ add: false });
  }

  applyExplosion(cx: number, cy: number, radius: number): void {
    this.eraseBrush.clear();
    this.eraseBrush.fillStyle(0xffffff, 1);
    this.eraseBrush.fillCircle(radius, radius, radius);
    this.rt.erase(this.eraseBrush, cx - radius, cy - radius);
  }

  destroy(): void {
    this.bg.destroy();
    this.rt.destroy();
    this.eraseBrush.destroy();
  }
}
```

### terrain-textures.ts a deletar
Localização: `system/frontend/src/game/terrain/terrain-textures.ts` (170 linhas)
Contém: geração programática de texturas de tile colorido por material.
Deve ser deletado completamente.

### ATENÇÃO: método updateCells()
O renderer atual provavelmente tem `updateCells()`. Este método deve ser removido — o caller em `battle.scene.ts` será atualizado pelo Agente 006. Se precisar de um stub vazio para não quebrar o build durante a transição, pode adicionar, mas o Agente 006 deve removê-lo.

## Arquivos que pode alterar/deletar
- `system/frontend/src/game/terrain/terrain-renderer.ts` — reescrever
- `system/frontend/src/game/terrain/terrain-textures.ts` — **deletar**

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/terrain-types.ts` — para imports

## O que NÃO deve mexer
- `battle.scene.ts` — o Agente 006 cuida disso
- `terrain-engine.ts`, `terrain-collision.ts`, `spawn-selector.ts`

## Dependências obrigatórias
- Agente 002 (terrain-types.ts atualizado com WORLD_WIDTH/WORLD_HEIGHT)

## Critérios de aceite
- [ ] `terrain-textures.ts` deletado
- [ ] `TerrainRenderer` construtor aceita `(scene, bgKey, terrainKey)`
- [ ] `applyExplosion(cx, cy, radius)` implementado com `rt.erase()`
- [ ] Background renderizado com `setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT)` — garante escalonamento correto do runic-forest (1536×1024 → 1672×941)
- [ ] Sem nenhuma referência a `terrain-textures`, chunks ou CELL_SIZE
- [ ] Compila sem erros TypeScript

## Instrução exata para execução
```
Você é o Agente 004. Leia .ai-orchestration/agents/004-terrain-renderer.md para seu escopo completo.

Pré-requisito: confirme que Agente 002 concluiu (arquivo .ai-orchestration/agents/002-terrain-types-resumo.md existe com status Concluído).

Sua tarefa:
1. Ler system/frontend/src/game/terrain/terrain-renderer.ts (205 linhas)
2. Ler system/frontend/src/game/terrain/terrain-textures.ts (170 linhas) — para entender o que será deletado
3. Reescrever terrain-renderer.ts conforme o sub-spec
4. Deletar terrain-textures.ts
5. Criar .ai-orchestration/agents/004-terrain-renderer-resumo.md com status
```

---

## Memory — Agente 004: Reescrever terrain-renderer.ts + Deletar terrain-textures.ts

### Objetivo
Substituir renderer baseado em chunks/tiles por RenderTexture + erase(). Deletar terrain-textures.ts.

### Contexto permitido
- terrain-renderer.ts (205 linhas) — reescrever
- terrain-textures.ts (170 linhas) — deletar
- terrain-types.ts — apenas importar

### Arquivos autorizados
- Modificar: `system/frontend/src/game/terrain/terrain-renderer.ts`
- Deletar: `system/frontend/src/game/terrain/terrain-textures.ts`

### Dependências
- Agente 002 deve ter concluído

### Restrições
- NÃO alterar battle.scene.ts (Agente 006 cuida dos callers)
- NÃO alterar terrain-engine.ts
- Background deve usar setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT) para escalonar runic-forest

### Critérios de aceite
- terrain-textures.ts deletado
- TerrainRenderer usa RenderTexture.erase()
- applyExplosion(cx, cy, radius) implementado
- Compila sem erros
