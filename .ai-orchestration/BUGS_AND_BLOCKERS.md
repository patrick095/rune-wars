# Bugs e Bloqueios

## Críticos
(nenhum)

## Importantes
(nenhum)

## Baixos
(nenhum)

## Resolvidos
- v0.8.0: posição inicial de inimigos variava por resolução e podia cair fora do mapa. Corrigido em `BattleScene` e `DungeonScene` usando largura real do grid (`GRID_COLS * CELL_SIZE`) com clamp para mapa/viewport.
- v0.8.0: controles dependiam de cliques nos botões. Corrigido em `BattleScene` e `DungeonScene` com input contínuo por teclado e barra de espaço para disparo.
- v0.8.0: IA local errava todos os tiros e repetia o mesmo ponto; "Jogar Novamente" reaproveitava HP antigo. Corrigido em `BattleScene` com mira por simulação de trajetória e reset explícito do estado runtime.
