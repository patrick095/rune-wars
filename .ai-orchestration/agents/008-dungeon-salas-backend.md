# Agente 008 — Dungeon Salas (estender dungeon-floors)

## Memory — Dungeon Salas

### Objetivo
Transformar `dungeon-floors` em lobby/sala estilo PvP: estender `DungeonLobby` e criar os endpoints de sala (CRUD, join/leave/ready/settings/start, stage-complete, regroup), integrando gate (006) e portais (007).

### Contexto permitido
- Spec §13.3, §10.4, §10.5 (gate), §11 (fluxo). Molde: `PvpService`/`PvpRoom`.
- **DungeonLobby JÁ TEM** floor/track/status/members (simple-array). ADICIONAR: `difficulty` (easy|medium|hard|heroic, mapeada p/ track: easy→initiates, medium→adventurers, hard→champions, heroic→heroes), `max_members` (4), `slots` (jsonb `DungeonSlot[]`: playerId/playerName/ready/weaponId/consumableSelection/equippedLoadout), `current_stage`, `stage_count`, `portal_state` (jsonb), `status` estendido (waiting|in_battle|portal|regroup|completed|failed).
- Endpoints: `GET /dungeon/rooms`; `POST /dungeon/rooms` (valida gate via 006); `POST /dungeon/rooms/:id/join` (cheia/in_battle); `.../leave`, `.../ready`, `.../settings` (andar/dif, só dono, revalida gate), `.../start`, `.../stage-complete` (gera portais via 007; no boss chama recordFloorClear 006), `.../regroup` (vida restaurada). Cleanup por TTL (igual PvP).

### Arquivos autorizados (criar/editar)
- `system/backend/src/dungeon-floors/dungeon-lobby.entity.ts`
- `system/backend/src/dungeon-floors/dungeon-floors.service.ts`
- `system/backend/src/dungeon-floors/dungeon-floors.controller.ts`
- `system/backend/src/dungeon-floors/dungeon-floor.config.ts`
- `system/backend/src/dungeon-floors/dungeon-floors.module.ts` (importar PortalModule/DungeonModule)

### Arquivos apenas de consulta
- `system/backend/src/pvp/pvp.service.ts`, `pvp-room.entity.ts` (molde)
- `system/backend/src/dungeon/dungeon.service.ts` (gate — 006)
- `system/backend/src/dungeon-rewards/portal.service.ts` (007)

### O que NÃO mexer
- PortalService interno (007), gate interno (006), UI.

### Dependências obrigatórias
- **006** (gate), **007** (portais).

### Critérios de aceite
- Salas listam andar/dificuldade/players/status; bloqueia cheia/in_battle; máx 4; gate no create/settings; stage-complete gera portais e (boss) registra clear; regroup restaura vida.
- Testes integração. `tsc --noEmit && nest build` passam.

### Checklist granular
- [ ] 8.1 Estender entity (difficulty/max_members/slots/current_stage/stage_count/portal_state/status)
- [ ] 8.2 `GET /dungeon/rooms` + `POST /dungeon/rooms` (gate)
- [ ] 8.3 join/leave/ready (cheia/in_battle)
- [ ] 8.4 settings (dono, revalida gate) + start
- [ ] 8.5 stage-complete (portais 007 + clear 006 no boss)
- [ ] 8.6 regroup (restaura vida) + cleanup TTL
- [ ] 8.7 Migration de referência + testes + typecheck/build

### Comando de execução
"Implemente o Agente 008 conforme o arquivo. Atualize o checklist granular após cada item. Gere `008-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
