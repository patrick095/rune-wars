# Fila de Subagentes

## Prontos para executar
- 001-spawn-points
- 002-terrain-types

## Executando
- (nenhum)

## Aguardando dependência
- 003-terrain-engine → aguarda 002-terrain-types
- 004-terrain-renderer → aguarda 002-terrain-types
- 005-spawn-selector → aguarda 002-terrain-types
- 006-battle-scene → aguarda 003, 004, 005
- 007-map-jsons → aguarda 001 e 006
- 008-validacao-build → aguarda todos

## Concluídos
- (nenhum)

## Bloqueados
- (nenhum)

## Cancelados
- (nenhum)

## Ordem recomendada
1. [PARALELO] 001-spawn-points + 002-terrain-types
2. [PARALELO] 003-terrain-engine + 004-terrain-renderer + 005-spawn-selector
3. [SEQUENCIAL] 006-battle-scene
4. [SEQUENCIAL] 007-map-jsons
5. [SEQUENCIAL] 008-validacao-build
