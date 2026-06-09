# Estado da Orquestração

## Status geral
Não iniciado

## Spec original
`v1.5.0.md` — Modificadores de Mapa, Sistema Visual de Personagens/Equipamentos, HUD Reformulado e Unificação de Controles

## Objetivo geral
Implementar v1.5.0 do Rune Wars: (1) sistema de modificadores de mapa efêmeros que afetam projéteis, (2) personagens com sprites compostos em layers por equipamento e animações por estado, (3) HUD responsivo completo com timer, vento, barras, hotkeys, (4) controles unificados entre PvP/Dungeon/Academy.

## Última ação concluída
Plano criado — todos os sub-specs em `.ai-orchestration/agents/`

## Próxima ação recomendada
Executar Fase 1 em paralelo: Agents 001, 002, 003, 004, 005, 006, 007, 008, 010

## Fase atual
Fase 0 — Planejamento (concluído)

## Agente atual
—

## Agentes concluídos
- (nenhum)

## Agentes pendentes
- 001-battle-input-controller
- 002-turn-timer
- 003-wind-display
- 004-consumable-dock
- 005-modifier-dock
- 006-player-status-bar
- 007-power-bar
- 008-map-modifier
- 009-battle-hud
- 010-character-sprite
- 011-battle-scene-integration
- 012-mode-unification
- 013-qa-typecheck

## Agentes bloqueados
- 009-battle-hud (aguarda 002, 003, 004, 005, 006, 007)
- 011-battle-scene-integration (aguarda 001, 008, 009, 010)
- 012-mode-unification (aguarda 011)
- 013-qa-typecheck (aguarda 011, 012)

## Dependências liberadas
- 001, 002, 003, 004, 005, 006, 007, 008, 010 — prontos para executar agora

## Bugs críticos
- (nenhum ainda)

## Decisões tomadas
| Data       | Decisão                                                           | Motivo                                              |
| ---------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| 2026-06-09 | Assets de personagem usam fallback no código (placeholders)       | Assets IA ainda não gerados, não bloquear frontend  |
| 2026-06-09 | `combat-hud.ts` e `power-meter-hud.ts` não são deletados         | Segurança para rollback até validação               |
| 2026-06-09 | `MapModifier` usa círculos Graphics como placeholder visual       | Assets de modificadores ainda não gerados           |
| 2026-06-09 | Agent 011 usa marcador `// [v1.5.0]` em cada alteração            | Facilitar revisão e rollback                        |

## Decisões pendentes
- Quantos consumíveis por turno são permitidos? (bloqueio de regra de negócio — não implementado nesta versão)
- Assets finais de personagem (Midjourney/DALL-E) — fora do escopo de código

## Arquivos alterados até agora
- (nenhum — plano apenas)

## Como retomar
Para continuar esta implementação, leia primeiro:

1. `.ai-orchestration/ORCHESTRATION_STATE.md`
2. `.ai-orchestration/AGENTS_QUEUE.md`
3. `.ai-orchestration/BUGS_AND_BLOCKERS.md`
4. `.ai-orchestration/FILES_CHANGED.md`
5. Os resumos em `.ai-orchestration/agents/`

Depois continue exatamente da seção "Próxima ação recomendada".
