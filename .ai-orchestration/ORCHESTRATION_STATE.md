# Estado da Orquestração

## Status geral
Não iniciado

## Spec original
v1.2.0.md — Rune Wars v1.2.0: Assets Visuais, Inventário, Cofre, Mapas, Fixes de Gameplay, Canvas Único

## Objetivo geral
Entregar build jogável e testável por beta testers com: ~49 assets visuais, power meter funcional, ghost trace, inventário 6x6 + slots de equipamento, cofre 6x10 compartilhado, 3 novos mapas battle, paridade desktop=playground, canvas único sem navegação Angular.

## Última ação concluída
Planejamento criado em 2026-06-08.

## Próxima ação recomendada
Executar Agent 001 (Asset Spec & Prompts) — sem dependências, pode iniciar imediatamente.
Em paralelo: Agent 006 (Power Meter HUD), Agent 008 (Desktop Parity).

## Fase atual
Fase 0 — Planejamento concluído. Pronto para execução.

## Agente atual
Nenhum em execução.

## Agentes concluídos
- (nenhum)

## Agentes pendentes
- 001-asset-spec-prompts
- 002-character-sprites
- 003-weapon-icons
- 004-item-icons
- 005-craft-material-icons
- 006-power-meter-hud
- 007-ghost-trace
- 008-desktop-parity
- 009-item-slot-tooltip
- 010-equipment-inventory-grid
- 011-character-inventory-integration
- 012-vault-backend
- 013-vault-frontend
- 014-map-jsons
- 015-map-assets
- 016-event-bus-hub-refactor
- 017-app-overlay-system
- 018-integration-qa

## Agentes bloqueados
- 002-character-sprites (aguarda 001)
- 003-weapon-icons (aguarda 001)
- 004-item-icons (aguarda 001)
- 005-craft-material-icons (aguarda 001)
- 007-ghost-trace (aguarda 006 para integração na BattleScene)
- 010-equipment-inventory-grid (aguarda 009)
- 011-character-inventory-integration (aguarda 009, 010)
- 013-vault-frontend (aguarda 012, 011)
- 015-map-assets (aguarda 014)
- 017-app-overlay-system (aguarda 016)
- 018-integration-qa (aguarda todos)

## Dependências liberadas
- (nenhuma ainda)

## Bugs críticos
- (nenhum identificado ainda)

## Decisões tomadas
- D1: Assets seguem estilo painted do hub: RPG isométrico premium, texturas ricas, stone/gold/wood com iluminação mágica, fundos transparentes para sprites individuais
- D2: Personagens têm proporção ligeiramente compacta/chibi, visível nas imagens do hub (ver poi_academy_painted.png)
- D3: Ícones de item (48x48) seguem mesma linguagem visual mas adaptados para leitura em grid pequeno
- D4: Materiais (32x32) ainda menores — foco total em silhueta e cor identificável
- D5: P4 resolvido: ghost trace apaga ao iniciar turno próprio seguinte (padrão do gênero)
- D6: Taxa fixa de retirada de item do cofre (P1) — pendente confirmação do usuário antes de implementar backend do vault

## Decisões pendentes
- P1: Valor da taxa fixa para retirar item do cofre (confirmar antes do Agent 012)

## Arquivos alterados até agora
- (nenhum)

## Como retomar
Para continuar esta implementação, leia primeiro:
1. `.ai-orchestration/ORCHESTRATION_STATE.md`
2. `.ai-orchestration/AGENTS_QUEUE.md`
3. `.ai-orchestration/BUGS_AND_BLOCKERS.md`
4. `.ai-orchestration/FILES_CHANGED.md`
5. Os resumos em `.ai-orchestration/agents/`

Depois continue exatamente da seção "Próxima ação recomendada".
