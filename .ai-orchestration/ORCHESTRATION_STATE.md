# Estado da Orquestração

## Status geral
Não iniciado

## Spec original
v1.1.0.md — Tela Inicial Imersiva: Floresta Rúnica

## Objetivo geral
Substituir a tela inicial/menu pós-login por um hub jogável e imersivo chamado Floresta Rúnica. O personagem aparece no mundo, navega por locais interativos (POIs) que acessam as funcionalidades existentes do Rune Wars.

## Última ação concluída
Plano de orquestração criado (2026-06-08).

## Próxima ação recomendada
Executar Agente 033 (Hub Spec Validator) — obrigatório antes de todos os outros.

## Fase atual
Fase 0 — Planejamento concluído, pronto para execução.

## Agente atual
Nenhum em execução.

## Agentes concluídos
Nenhum.

## Agentes pendentes
- 033 — Hub Spec Validator
- 034 — SVG Icons & UI Assets
- 035 — Background, POI & FX Assets
- 036 — Audio Spec & Placeholders
- 037 — Hub Angular/Phaser Core
- 038 — Hub Art Pass
- 039 — Hub QA

## Agentes bloqueados
- 037 — aguarda 033 (obrigatório)
- 038 — aguarda 037, 034, 035 (todos obrigatórios)
- 039 — aguarda 037, 038 (ambos obrigatórios)

## Dependências liberadas
Nenhuma.

## Bugs críticos
Nenhum identificado.

## Decisões tomadas
- Login pós-sucesso atual navega para `/playground`; deve ser alterado para `/hub` pelo Agente 037.
- Rotas existentes mapeadas: pvp, dungeon, character, market, craft, guild, academy, rankings, dungeon-floors.
- `/craft` será usado para o Ferreiro (inclui upgrade via rota separada `/upgrade`).
- Assets ficarão em `system/frontend/src/assets/hub/`.
- Cenas Phaser existentes: academy, battle, boot, dungeon, playground.
- Não há pasta `assets` ainda — Agentes 034/035/036 criam os diretórios necessários.

## Decisões pendentes
- Confirmar se Ferreiro deve linkar para `/craft` ou `/upgrade` (ou exibir modal de escolha). Agente 033 valida.
- Confirmar se `rankings` precisa de POI próprio no hub. Spec atual não menciona.

## Arquivos alterados até agora
Nenhum arquivo do projeto.

## Como retomar
Para continuar esta implementação, leia primeiro:
1. `.ai-orchestration/ORCHESTRATION_STATE.md`
2. `.ai-orchestration/AGENTS_QUEUE.md`
3. `.ai-orchestration/BUGS_AND_BLOCKERS.md`
4. `.ai-orchestration/FILES_CHANGED.md`
5. Os resumos em `.ai-orchestration/agents/`

Depois continue exatamente da seção "Próxima ação recomendada".
