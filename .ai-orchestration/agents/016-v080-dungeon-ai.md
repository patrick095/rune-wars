# Agent 016 — v0.8.0 Monster AI + Boss

## Objetivo
Implementar as 3 IAs de monstros (EASY, INTERMEDIATE, BOSS), o Golem Menor com fases de vida, e a cena Phaser da Dungeon.

## Contexto mínimo necessário

### Níveis de IA:
| Nível | Erro Ângulo | Erro Força | Usa Cobertura | Prioriza Fraco |
|-------|------------|-----------|--------------|----------------|
| EASY | ±20° | ±25% | Não | Não |
| INTERMEDIATE | ±10° | ±15% | Sim | Não |
| BOSS | ±5° | ±8° | Sim | Sim |

### Golem Menor:
- 100%→50% HP: ataques normais + pedras caindo (explosão top-down)
- 50%→0% HP: destrói terreno destrutível próximo ao jogador

## Arquivos autorizados a criar/alterar
```
system/frontend/src/app/shared/game-core/
  monster-ai.ts
system/frontend/src/game/
  scenes/
    dungeon.scene.ts
  enemies/
    enemy-renderer.ts
    golem-boss.ts
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  dungeon-engine.ts
  dungeon-types.ts
  terrain-engine.ts
  ai-local.ts
```

## O que NÃO mexer
- `dungeon-engine.ts` (agente 015)
- Qualquer outro arquivo game-core

## Dependências obrigatórias
- Agente 015 concluído

## Interface MonsterAi:
```ts
export enum AiLevel { EASY, INTERMEDIATE, BOSS }
export interface MonsterAi {
  level: AiLevel; aimErrorDegrees: number; forceErrorPercent: number;
  usesCover: boolean; targetsWeakest: boolean; phaseThresholds?: number[];
}
```

## Critérios de aceite
- EASY falha mais vezes que BOSS visivelmente
- Golem muda comportamento ao atingir 50% HP
- DungeonScene carrega o mapa correto para cada fase
- Inimigos são renderizados com sprite distinto do jogador
- Golem (BOSS) usa cobertura: tenta posicionar atrás de INDESTRUCTIBLE

## Memory

### Objetivo
MonsterAI (3 níveis) + Golem com fases + DungeonScene Phaser.

### Contexto permitido
Tabela de IA + spec do Golem + APIs de DungeonEngine (015).

### Arquivos autorizados
Os listados.

### Dependências
015 concluído.

### Restrições
- BOSS AI só prioriza fraco se houver múltiplos alvos (versão futura); nesta versão há 1 jogador.
- Golem destrói terreno na fase 2 chamando `terrainEngine.explode()` em células próximas ao jogador.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-016.md`.

## Limpeza pós-versão
Após v0.8.0 completa (015+016+017): deletar `v0.8.0.md` da raiz.
