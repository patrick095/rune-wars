# Fila de Subagentes

## Prontos para executar (Fase 1 — paralelos)
- Agent-001-projectile-renderer
- Agent-002-death-line
- Agent-003-spawn-selector
- Agent-004-terrain-collision

## Prontos para executar (Fase 2 — paralelos após plano)
- Agent-005-game-frame
- Agent-006-game-navigator
- Agent-007-modal-blocking
- Agent-008-debug-toggle
- Agent-012-pvp-backend

## Executando
- (nenhum)

## Aguardando dependência
- Agent-009-combat-hud (aguarda Fase 1 concluída)
- Agent-010-shot-modifier-system (aguarda Fase 1 concluída)
- Agent-011-item-dock (aguarda Agent-010)
- Agent-013-pvp-lobby-frontend (aguarda Agent-006 + Agent-012)
- Agent-014-pvp-room-frontend (aguarda Agent-013)
- Agent-015-grid-expansion (aguarda Fase 1 concluída)
- Agent-016-terrain-textures (aguarda Agent-015)
- Agent-017-qa-validation (aguarda todos)

## Concluídos
- (nenhum)

## Bloqueados
- (nenhum)

## Cancelados
- (nenhum)

## Ordem recomendada de execução

### Fase 1 — Bugs Críticos (todos em paralelo)
1. Agent-001-projectile-renderer
2. Agent-002-death-line
3. Agent-003-spawn-selector
4. Agent-004-terrain-collision

### Fase 2 — Arquitetura + Backend PvP (todos em paralelo)
5. Agent-005-game-frame
6. Agent-006-game-navigator
7. Agent-007-modal-blocking
8. Agent-008-debug-toggle
9. Agent-012-pvp-backend

### Fase 3 — HUD e Modificadores (após Fase 1)
10. Agent-009-combat-hud
11. Agent-010-shot-modifier-system

### Fase 4 — Item Dock + Grid (após Fase 3)
12. Agent-011-item-dock (após Agent-010)
13. Agent-015-grid-expansion

### Fase 5 — PvP Frontend + Texturas (após Fase 2)
14. Agent-013-pvp-lobby-frontend (após Agent-006 + Agent-012)
15. Agent-016-terrain-textures (após Agent-015)

### Fase 6 — PvP Room + Dependentes
16. Agent-014-pvp-room-frontend (após Agent-013)

### Fase 7 — Validação Final
17. Agent-017-qa-validation
