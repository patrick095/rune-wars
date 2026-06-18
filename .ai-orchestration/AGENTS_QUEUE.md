# Fila de Subagentes — v1.8.0

## Prontos para executar (sem dependência)
- 001 — Raridade Core
- 003 — Economia de Ouro
- 006 — Gate (DungeonProgress)
- 017 — Mapas de Dungeon
- 018 — Prompts de Assets

## Executando
- (nenhum)

## Aguardando dependência
- 002 — Catálogo ← 001
- 004 — Craft Backend ← 001, 002
- 005 — Upgrade Backend ← 002, 003
- 007 — PortalService ← 001, 002, 003
- 010 — Raridade Display+Combate ← 001
- 012 — Academia ← 001
- 013 — Dungeon Content ← 001
- 008 — Dungeon Salas ← 006, 007
- 009 — PvP Rewards Hook ← 007
- 011 — Ferreiro UI ← 002, 004, 005
- 016 — RewardPortals UI ← 007, 009
- 014 — DungeonScene ← 013, 017
- 015 — Dungeon Lobby/Room UI ← 008 (e 011 p/ GameScreen)
- 019 — Integração + Docs + QA ← TODOS

## Concluídos
- (nenhum)

## Bloqueados
- (nenhum)

## Cancelados
- (nenhum)

## Ordem recomendada
1. **Fase 1 (paralelo):** 001, 003, 006, 017, 018
2. **Fase 2a:** 002 (após 001)
3. **Fase 2b (paralelo, após 002/003):** 004, 005, 007, 010, 012, 013
4. **Fase 3a (paralelo):** 008 (após 006,007), 009 (após 007), 011 (após 002,004,005), 013→ pronto
5. **Fase 3b (paralelo):** 016 (após 007,009), 014 (após 013,017), 015 (após 008,011)
6. **Fase 4:** 019 (após todos)
