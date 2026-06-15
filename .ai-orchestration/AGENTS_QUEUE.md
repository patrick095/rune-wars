# Fila de Subagentes

## Prontos para executar
- 001 — Interfaces e Types (Fase 1)
- 002 — Estrutura do Módulo (Fase 1)

## Executando
- (nenhum)

## Aguardando dependência
- 003 — Projectile Physics (aguarda: 001, 002)
- 004 — Damage Calculator (aguarda: 001, 002)
- 005 — Wind System (aguarda: 001, 002)
- 006 — Terrain Engine + Loader (aguarda: 001, 002)
- 007 — Weapon Definition (aguarda: 001, 002)
- 008 — Consumable System (aguarda: 001, 002)
- 009 — Status Effect + Shot Modifier (aguarda: 001, 002)
- 010 — AI Engine (aguarda: 003, 004, 005, 006, 007, 008, 009)
- 011 — Action Validator + Violation Tracker (aguarda: 001, 002)
- 012 — GameEngineService (aguarda: 003, 004, 005, 006, 007, 008, 009, 010, 011)
- 013 — BattleGateway Refactor (aguarda: 012)
- 014 — BattleSocketService (aguarda: 001)
- 015 — BattleScene Thin Client (aguarda: 013, 014)
- 016 — Validação Final (aguarda: 015)

## Concluídos
- (nenhum)

## Bloqueados
- (nenhum)

## Cancelados
- (nenhum)

## Ordem recomendada
1. [PARALELO] 001, 002
2. [PARALELO] 003, 004, 005, 006, 007, 008, 009, 011 (após 001+002)
3. [PARALELO] 010, 014 (após 003-009 concluídos; 014 só precisa de 001)
4. [SEQUENCIAL] 012 (após 003-011)
5. [SEQUENCIAL] 013 (após 012)
6. [PARALELO] 015 (após 013+014)
7. [SEQUENCIAL] 016 (após 015)
