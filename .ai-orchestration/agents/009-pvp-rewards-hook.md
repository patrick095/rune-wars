# Agente 009 — PvP Rewards Hook (backend)

## Memory — PvP Rewards Hook

### Objetivo
Disparar os portais de recompensa ao fim de cada partida PvP, usando o PortalService (007).

### Contexto permitido
- Spec §10.6.5, §13.5 (gancho PvP). 8 portais (escolhe 1, timer 10s, auto-pick), 91/5/3/1.
- Adicionar `reward_state` (jsonb) ao `PvpRoom` (ou tabela própria) e endpoint `POST /pvp/rooms/:id/rewards` (ou equivalente) que chama `generatePortals({mode:'pvp'})` e `select`.
- Gancho no fim da partida (BattleGateway/fluxo PvP) — localizar o ponto de término.

### Arquivos autorizados (criar/editar)
- `system/backend/src/pvp/pvp-room.entity.ts` (+reward_state)
- `system/backend/src/pvp/pvp.service.ts`
- `system/backend/src/pvp/pvp.controller.ts`
- `system/backend/src/pvp/pvp.module.ts` (importar PortalModule)
- (consultar) battle gateway, se o término vier dele

### Arquivos apenas de consulta
- `system/backend/src/dungeon-rewards/portal.service.ts` (007)
- `system/backend/src/battle/*` (ponto de término da partida)

### O que NÃO mexer
- PortalService interno (007), dungeon-floors (008), UI.

### Dependências obrigatórias
- **007**.

### Critérios de aceite
- Endpoint gera 8 portais PvP e concede recompensa; reward_state persiste estado.
- Testes integração. `tsc --noEmit && nest build` passam.

### Checklist granular
- [ ] 9.1 Coluna `reward_state` no PvpRoom
- [ ] 9.2 Endpoint `POST /pvp/rooms/:id/rewards` (generate 007)
- [ ] 9.3 select/concessão via 007
- [ ] 9.4 Gancho de fim de partida
- [ ] 9.5 Testes + typecheck/build backend

### Comando de execução
"Implemente o Agente 009 conforme o arquivo. Atualize o checklist granular após cada item. Gere `009-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
