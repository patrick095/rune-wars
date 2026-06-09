# Agente 001 — Backend: Character Entity + Migration

## Objetivo
Adicionar campo `race` na entidade `Character` do NestJS/TypeORM, tornar `name` globalmente único (UNIQUE constraint), e criar a migration correspondente.

## Contexto mínimo necessário
- Projeto NestJS com TypeORM
- Entidade atual em `system/backend/src/character/character.entity.ts`
- Banco PostgreSQL
- Migrations em `system/backend/src/migrations/` (verificar se pasta existe — se não, criar)
- Personagens existentes não devem perder dados: `race` terá DEFAULT 'human'

## Arquivos que pode alterar
- `system/backend/src/character/character.entity.ts`
- `system/backend/src/migrations/TIMESTAMP-add-race-unique-name-to-character.ts` (criar)
- `system/backend/src/app.module.ts` (apenas se precisar registrar a migration)

## Arquivos que deve apenas consultar
- `system/backend/src/auth/user.entity.ts`
- `system/backend/src/character/character.service.ts`
- `system/backend/src/app.module.ts` (ler config do TypeORM para entender migrations)

## O que NÃO deve mexer
- `character.service.ts` (escopo do agente 002)
- `character.controller.ts` (escopo do agente 002)
- Qualquer arquivo do frontend
- Outras entidades

## Dependências obrigatórias
- Nenhuma (agente fundação)

## Critérios de aceite
- [ ] `character.entity.ts` tem campo `race: string` com `@Column({ length: 20, default: 'human' })`
- [ ] `character.entity.ts` tem `name` com constraint `unique: true`
- [ ] Migration criada com SQL equivalente a:
  ```sql
  ALTER TABLE "character" ADD COLUMN "race" character varying(20) NOT NULL DEFAULT 'human';
  ALTER TABLE "character" ADD CONSTRAINT "UQ_character_name" UNIQUE ("name");
  ```
- [ ] Migration inclui query de diagnóstico de duplicatas como comentário ou verificação prévia
- [ ] Backend compila sem erros (`npx tsc --noEmit` em `system/backend`)

## Restrições importantes
- Se já existirem nomes duplicados no banco, o agente deve incluir um aviso no resumo (IMPORTANTE) mas continuar — a constraint SQL é criada no código de migration; será responsabilidade do operador limpar antes de rodar em produção
- Não usar `synchronize: true` — usar migration explícita
- O campo `race` deve aceitar os valores: 'human', 'dwarf', 'elf' (validação de enum é no service, não na entidade)

## Memory

### Objetivo
Adicionar `race` + UNIQUE em `name` na entidade Character e criar migration TypeORM.

### Contexto permitido
- NestJS + TypeORM + PostgreSQL
- `system/backend/src/character/character.entity.ts`
- `system/backend/src/app.module.ts` (somente leitura para entender config do TypeORM)

### Arquivos autorizados
- `system/backend/src/character/character.entity.ts` (editar)
- `system/backend/src/migrations/` (criar arquivo de migration)
- `system/backend/src/app.module.ts` (editar apenas se necessário para registrar migration)

### Dependências
- Nenhuma

### Restrições
- Não alterar `character.service.ts` nem `character.controller.ts`
- Não alterar frontend
- Migration com SQL explícito, não `synchronize: true`

### Critérios de aceite
- race: `@Column({ length: 20, default: 'human' })`
- name: `@Column({ length: 50, unique: true })`
- Migration SQL criada e válida
- `npx tsc --noEmit` sem erros em `system/backend`

## Formato do resumo final
Criar `.ai-orchestration/agents/001-backend-character-entity-migration-DONE.md` seguindo o formato padrão de resumo.
