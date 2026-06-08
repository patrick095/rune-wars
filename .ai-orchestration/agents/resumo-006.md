# Resumo Agente 006
**Status:** Concluído

**Arquivos criados/modificados:**
- `system/frontend/src/game/terrain/terrain-renderer.ts` — CRIADO
- `system/frontend/src/game/terrain/character-fall.ts` — CRIADO
- `system/frontend/src/game/scenes/battle.scene.ts` — MODIFICADO
- `system/frontend/src/app/playground/debug-overlay/debug-overlay.component.ts` — MODIFICADO
- `system/frontend/tsconfig.json` — MODIFICADO (adicionado `resolveJsonModule: true`)

**Decisões:**
- `TerrainRenderer.updateCells()` chama `renderFull()` internamente para garantir sincronismo total com o estado do engine após explosão, evitando inconsistência visual entre tiles deletados e o estado lógico do grid.
- `CharacterFall.update()` usa velocidade de 200px/s com delta em ms para queda suave; ao não encontrar chão (`getFloorBelow` retorna `null`) mantém a posição do sprite sem forçar queda para fora do mapa.
- No `BattleScene.animateProjectile()`, o terreno é sempre explodido quando o projétil para (hit terrain, hit ground, hit target, ou end of path), eliminando a necessidade de dois blocos de explosão separados.
- Explosão no centro (`debugExplode`) usa coordenadas do centro da tela (width/2, height/2) para funcionar independentemente do tamanho da janela.
- `resolveJsonModule: true` adicionado ao tsconfig para permitir `import mapPlains from '...map-plains.json'` diretamente, sem necessidade de `fetch` ou assets do Phaser.
- O `update()` da BattleScene sincroniza `playerStats.x/y` e `aiStats.x/y` com as posições dos sprites após a queda, mantendo a lógica de tiro e colisão sempre atualizada.
