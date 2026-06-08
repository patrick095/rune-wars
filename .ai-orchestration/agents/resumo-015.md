# Resumo Agente 015

**Status:** Concluído

**Arquivos criados/modificados:**
- `system/frontend/src/app/shared/game-core/dungeon-types.ts` — tipos de objetivo, fase, inimigo, jogador, alvo protegido e `DungeonState`
- `system/frontend/src/app/shared/game-core/dungeon-engine.ts` — `DungeonEngine` TS puro com Andar 1, objetivos, 3 vidas, recompensas e transição de fases
- `system/frontend/src/app/shared/game-core/maps/dungeon-cave-entrance.json` — mapa da Entrada da Caverna
- `system/frontend/src/app/shared/game-core/maps/dungeon-cave-hall.json` — mapa do Salão dos Morcegos
- `system/frontend/src/app/shared/game-core/maps/dungeon-cave-boss.json` — mapa do Covil do Golem Menor

**Decisões:**
- O engine mantém estado mutável internamente e expõe cópias via `getState()` para evitar alteração externa acidental
- `PROTECT` usa `recordProtectedTurn()` para contar turnos sobrevividos e falha imediatamente se o cristal chega a 0 HP
- `loseLife()` reinicia a fase atual e restaura HP do jogador; ao chegar a 0 vidas define `FAILED`
- `advancePhase()` coleta recompensa da fase concluída e define `FLOOR_COMPLETE` ao finalizar o chefe
- Mapas usam o formato `{ "grid": number[][] }` compatível com `TerrainEngine`
