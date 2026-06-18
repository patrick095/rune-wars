# Agente 002 — Catálogo: Fragmentos & Pedras

## Memory — Catálogo

### Objetivo
Adicionar ao `ITEM_CATALOG` os **fragmentos** (`fragment_weapon|armor|head|legs|accessory|secondary`, raridade em `rarity`) e a **pedra de aprimoramento** (`enhancement_stone`, nível em `upgrade_level`), com ícones e helpers de exibição (pedra mostra "+N" e troca de ícone por nível 0–5; fragmento mostra categoria+raridade).

### Contexto permitido
- Spec §10.2.1, §13.2 (modelo de itens), §14.6, §27 (ids de ícone: `item_enhancement_stone_0..5`, `item_fragment_*`).
- Não equipável: fragmentos e pedras são insumos.

### Arquivos autorizados (criar/editar)
- `system/frontend/src/app/shared/game-core/item-catalog.ts` (editar — novas entradas + categorias)
- Helper de exibição de item, se necessário (ex.: `item-catalog.ts` mesmo ou novo `item-display.ts`).

### Arquivos apenas de consulta
- `system/frontend/src/app/shared/game-core/rarity.ts` (Agente 001 — tipos/cores)
- `system/backend/src/inventory/item-instance.entity.ts`

### O que NÃO mexer
- rarity.ts; lógica de craft/upgrade; componentes de UI.

### Dependências obrigatórias
- **001** (tipos de raridade).

### Critérios de aceite
- 6 fragmentos + 1 pedra no catálogo, com ícones (ids §27) e categoria.
- Helper de exibição: pedra "+N" com ícone por nível; fragmento "categoria + raridade".
- `npx tsc --noEmit` front passa.

### Checklist granular
- [ ] 2.1 Entradas `fragment_*` (6) no catálogo
- [ ] 2.2 Entrada `enhancement_stone` (nível em upgrade_level)
- [ ] 2.3 Mapa de ícones por nível da pedra (0–5)
- [ ] 2.4 Helper de exibição (fragmento/pedra)
- [ ] 2.5 typecheck front

### Comando de execução
"Implemente o Agente 002 conforme o arquivo. Atualize o checklist granular após cada item. Gere `002-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
