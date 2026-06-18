# Agente 005 — Upgrade Backend (item + stone + chance)

## Memory — Upgrade Backend

### Objetivo
Refatorar o Aprimoramento para dois fluxos (item +0→+10 e pedra +0→+5) com tabelas de chance, **Sorte**, hooks aditivos, clamp 100% e **custo em ouro** (débito atômico).

### Contexto permitido
- Spec §10.2.4 (tabelas de pedra e item), §13.2 (Aprimoramento).
- `POST /upgrade/item` `{ itemInstanceId, stoneInstanceIds:[3] }`: valida nível das 3 pedras + ouro pela tabela; debita ouro; rola `chanceFinal`; sucesso `upgrade_level++`; **falha consome só as pedras** (ouro já debitado, item intacto).
- `POST /upgrade/stone` `{ stoneInstanceIds:[3] }`: 3 pedras nível L → 1 pedra L+1; falha consome as 3; ouro debitado.
- `GET /upgrade/chance?target=item|stone&level&luck` → `chanceFinal`.
- `computeChance(base, luck, bonuses)` central, clamp 100%; mapeamento luck→% tunável calibrado p/ build exemplo dar +6% (base+10 → 10%+6% Sorte (+2% raça +3% evento = 21% no exemplo, mas raça/evento=0 no v1.8.0)).
- Operações atômicas: debitar ouro + consumir insumos numa transação.

### Arquivos autorizados (criar/editar)
- `system/backend/src/upgrade/upgrade.service.ts`
- `system/backend/src/upgrade/upgrade.controller.ts`
- `system/backend/src/upgrade/upgrade.module.ts` (se necessário)

### Arquivos apenas de consulta
- `system/backend/src/character/character.service.ts` (spendGold — 003)
- `system/backend/src/game-engine/items/rarity.util.ts` (001 — normalize)
- `system/frontend/src/app/shared/game-core/item-catalog.ts` (002 — enhancement_stone)
- `system/backend/src/inventory/*`

### O que NÃO mexer
- Craft, portais, character.entity, UI.

### Dependências obrigatórias
- **002** (pedras no catálogo), **003** (spendGold). (001 p/ normalize.)

### Critérios de aceite
- Tabelas de item/pedra fiéis a §10.2.4; clamp 100%; ouro debitado e validado (400 se insuficiente); falha consome só pedras.
- Testes (computeChance+clamp, validação nível/ouro, consumo em falha). `tsc --noEmit && nest build` passam.

### Checklist granular
- [ ] 5.1 `computeChance(base, luck, bonuses)` + mapa luck→% + clamp 100%
- [ ] 5.2 Tabelas de pedra (+1..+5) e item (+1..+10)
- [ ] 5.3 `POST /upgrade/item` (valida pedras+ouro, débito, rolagem, falha consome pedras)
- [ ] 5.4 `POST /upgrade/stone` (3→1 L+1, falha consome 3)
- [ ] 5.5 `GET /upgrade/chance` estendido (target/level/luck)
- [ ] 5.6 Transação atômica ouro+insumos
- [ ] 5.7 Testes + typecheck/build backend

### Comando de execução
"Implemente o Agente 005 conforme o arquivo. Atualize o checklist granular após cada item. Gere `005-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
