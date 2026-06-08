# Agent 005 — v0.3.0 TerrainEngine (TypeScript Puro)

## Objetivo
Implementar o `TerrainEngine` em TypeScript puro: grid de materiais, explosão circular, query de chão, e dois mapas como JSON.

## Contexto mínimo necessário
- Grid de células 8×8px; mapa base 100×40 células = 800×320px
- Materiais: `EMPTY=0`, `DESTRUCTIBLE=1`, `INDESTRUCTIBLE=2`
- `explode(cx,cy,radius)` remove DESTRUCTIBLE em círculo, retorna células alteradas
- `getMaterialAt(worldX,worldY)` retorna material
- `getFloorBelow(worldX,worldY)` retorna Y do chão mais próximo abaixo

## Arquivos autorizados a criar/alterar
```
system/frontend/src/app/shared/game-core/
  terrain-engine.ts
  terrain-types.ts
  maps/
    map-plains.json
    map-castle.json
```

## Arquivos apenas para consulta
- `system/frontend/src/app/shared/game-core/projectile-physics.ts`

## O que NÃO mexer
- Qualquer arquivo Phaser ou Angular
- Arquivos game-core existentes (turn-manager, wind-system, etc.)

## Dependências obrigatórias
- Agentes 003 + 004 concluídos

## Interfaces obrigatórias
```ts
export enum TerrainMaterial { EMPTY=0, DESTRUCTIBLE=1, INDESTRUCTIBLE=2 }
export interface TerrainCell { x:number; y:number; material:TerrainMaterial }
export interface ExplosionResult { cellsDestroyed:TerrainCell[]; center:{x:number;y:number}; radius:number }
export interface TerrainMaterialConfig { type:TerrainMaterial; color:number; destructible:boolean }
```

## Mapas a criar
- **map-plains.json**: chão plano destrutível, rocha indestrutível nas bordas/fundo, duas colinas destrutíveis centrais
- **map-castle.json**: plataformas indestrutíveis em alturas variadas, solo misto

## Critérios de aceite
- `explode()` não remove INDESTRUCTIBLE
- `explode()` remove DESTRUCTIBLE apenas dentro do raio circular
- `getFloorBelow()` retorna null se não há chão
- Zero imports de Phaser
- Mapas JSON válidos com grid 100×40

## Memory

### Objetivo
TerrainEngine TS puro + dois mapas JSON.

### Contexto permitido
Interfaces acima + especificação de tamanho de célula e mapas.

### Arquivos autorizados
Os listados acima.

### Dependências
003+004 concluídos.

### Restrições
- Grid lógico é a fonte da verdade; visual é responsabilidade do agente 006.
- Não instanciar Phaser.
- `explode` usa fórmula circular: `Math.sqrt((dx)²+(dy)²) <= radius`.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-005.md`.

## Limpeza pós-versão
Após v0.3.0 completa (005+006): deletar `v0.3.0.md` da raiz.
