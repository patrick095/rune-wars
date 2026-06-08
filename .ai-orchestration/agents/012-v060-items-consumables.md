# Agent 012 — v0.6.0 Items, Consumables + HUD

## Objetivo
Implementar 5 itens secundários, 5 consumíveis com regra de 3 por partida, HUD de efeitos ativos, e integrar efeitos rúnicos ao BattleScene.

## Contexto mínimo necessário

### Itens secundários:
| Item | Usa turno? | Efeito |
|------|-----------|--------|
| shield | Não | Reduz próximo dano recebido em 40% |
| healing-book | Sim | Cura 15% HP máximo |
| camouflage-orb | Sim | Camuflado por 1 turno (IA ignora) |
| protection-totem | Sim | Barreira por 2 turnos |
| runic-builder | — | Placeholder (ativa v0.7.0) |

### Consumíveis:
| Item | Usa turno? | Efeito |
|------|-----------|--------|
| teleport | Sim | Vai para ponto de impacto |
| heal | Não | Cura 25% HP máximo |
| ice-throw | Sim | Imobiliza alvo 1 turno |
| invisibility | Não | Invisível por 1 turno |
| calibration-shot | Sim | Mostra linha de referência |

### Regra: máximo 3 consumíveis equipados por partida

## Arquivos autorizados a criar/alterar
```
system/frontend/src/app/shared/game-core/
  secondary-item-system.ts
  consumable-system.ts
system/frontend/src/game/
  scenes/battle.scene.ts (integrar efeitos rúnicos na resolução do tiro)
  hud/
    effects-hud.ts
system/frontend/src/app/playground/debug-overlay/
  debug-overlay.component.ts
  debug-overlay.component.html
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  runic-effect-system.ts
  status-effect-manager.ts
  player-stats.ts
  weapon-system.ts
```

## O que NÃO mexer
- `runic-effect-system.ts`, `status-effect-manager.ts` (agente 011)

## Dependências obrigatórias
- Agente 011 concluído

## Critérios de aceite
- Efeito rúnico ativa com probabilidade proporcional à Sorte
- BLIND oculta HUD de ângulo
- FREEZE bloqueia movimento
- WEAK_SHOT limita barra de força a 40% visivelmente
- Máximo 3 consumíveis respeitado
- Consumíveis que atiram consomem turno; curar não consome
- HUD exibe efeitos ativos com contador de turnos

## Memory

### Objetivo
Itens secundários, consumíveis, HUD de efeitos + integração ao BattleScene.

### Contexto permitido
APIs de RunicEffectSystem/StatusEffectManager (011) + tabelas de itens acima.

### Arquivos autorizados
Os listados.

### Dependências
011 concluído.

### Restrições
- `runic-builder` no item secundário apenas como placeholder (sem lógica real ainda).
- IA deve verificar `hasEffect('ai', 'ITEM_BLOCK')` antes de usar itens.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-012.md`.

## Limpeza pós-versão
Após v0.6.0 completa (011+012): deletar `v0.6.0.md` da raiz.
