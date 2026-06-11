# Sub-spec — Agent 003: BE Auth + Admin Module

## Objetivo
1. Adicionar campo `is_admin` ao `User` entity
2. Incluir `isAdmin` no JWT payload via `AuthService.login()`
3. Criar `AdminModule` com `AdminGuard`, `AdminController` e `AdminService`

## Dependências
- Agent 001 (DB Migrations) deve ter concluído — coluna `is_admin` precisa existir no banco

## Contexto mínimo necessário
- Backend NestJS em `system/backend/src/`
- `system/backend/src/auth/` — módulo de autenticação existente
- `system/backend/src/inventory/` — inventário existente (admin vai consultar/adicionar itens)
- Pattern de guards existente: `jwt-auth.guard.ts` como referência
- JWT payload atual: verificar `jwt.strategy.ts` e `auth.service.ts`

## Arquivos autorizados a alterar
- `system/backend/src/auth/user.entity.ts` — adicionar `is_admin`
- `system/backend/src/auth/auth.service.ts` — incluir `isAdmin` no JWT
- `system/backend/src/auth/jwt.strategy.ts` — incluir `isAdmin` no payload extraído
- `system/backend/src/app.module.ts` — registrar AdminModule

## Arquivos a criar
- `system/backend/src/admin/admin.guard.ts`
- `system/backend/src/admin/admin.controller.ts`
- `system/backend/src/admin/admin.service.ts`
- `system/backend/src/admin/admin.module.ts`

## Arquivos a consultar (somente leitura)
- `system/backend/src/auth/jwt-auth.guard.ts`
- `system/backend/src/inventory/inventory.service.ts`
- `system/backend/src/inventory/item-instance.entity.ts`
- `system/backend/src/character/` (se existir) — para listar personagens

## O que NÃO mexer
- Lógica de batalha, craft, mercado
- Módulos não listados acima

## Implementações exigidas

### User entity
```typescript
// Adicionar em user.entity.ts:
@Column({ default: false })
is_admin: boolean;
```

### AuthService.login()
```typescript
// No payload do JWT, incluir:
isAdmin: user.is_admin,
```

### JWT Strategy
```typescript
// No validate(), incluir isAdmin no objeto retornado
isAdmin: payload.isAdmin,
```

### AdminGuard
```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.user?.isAdmin === true;
  }
}
```

### AdminController endpoints
```
GET  /admin/characters                    → lista todos os personagens (id, name, level, userId, email do user)
GET  /admin/characters/:id/inventory      → inventário do personagem (ItemInstance[])
POST /admin/characters/:id/inventory/add  → { item_base_id, rarity?, quantity } → cria ItemInstance(s)
POST /admin/characters/:id/consumables/add → { consumableId, quantity } → incrementa character_consumable
```

Todos os endpoints exigem `@UseGuards(JwtAuthGuard, AdminGuard)`.

### AdminService
- `listCharacters()`: busca todos os characters com join no user para email
- `getCharacterInventory(id)`: ItemInstance[] do personagem
- `addItemToInventory(characterId, itemBaseId, rarity, quantity)`: cria `quantity` instâncias de `ItemInstance`
- `addConsumable(characterId, consumableId, quantity)`: upsert em `character_consumable`

### Logs
Adicionar `Logger` do NestJS para:
- `ADMIN_ADD_ITEM`: quando admin adiciona item
- `ADMIN_ADD_CONSUMABLE`: quando admin adiciona consumível

## Critérios de aceite
- [ ] `user.is_admin` existe no entity e na tabela
- [ ] JWT inclui `isAdmin` no payload após login
- [ ] `GET /admin/characters` retorna 403 para não-admin, 200 para admin
- [ ] `POST /admin/characters/:id/inventory/add` cria itens corretamente
- [ ] `POST /admin/characters/:id/consumables/add` incrementa corretamente
- [ ] Build backend sem erros TypeScript

## Formato do resumo final
Criar `.ai-orchestration/agents/003-be-auth-admin-result.md`

## Memory

### Objetivo
Adicionar is_admin ao User, isAdmin no JWT, criar AdminModule com endpoints protegidos por AdminGuard.

### Contexto permitido
Backend NestJS. system/backend/src/auth/ e system/backend/src/admin/ (novo).

### Arquivos autorizados
user.entity.ts, auth.service.ts, jwt.strategy.ts, app.module.ts + novos arquivos admin/

### Dependências
Agent 001 (coluna is_admin deve existir no banco)

### Restrições
NÃO alterar lógica de negócio de outros módulos. NÃO criar rotas sem AdminGuard.

### Critérios de aceite
is_admin no entity, isAdmin no JWT, 4 endpoints admin funcionando com guard, build limpo.
