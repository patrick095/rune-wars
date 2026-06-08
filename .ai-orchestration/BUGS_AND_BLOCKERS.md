# Bugs e Bloqueios

## Críticos
(nenhum)

## Importantes
(nenhum)

## Baixos
(nenhum)

## Resolvidos
- v0.8.0: posição inicial de inimigos variava por resolução e podia cair fora do mapa. Corrigido em `BattleScene` e `DungeonScene` usando largura real do grid (`GRID_COLS * CELL_SIZE`) com clamp para mapa/viewport.
