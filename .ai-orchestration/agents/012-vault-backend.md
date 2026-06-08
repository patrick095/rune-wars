# Agent 012 — Vault Backend

## Objetivo
Implementar o sistema de cofre no backend NestJS: entidades TypeORM, migrations, VaultService com regras de taxa, e VaultController com 5 endpoints REST.

## Contexto mínimo necessário
- Stack: NestJS 10 + TypeORM + PostgreSQL
- Cofre é por conta (user), não por personagem
- 60 slots (índices 0–59)
- Taxa fixa de retirada de item: constante `VAULT_ITEM_FEE = 100` gold (usar esse default se P1 não foi confirmado — deixar como constante configurável)
- Taxa de retirada de gold: `Math.floor(amount * 0.03)` deduzido do saldo do cofre
- Depositar é gratuito
- JWT auth obrigatório em todos os endpoints
- Validar que cofre pertence ao userId do token

## Arquivos autorizados a criar
- `system/backend/src/vault/vault.entity.ts`
- `system/backend/src/vault/vault-slot.entity.ts`
- `system/backend/src/vault/vault.service.ts`
- `system/backend/src/vault/vault.controller.ts`
- `system/backend/src/vault/vault.module.ts`
- `system/backend/src/vault/dto/` (DTOs necessários)
- Migration: `CreateVaultTable`
- Migration: `CreateVaultSlotTable`

## Arquivos autorizados a alterar
- `system/backend/src/app.module.ts` (registrar VaultModule)

## Arquivos a consultar
- `system/backend/src/inventory-slots/` (padrão de estrutura)
- `system/backend/src/auth/jwt-auth.guard.ts`
- `system/backend/src/auth/jwt.strategy.ts`
- Entidade User existente

## O que NÃO mexer
- Sistemas de inventário, craft, auth existentes
- Frontend

## Dependências obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de aceite
- 5 endpoints implementados e protegidos por JWT:
  - GET `/vault` → retorna cofre da conta
  - POST `/vault/deposit/item` → move item inventário→cofre (gratuito)
  - POST `/vault/withdraw/item` → move item cofre→inventário (cobra VAULT_ITEM_FEE)
  - POST `/vault/deposit/gold` → deposita gold no cofre
  - POST `/vault/withdraw/gold` → retira gold (cobra 3%)
- Migrations criadas e funcionais
- Validações: item pertence ao personagem, gold suficiente para taxa, limites de slot
- Logs: VAULT_WITHDRAW_ITEM, VAULT_WITHDRAW_GOLD, VAULT_INSUFFICIENT_GOLD
- `npm run build` do backend passa
- Erros retornam mensagens claras (400/403)

## Regras de Negócio Críticas
```
RN06: 60 slots (6x10)
RN07: Compartilhado entre personagens da mesma conta
RN08: Retirar item cobra VAULT_ITEM_FEE (default: 100 gold)
RN09: Retirar dinheiro cobra 3% do valor
RN10: Gold em saldo separado (não ocupa slot)
RN11: Depositar é gratuito
```

## Memory — Agent 012

### Objetivo
Implementar VaultModule NestJS completo (entidades, service, controller, migrations).

### Contexto permitido
- `backend/src/inventory-slots/` (padrão)
- `backend/src/auth/` (JWT guard)
- Entidade User

### Arquivos autorizados
- `backend/src/vault/` (criar módulo completo)
- `backend/src/app.module.ts` (registrar VaultModule)

### Dependências
- Nenhuma

### Restrições
- Não alterar sistemas existentes de inventário, craft, auth
- VAULT_ITEM_FEE = 100 gold como default configurável

### Critérios de aceite
- 5 endpoints REST protegidos por JWT
- Migrations funcionais
- Build passa
