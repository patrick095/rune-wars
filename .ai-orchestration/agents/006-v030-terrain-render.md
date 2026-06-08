# Agent 006 — v0.3.0 Terrain Rendering + Fall Physics

## Objetivo
Integrar `TerrainEngine` ao Phaser: renderizar o grid com Graphics, atualizar visual após explosão, implementar física de queda do personagem, e expandir o painel de debug com controles de terreno.

## Contexto mínimo necessário
- Renderização: usar `Phaser.GameObjects.Graphics` com retângulos por célula (MVP)
- Cores: DESTRUCTIBLE = 0x8B4513 (marrom terra), INDESTRUCTIBLE = 0x444444 (cinza escuro)
- Após explosão: redesenhar apenas as células da `ExplosionResult.cellsDestroyed`
- Queda: se `getFloorBelow(x,y)` != atual → aplicar velocidade Y até chegar no chão

## Arquivos autorizados a criar/alterar
```
system/frontend/src/
  game/
    scenes/
      battle.scene.ts (integrar TerrainEngine, adicionar terreno)
    terrain/
      terrain-renderer.ts
      character-fall.ts
  app/
    playground/
      debug-overlay/
        debug-overlay.component.ts (adicionar controles de terreno)
        debug-overlay.component.html
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  terrain-engine.ts
  terrain-types.ts
  maps/map-plains.json
  maps/map-castle.json
  projectile-physics.ts
```

## O que NÃO mexer
- `terrain-engine.ts` e `terrain-types.ts` (do agente 005)
- Qualquer arquivo de `game-core/` TS puro

## Dependências obrigatórias
- Agente 005 concluído (TerrainEngine disponível)

## Painel de debug a adicionar
- Select: material (DESTRUCTIBLE/INDESTRUCTIBLE/EMPTY)
- Clique no mapa: pinta célula com material selecionado
- Slider: raio de explosão
- Botão: explodir no cursor
- Botão: resetar mapa
- Select: alternar entre Mapa 1 e Mapa 2

## Critérios de aceite
- Terreno destrutível some visualmente após explosão
- Terreno indestrutível não muda visualmente
- Personagem cai quando perde suporte
- Personagem pousa no novo chão
- Debug permite pintar e explodir em tempo real
- Jogo continua após múltiplas explosões

## Memory

### Objetivo
Renderizar TerrainEngine no Phaser + física de queda + debug.

### Contexto permitido
APIs do TerrainEngine (005) + APIs do BattleScene (004).

### Arquivos autorizados
Os listados acima.

### Dependências
005 concluído.

### Restrições
- Grid lógico é a fonte da verdade; não manter estado visual separado.
- Após explosão, sincronizar visual com estado lógico do TerrainEngine.
- Queda não mata o personagem nesta versão.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-006.md`.

## Limpeza pós-versão
Após v0.3.0 completa (005+006): deletar `v0.3.0.md` da raiz.
