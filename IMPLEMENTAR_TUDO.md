# Implementar Tudo — v1.7.0

## Objetivo Geral
Implementar quatro grandes entregas na versão 1.7.0 do Rune Wars:
1. **Inventário funcional com dados reais** — endpoints corrigidos, ITEM_CATALOG, equip/unequip real
2. **Cofre/baú funcional** — overlay Angular dedicado com DnD entre inventário e cofre
3. **Admin Panel** — tecla "I" no Hub abre painel para admin inspecionar/editar inventários
4. **Sala PvP redesenhada** — 4 slots de equipe, carrossel de mapa, modos, consumíveis persistentes

---

## Estratégia
- Backend e frontend desenvolvidos em paralelo (backend-first onde há dependência de endpoint)
- DB migrations rodam primeiro para desbloquear todas as entidades
- ITEM_CATALOG criado em paralelo com migrations (sem dependência)
- Agentes com escopo fechado e contexto mínimo
- QA valida build e critérios ao final

---

## Fila de Execução

### Fase 1 — Fundação (paralelo, executar agora)
Pode executar em paralelo:
- **Agent 001** — DB Migrations (is_admin, character_consumable, pvp_room columns + seeds)
- **Agent 002** — ITEM_CATALOG (constante TypeScript estática)

### Fase 2 — Backend + Inventory Frontend (paralelo, após Fase 1)
Pode executar em paralelo:
- **Agent 003** — BE Auth + Admin Module (aguarda 001)
- **Agent 004** — BE ConsumableInventory Module (aguarda 001)
- **Agent 005** — BE PvP Room Extensions (aguarda 001)
- **Agent 006** — FE Inventory Fix + CharacterComponent Equip (aguarda 002)

### Fase 3 — Frontend Secundário (paralelo, após Fase 2 parcial)
Pode executar em paralelo:
- **Agent 007** — FE VaultScreenComponent (aguarda 006)
- **Agent 008** — FE ConsumableInventoryService (aguarda 004)

### Fase 4 — Frontend Avançado (paralelo, após Fase 3)
Pode executar em paralelo:
- **Agent 009** — FE AdminInventoryPanelComponent + HubComponent keydown (aguarda 003 + 008)
- **Agent 010** — FE PvpRoomComponent Redesign Completo (aguarda 005 + 008)

### Fase 5 — Validação Final
Sequencial:
- **Agent 011** — QA Build + Validação (aguarda todos os anteriores)

---

## Mapa de Dependências

```
001 (DB) ──────────┬──→ 003 (BE Auth+Admin)
                   ├──→ 004 (BE Consumables)
                   └──→ 005 (BE PvP Room)

002 (ITEM_CATALOG) ──→ 006 (FE Inventory)
                         └──→ 007 (FE Vault)

004 (BE Consumables) ──→ 008 (FE Consumable Service)

003 (BE Auth+Admin) ──┐
                      ├──→ 009 (FE Admin Panel)
008 (FE Consumables) ─┘

005 (BE PvP Room) ────┐
                      ├──→ 010 (FE PvP Room Redesign)
008 (FE Consumables) ─┘

[TODOS 001-010] ──→ 011 (QA Build)
```

---

## Subagentes

| # | Nome | Escopo | Fase | Depende de |
|---|------|--------|------|------------|
| 001 | DB Migrations | Migrations SQL + seeds | 1 | — |
| 002 | ITEM_CATALOG | Constante TypeScript | 1 | — |
| 003 | BE Auth + Admin | User.is_admin + JWT + AdminModule | 2 | 001 |
| 004 | BE Consumables | CharacterConsumable entity + ConsumableInventoryModule | 2 | 001 |
| 005 | BE PvP Room | PvpRoom slots/mode + 3 endpoints | 2 | 001 |
| 006 | FE Inventory | InventoryService fix + CharacterComponent equip | 2 | 002 |
| 007 | FE Vault | VaultScreenComponent + GameScreen 'vault' | 3 | 006 |
| 008 | FE Consumable Service | ConsumableInventoryService | 3 | 004 |
| 009 | FE Admin Panel | AdminInventoryPanelComponent + HubComponent keydown | 4 | 003, 008 |
| 010 | FE PvP Room | PvpRoomComponent redesign completo | 4 | 005, 008 |
| 011 | QA Build | npm run build + validação dos critérios | 5 | todos |

---

## Instruções de Execução

### Como chamar cada agente

Cada agente tem um sub-spec completo em:
```
.ai-orchestration/agents/{NNN}-{nome}.md
```

Para executar um agente, leia o sub-spec correspondente e delegue a execução. O agente deve:
1. Ler o sub-spec inteiro antes de começar
2. Consultar os arquivos listados em "Arquivos a consultar"
3. Implementar exatamente o que está em "Implementações exigidas"
4. Criar o arquivo de resumo `*-result.md` ao terminar
5. Atualizar `.ai-orchestration/ORCHESTRATION_STATE.md` e `FILES_CHANGED.md`

### Como verificar se um agente terminou
Checar se existe `.ai-orchestration/agents/{NNN}-{nome}-result.md` com `Status: Concluído`.

### Como liberar agentes dependentes
Antes de iniciar um agente, verificar se todos os `result.md` das dependências existem com Status Concluído.

---

## Como lidar com bugs

### Se o Agent 011 encontrar erros de build (CRÍTICO):
1. NÃO criar commit
2. Criar sub-spec de correção: `.ai-orchestration/agents/012-fix-{bug}.md`
3. Executar Agent 012 antes de finalizar
4. Reexecutar Agent 011 após correção

### Se um agente intermediário reportar bug CRÍTICO:
1. Pausar agentes dependentes
2. Criar novo agente corretivo com escopo fechado
3. Liberar dependentes somente após correção

### Se um agente reportar bug IMPORTANTE ou BAIXO:
1. Registrar em `BUGS_AND_BLOCKERS.md`
2. Continuar execução dos demais agentes
3. Tratar antes do commit final (Agent 011 irá identificar)

---

## Como lidar com conflitos

Se dois agentes alteraram o mesmo arquivo:
1. Agent 011 detecta via `FILES_CHANGED.md`
2. Verificar se as alterações são compatíveis
3. Se conflito: criar Agent de merge com os dois result.md como contexto

---

## Como finalizar

Após Agent 011 reportar `APROVADO`:

1. **Verificar checklist final** em `.ai-orchestration/FINAL_CLEANUP.md`
2. **Criar resumo permanente** em `docs/implementations/2026-06-10-v1.7.0-implementation-summary.md`
3. **Remover pasta temporária**: `rm -rf .ai-orchestration/`
4. **Perguntar sobre commit** — nunca commitar automaticamente

---

## Arquivos do Projeto Afetados

### Backend — modificar
- `system/backend/src/auth/user.entity.ts`
- `system/backend/src/auth/auth.service.ts`
- `system/backend/src/auth/jwt.strategy.ts`
- `system/backend/src/app.module.ts`
- `system/backend/src/migrations/` (novos arquivos)

### Backend — criar
- `system/backend/src/inventory/character-consumable.entity.ts`
- `system/backend/src/consumable-inventory/` (módulo completo)
- `system/backend/src/admin/` (módulo completo)
- `system/backend/src/pvp/` (extensões: slots, mode, map_slug, 3 endpoints)

### Frontend — modificar
- `system/frontend/src/app/shared/services/inventory.service.ts`
- `system/frontend/src/app/character/character.component.ts`
- `system/frontend/src/app/character/character.component.html`
- `system/frontend/src/app/shared/services/game-navigator.service.ts`
- `system/frontend/src/app/app.component.ts`
- `system/frontend/src/app/app.component.html`
- `system/frontend/src/app/hub/hub.component.ts`
- `system/frontend/src/app/hub/hub.component.html`
- `system/frontend/src/app/pvp/pvp-room.component.ts`
- `system/frontend/src/app/pvp/pvp-room.component.html`
- `system/frontend/src/app/pvp/pvp-room.component.scss`

### Frontend — criar
- `system/frontend/src/app/shared/game-core/item-catalog.ts`
- `system/frontend/src/app/shared/services/consumable-inventory.service.ts`
- `system/frontend/src/app/vault/vault-screen.component.ts`
- `system/frontend/src/app/vault/vault-screen.component.html`
- `system/frontend/src/app/vault/vault-screen.component.scss`
- `system/frontend/src/app/admin/admin-inventory-panel.component.ts`
- `system/frontend/src/app/admin/admin-inventory-panel.component.html`
- `system/frontend/src/app/admin/admin-inventory-panel.component.scss`
