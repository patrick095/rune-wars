# Fila de Subagentes

## Prontos para executar (Fase 1 — paralelo)
- 001-battle-input-controller
- 002-turn-timer
- 003-wind-display
- 004-consumable-dock
- 005-modifier-dock
- 006-player-status-bar
- 007-power-bar
- 008-map-modifier
- 010-character-sprite

## Executando
- (nenhum)

## Aguardando dependência
- 009-battle-hud → aguarda: 002, 003, 004, 005, 006, 007
- 011-battle-scene-integration → aguarda: 001, 008, 009, 010
- 012-mode-unification → aguarda: 011
- 013-qa-typecheck → aguarda: 011, 012

## Concluídos
- (nenhum)

## Bloqueados
- (nenhum)

## Cancelados
- (nenhum)

## Ordem recomendada
1. [PARALELO] 001, 002, 003, 004, 005, 006, 007, 008, 010
2. [SERIAL após fase 1 concluída] 009
3. [SERIAL após 009] 011
4. [SERIAL após 011] 012
5. [SERIAL após 012] 013
