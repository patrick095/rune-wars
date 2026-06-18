# Agente 011 — Ferreiro UI (frontend)

## Memory — Ferreiro UI

### Objetivo
Criar a tela **Ferreiro** baseada em slots com 3 abas funcionais (Craft, Desmontagem, Aprimoramento) + abas placeholder, usando personagem ativo + inventário real, header com ouro. Aposentar as telas `craft`/`upgrade`.

### Contexto permitido
- Spec §14.2, §12 (UI), §10.2 (regras), §11 (fluxo).
- Craft: 3 slots em triângulo + slot de resultado central + botão Criar; só fragmentos compatíveis; chama `POST /craft/combine`.
- Desmontagem: slot de item + slot de fragmento-resultado + botão Desmontar; `POST /craft/dismantle`.
- Aprimoramento: 3 slots de pedra + slot de item + slot de resultado; alterna item/pedra; mostra **chance final** (`GET /upgrade/chance`) + **custo de ouro**; bloqueia se ouro insuficiente; `POST /upgrade/item` ou `POST /upgrade/stone`.
- **ESTE AGENTE É O DONO DO GameScreen**: adicionar `ferreiro`, `dungeon-lobby`, `dungeon-room` ao type em `game-navigator.service.ts` (em nome de si e do Agente 015). Adicionar `@case 'ferreiro'` no AppComponent; redirecionar rotas craft/upgrade.

### Arquivos autorizados (criar/editar)
- `system/frontend/src/app/ferreiro/` (NOVO: ferreiro.component + ferreiro-craft-tab + ferreiro-dismantle-tab + ferreiro-upgrade-tab)
- `system/frontend/src/app/shared/services/game-navigator.service.ts` (+3 GameScreen)
- `system/frontend/src/app/app.component.ts` / `.html` (@case ferreiro)
- `system/frontend/src/app/app.routes.ts` (redirect craft/upgrade)
- Wiring do POI Ferreiro no hub (apenas o gatilho de navegação)

### Arquivos apenas de consulta
- `system/frontend/src/app/pvp/pvp-room/*` (padrão visual)
- rarity.ts (001), item-catalog (002), inventory.service, active-character.service
- Endpoints craft (004), upgrade (005)

### O que NÃO mexer
- Backend; dungeon; academia; lógica de raridade core.

### Dependências obrigatórias
- **002**, **004**, **005**. (001 p/ exibição.)

### Critérios de aceite (§25.2)
- Ferreiro abre como tela única; 3 abas funcionando com personagem/inventário real; header com ouro; layout comporta abas futuras; cores de raridade.
- `tsc --noEmit && ng build` passam.

### Checklist granular
- [ ] 11.1 GameScreen +ferreiro/dungeon-lobby/dungeon-room + redirect rotas
- [ ] 11.2 FerreiroComponent (header ouro + barra de abas + placeholders)
- [ ] 11.3 Aba Craft (3 slots triângulo + resultado + combine)
- [ ] 11.4 Aba Desmontagem (item + resultado + dismantle)
- [ ] 11.5 Aba Aprimoramento (3 pedras + item + resultado + chance/custo + item|stone)
- [ ] 11.6 Seletor de inventário nos slots + estados loading/erro/sucesso
- [ ] 11.7 @case no AppComponent + POI hub
- [ ] 11.8 typecheck + build frontend

### Comando de execução
"Implemente o Agente 011 conforme o arquivo. Atualize o checklist granular após cada item. Gere `011-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
