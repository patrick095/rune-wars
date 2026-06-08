# Fila de Subagentes — v1.2.0

## Prontos para executar (sem dependências)
- 001-asset-spec-prompts
- 006-power-meter-hud
- 008-desktop-parity
- 009-item-slot-tooltip
- 012-vault-backend
- 014-map-jsons
- 016-event-bus-hub-refactor

## Executando
- (nenhum)

## Aguardando dependência
- 002-character-sprites → aguarda 001
- 003-weapon-icons → aguarda 001
- 004-item-icons → aguarda 001
- 005-craft-material-icons → aguarda 001
- 007-ghost-trace → aguarda 006
- 010-equipment-inventory-grid → aguarda 009
- 011-character-inventory-integration → aguarda 009, 010
- 013-vault-frontend → aguarda 012, 011
- 015-map-assets → aguarda 014
- 017-app-overlay-system → aguarda 016
- 018-integration-qa → aguarda todos

## Concluídos
- (nenhum)

## Bloqueados
- (nenhum)

## Cancelados
- (nenhum)

## Ordem recomendada de execução

### Rodada 1 — Paralelo (sem dependências)
1. 001-asset-spec-prompts
2. 006-power-meter-hud
3. 008-desktop-parity
4. 009-item-slot-tooltip
5. 012-vault-backend
6. 014-map-jsons
7. 016-event-bus-hub-refactor

### Rodada 2 — Desbloqueados após rodada 1
8. 002-character-sprites (após 001)
9. 003-weapon-icons (após 001)
10. 004-item-icons (após 001)
11. 005-craft-material-icons (após 001)
12. 007-ghost-trace (após 006)
13. 010-equipment-inventory-grid (após 009)
14. 015-map-assets (após 014)
15. 017-app-overlay-system (após 016)

### Rodada 3 — Dependem da rodada 2
16. 011-character-inventory-integration (após 009, 010)

### Rodada 4 — Dependem da rodada 3
17. 013-vault-frontend (após 012, 011)

### Rodada 5 — Finalização
18. 018-integration-qa (após todos)
