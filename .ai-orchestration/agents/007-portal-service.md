# Agente 007 — PortalService (autoritativo: dungeon + PvP)

## Memory — PortalService

### Objetivo
Implementar a geração e concessão **autoritativa** de portais no servidor, usada por dungeon e PvP.

### Contexto permitido
- Spec §10.6 (dungeon), §10.6.5 (PvP 91/5/3/1), §10.6.4 (ouro), §13.5.
- `generatePortals({ mode:'dungeon'|'pvp', floor?, stage?, difficulty?, isBoss? })` → `Portal[]` (`{ index, kind:'gold'|'item'|'stone', amount?, itemBaseId?, rarity?, stoneLevel? }`).
- Composição por dificuldade (§10.6.2), ouro por portal (§10.6.4), cada "slot de item" rola item OU pedra de nível equivalente (§10.6.3: comum→item comum ou pedra base; incomum→item incomum ou pedra+1; raro→item raro ou pedra+2). **Heroico nunca dropa.**
- PvP: 8 portais 91% ouro / 5% comum+pedra base / 3% incomum+pedra+1 / 1% raro+pedra+2.
- `select(contextId, characterId, portalIndices)` → valida quantidade (1 normal/PvP, 2 boss) e unicidade por player; ao completar (ou auto-pick), concede: item → ItemInstance c/ rarity (bônus §10.1) no owner_id; pedra → ItemInstance enhancement_stone c/ upgrade_level=stoneLevel; ouro → CharacterService.addGold. Retorna reveal (todos os portais no boss) + ganhos individuais.

### Arquivos autorizados (criar/editar)
- `system/backend/src/dungeon-rewards/portal.service.ts` (NOVO)
- `system/backend/src/dungeon-rewards/portal.module.ts` (NOVO)
- `system/backend/src/dungeon-rewards/portal-pools.ts` (NOVO — pools por raridade derivados do catálogo, server-side)
- (opcional) `system/backend/src/dungeon-rewards/portal.controller.ts` ou expor via dungeon-floors/pvp (definido pelos agentes 008/009)

### Arquivos apenas de consulta
- `system/backend/src/game-engine/items/rarity.util.ts` (001)
- `system/frontend/src/app/shared/game-core/item-catalog.ts` (002 — pools)
- `system/backend/src/character/character.service.ts` (addGold — 003)
- `system/backend/src/inventory/*` (criar ItemInstance)

### O que NÃO mexer
- dungeon-floors (008), pvp (009) — só fornecer a API; eles disparam.

### Dependências obrigatórias
- **001**, **002**, **003**.

### API pública (contrato)
`PortalService.generatePortals(opts): Portal[]`, `PortalService.select(contextId, characterId, indices): { reveal, gains }`. Tipo `Portal` exportado.

### Critérios de aceite
- Geração fiel às tabelas (cada dificuldade × normal/boss e PvP); heroic nunca presente; item-ou-pedra por slot; concessão correta de item/pedra/ouro.
- Testes (generate por dificuldade/boss/PvP; select 1/2; unicidade). `tsc --noEmit && nest build` passam.

### Checklist granular
- [ ] 7.1 Tipo `Portal` + `portal-pools.ts`
- [ ] 7.2 `generatePortals` dungeon normal (§10.6.2/10.6.3/10.6.4)
- [ ] 7.3 `generatePortals` dungeon boss (16)
- [ ] 7.4 `generatePortals` PvP (91/5/3/1)
- [ ] 7.5 `select` (validação 1/2, unicidade, auto-pick)
- [ ] 7.6 Concessão item/pedra/ouro (ItemInstance + addGold)
- [ ] 7.7 Reveal + ganhos individuais
- [ ] 7.8 Testes + typecheck/build backend

### Comando de execução
"Implemente o Agente 007 conforme o arquivo. Atualize o checklist granular após cada item. Gere `007-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
