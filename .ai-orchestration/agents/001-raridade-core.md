# Agente 001 — Raridade Core

## Memory — Raridade Core

### Objetivo
Criar o módulo único de raridade (4 tiers) compartilhado entre front e back: tipos, bônus, cores, labels, helpers de status primário, aplicação de bônus, formatação de nome e normalização de legados (epic→rare, legendary→heroic). Cobrir com testes unitários.

### Contexto permitido
- Spec §10.1 (tiers/bônus/status primário/exibição/combate/normalização) e §13.1.
- Tabela de tiers: common ×1.00 / uncommon ×1.02 / rare ×1.04 / heroic ×1.07.
- Status primário: weapon→attack; armor/head/legs/secondary→defense; accessory→maior status.
- Ordem de combate: base → ×raridade → +upgrade. Bônus arredonda com Math.round.

### Arquivos autorizados (criar/editar)
- `system/frontend/src/app/shared/game-core/rarity.ts` (NOVO)
- `system/frontend/src/app/shared/game-core/__tests__/rarity.spec.ts` (NOVO)
- `system/backend/src/game-engine/items/rarity.util.ts` (NOVO espelho backend — confirmar pasta; se não existir, usar `system/backend/src/common/` e registrar a decisão)

### Arquivos apenas de consulta
- `system/backend/src/inventory/item-instance.entity.ts` (campos rarity/upgrade_level)
- `system/frontend/src/app/shared/game-core/item-catalog.ts` (categorias)

### O que NÃO mexer
- Nenhuma tela, nenhum service de craft/upgrade/dungeon, nenhum componente.

### Dependências obrigatórias
- Nenhuma.

### API pública a exportar (contrato p/ outros agentes)
`ItemRarity` (`'common'|'uncommon'|'rare'|'heroic'`), `RARITY_BONUS`, `RARITY_COLORS`, `RARITY_LABEL`, `RARITY_SUFFIX`, `getPrimaryStatKey(category)`, `applyRarity(stats, category, rarity)`, `formatItemName(baseName, rarity)`, `normalizeRarity(legacy)`.

### Critérios de aceite
- Helpers cobrem todas as categorias; bônus arredondado; legados normalizados.
- `formatItemName('Canhão','common') === 'Canhão (Comum)'`.
- Testes unitários verdes (bônus por tier/categoria, arredondamento, formatName, normalização).
- `npx tsc --noEmit` passa no front e no back.

### Checklist granular (atualizar ORCHESTRATION_STATE após CADA item)
- [ ] 1.1 Criar `rarity.ts` (tipos + RARITY_BONUS/COLORS/LABEL/SUFFIX)
- [ ] 1.2 `getPrimaryStatKey` + `applyRarity`
- [ ] 1.3 `formatItemName` + `normalizeRarity`
- [ ] 1.4 Espelho backend `rarity.util.ts` (reexport/duplicação mínima)
- [ ] 1.5 Testes `rarity.spec.ts`
- [ ] 1.6 typecheck front + back

### Comando de execução
"Implemente o Agente 001 conforme `.ai-orchestration/agents/001-raridade-core.md`. Atualize o checklist granular em ORCHESTRATION_STATE.md após cada item. Ao final gere o resumo em `.ai-orchestration/agents/001-raridade-core.summary.md`."

### Formato do resumo final
Seguir template padrão (Status / O que foi feito / Arquivos alterados / Arquivos consultados / Decisões / Bugs / Riscos / Impacto em outros agentes / Recomendações).
