# Sub-spec — Agent 004: ConsumableDock

## Objetivo
Criar `game/hud/consumable-dock.ts` — dock de 5 slots de consumíveis com hotkeys Q, W, E, R, T, posicionado na base esquerda do HUD.

## Contexto Mínimo Necessário
- Stack: Phaser 3
- Layout:
  - 5 slots em linha horizontal, base esquerda do canvas
  - Cada slot: ícone 52×52px, bordas arredondadas, fundo escuro semitransparente
  - Label da hotkey abaixo do ícone (Q, W, E, R, T) em amarelo
  - Slot vazio: ícone cinza com "—"
  - Quantidade: canto superior direito (se stackável)
  - Ao ativar: flash alpha + tween de escala
- Hotkeys Q/W/E/R/T disparam `consumable:use` via `scene.events` (capturado pelo BattleInputController)
- Responsivo: base esquerda relativa ao canvas

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/game/hud/consumable-dock.ts` (CRIAR)

## Arquivos que Deve Apenas Consultar
- `system/frontend/src/game/hud/item-dock.ts` (referência de dock existente — somente leitura)

## O que Não Deve Mexer
- Nenhum arquivo existente

## Dependências Obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de Aceite
- [ ] Classe `ConsumableDock` exportada
- [ ] `create(scene: Phaser.Scene): void`
- [ ] `setSlot(index: number, item: { iconKey: string; quantity?: number } | null): void`
- [ ] `activateSlot(index: number): void` — flash visual + tween
- [ ] `clearSlot(index: number): void`
- [ ] Escuta evento `consumable:use` de `scene.events` e chama `activateSlot`
- [ ] Responsivo: posição e tamanho relativos ao canvas
- [ ] TypeScript sem erros

## Instrução de Execução
Usar Container Phaser por slot com: Graphics (fundo), Image (ícone ou placeholder cinza), Text (hotkey label), Text (quantidade). Container pai para agrupar todos. Usar `Phaser.Math.Clamp` para garantir tamanho mínimo e máximo de ícone (`Math.min(W * 0.045, 60)`).

## Formato do Resumo Final
Criar `.ai-orchestration/agents/004-summary.md` com o template padrão de resumo.
