# Estado da Orquestração

## Status geral
Não iniciado

## Spec original
`docs/implementations/2026-06-10-v1.6.0-spec.md`

## Objetivo geral
Substituir o motor de mapa baseado em grade (tiles 8×8px) por um sistema de terreno bitmap pixel-perfect usando as imagens reais dos mapas PVP. Explosões criam buracos circulares via RenderTexture.erase(). Colisão lê diretamente o canal alpha do PNG (Uint8Array). 12 spawn points por mapa em coordenadas de pixel.

## Última ação concluída
Plano de orquestração criado (2026-06-10)

## Próxima ação recomendada
Executar Agente 01 (Spawn Points) e Agente 02 (terrain-types) em paralelo — ambos independentes.

## Fase atual
Fase 0 — Planejamento concluído / pronto para execução

## Agente atual
Nenhum

## Agentes concluídos
- (nenhum)

## Agentes pendentes
- 001-spawn-points
- 002-terrain-types
- 003-terrain-engine
- 004-terrain-renderer
- 005-spawn-selector
- 006-battle-scene
- 007-map-jsons
- 008-validacao-build

## Agentes bloqueados
- 003-terrain-engine (aguarda 002-terrain-types)
- 004-terrain-renderer (aguarda 002-terrain-types)
- 005-spawn-selector (aguarda 002-terrain-types)
- 006-battle-scene (aguarda 003, 004, 005)
- 007-map-jsons (aguarda 001 e 006)
- 008-validacao-build (aguarda todos)

## Dependências liberadas
- 001-spawn-points — pronto
- 002-terrain-types — pronto

## Bugs críticos
- (nenhum)

## Decisões tomadas
| Data       | Decisão                                                      | Motivo                                   |
|------------|--------------------------------------------------------------|------------------------------------------|
| 2026-06-10 | `castle` renomeado para `mystic_castle` em todo o código     | Assets estão em pasta `mystic-castle/`   |
| 2026-06-10 | Dimensões do mundo fixas em 1672×941 para todos os 5 mapas   | Matching com terrain PNGs                |
| 2026-06-10 | `CELL_SIZE` mantido como alias = 1 por compatibilidade       | Evitar quebrar imports não mapeados      |
| 2026-06-10 | `terrain-textures.ts` deletado                                | Tiles gerados não são mais necessários   |

## Decisões pendentes
- (nenhuma crítica para v1.6.0)

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
