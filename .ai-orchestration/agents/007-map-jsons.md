# Sub-spec — Agente 007: Atualizar JSONs de Mapa PVP

## Objetivo exato
Atualizar os 5 arquivos JSON de mapa PVP: remover o campo `grid` (que representa ~141KB por arquivo), renomear `map-castle.json` para `map-mystic-castle.json`, e atualizar `spawnPoints` com as coordenadas de pixel geradas pelo Agente 001.

## Contexto mínimo necessário

### Arquivos a modificar
Todos em: `system/frontend/src/app/shared/game-core/maps/`
- `map-plains.json` (141KB)
- `map-castle.json` (141KB) → renomear para `map-mystic-castle.json`
- `map-deep-mines.json` (141KB)
- `map-arcane-ruins.json` (141KB)
- `map-runic-forest.json` (141KB)

### Formato final de cada JSON
```json
{
  "meta": {
    "name": "Nome do Mapa",
    "width": 1672,
    "height": 941,
    "spawnPoints": [
      { "x": 140, "y": 820 },
      ...12 pontos total...
    ]
  }
}
```
- Campo `grid` deve ser completamente removido
- Campo `meta.spawnPoints` deve ser substituído pelos valores do Agente 001
- Adicionar `meta.width: 1672` e `meta.height: 941` se não existirem

### Spawn points
Ler o arquivo `.ai-orchestration/agents/001-spawn-points-resumo.md` para obter os 12 spawn points por mapa.

### Renomear castle
Após criar `map-mystic-castle.json`, o arquivo `map-castle.json` deve ser deletado.
O import em `battle.scene.ts` já terá sido atualizado pelo Agente 006 para `map-mystic-castle.json`.

## Arquivos que pode alterar/criar/deletar
- `system/frontend/src/app/shared/game-core/maps/map-plains.json` — modificar
- `system/frontend/src/app/shared/game-core/maps/map-castle.json` — deletar
- `system/frontend/src/app/shared/game-core/maps/map-mystic-castle.json` — criar (conteúdo de castle + novo nome)
- `system/frontend/src/app/shared/game-core/maps/map-deep-mines.json` — modificar
- `system/frontend/src/app/shared/game-core/maps/map-arcane-ruins.json` — modificar
- `system/frontend/src/app/shared/game-core/maps/map-runic-forest.json` — modificar

## Arquivos que deve apenas consultar
- `.ai-orchestration/agents/001-spawn-points-resumo.md` — spawn points gerados
- `.ai-orchestration/agents/006-battle-scene-resumo.md` — confirmar que castle foi renomeado

## O que NÃO deve mexer
- Nenhum arquivo TypeScript
- JSONs de dungeon ou outros modos (se existirem)

## Dependências obrigatórias
- Agente 001 (spawn points por mapa)
- Agente 006 (battle.scene.ts atualizado, confirmar que map-mystic-castle.json é o nome correto)

## Critérios de aceite
- [ ] Campo `grid` removido de todos os 5 JSONs
- [ ] `map-castle.json` deletado
- [ ] `map-mystic-castle.json` criado
- [ ] Cada JSON tem `meta.spawnPoints` com exatamente 12 itens `{x, y}`
- [ ] Cada JSON tem `meta.width: 1672` e `meta.height: 941`
- [ ] Tamanho dos arquivos reduzido significativamente (de ~141KB para <2KB)

## Instrução exata para execução
```
Você é o Agente 007. Leia .ai-orchestration/agents/007-map-jsons.md para seu escopo completo.

Pré-requisitos:
- Confirme que Agente 001 concluiu: leia .ai-orchestration/agents/001-spawn-points-resumo.md
- Confirme que Agente 006 concluiu: leia .ai-orchestration/agents/006-battle-scene-resumo.md

Sua tarefa:
1. Ler os spawn points do resumo do Agente 001
2. Para cada mapa, criar o novo JSON no formato correto (sem grid, com spawn points e meta)
3. Renomear map-castle.json → map-mystic-castle.json (criar novo, deletar velho)
4. Verificar que cada JSON tem exatamente 12 spawn points
5. Criar .ai-orchestration/agents/007-map-jsons-resumo.md com status

ATENÇÃO: Os JSONs têm 141KB cada porque contêm um array grid massivo. O novo formato deve ter apenas meta com spawnPoints — o arquivo final deve ter poucos kilobytes.
```

---

## Memory — Agente 007: Atualizar JSONs de Mapa PVP

### Objetivo
Remover campo grid dos 5 JSONs PVP, atualizar spawnPoints com coordenadas pixel, renomear castle→mystic-castle.

### Contexto permitido
- 5 arquivos JSON de mapa em `system/frontend/src/app/shared/game-core/maps/`
- Resumo do Agente 001 para spawn points
- Resumo do Agente 006 para confirmação de renomearção

### Arquivos autorizados
- Modificar/criar/deletar: os 5 JSONs de mapa PVP

### Dependências
- Agente 001 (spawn points)
- Agente 006 (castle renomeado)

### Restrições
- NÃO alterar TypeScript
- NÃO tocar JSONs fora do escopo PVP

### Critérios de aceite
- grid removido de todos os 5 JSONs
- 12 spawn points {x,y} por mapa
- map-castle.json deletado, map-mystic-castle.json criado
- Arquivos reduzidos de ~141KB para ~2KB
