# Fila de Subagentes

## Prontos para executar
- 001 — Backend: Character Entity + Migration
- 003 — Frontend: Character Model + ActiveCharacterService

## Executando
- Nenhum

## Aguardando dependência
- 002 — aguarda 001
- 004 — aguarda 003
- 005 — aguarda 002 + 003 + 004
- 006 — aguarda 003
- 007 — aguarda 003
- 008 — aguarda 003 (independente de parte 1, mas usa race do char ativo — aguarda model)
- 009 — aguarda 008
- 010 — aguarda 009
- 011 — aguarda 010
- 012 — aguarda 001 a 011
- 013 — aguarda 012

## Concluídos
- Nenhum

## Bloqueados
- Nenhum

## Cancelados
- Nenhum

## Ordem recomendada
1. [PARALELO] 001 + 003
2. [SEQUENCIAL] 002 (após 001)
3. [PARALELO] 004 + 006 + 007 + 008 (após 003; 004 também precisa de 002 pronto antes do 005)
4. [SEQUENCIAL] 005 (após 002 + 003 + 004)
5. [SEQUENCIAL] 009 → 010 → 011 (após 008)
6. [SEQUENCIAL] 012 (após todos)
7. [SEQUENCIAL] 013 (após 012)
