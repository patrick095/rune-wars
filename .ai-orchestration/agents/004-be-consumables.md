# Sub-spec — Agent 004: BE Consumable Inventory Module

## Objetivo
Criar o módulo de inventário de consumíveis por personagem no backend:
1. Entity `CharacterConsumable`
2. `ConsumableInventoryModule` com service, controller e endpoints

## Dependências
- Agent 001 (DB Migrations) — tabela `character_consumable` deve existir

## Contexto mínimo necessário
- Backend NestJS em `system/backend/src/`
- Pattern de módulo existente: ver `system/backend/src/inventory/` como referência
- Consumíveis existentes no frontend: 'heal', 'teleport', 'ice-throw', 'invisibility', 'calibration-shot'
- JWT guard existente: `system/backend/src/auth/jwt-auth.guard.ts`

## Arquivos a criar
- `system/backend/src/inventory/character-consumable.entity.ts`
- `system/backend/src/consumable-inventory/consumable-inventory.controller.ts`
- `system/backend/src/consumable-inventory/consumable-inventory.service.ts`
- `system/backend/src/consumable-inventory/consumable-inventory.module.ts`

## Arquivos autorizados a alterar
- `system/backend/src/app.module.ts` — registrar ConsumableInventoryModule e CharacterConsumable entity

## Arquivos a consultar (somente leitura)
- `system/backend/src/inventory/inventory.module.ts` — padrão de módulo
- `system/backend/src/auth/jwt-auth.guard.ts` — guard a usar

## O que NÃO mexer
- Módulos existentes além do app.module.ts para registro

## Implementações exigidas

### CharacterConsumable entity
```typescript
@Entity('character_consumable')
export class CharacterConsumable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  character_id: string;

  @Column()
  consumable_id: string;

  @Column({ default: 0 })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;
}
```

### ConsumableInventoryService métodos
- `getConsumables(characterId: string)`: retorna CharacterConsumable[] onde quantity > 0
- `useConsumable(characterId, consumableId)`: decrementa 1; se chegar a 0, não remove (mantém com 0, frontend filtra)
- `addConsumable(characterId, consumableId, quantity)`: upsert — se já existe soma, se não existe cria

### ConsumableInventoryController endpoints
```
GET  /characters/:characterId/consumables          → lista estoque (quantity > 0)
POST /characters/:characterId/consumables/use      → { consumableId } → decrementa
POST /characters/:characterId/consumables/add      → { consumableId, quantity } → incrementa
```

**Segurança**: `use` e `add` exigem que `characterId` pertença ao usuário do JWT (ou seja admin).
Verificar: `req.user.characterId === characterId` OU `req.user.isAdmin === true`.

### Logs
- `CONSUMABLE_USE`: log quando consumível é usado

## Critérios de aceite
- [ ] Entity `CharacterConsumable` criada e registrada no TypeORM
- [ ] `GET /characters/:id/consumables` retorna lista correta
- [ ] `POST .../use` decrementa quantity; quantity não fica negativa
- [ ] `POST .../add` incrementa ou cria a entrada
- [ ] Verificação de ownership implementada
- [ ] Build backend sem erros TypeScript

## Formato do resumo final
Criar `.ai-orchestration/agents/004-be-consumables-result.md`

## Memory

### Objetivo
Criar entity CharacterConsumable e ConsumableInventoryModule com 3 endpoints REST.

### Contexto permitido
Backend NestJS. system/backend/src/inventory/ (entity) e system/backend/src/consumable-inventory/ (módulo novo).

### Arquivos autorizados
character-consumable.entity.ts (novo), consumable-inventory/* (novo), app.module.ts (registro)

### Dependências
Agent 001 (tabela character_consumable deve existir)

### Restrições
NÃO remover ou alterar entities existentes. Verificar ownership no use/add.

### Critérios de aceite
3 endpoints funcionando, entity registrada, verificação de ownership, build limpo.
