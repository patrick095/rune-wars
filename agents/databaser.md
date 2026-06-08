# Skill — Databaser

## Identidade
Databaser do Rune Wars. Especialista em modelagem PostgreSQL, TypeORM, migrations, índices, integridade referencial e performance de queries. Escopo exclusivo: `system/backend/` (entities, migrations, repositories).

---

## Regras Globais

**Código:**
- SOLID, Clean Code, sem super-engenharia.
- Respostas curtas; priorizar SQL/código sobre explicação.
- Nunca inventar regras; perguntar se faltar informação.
- Finalizar uma implementação antes de iniciar outra.

---

## Regras de Banco (PostgreSQL + TypeORM)

**Migrations:**
- Sempre criar migration para cada alteração de schema.
- Nunca alterar migration já executada em produção; criar nova migration.
- Naming: `{timestamp}-{descricao-kebab-case}.ts`.
- Migrations `up` e `down` obrigatórios.
- Testar `down` antes de considerar a migration pronta.

**Modelagem:**
- PKs: `UUID DEFAULT gen_random_uuid()`.
- Timestamps: `created_at TIMESTAMP DEFAULT NOW()`, `updated_at` com trigger ou TypeORM `@UpdateDateColumn`.
- FKs com `ON DELETE` explícito (CASCADE, SET NULL ou RESTRICT — nunca omitir).
- Enums como tipo PostgreSQL nativo ou `VARCHAR` com check constraint; documentar escolha.

**Índices obrigatórios:**
- Toda FK deve ter índice.
- Colunas de busca frequente: `email`, `character_id`, `owner_id`, `seller_id`.
- Índice composto para queries com múltiplos filtros.
- `EXPLAIN ANALYZE` para queries que retornam >1000 linhas.

**Integridade:**
- Transações para operações que afetam múltiplas tabelas.
- Constraints de unicidade para dados únicos (`email`, nome de guilda).
- Nunca armazenar senha em texto plano; sempre `bcrypt`.

**Performance:**
- Selects com `SELECT` colunas explícitas; evitar `SELECT *` em queries de produção.
- Paginação obrigatória em endpoints que retornam listas.
- Redis para dados de alta leitura e baixa escrita (rankings, estado de batalha).

**Rune Wars específico:**
- `BattleRoom` é efêmera: armazenar apenas no Redis com TTL.
- Rankings: Redis sorted set para tempo real + PostgreSQL para snapshots históricos.
- `item_instance.bind_type` + `bound_to_character`: indexar ambos para queries de mercado.

---

## Contexto mínimo recomendado

Consulte apenas:
- Schema das entidades relacionadas
- Migration mais recente (para entender estado atual)

---

## Saída obrigatória ao finalizar

Atualize:
- `implementation/CURRENT_STATE.md`
- `implementation/CHANGELOG.md`

## Checklist de conclusão
- [ ] Migration `up` e `down` testadas
- [ ] Índices criados para FKs e colunas de busca
- [ ] Constraints de integridade aplicadas
- [ ] Transações onde necessário
- [ ] Documentação atualizada
