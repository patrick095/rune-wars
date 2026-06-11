# Sub-spec — Agent 001: DB Migrations

## Objetivo
Aplicar todas as migrations necessárias para a v1.7.0 no banco PostgreSQL local e executar os seeds de desenvolvimento.

## Dependências
Nenhuma — deve ser o primeiro a executar.

## Contexto mínimo necessário
- Stack: NestJS + PostgreSQL
- Diretório de migrations: `system/backend/src/migrations/`
- O projeto usa TypeORM com migrations manuais (arquivos .ts)

## Arquivos autorizados a alterar
- `system/backend/src/migrations/` — criar novos arquivos de migration

## Arquivos a consultar
- `system/backend/src/auth/user.entity.ts` — ver estrutura atual do User
- `system/backend/src/pvp/pvp-room.entity.ts` — ver estrutura atual do pvp_room
- `system/backend/src/app.module.ts` — ver como migrations são registradas

## O que NÃO mexer
- Código de módulos NestJS
- Entities existentes
- Dados de produção

## Migrations a aplicar

### M1 — is_admin no User
```sql
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;
```

### M2 — character_consumable (nova tabela)
```sql
CREATE TABLE IF NOT EXISTS character_consumable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  consumable_id VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_char_consumable UNIQUE(character_id, consumable_id)
);
CREATE INDEX IF NOT EXISTS idx_char_consumable_char ON character_consumable(character_id);
```

### M3 — pvp_room: slots e mode
**ATENÇÃO**: verificar estrutura atual antes de aplicar. Usar `\d pvp_room` ou consultar pvp-room.entity.ts.
```sql
ALTER TABLE pvp_room ADD COLUMN IF NOT EXISTS slots JSONB DEFAULT '[]';
ALTER TABLE pvp_room ADD COLUMN IF NOT EXISTS mode VARCHAR(20) DEFAULT 'free';
ALTER TABLE pvp_room ADD COLUMN IF NOT EXISTS map_slug VARCHAR(50) DEFAULT 'plains';
```

### Seed de admin
```sql
UPDATE "user" SET is_admin = true WHERE email = 'patrick095@gmail.com';
```

### Seed de consumíveis para personagem de teste
```sql
INSERT INTO character_consumable (character_id, consumable_id, quantity)
SELECT c.id, unnest(ARRAY['heal','teleport','ice-throw','invisibility','calibration-shot']), 10
FROM character c
WHERE c.name = 'Lucas'
ON CONFLICT DO NOTHING;
```

## Como executar
Verificar se o projeto usa `typeorm migration:run` ou scripts manuais:
```bash
# Opção 1: via psql direto
cd system/backend && cat package.json | grep -i migration
# Opção 2: criar arquivo de migration TypeORM
# Opção 3: usar psql diretamente se DATABASE_URL disponível
```

## Critérios de aceite
- [ ] Coluna `is_admin` existe em `user`
- [ ] Tabela `character_consumable` existe com índice
- [ ] Colunas `slots`, `mode`, `map_slug` existem em `pvp_room`
- [ ] Email patrick095@gmail.com tem is_admin = true
- [ ] Personagem 'Lucas' tem 10 unidades de cada consumível (se existir)

## Formato do resumo final
Criar `.ai-orchestration/agents/001-db-migrations-result.md` com status, o que foi executado, queries que falharam e observações.

## Memory

### Objetivo
Aplicar migrations SQL para v1.7.0 e executar seeds de desenvolvimento.

### Contexto permitido
Backend NestJS + PostgreSQL. Diretório system/backend/.

### Arquivos autorizados
system/backend/src/migrations/ (criar novos arquivos)

### Dependências
Nenhuma

### Restrições
NÃO alterar entities, módulos ou dados além dos especificados.

### Critérios de aceite
Coluna is_admin em user, tabela character_consumable, colunas slots/mode/map_slug em pvp_room, seed admin e consumíveis.
