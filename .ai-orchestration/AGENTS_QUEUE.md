# Fila de Subagentes

## Prontos para executar
- 001-db-migrations (Fase 1, paralelo)
- 002-item-catalog (Fase 1, paralelo)

## Executando
- (nenhum)

## Aguardando dependência
- 003-be-auth-admin → aguarda 001
- 004-be-consumables → aguarda 001
- 005-be-pvp-room → aguarda 001
- 006-fe-inventory → aguarda 002
- 007-fe-vault → aguarda 006
- 008-fe-consumable-service → aguarda 004
- 009-fe-admin-panel → aguarda 003 + 008
- 010-fe-pvp-room → aguarda 005 + 008
- 011-qa-build → aguarda todos os anteriores

## Concluídos
- (nenhum)

## Bloqueados
- (nenhum)

## Cancelados
- (nenhum)

## Ordem recomendada
1. [PARALELO] 001-db-migrations + 002-item-catalog
2. [PARALELO] 003-be-auth-admin + 004-be-consumables + 005-be-pvp-room + 006-fe-inventory
3. [PARALELO] 007-fe-vault + 008-fe-consumable-service
4. [PARALELO] 009-fe-admin-panel + 010-fe-pvp-room
5. [SEQUENCIAL] 011-qa-build
