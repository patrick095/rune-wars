# Implementar Tudo — Rune Wars v1.2.0 Gameplay PvP

## Objetivo Geral

Implementar todas as melhorias de gameplay PvP definidas em `v1.2.0.md`:
- Mapas grandes (300×80 células = 6000×1600px) com 12 spawn points seguros
- Atribuição aleatória de spawn por partida (Fisher-Yates shuffle)
- Movimentação com orçamento por turno baseado em agilidade
- Colisão horizontal ao caminhar + step climbing suave (max 12px)
- Morte por queda em abismos
- Facing direction + flip de sprite + mira espelhada
- Câmera com follow e bounds do mundo
- Renderização de terreno via RenderTexture com tiles (estilo DDTank/Gunbound)
- Debug overlay com todos os mapas + slider de agilidade
- Ao final: remover spec files e commitar

---

## Estratégia

Execução em 5 fases. A fase 1 é fundação obrigatória. A fase 2 é máxima paralelização.
A fase 3 é a integração central no BattleScene (arquivo crítico, um só agente).
A fase 4 valida. A fase 5 limpa e commita.

---

## Fila de Execução

### Fase 1 — Fundação (obrigatório, sequencial)
- **Agent 001** — Engine Foundation
  - Atualiza GRID_COLS=300, GRID_ROWS=80
  - Modifica CharacterFall para retornar 'alive'|'dead' e continuar queda
  - Expõe worldWidth/worldHeight em TerrainEngine
  - Parseia meta.spawnPoints do JSON

### Fase 2 — Desenvolvimento Paralelo (após Agent 001 concluir)
Pode executar todos em paralelo:
- **Agent 002** — New Helper Files (terrain-collision, spawn-selector, movement-budget-hud)
- **Agent 003** — Terrain Renderer Rewrite (RenderTexture + ERASE blend)
- **Agent 004** — Terrain Textures (placeholder tiles via Phaser Graphics)
- **Agent 005** — PvP Maps JSON (5 mapas 300×80 com spawnPoints)
- **Agent 006** — Dungeon Maps JSON (3 mapas 200×60-70 com spawnPoints)

### Fase 3 — Integração (após Fase 2 completa)
Pode executar em paralelo:
- **Agent 007** — BattleScene Integration (tudo em battle.scene.ts)
- **Agent 008** — Debug Overlay Update (todos os mapas + agilidade)

### Fase 4 — QA e Validação (após Fase 3 completa)
- **Agent 009** — TypeScript QA (tsc --noEmit + correção de erros)

### Fase 5 — Limpeza e Commit (após Fase 4 limpa)
- **Agent 010** — Cleanup & Commit

---

## Mapa de Dependências

```
001 (Foundation)
 ├── 002 (Helper Files)      ─┐
 ├── 003 (TerrainRenderer)   ─┤
 ├── 004 (Textures)          ─┤→ 007 (BattleScene)
 ├── 005 (PvP Maps)          ─┤→ 008 (Debug Overlay)
 └── 006 (Dungeon Maps)      ─┘
                               007, 008 → 009 (QA)
                                          009 → 010 (Cleanup)
```

---

## Subagentes

| # | Nome | Fase | Paralelo | Arquivos alterados |
|---|------|------|----------|-------------------|
| 001 | Engine Foundation | 1 | Não | terrain-engine.ts, character-fall.ts |
| 002 | New Helper Files | 2 | Sim | terrain-collision.ts (new), spawn-selector.ts (new), movement-budget-hud.ts (new) |
| 003 | Terrain Renderer Rewrite | 2 | Sim | terrain-renderer.ts |
| 004 | Terrain Textures | 2 | Sim | terrain-textures.ts (new) |
| 005 | PvP Maps JSON | 2 | Sim | map-*.json (5 arquivos) |
| 006 | Dungeon Maps JSON | 2 | Sim | dungeon-*.json (3 arquivos) |
| 007 | BattleScene Integration | 3 | Com 008 | battle.scene.ts |
| 008 | Debug Overlay Update | 3 | Com 007 | debug-overlay.component.ts |
| 009 | TypeScript QA | 4 | Não | Qualquer arquivo com erro de tipo |
| 010 | Cleanup & Commit | 5 | Não | Remove specs, commita |

---

## Instruções de Execução

1. Verificar `.ai-orchestration/ORCHESTRATION_STATE.md` antes de cada agente
2. Executar agente via `Agent` tool com o conteúdo do arquivo `.ai-orchestration/agents/00X-*.md`
3. Após cada agente: atualizar ORCHESTRATION_STATE.md, AGENTS_QUEUE.md, FILES_CHANGED.md
4. Se agente retornar bug CRÍTICO: parar fila dependente, criar agente corretivo
5. Se agente retornar bug IMPORTANTE: registrar em BUGS_AND_BLOCKERS.md e tratar em Agent 009
6. Nunca executar Agent 007 antes de 001, 002, 003, 004, 005, 006 estarem CONCLUÍDOS

---

## Como lidar com bugs

- **CRÍTICO** (bloqueia fases seguintes): Parar. Criar sub-spec corretivo. Reordenar fila.
- **IMPORTANTE** (não bloqueia imediatamente): Registrar em BUGS_AND_BLOCKERS.md. Agent 009 resolve.
- **BAIXO**: Registrar. Resolver no Agent 009 se houver tempo.

## Como lidar com conflitos

Se dois agentes modificarem o mesmo arquivo:
1. O segundo agente deve ler o estado atual do arquivo (já modificado pelo primeiro)
2. Integrar suas mudanças sem sobrescrever o trabalho do primeiro
3. Registrar o conflito em DECISIONS_LOG.md

## Como finalizar

1. Agent 009 deve passar sem erros de TypeScript
2. Agent 010 cria `docs/implementations/2026-06-08-v1.2.0-gameplay-pvp.md`
3. Agent 010 remove `v1.2.0.md` da raiz do projeto
4. Agent 010 faz git commit
5. Agent 010 remove `.ai-orchestration/` (último passo)
