# Implementar Tudo — v1.6.0: Motor de Mapa Bitmap + Terrain Destrutível

## Objetivo Geral
Substituir o motor de terrain baseado em grade (tiles 8×8px) por um sistema bitmap pixel-perfect. As imagens PNG reais dos mapas PVP passam a ser usadas diretamente. Explosões cortam buracos circulares via `RenderTexture.erase()`. Colisão lê o canal alpha do PNG via `Uint8Array`. 12 spawn points por mapa em coordenadas de pixel. 5 mapas PVP suportados.

## Estratégia
- 8 subagentes com escopo fechado e contexto mínimo
- Execução em 5 fases (2 paralelas iniciais, convergência progressiva)
- Sem alteração de backend ou dungeon/academy
- Build validado ao final antes de qualquer commit

---

## Fila de Execução

### Fase 1 — Paralela (independentes)
Podem executar simultaneamente:
- **Agente 001** — Criar `tools/analyze-spawns.mjs` e gerar spawn points dos 5 mapas
- **Agente 002** — Atualizar `terrain-types.ts` (WORLD_WIDTH/HEIGHT, CELL_SIZE deprecado, ExplosionResult sem cellsDestroyed)

### Fase 2 — Paralela (dependem de 002)
Podem executar simultaneamente após Agente 002 concluir:
- **Agente 003** — Reescrever `terrain-engine.ts` (Uint8Array, fromImageData, API preservada)
- **Agente 004** — Reescrever `terrain-renderer.ts` + deletar `terrain-textures.ts`
- **Agente 005** — Atualizar `spawn-selector.ts` ({x,y} em pixels)

### Fase 3 — Sequencial (depende de 003+004+005)
- **Agente 006** — Atualizar `battle.scene.ts` (preload assets reais, integração do novo motor, renomear castle→mystic_castle)

### Fase 4 — Sequencial (depende de 001+006)
- **Agente 007** — Atualizar JSONs de mapa PVP (remover grid, spawn points pixel, renomear map-castle→map-mystic-castle)

### Fase 5 — Validação Final (depende de todos)
- **Agente 008** — Rodar `ng build`, corrigir erros TypeScript, verificar regressões

---

## Mapa de Dependências

```
001-spawn-points ──────────────────────────────────────────→ 007-map-jsons
002-terrain-types → 003-terrain-engine → 006-battle-scene → 007-map-jsons → 008-validacao
002-terrain-types → 004-terrain-renderer → 006-battle-scene ↗
002-terrain-types → 005-spawn-selector → 006-battle-scene ↗
```

---

## Subagentes

| ID | Nome | Dependências | Paralelo com |
|----|------|-------------|--------------|
| 001 | Analisar e Gerar Spawn Points | nenhuma | 002 |
| 002 | Atualizar terrain-types.ts | nenhuma | 001 |
| 003 | Reescrever terrain-engine.ts | 002 | 004, 005 |
| 004 | Reescrever terrain-renderer.ts + deletar terrain-textures | 002 | 003, 005 |
| 005 | Atualizar spawn-selector.ts | 002 | 003, 004 |
| 006 | Atualizar battle.scene.ts | 003, 004, 005 | — |
| 007 | Atualizar JSONs de mapa PVP | 001, 006 | — |
| 008 | Validação e Build | 001–007 | — |

---

## Arquivos Alterados por Agente

| Arquivo | Agente | Operação |
|---------|--------|----------|
| `tools/analyze-spawns.mjs` | 001 | Criar |
| `system/frontend/src/app/shared/game-core/terrain-types.ts` | 002 | Modificar |
| `system/frontend/src/app/shared/game-core/terrain-engine.ts` | 003 | Reescrever |
| `system/frontend/src/game/terrain/terrain-renderer.ts` | 004 | Reescrever |
| `system/frontend/src/game/terrain/terrain-textures.ts` | 004 | **Deletar** |
| `system/frontend/src/game/terrain/spawn-selector.ts` | 005 | Modificar |
| `system/frontend/src/game/scenes/battle.scene.ts` | 006 | Modificar |
| `system/frontend/src/app/shared/game-core/maps/map-plains.json` | 007 | Modificar |
| `system/frontend/src/app/shared/game-core/maps/map-castle.json` | 007 | **Deletar** |
| `system/frontend/src/app/shared/game-core/maps/map-mystic-castle.json` | 007 | Criar |
| `system/frontend/src/app/shared/game-core/maps/map-deep-mines.json` | 007 | Modificar |
| `system/frontend/src/app/shared/game-core/maps/map-arcane-ruins.json` | 007 | Modificar |
| `system/frontend/src/app/shared/game-core/maps/map-runic-forest.json` | 007 | Modificar |

---

## Instruções de Execução

### Pré-requisito
Ler `.ai-orchestration/ORCHESTRATION_STATE.md` para verificar se já há execução em andamento.

### Execução passo a passo

**Passo 1 — Fase 1 (paralela)**
Execute os dois agentes em paralelo:
```
[Agente 001] Siga .ai-orchestration/agents/001-spawn-points.md
[Agente 002] Siga .ai-orchestration/agents/002-terrain-types.md
```

**Passo 2 — Verificar Fase 1**
Confirmar que ambos os resumos existem com status Concluído:
- `.ai-orchestration/agents/001-spawn-points-resumo.md`
- `.ai-orchestration/agents/002-terrain-types-resumo.md`

**Passo 3 — Fase 2 (paralela)**
Execute os três agentes em paralelo (002 deve estar concluído):
```
[Agente 003] Siga .ai-orchestration/agents/003-terrain-engine.md
[Agente 004] Siga .ai-orchestration/agents/004-terrain-renderer.md
[Agente 005] Siga .ai-orchestration/agents/005-spawn-selector.md
```

**Passo 4 — Verificar Fase 2**
Confirmar resumos com status Concluído para 003, 004, 005.

**Passo 5 — Fase 3 (sequencial)**
```
[Agente 006] Siga .ai-orchestration/agents/006-battle-scene.md
```

**Passo 6 — Verificar Fase 3**
Confirmar `.ai-orchestration/agents/006-battle-scene-resumo.md` como Concluído.

**Passo 7 — Fase 4 (sequencial)**
```
[Agente 007] Siga .ai-orchestration/agents/007-map-jsons.md
```

**Passo 8 — Fase 5 — Validação**
```
[Agente 008] Siga .ai-orchestration/agents/008-validacao-build.md
```

---

## Como lidar com bugs

### Bug CRÍTICO (bloqueia build ou runtime)
1. Registrar em `.ai-orchestration/BUGS_AND_BLOCKERS.md` como CRÍTICO
2. Criar novo sub-spec em `.ai-orchestration/agents/009-bug-fix-{nome}.md`
3. Executar agente corretivo antes de prosseguir com fases dependentes
4. Atualizar `ORCHESTRATION_STATE.md` e `AGENTS_QUEUE.md`

### Bug IMPORTANTE (erro de tipo, lógica incorreta)
1. Registrar em `BUGS_AND_BLOCKERS.md` como IMPORTANTE
2. O Agente 008 pode corrigir diretamente se for erro de compilação
3. Se for lógica, criar agente corretivo pontual

### Bug BAIXO (warning, style, cosmético)
1. Registrar em `BUGS_AND_BLOCKERS.md` como BAIXO
2. Acumular para tratar no final ou deixar como pendência documentada

---

## Como lidar com conflitos

Se dois agentes tocarem o mesmo arquivo:
1. Verificar `FILES_CHANGED.md` antes de iniciar cada agente
2. Se conflito detectado, o agente subsequente deve ler o arquivo já modificado
3. Nunca sobrescrever mudanças do agente anterior sem ler primeiro
4. Registrar o conflito em `DECISIONS_LOG.md`

---

## Como finalizar

Após Agente 008 concluir com sucesso:

1. Verificar checklist em `.ai-orchestration/FINAL_CLEANUP.md`
2. Criar resumo final permanente em `docs/implementations/2026-06-10-v1.6.0-motor-bitmap-pvp.md`
3. Remover `.ai-orchestration/` com `rm -rf .ai-orchestration/`
4. Perguntar ao usuário sobre commit

---

## Retomada

Se a implementação for interrompida, retome assim:
```
/plan continue
```
Ou manualmente:
1. Ler `.ai-orchestration/ORCHESTRATION_STATE.md`
2. Ler `.ai-orchestration/AGENTS_QUEUE.md`
3. Continuar da "Próxima ação recomendada"
