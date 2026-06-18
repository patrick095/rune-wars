# Agente 016 — RewardPortals UI (reutilizável dungeon + PvP)

## Memory — RewardPortals UI

### Objetivo
Criar o overlay de portais de recompensa reutilizável por dungeon e PvP: 8/16 portais, timer 10s, seleção (1 ou 2), auto-pick, chamada de `select`, reveal/ganhos com cor de raridade.

### Contexto permitido
- Spec §14.4 (RewardPortalsComponent), §10.6 (fluxo/composição), §12 (UI/timer numérico).
- 8 portais → escolhe 1 (estágio normal / PvP); 16 → escolhe 2 (boss). Timer 10s visível (número + barra); auto-pick aleatório ao expirar; boss exige 2 seleções; tela de revelação (ícone + nome+raridade ou ouro); animação de abertura.
- Acionado no fim do estágio de dungeon (Agente 014) e fim da partida PvP (gancho em `pvp.component`).

### Arquivos autorizados (criar/editar)
- `system/frontend/src/app/shared/components/reward-portals/*` (NOVO)
- `system/frontend/src/app/pvp/pvp.component.ts` (gatilho no fim da partida — apenas abrir o overlay)

### Arquivos apenas de consulta
- Endpoint `select`/`rewards` (007/009); rarity.ts + RARITY_COLORS (001); item-catalog (002)

### O que NÃO mexer
- PortalService backend (007/009); `pvp-room.component` labels (010); DungeonScene interna (014 só invoca o componente).

### Dependências obrigatórias
- **007** (select dungeon), **009** (rewards PvP). (001/002 p/ exibição.)

### Critérios de aceite (§25.8)
- 8/16 portais, timer 10s + auto-pick, seleção 1/2, reveal com ganhos; cores de raridade; usável por dungeon e PvP.
- `tsc --noEmit && ng build` passam.

### Checklist granular
- [ ] 16.1 RewardPortalsComponent (render 8/16 + frames de raridade)
- [ ] 16.2 Timer 10s (número+barra) + auto-pick
- [ ] 16.3 Seleção 1/2 (boss) + unicidade
- [ ] 16.4 Chamada `select` + reveal/ganhos (item/pedra/ouro)
- [ ] 16.5 Gatilho no fim da partida PvP (pvp.component)
- [ ] 16.6 typecheck + build frontend

### Comando de execução
"Implemente o Agente 016 conforme o arquivo. Atualize o checklist granular após cada item. Gere `016-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
