# Sub-spec — Agent 005: ModifierDock

## Objetivo
Criar `game/hud/modifier-dock.ts` — dock de 5 slots de modificadores de disparo com hotkeys 1–5, posicionado na base direita do HUD. Layout menor que ConsumableDock (44×44px), com highlight roxo/arcano ao ativar.

## Contexto Mínimo Necessário
- Stack: Phaser 3
- Layout:
  - 5 slots em linha horizontal, base direita do canvas
  - Cada slot: ícone 44×44px, bordas menores que ConsumableDock
  - Label numérico no canto inferior esquerdo do ícone (1, 2, 3, 4, 5)
  - Ao ativar: highlight roxo/arcano (borda colorida + tween alpha)
- Hotkeys 1–5 disparam `modifier:use` via `scene.events`
- Responsivo: base direita relativa ao canvas

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/game/hud/modifier-dock.ts` (CRIAR)

## Arquivos que Deve Apenas Consultar
- `system/frontend/src/game/hud/consumable-dock.ts` (se já existir — ver padrão)
- `system/frontend/src/game/hud/item-dock.ts` (referência existente)

## O que Não Deve Mexer
- Nenhum arquivo existente

## Dependências Obrigatórias
- Nenhuma (pode executar imediatamente, mas deve ser coerente com padrão do Agent 004)

## Critérios de Aceite
- [ ] Classe `ModifierDock` exportada
- [ ] `create(scene: Phaser.Scene): void`
- [ ] `setSlot(index: number, item: { iconKey: string } | null): void`
- [ ] `activateSlot(index: number): void` — highlight roxo
- [ ] `clearSlot(index: number): void`
- [ ] Escuta evento `modifier:use` de `scene.events`
- [ ] Responsivo: base direita
- [ ] TypeScript sem erros

## Instrução de Execução
Estrutura igual ao ConsumableDock mas: ícones 44×44, borda highlight cor `0x9b59b6` (roxo), label no canto inferior esquerdo em vez de abaixo.

## Formato do Resumo Final
Criar `.ai-orchestration/agents/005-summary.md` com o template padrão de resumo.
