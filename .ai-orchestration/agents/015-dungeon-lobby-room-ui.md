# Agente 015 — Dungeon Lobby + Room UI (frontend)

## Memory — Dungeon Lobby/Room

### Objetivo
Criar o Lobby e a Sala de dungeon estilo PvP (lista/criação/entrada de salas; slots, andar/dificuldade, consumíveis, inventário, PRONTO, regroup), consumindo os endpoints reais (Agente 008).

### Contexto permitido
- Spec §10.4, §14.4, §12 (UI). Molde: `PvpLobbyComponent` / `PvpRoomComponent`.
- Lobby: lista `/dungeon/rooms`, polling 5s, criar (modal andar+dificuldade, gate visível), entrar (bloqueio cheia/in_battle).
- Sala: 4 slots; seletor andar/dificuldade (dono, respeita gate); 5 consumíveis; botão Inventário (reusa overlay); PRONTO; start (dono); tela de regroup ("Prepare-se para o estágio N").
- `GameScreen` `dungeon-lobby`/`dungeon-room` JÁ adicionados pelo Agente 011 — apenas usar.

### Arquivos autorizados (criar/editar)
- `system/frontend/src/app/dungeon/dungeon-lobby/*` (refatorar/expandir existente)
- `system/frontend/src/app/dungeon/dungeon-room/*` (NOVO)
- `system/frontend/src/app/shared/services/dungeon-storage.service.ts` (trocar storage local por chamadas reais)
- `system/frontend/src/app/app.component.ts/.html` (@case dungeon-lobby/dungeon-room — coordenar com 011)

### Arquivos apenas de consulta
- `system/frontend/src/app/pvp/pvp-lobby/*`, `pvp-room/*` (molde)
- Endpoints dungeon-floors (008); rarity display (010); inventory overlay

### O que NÃO mexer
- `game-navigator.service.ts` GameScreen type (dono = 011); DungeonScene (014); backend.

### Dependências obrigatórias
- **008** (endpoints de sala). (011 já registrou GameScreen.)

### Critérios de aceite (§25.5/§25.6)
- Lobby lista salas (andar/dif/players/status), bloqueia cheia/in_battle, máx 4; criar respeita gate; sala inicia no estágio 1; regroup entre estágios.
- `tsc --noEmit && ng build` passam.

### Checklist granular
- [ ] 15.1 DungeonLobbyComponent (lista + polling + estado vazio)
- [ ] 15.2 Modal criar sala (andar+dificuldade, gate visível)
- [ ] 15.3 Entrar (bloqueio cheia/in_battle)
- [ ] 15.4 DungeonRoomComponent (4 slots, seletores, consumíveis, PRONTO, start)
- [ ] 15.5 Botão Inventário (overlay) + tela de regroup
- [ ] 15.6 dungeon-storage.service → endpoints reais + @case AppComponent
- [ ] 15.7 typecheck + build frontend

### Comando de execução
"Implemente o Agente 015 conforme o arquivo. Atualize o checklist granular após cada item. Gere `015-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
