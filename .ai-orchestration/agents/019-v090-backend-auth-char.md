# Agent 019 — v0.9.0 Backend: Auth + Character + Inventory + Dungeon

## Objetivo
Criar o projeto NestJS em `system/backend/`, configurar TypeORM + PostgreSQL, implementar migrations iniciais, AuthModule (JWT), CharacterModule, InventoryModule básico e DungeonModule.

## Contexto mínimo necessário

### Entidades principais:
```sql
-- user: id UUID, email VARCHAR(255) UNIQUE, password_hash, created_at
-- character: id, user_id FK, name, level=1, xp=0, strength=0, agility=0, vitality=0, luck=0
-- item_instance: id, owner_id FK(character), item_base_id, rarity='common', upgrade_level=0, equipped_slot, created_at
-- dungeon_progress: id, character_id FK, floor=1, phase=1, completed=false, updated_at
```

### AuthModule: registro(email,senha), login → JWT, `@UseGuards(JwtAuthGuard)`
### CharacterModule: CRUD, retorna atributos + derivados calculados
### InventoryModule: listar itens do personagem, equipar/desequipar slot
### DungeonModule: salvar/carregar progresso por andar

## Arquivos autorizados a criar/alterar
```
system/backend/
  src/
    auth/
      auth.module.ts, auth.controller.ts, auth.service.ts
      dto/register.dto.ts, login.dto.ts
      guards/jwt-auth.guard.ts
      strategies/jwt.strategy.ts
    character/
      character.module.ts, character.controller.ts, character.service.ts
      entities/character.entity.ts
      dto/
    inventory/
      inventory.module.ts, inventory.controller.ts, inventory.service.ts
      entities/item-instance.entity.ts
    dungeon/
      dungeon.module.ts, dungeon.controller.ts, dungeon.service.ts
      entities/dungeon-progress.entity.ts
    app.module.ts, main.ts
  package.json, tsconfig.json, nest-cli.json
  migrations/ (TypeORM migrations)
```

## Arquivos apenas para consulta
- `system/frontend/src/app/shared/game-core/player-stats.ts`
- `system/frontend/src/app/shared/game-core/attribute-calculator.ts`

## O que NÃO mexer
- Qualquer arquivo de frontend
- `devops/` (agente 018)

## Dependências obrigatórias
- Agente 017 concluído (pode rodar em paralelo com 018)

## Critérios de aceite
- `POST /auth/register` cria usuário + personagem padrão
- `POST /auth/login` retorna JWT válido
- `GET /character/:id` retorna personagem com derivados calculados
- `GET /inventory` retorna itens do personagem autenticado
- `POST /dungeon/progress` salva progresso
- Migrations rodam automaticamente no `npm run start`

## Memory

### Objetivo
NestJS backend com Auth, Character, Inventory, Dungeon modules.

### Contexto permitido
Schema SQL das entidades + endpoints + spec de atributos (AttributeCalculator).

### Arquivos autorizados
Os listados.

### Dependências
017 concluído.

### Restrições
- Usar `@nestjs/jwt`, `bcryptjs`, `@nestjs/typeorm`, `typeorm`.
- Nunca retornar `password_hash` nos responses.
- AttributeCalculator: portar lógica de fórmulas do frontend para o backend (DRY: idealmente mover para `system/shared/` mas se muito complexo, duplicar documentando a intenção de unificar).

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-019.md`.

## Limpeza pós-versão
Após v0.9.0 completa: deletar `v0.9.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Backend** | `agents/dev-backend.md` | NestJS, estrutura domain/infrastructure, DTOs, validação, JWT |
| **Databaser** | `agents/databaser.md` | Schema das 4 entidades, migrations, índices em FKs |

**Instrução:** `dev-backend` para estrutura de módulos e regras NestJS. `databaser` para modelagem das entidades (User, Character, ItemInstance, DungeonProgress) — criar migrations com `up` e `down`, indexar todas as FKs.
