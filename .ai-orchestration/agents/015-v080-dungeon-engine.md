# Agent 015 — v0.8.0 DungeonEngine (TypeScript Puro)

## Objetivo
Implementar `DungeonEngine` em TypeScript puro com `DungeonState`, 3 fases do Andar 1, sistema de objetivos (DEFEAT_ALL, PROTECT), sistema de vidas e recompensas locais.

## Contexto mínimo necessário

### 3 fases do Andar 1:
- Fase 1 `floor1-phase1`: objetivo DEFEAT_ALL(4 inimigos), mapa `dungeon-cave-entrance`
- Fase 2 `floor1-phase2`: objetivo PROTECT(crystal, 5 turnos), 6 morcegos em ondas
- Fase 3 `floor1-boss`: objetivo DEFEAT_BOSS(golem-minor), mapa `dungeon-cave-boss`

### Recompensas por fase:
- Fase 1: XP=50, Ouro=20
- Fase 2: XP=75, Ouro=30
- Fase 3 (chefe): XP=150, Ouro=80

### Vidas: 3 por andar; ao 0 → status FAILED

## Arquivos autorizados a criar/alterar
```
system/frontend/src/app/shared/game-core/
  dungeon-engine.ts
  dungeon-types.ts
  maps/
    dungeon-cave-entrance.json
    dungeon-cave-hall.json
    dungeon-cave-boss.json
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  player-stats.ts
  terrain-engine.ts
```

## O que NÃO mexer
- Qualquer arquivo Phaser/Angular
- game-core existente fora dos arquivos listados

## Dependências obrigatórias
- Agentes 013 + 014 concluídos

## Interfaces obrigatórias:
```ts
export type ObjectiveType = 'DEFEAT_ALL' | 'PROTECT' | 'DEFEAT_BOSS'
export interface DungeonPhase { id:string; name:string; objective:DungeonObjective; enemies:EnemyConfig[]; map:string }
export interface DungeonState {
  floorId:string; currentPhaseIndex:number; phases:DungeonPhase[];
  playerState:PlayerState; lives:number; localXp:number; localGold:number;
  status:'IN_PROGRESS'|'PHASE_COMPLETE'|'FLOOR_COMPLETE'|'FAILED'
}
export class DungeonEngine {
  advancePhase(): void
  checkObjective(): boolean
  collectReward(phase: DungeonPhase): void
  loseLife(): void
}
```

## Critérios de aceite
- `checkObjective()` retorna true quando DEFEAT_ALL vê 0 inimigos vivos
- `checkObjective()` retorna false quando PROTECT detecta cristal destruído
- `loseLife()` decrementa vidas; ao 0 → status FAILED
- `collectReward()` incrementa `localXp` e `localGold` corretamente
- Mapas JSON válidos com grid de terreno

## Memory

### Objetivo
DungeonEngine TS puro com 3 fases, objetivos, vidas, recompensas.

### Contexto permitido
Tabela de fases + recompensas + interfaces acima.

### Arquivos autorizados
Os listados.

### Dependências
013+014 concluídos.

### Restrições
- Zero Phaser/Angular.
- Mapas JSON devem ser compatíveis com o formato do TerrainEngine (grid TerrainMaterial).

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-015.md`.

## Limpeza pós-versão
Após v0.8.0 completa (015+016+017): deletar `v0.8.0.md` da raiz.
