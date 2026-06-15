# Sub-spec — Agent 001: Interfaces e Types

## Objetivo
Criar o arquivo `game-state.interface.ts` no backend com todas as interfaces TypeScript necessárias para o motor autoritativo, além dos DTOs de WebSocket (`BattleActionDto`). Este arquivo é a fonte de verdade de tipos para todos os outros agentes.

## Contexto mínimo necessário
- Stack: NestJS backend em `system/backend/src/`
- Linguagem: TypeScript
- Novos tipos devem ficar em `system/backend/src/game-engine/game-state.interface.ts`
- DTOs de WebSocket devem ficar em `system/backend/src/battle/dto/battle-action.dto.ts`

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/game-state.interface.ts` (CRIAR)
- `system/backend/src/battle/dto/battle-action.dto.ts` (CRIAR)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/types.ts` — tipos existentes no frontend
- `system/frontend/src/app/shared/game-core/player-stats.ts` — estrutura de PlayerStats
- `system/frontend/src/app/shared/game-core/wind-system.ts` — WindState existente
- `system/backend/src/battle/battle-room.interface.ts` — BattleRoom existente

## O que NÃO deve mexer
- Qualquer arquivo de implementação
- O `battle.gateway.ts` existente
- Arquivos de frontend

## Dependências obrigatórias
- Nenhuma (este é o agente fundação)

## Critérios de aceite
- [ ] `game-state.interface.ts` exporta: `ServerBattleState`, `ServerPlayerState`, `ActionResult`, `WindState`, `TerrainDelta`, `PlayerSnapshot`, `BattleEvent`, `StatusEffectEntry`, `WeaponDefinition` (interface mínima)
- [ ] `BattleActionDto` tem todos os campos do spec (type, angle, force, playerX, consumableId, secondaryItemId, targetX) com class-validator decorators
- [ ] Sem dependências de Phaser em nenhum arquivo criado
- [ ] TypeScript válido (sem erros óbvios de sintaxe)

## Interfaces obrigatórias (do spec)

```typescript
// game-state.interface.ts
export interface ServerBattleState {
  roomId: string;
  mode: 'pvp' | 'dungeon';
  vsAI: boolean;
  phase: 'waiting' | 'active' | 'finished';
  mapName: string;
  currentTurnPlayerId: string;
  turnNumber: number;
  wind: WindState;
  terrain: any; // TerrainEngine instance
  players: ServerPlayerState[];
  winner?: string;
  eventLog: BattleEvent[];
  terrainExcavationLog: TerrainDelta[]; // para reconexão
}

export interface ServerPlayerState {
  characterId: string;
  socketId: string;
  isAI: boolean;
  connected: boolean;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  facing: 'left' | 'right';
  weapon: any; // WeaponDefinition
  consumablesEquipped: string[];
  consumablesUsed: Set<string>;
  moveBudgetTotal: number;
  moveBudgetUsed: number;
  statusEffects: StatusEffectEntry[];
  violationCount: number;
}

export interface ActionResult {
  valid: boolean;
  violationReason?: string;
  path: Array<{ x: number; y: number; time: number }>;
  impactX: number;
  impactY: number;
  damageDealt: number;
  terrainDelta: TerrainDelta[];
  playerStates: PlayerSnapshot[];
  nextTurnPlayerId: string;
  wind: WindState;
  gameOver: boolean;
  winner?: string;
}

export interface WindState {
  direction: number; // -1 | 1
  intensity: number; // 0-20
}

export interface TerrainDelta {
  cx: number;
  cy: number;
  radius: number;
}

export interface PlayerSnapshot {
  characterId: string;
  hp: number;
  x: number;
  y: number;
}

export interface StatusEffectEntry {
  type: 'FREEZE' | 'WEAK_SHOT' | 'ITEM_BLOCK';
  turnsRemaining: number;
}

export interface BattleEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}
```

## Instrução para execução

```
Você é um desenvolvedor TypeScript sênior trabalhando no projeto Rune Wars (NestJS backend + Angular/Phaser frontend).

Sua tarefa é APENAS criar dois arquivos de tipos/interfaces TypeScript no backend:

1. `system/backend/src/game-engine/game-state.interface.ts`
2. `system/backend/src/battle/dto/battle-action.dto.ts`

NÃO crie nada além desses dois arquivos. NÃO implemente lógica.

Antes de criar, consulte para entender os tipos existentes:
- system/frontend/src/app/shared/game-core/types.ts
- system/frontend/src/app/shared/game-core/player-stats.ts
- system/frontend/src/app/shared/game-core/wind-system.ts
- system/backend/src/battle/battle-room.interface.ts

O `game-state.interface.ts` deve exportar exatamente estas interfaces (adapte conforme o que você ler nos arquivos existentes):
ServerBattleState, ServerPlayerState, ActionResult, WindState, TerrainDelta, PlayerSnapshot, StatusEffectEntry, BattleEvent

O `BattleActionDto` deve ter:
- type: 'shoot' | 'move' | 'use_consumable' | 'pass_turn' | 'use_secondary'
- angle?: number (graus)
- force?: number (5-100)
- playerX?: number
- consumableId?: string
- secondaryItemId?: string
- targetX?: number
Use decorators do class-validator (@IsString, @IsOptional, @IsNumber, @Min, @Max, @IsIn).

Sem dependências de Phaser. Sem lógica. Apenas tipos e DTOs.

Ao terminar, crie um resumo no formato:
# Resumo — Agent 001: Interfaces e Types
## Status: Concluído | Parcial | Bloqueado
## O que foi feito
## Arquivos criados
## Decisões tomadas
## Bugs encontrados
## Impacto em outros agentes
```

## Memory — Agent 001: Interfaces e Types

### Objetivo
Criar interfaces TypeScript (`game-state.interface.ts`) e DTOs WebSocket (`BattleActionDto`) para o motor autoritativo v1.8.0.

### Contexto permitido
- Backend NestJS em `system/backend/src/`
- Frontend game-core em `system/frontend/src/app/shared/game-core/` (CONSULTA APENAS)

### Arquivos autorizados
- CRIAR: `system/backend/src/game-engine/game-state.interface.ts`
- CRIAR: `system/backend/src/battle/dto/battle-action.dto.ts`

### Dependências
Nenhuma

### Restrições
- Sem lógica de implementação
- Sem dependências de Phaser
- Sem modificar arquivos existentes

### Critérios de aceite
- Exporta ServerBattleState, ServerPlayerState, ActionResult, WindState, TerrainDelta, PlayerSnapshot, StatusEffectEntry, BattleEvent
- BattleActionDto com class-validator
- TypeScript válido
