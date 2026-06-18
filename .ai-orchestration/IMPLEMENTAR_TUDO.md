# Implementar Tudo — v1.8.0

## Objetivo Geral
Entregar as 7 frentes da v1.8.0 (Raridade 4 tiers, Ferreiro em abas, Academia, Dungeon Andares 1–2 com lobby/salas estilo PvP, Portais de recompensa, Economia de Ouro), com **batalha client-side** e **lobby/portais/progresso autoritativos no backend**. Referência: `docs/implementations/2026-06-18-v1.8.0-spec.md`.

## Estratégia
Ordem por blocos compiláveis (spec §24): **Raridade → Catálogo → Backend (Ferreiro/Gate/Portais/Salas) → Frontend (Display/Ferreiro/Academia/Dungeon) → Consolidação.** Cada agente tem escopo fechado, contexto mínimo e checklist granular. O estado é salvo **após cada item** em `ORCHESTRATION_STATE.md` para retomada exata.

## Fila de Execução

### Fase 1 — Preparação (paralelo, sem dependências)
- 001 Raridade Core · 003 Economia de Ouro · 006 Gate · 017 Mapas · 018 Prompts de Assets

### Fase 2 — Catálogo + Backend de domínio
- 002 Catálogo (após 001)
- Paralelo após 002/003: 004 Craft · 005 Upgrade · 007 PortalService · 010 Raridade Display · 012 Academia · 013 Dungeon Content

### Fase 3 — Integração de domínio + UI
- 008 Dungeon Salas (após 006, 007) · 009 PvP Rewards (após 007) · 011 Ferreiro UI (após 002, 004, 005)
- 016 RewardPortals UI (após 007, 009) · 014 DungeonScene (após 013, 017) · 015 Dungeon Lobby/Room (após 008; 011 p/ GameScreen)

### Fase 4 — Consolidação
- 019 Integração + Docs + QA (após todos)

## Mapa de Dependências
```
001 ─┬─ 002 ─┬─ 004 ─┐
     │       └─ 005 ─┼─ 011 ─┐
     │  003 ─┴─ 005  │       ├─ 015
     ├─ 007 ─┬─ 008 ─┘  006 ─┘
     │  003 ─┘  └─ (gate 006)
     ├─ 007 ─── 009 ─── 016
     ├─ 010
     ├─ 012
     └─ 013 ─── 014 ─── (016 portais)
        017 ───┘
TODOS ─── 019
```
- 001 é base de quase tudo (raridade). 002 depende de 001. 003 é independente. 006/017/018 independentes.
- 007 (portais) precisa 001+002+003. 008 (salas) precisa 006+007. 009 precisa 007.
- 011 (Ferreiro) precisa 002+004+005 e é dono do `GameScreen`. 014 precisa 013+017. 015 precisa 008 (+GameScreen do 011). 016 precisa 007+009.

## Subagentes
Sub-specs em `.ai-orchestration/agents/001..019-*.md`. Orquestrador em `000-orquestrador.md`.

| # | Agente | Camada | Depende de |
|---|--------|--------|-----------|
| 001 | Raridade Core | game-core + backend | — |
| 002 | Catálogo (fragmentos/pedras) | game-core | 001 |
| 003 | Economia de Ouro | backend | — |
| 004 | Craft Backend | backend | 001, 002 |
| 005 | Upgrade Backend | backend | 002, 003 |
| 006 | Gate (DungeonProgress) | backend | — |
| 007 | PortalService | backend | 001, 002, 003 |
| 008 | Dungeon Salas | backend | 006, 007 |
| 009 | PvP Rewards Hook | backend | 007 |
| 010 | Raridade Display+Combate | frontend | 001 |
| 011 | Ferreiro UI | frontend | 002, 004, 005 |
| 012 | Academia | frontend | 001 |
| 013 | Dungeon Content | game-core | 001 |
| 014 | DungeonScene | frontend | 013, 017 |
| 015 | Dungeon Lobby/Room UI | frontend | 008 (011) |
| 016 | RewardPortals UI | frontend | 007, 009 |
| 017 | Mapas de Dungeon | dados | — |
| 018 | Prompts de Assets | docs | — |
| 019 | Integração + Docs + QA | consolidação | todos |

## Instruções de Execução
1. Sempre começar pelo primeiro item `[ ]` em `ORCHESTRATION_STATE.md`.
2. Executar item → **atualizar estado imediatamente** (ORCHESTRATION_STATE + FILES_CHANGED + summary incremental).
3. Liberar dependentes só após o resumo final do agente.
4. Validar (typecheck+build) ao fim de cada agente de backend/frontend.

## Como lidar com bugs
CRÍTICO → sub-spec corretivo imediato + bloqueio de dependentes. IMPORTANTE → antes da consolidação. BAIXO → Agente 019. Registrar em `BUGS_AND_BLOCKERS.md`.

## Como lidar com conflitos
Donos de arquivos compartilhados em `FILES_CHANGED.md` (GameScreen=011, item-catalog=002, app.component coordenado 011→015). Agentes que só consultam não editam.

## Como finalizar
Agente 019 valida §25, roda builds, atualiza docs, cria o summary permanente em `docs/implementations/`. Depois: checklist `FINAL_CLEANUP.md` → `rm -rf .ai-orchestration/` → pergunta de commit.
