# Implementar Tudo — Rune Wars v0.1.0 → v1.0.0

## Objetivo Geral

Implementar o MMORPG 2D Rune Wars em 10 versões incrementais (v0.1.0–v1.0.0), sempre com o projeto rodando, usando 32 agentes especializados com contexto mínimo.

## Estratégia

- Cada agente recebe apenas o contexto do seu escopo. Nada além.
- Versões v0.1.0–v0.8.0: frontend-only (Angular + Phaser), sem backend.
- Versão v0.9.0: primeira integração backend (NestJS + PostgreSQL + Redis).
- Versão v1.0.0: sistemas avançados divididos em sub-agentes paralelos.
- Após cada versão completa: deletar o arquivo `vX.Y.Z.md` da raiz.
- Código backend → `system/backend/`, frontend → `system/frontend/`, infra → `devops/`.

---

## Fila de Execução

### Fase 0 — v0.1.0: Setup Jogável Local

Executar em paralelo:
- `001-v010-devops-setup` — Docker, Dockerfile, docker-compose
- `002-v010-angular-phaser` — Angular + Phaser + rota /playground

Aguardar ambos → validar `docker-compose up` → deletar `v0.1.0.md`

---

### Fase 1 — v0.2.0: Tiro, Vento e IA Local

Aguardar: Fase 0 completa

Executar em paralelo:
- `003-v020-game-logic` — TurnManager, WindSystem, ProjectilePhysics, DamageCalculator (TS puro)
- `004-v020-ai-battle` — AiLocal, BattleScene Phaser, HUD, controles, debug

Aguardar ambos → deletar `v0.2.0.md`

---

### Fase 2 — v0.3.0: Terreno Destrutível

Aguardar: Fase 1 completa

Executar em paralelo:
- `005-v030-terrain-engine` — TerrainEngine TS puro, mapas JSON
- `006-v030-terrain-render` — renderização Phaser, física de queda, integração

Aguardar ambos → deletar `v0.3.0.md`

---

### Fase 3 — v0.4.0: Armas com Física Própria

Aguardar: Fase 2 completa

Executar em paralelo:
- `007-v040-weapon-system` — WeaponSystem, WeaponDefinition, 6 armas (TS puro)
- `008-v040-weapon-phaser` — sprites/cores por arma, boomerang, debug

Aguardar ambos → deletar `v0.4.0.md`

---

### Fase 4 — v0.5.0: Personagem Customizável

Aguardar: Fase 3 completa

Executar em paralelo:
- `009-v050-attribute-system` — PlayerStats, AttributeCalculator, requisitos de armas
- `010-v050-character-ui` — rota /character, localStorage, 5 presets

Aguardar ambos → deletar `v0.5.0.md`

---

### Fase 5 — v0.6.0: Efeitos Rúnicos e Consumíveis

Aguardar: Fase 4 completa

Executar em paralelo:
- `011-v060-runic-system` — RunicEffectSystem, StatusEffectManager, rollRunicEffect
- `012-v060-items-consumables` — 5 itens secundários, 5 consumíveis, HUD de efeitos

Aguardar ambos → deletar `v0.6.0.md`

---

### Fase 6 — v0.7.0: Construção de Terreno e Academia

Aguardar: Fase 5 completa

Executar em paralelo:
- `013-v070-terrain-construction` — material CONSTRUCTED, Linha Rúnica, Bloco Rúnico
- `014-v070-academy` — rota /academy, AcademyScene, alvos, tutorial visual

Aguardar ambos → deletar `v0.7.0.md`

---

### Fase 7 — v0.8.0: Dungeon Local

Aguardar: Fase 6 completa

Sequencial (dependência interna):
1. `015-v080-dungeon-engine` — DungeonEngine, DungeonState, fases, objetivos
2. `016-v080-dungeon-ai` — MonsterAI, Golem com fases de vida, mapas
3. `017-v080-dungeon-ui` — Lobby, telas, recompensas localStorage

Aguardar todos → deletar `v0.8.0.md`

---

### Fase 8 — v0.9.0: Backend Mínimo e Multiplayer PvP

Aguardar: Fase 7 completa

Executar em paralelo (streams independentes):
- `018-v090-devops` — docker-compose completo, Dockerfiles, .env.example
- `019-v090-backend-auth-char` — NestJS setup, AuthModule, CharacterModule, InventoryModule, DungeonModule
- `021-v090-frontend-auth` — telas login/registro, JWT interceptor

Aguardar `018` e `019` → executar:
- `020-v090-backend-battle` — BattleGateway WS, MatchmakingModule, lógica autoritativa
- `022-v090-frontend-pvp` — WebSocket PvP, matchmaking UI, reconexão

Aguardar todos → deletar `v0.9.0.md`

---

### Fase 9 — v1.0.0: Sistemas Completos

Aguardar: Fase 8 completa

Stream A — Backend sistemas (paralelo):
- `023-v100-progression` — XP/level, raças, backend progression
- `024-v100-inventory` — slots completos, todos os tipos de item
- `025-v100-ranked-pvp` — ELO, fila ranqueada, divisões
- `026-v100-rankings` — rankings diário/semanal/mensal/geral
- `027-v100-dungeon-floors` — Andares 2–5, trilhas de dificuldade
- `028-v100-craft-upgrade` — CraftModule, UpgradeModule, receitas
- `029-v100-market` — MarketModule, listagens, compra, histórico
- `030-v100-guilds` — GuildModule, PvP guildas, chat WS

Aguardar todos os sistemas → executar:
- `031-v100-frontend-screens` — todas as telas novas (craft, market, guild, rankings, dungeon)
- `032-v100-qa-consolidation` — validação final, critérios de aceite, documentação

Aguardar todos → deletar `v1.0.0.md`

---

## Mapa de Dependências

```
001 ──┐
      ├── 003 ──┐
002 ──┘         ├── 005 ──┐
      ┌── 004 ──┘         ├── 007 ──┐
      │                   ├── 009 ──┤
      │          006 ──┘  │         ├── 011 ──┐
      │                   │         ├── 013 ──┤   015 → 016 → 017
      │                   008 ──┘   │         │                  │
      │                             010 ──┘   │      012 ──┘     │
      │                                       │      014 ──┘     │
      │                                       │                   │
      └───────────────────────────────────────┴───────────────────┘
                                                                    │
                                              018, 019, 021 ──── 020, 022
                                                                    │
                                              023–030 ─────── 031, 032
```

---

## Subagentes (32 total)

| # | ID | Versão | Escopo | Paralelo com |
|---|---|---|---|---|
| 1 | 001-v010-devops-setup | v0.1.0 | Docker, Dockerfile, docker-compose | 002 |
| 2 | 002-v010-angular-phaser | v0.1.0 | Angular + Phaser + /playground | 001 |
| 3 | 003-v020-game-logic | v0.2.0 | TurnManager, WindSystem, Physics, Damage | 004 |
| 4 | 004-v020-ai-battle | v0.2.0 | AiLocal, BattleScene, HUD, debug | 003 |
| 5 | 005-v030-terrain-engine | v0.3.0 | TerrainEngine TS puro, mapas JSON | 006 |
| 6 | 006-v030-terrain-render | v0.3.0 | Renderização Phaser, queda | 005 |
| 7 | 007-v040-weapon-system | v0.4.0 | WeaponSystem, 6 armas TS puro | 008 |
| 8 | 008-v040-weapon-phaser | v0.4.0 | Sprites, boomerang, debug | 007 |
| 9 | 009-v050-attribute-system | v0.5.0 | PlayerStats, fórmulas, requisitos | 010 |
| 10 | 010-v050-character-ui | v0.5.0 | /character, localStorage, presets | 009 |
| 11 | 011-v060-runic-system | v0.6.0 | RunicEffectSystem, StatusEffectManager | 012 |
| 12 | 012-v060-items-consumables | v0.6.0 | Itens secundários, consumíveis, HUD | 011 |
| 13 | 013-v070-terrain-construction | v0.7.0 | CONSTRUCTED, Linha/Bloco Rúnico | 014 |
| 14 | 014-v070-academy | v0.7.0 | /academy, AcademyScene, alvos | 013 |
| 15 | 015-v080-dungeon-engine | v0.8.0 | DungeonEngine, fases, objetivos | — |
| 16 | 016-v080-dungeon-ai | v0.8.0 | MonsterAI, Golem, mapas dungeon | 015 |
| 17 | 017-v080-dungeon-ui | v0.8.0 | Lobby, telas, localStorage rewards | 016 |
| 18 | 018-v090-devops | v0.9.0 | docker-compose, .env.example | 019, 021 |
| 19 | 019-v090-backend-auth-char | v0.9.0 | NestJS, Auth, Character, Inventory, Dungeon | 018, 021 |
| 20 | 020-v090-backend-battle | v0.9.0 | BattleGateway, Matchmaking | 019 |
| 21 | 021-v090-frontend-auth | v0.9.0 | Login/Registro, JWT interceptor | 018, 019 |
| 22 | 022-v090-frontend-pvp | v0.9.0 | WebSocket PvP, matchmaking UI | 020 |
| 23 | 023-v100-progression | v1.0.0 | XP, level-up, raças backend | 024–030 |
| 24 | 024-v100-inventory | v1.0.0 | Slots completos, tipos de item | 023–030 |
| 25 | 025-v100-ranked-pvp | v1.0.0 | ELO, ranqueado, divisões | 023–030 |
| 26 | 026-v100-rankings | v1.0.0 | Rankings periódicos | 023–030 |
| 27 | 027-v100-dungeon-floors | v1.0.0 | Andares 2–5, trilhas | 023–030 |
| 28 | 028-v100-craft-upgrade | v1.0.0 | Craft, upgrade, receitas | 023–030 |
| 29 | 029-v100-market | v1.0.0 | Mercado P2P, listagens | 023–030 |
| 30 | 030-v100-guilds | v1.0.0 | Guildas, PvP guildas, chat | 023–030 |
| 31 | 031-v100-frontend-screens | v1.0.0 | Todas as telas v1.0.0 | 032 |
| 32 | 032-v100-qa-consolidation | v1.0.0 | QA final, critérios, docs | 031 |

---

## Instruções de Execução

1. Ler `.ai-orchestration/ORCHESTRATION_STATE.md` antes de iniciar.
2. Executar agentes na ordem da fila, respeitando paralelismo.
3. Após cada agente: atualizar `ORCHESTRATION_STATE.md`, `AGENTS_QUEUE.md`, `FILES_CHANGED.md`.
4. Após cada versão completa: deletar o arquivo `vX.Y.Z.md` da raiz **sem confirmação**.
5. Bugs críticos interrompem a fase atual antes de liberar dependentes.
6. Ao final de tudo: criar resumo permanente em `docs/implementations/` e deletar `.ai-orchestration/`.

---

## Como lidar com bugs

- **CRÍTICO:** bloquear próximas fases, criar agente corretivo imediato.
- **IMPORTANTE:** corrigir antes de avançar para próxima versão.
- **BAIXO:** registrar em `BUGS_AND_BLOCKERS.md`, tratar na consolidação.

## Como lidar com conflitos

Ao detectar conflito de arquivo entre agentes paralelos:
1. Pausar o segundo agente.
2. Registrar conflito em `DECISIONS_LOG.md`.
3. Resolver manualmente ou criar agente mediador.

## Como finalizar

1. Todos os 32 agentes `Concluído`.
2. Zero bugs críticos pendentes.
3. Critérios de aceite de cada versão validados.
4. Criar `docs/implementations/2026-06-07-rune-wars-v010-v100.md`.
5. Deletar `.ai-orchestration/`.
