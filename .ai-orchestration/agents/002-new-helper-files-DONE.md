# Agent 002 — New Helper Files

**Status:** DONE

## Arquivos criados

1. `system/frontend/src/game/terrain/terrain-collision.ts`
   - Exporta interface `MoveResult` e função `tryHorizontalMove`
   - Usa `TerrainEngine.getMaterialAt` e `getFloorBelow` para detecção de parede e step
   - Constantes: CHAR_HALF_WIDTH=20, CHAR_HEIGHT=60, MAX_STEP_HEIGHT=12

2. `system/frontend/src/game/terrain/spawn-selector.ts`
   - Exporta interface `SpawnPoint` e funções: `selectSpawns`, `spawnToWorld`, `moveSpeed`, `moveBudget`
   - Sem dependências externas (puro TypeScript)

3. `system/frontend/src/game/hud/movement-budget-hud.ts`
   - Exporta classe `MovementBudgetHUD` (Phaser 3)
   - Barra colorida (verde/amarelo/vermelho por %), label "MOV X%", depth=16, scrollFactor=0

## Bugs / Observações

- Nenhum bug identificado nos arquivos criados.
- Os imports de `terrain-collision.ts` dependem de `TerrainEngine` e `TerrainMaterial` existirem em `src/app/shared/game-core/terrain-engine` e `terrain-types` respectivamente — não verificados neste agente (fora do escopo).
