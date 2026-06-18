# Agente 004 — Craft Backend (combine + dismantle)

## Memory — Craft Backend

### Objetivo
Substituir o craft por receita pelo modelo de **combinação de 3 fragmentos** e implementar **desmontagem** real (item → fragmento), usando inventário e raridade.

### Contexto permitido
- Spec §10.2.2 (Craft), §10.2.3 (Desmontagem), §13.2.
- **Craft** `POST /craft/combine` `{ fragmentInstanceIds:[id,id,id] }`: 3 fragmentos mesma categoria + raridade R → rolagem 30/20/10% (R=common→uncommon 30%, uncommon→rare 20%, rare→heroic 10%) → sucesso cria item **aleatório** da categoria em R+1 (grava `rarity`, inclui heroic); falha consome os 3.
- **Desmontagem** `POST /craft/dismantle` `{ itemInstanceId }`: chance 70/60/50% (common/uncommon/rare); sucesso gera 1 fragmento (categoria+raridade do item); falha consome o item; **Heroico bloqueado (400)**.
- Validar posse via inventário e mesma categoria+raridade.

### Arquivos autorizados (criar/editar)
- `system/backend/src/craft/craft.service.ts`
- `system/backend/src/craft/craft.controller.ts`
- `system/backend/src/craft/craft.module.ts` (se necessário)
- `system/backend/src/craft/craft-recipe.entity.ts` (apenas normalização de tiers legados, se mantido)

### Arquivos apenas de consulta
- `system/backend/src/game-engine/items/rarity.util.ts` (001)
- `system/frontend/src/app/shared/game-core/item-catalog.ts` (002 — pools por categoria)
- `system/backend/src/inventory/*` (ItemInstance, InventoryService — criar/remover instâncias)

### O que NÃO mexer
- Upgrade, portais, gold, UI.

### Dependências obrigatórias
- **001** (raridade), **002** (fragmentos no catálogo).

### Critérios de aceite
- `/craft/combine` e `/craft/dismantle` funcionam com ownership; rolagens corretas; heroic só via combine; dismantle de heroic → 400.
- Testes unitários (rolagem, consumo em falha, bloqueio heroic). `tsc --noEmit && nest build` passam.

### Checklist granular
- [ ] 4.1 `POST /craft/combine` (validação 3 fragmentos mesma cat+rar)
- [ ] 4.2 Rolagem 30/20/10% + criação de item aleatório R+1
- [ ] 4.3 Consumo dos 3 fragmentos em falha
- [ ] 4.4 `POST /craft/dismantle` (item→fragmento, 70/60/50%)
- [ ] 4.5 Bloqueio de Heroico (400) + consumo em falha
- [ ] 4.6 Normalizar/aposentar receita legada
- [ ] 4.7 Testes + typecheck/build backend

### Comando de execução
"Implemente o Agente 004 conforme o arquivo. Atualize o checklist granular após cada item. Gere `004-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
