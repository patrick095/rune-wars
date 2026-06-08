# Agent 013 — v0.7.0 Terrain Construction (Runic Builder)

## Objetivo
Adicionar material `CONSTRUCTED` ao TerrainEngine, implementar Modo Linha Rúnica e Modo Bloco Rúnico, rastreamento de limite por jogador, e ativar o item `runic-builder` com lógica real.

## Contexto mínimo necessário

### Novo material:
```ts
export enum TerrainMaterial { EMPTY=0, DESTRUCTIBLE=1, INDESTRUCTIBLE=2, CONSTRUCTED=3 }
```

### Modo Linha Rúnica: a cada N pixels do projétil, cria célula CONSTRUCTED
### Modo Bloco Rúnico: no impacto, cria área N×N de células CONSTRUCTED
### Limite: 20 células CONSTRUCTED por jogador por partida
### Cor CONSTRUCTED: 0x44AA44 (verde rúnico)
### Terreno CONSTRUCTED pode ser destruído; não tem gravidade

## Arquivos autorizados a criar/alterar
```
system/frontend/src/app/shared/game-core/
  terrain-engine.ts (adicionar CONSTRUCTED + métodos de construção)
  terrain-types.ts (adicionar CONSTRUCTED ao enum)
system/frontend/src/app/shared/game-core/
  secondary-item-system.ts (ativar runic-builder com lógica real)
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  projectile-physics.ts
  weapon-definition.ts
```

## O que NÃO mexer
- Outros arquivos de game-core
- Qualquer arquivo Phaser/Angular (renderização é do agente 006 — apenas adicionar suporte ao CONSTRUCTED no renderer)

## Dependências obrigatórias
- Agentes 011 + 012 concluídos

## Métodos a adicionar no TerrainEngine:
```ts
drawRunicLine(path: {x,y}[], playerId: string): number  // retorna células criadas
placeRunicBlock(cx: number, cy: number, size: number, playerId: string): number
getConstructedCount(playerId: string): number
```

## Critérios de aceite
- CONSTRUCTED não é removido por explosões (ou é — confirmar: spec diz que pode ser destruído, então SIM é removido)
- CONSTRUCTED não cai com gravidade
- Limite de 20 células por jogador respeitado
- `drawRunicLine` não cria mais do que o limite restante
- Item `runic-builder` agora funciona (não é mais placeholder)

## Memory

### Objetivo
CONSTRUCTED material + Linha/Bloco Rúnico + limite por jogador.

### Contexto permitido
Enum TerrainMaterial + métodos acima + spec: CONSTRUCTED pode ser destruído, não tem gravidade.

### Arquivos autorizados
Os listados.

### Dependências
011+012 concluídos.

### Restrições
- Não quebrar `explode()` existente — CONSTRUCTED deve ser removível por explosão.
- TerrainRenderer (agente 006) precisa ser atualizado para mostrar CONSTRUCTED — criar nota para o orquestrador.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-013.md`.

## Limpeza pós-versão
Após v0.7.0 completa (013+014): deletar `v0.7.0.md` da raiz.
