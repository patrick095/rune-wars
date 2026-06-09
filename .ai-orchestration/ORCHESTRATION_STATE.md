# Estado da Orquestração

## Status geral
Não iniciado

## Spec original
v1.3.0.md — duas features:
1. Seleção/Criação de Personagem antes do Hub
2. Melhorias de Controles e UX Mobile na BattleScene

## Objetivo geral
Implementar fluxo de identidade do jogador (character select/create) e melhorias de UX na BattleScene (map drag, mobile controls, power bar ruler, weapon angle limits).

## Última ação concluída
Plano de orquestração criado (2026-06-08)

## Próxima ação recomendada
Executar agentes **001** e **003** em paralelo (Fase 1 — Fundação)

## Fase atual
Fase 0 — Planejamento concluído, aguardando início da execução

## Agente atual
Nenhum

## Agentes concluídos
- Nenhum

## Agentes pendentes
- 001 — Backend: Character Entity + Migration
- 002 — Backend: CharacterService + Controller DELETE
- 003 — Frontend: Character Model + ActiveCharacterService
- 004 — Frontend: characterGuard + Rotas
- 005 — Frontend: CharacterSelectComponent
- 006 — Frontend: Integrações de Serviço
- 007 — BattleScene: Race do Personagem Ativo
- 008 — BattleScene: Map Drag
- 009 — BattleScene: Angle Controls Mobile
- 010 — BattleScene: PowerBar Redesign
- 011 — BattleScene: Weapon Angle Limits
- 012 — TypeScript QA
- 013 — Orquestrador Final

## Agentes bloqueados
- 002 (aguarda 001)
- 004 (aguarda 003)
- 005 (aguarda 002 + 003 + 004)
- 006 (aguarda 003)
- 007 (aguarda 003)
- 008 (pode iniciar em paralelo com 007)
- 009 (aguarda 008)
- 010 (aguarda 009)
- 011 (aguarda 010)
- 012 (aguarda todos 001-011)
- 013 (aguarda 012)

## Dependências liberadas
- Nenhuma ainda

## Bugs críticos
- Nenhum

## Decisões tomadas
- Personagens: até 5 por conta
- Nome: único globalmente
- Raças: human, dwarf, elf
- Persistência de personagem ativo: localStorage `rw_character_id`
- Detecção mobile: `window.matchMedia('(pointer: coarse)')`
- Botões de ângulo: visíveis apenas em mobile
- Throttle teclado: 100ms
- Hold-to-repeat: 400ms delay + 80ms interval
- Agentes 007-011 tocam BattleScene — executar sequencialmente

## Decisões pendentes
- Nenhuma

## Arquivos alterados até agora
- Nenhum (plano criado, implementação não iniciada)

## Como retomar
Para continuar esta implementação, leia primeiro:

1. `.ai-orchestration/ORCHESTRATION_STATE.md`
2. `.ai-orchestration/AGENTS_QUEUE.md`
3. `.ai-orchestration/BUGS_AND_BLOCKERS.md`
4. `.ai-orchestration/FILES_CHANGED.md`
5. Os resumos em `.ai-orchestration/agents/`

Depois continue exatamente da seção "Próxima ação recomendada".
