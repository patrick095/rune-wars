# Agente 010 — Raridade: Exibição + Combate (telas existentes)

## Memory — Raridade Display/Combate

### Objetivo
Aplicar a raridade (nome com sufixo + cor) nas telas EXISTENTES e aplicar o bônus de raridade + upgrade no loadout de batalha (PvP, dungeon, academia). **NÃO** tocar no Ferreiro (Agente 011) nem na DungeonScene de dano (Agente 013/014).

### Contexto permitido
- Spec §14.1, §10.1.4 (exibição), §10.1.5 (combate: base → ×raridade → +upgrade).
- Usar helpers do Agente 001 (`formatItemName`, `RARITY_COLORS`, `applyRarity`).

### Arquivos autorizados (criar/editar)
- Componentes de inventário/cofre (`shared/components/inventory-grid/*`)
- Slots de equipamento do personagem (`character/*` equipment)
- Labels de item no `pvp/pvp-room` e `pvp/pvp-lobby` (apenas exibição)
- Builder do loadout de batalha (onde o `attack`/`defense` efetivos são montados para PvP/dungeon/academia)

### Arquivos apenas de consulta
- `system/frontend/src/app/shared/game-core/rarity.ts` (001)
- `item-catalog.ts` (002)

### O que NÃO mexer
- `ferreiro/*` (011), `dungeon/` scene/engine (013/014), `academy/` scene (012 cuida; 010 só fornece helper de loadout se compartilhado).
- game-navigator.service.ts (GameScreen é do 011).

### Dependências obrigatórias
- **001**.

### Critérios de aceite
- Itens exibem "(Sufixo)" + cor em inventário/cofre/equip/sala/labels; attack/defense efetivos de combate consideram raridade + upgrade.
- Regressão: telas existentes não quebram. `tsc --noEmit && ng build` passam.

### Checklist granular
- [ ] 10.1 Exibição no inventário/cofre (formatItemName + cor)
- [ ] 10.2 Exibição nos slots de equipamento (character)
- [ ] 10.3 Labels com raridade em pvp-room/lobby
- [ ] 10.4 Loadout de batalha: applyRarity + upgrade no attack/defense
- [ ] 10.5 typecheck + build frontend

### Comando de execução
"Implemente o Agente 010 conforme o arquivo. Atualize o checklist granular após cada item. Gere `010-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
