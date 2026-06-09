# Sub-spec — Agent 001: BattleInputController

## Objetivo
Criar `game/input/battle-input-controller.ts` — controlador unificado de input para todos os modos de batalha (PvP, Dungeon, Academy). Centraliza captura de teclas Q, W, E, R, T (consumíveis), 1–5 (modificadores), ESPAÇO (início de charge), ← → (ângulo/movimento), e dispara eventos via EventBus do Phaser.

## Contexto Mínimo Necessário
- Stack: Angular 17 + Phaser 3
- Modos de batalha: PvP (`battle.scene.ts`), Academy (`academy.scene.ts`), Dungeon (`dungeon.scene.ts`)
- Padrão de eventos do Phaser: `scene.events.emit('event-name', payload)`
- Teclas consumíveis: Q, W, E, R, T → slots 0–4
- Teclas modificadores: 1, 2, 3, 4, 5 → slots 0–4
- ESPAÇO: início do charge de força
- ← →: ajuste de ângulo e movimentação

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/game/input/battle-input-controller.ts` (CRIAR)

## Arquivos que Deve Apenas Consultar
- `system/frontend/src/game/scenes/battle.scene.ts` (ver como teclas são usadas hoje)
- `system/frontend/src/game/hud/power-meter-hud.ts` (ver padrão de EventBus)

## O que Não Deve Mexer
- Nenhum arquivo existente além dos listados acima
- Não remover ou alterar lógica de input existente em `battle.scene.ts`

## Dependências Obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de Aceite
- [ ] Classe `BattleInputController` exportada como default
- [ ] Método `attach(scene: Phaser.Scene): void` — registra os listeners
- [ ] Método `detach(): void` — remove os listeners (cleanup)
- [ ] Evento `consumable:use` emitido com `{ slotIndex: number }` ao pressionar Q/W/E/R/T
- [ ] Evento `modifier:use` emitido com `{ slotIndex: number }` ao pressionar 1–5
- [ ] Evento `charge:start` emitido ao pressionar ESPAÇO (primeira vez por turno)
- [ ] Evento `angle:left` e `angle:right` emitidos ao pressionar ← →
- [ ] TypeScript sem erros

## Instrução de Execução
Criar o arquivo TypeScript com a classe `BattleInputController`. Usar `scene.input.keyboard.on('keydown-Q', ...)` etc. Eventos emitidos via `scene.events.emit(...)`. Garantir que `detach()` remove todos os listeners. Sem dependências externas além do Phaser.

## Formato do Resumo Final
Criar `.ai-orchestration/agents/001-summary.md` com o template padrão de resumo.
