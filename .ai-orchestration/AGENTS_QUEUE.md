# Fila de Subagentes

## Prontos para executar
- 033 — Hub Spec Validator

## Executando
Nenhum.

## Aguardando dependência
- 034 — SVG Icons (aguarda 033 — opcional, pode rodar em paralelo com cautela)
- 035 — Background & POI Assets (aguarda 033 — opcional, pode rodar em paralelo)
- 036 — Audio Spec (aguarda 033 — opcional, pode rodar em paralelo)
- 037 — Hub Angular/Phaser Core (aguarda 033 — obrigatório)
- 038 — Hub Art Pass (aguarda 037 + 034 + 035)
- 039 — Hub QA (aguarda 037 + 038)

## Concluídos
Nenhum.

## Bloqueados
Nenhum.

## Cancelados
Nenhum.

## Ordem recomendada
1. 033 — Hub Spec Validator (solo, read-only, rápido)
2. 034, 035, 036 — Paralelos (após 033 ou simultâneos com cautela)
3. 037 — Hub Angular/Phaser Core (após 033 obrigatório)
4. 038 — Hub Art Pass (após 037 + 034 + 035)
5. 039 — Hub QA (após 037 + 038)
