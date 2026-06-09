# Sub-spec — Agent 007: PowerBar

## Objetivo
Criar `game/hud/power-bar.ts` — barra de força responsiva que substitui `power-meter-hud.ts`. Ocupa a base central do HUD com: display de ângulo, barra de força gradiente em largura total, botão ATIRAR.

## Contexto Mínimo Necessário
- Stack: Phaser 3
- Layout (base central, largura total):
  ```
  [  ÂNGULO  ] [████████████████░░░░░░░░] [  ATIRAR  ]
      75°           Força: 65%              (ESPAÇO)
  ```
  - Ângulo: display numérico (ex: `75°`) + setas ← →
  - Barra de força: `W * 0.40` de largura, `H * 0.04` de altura; gradiente verde→amarelo→vermelho; marcações a cada 10%
  - Botão ATIRAR: label muda para "CARREGANDO..." durante charge + percentual
- Responsivo: `W = scene.scale.width`, `H = scene.scale.height`
- Emite evento `power:fire` quando botão clicado
- Substitui visualmente o `power-meter-hud.ts` mas NÃO apaga o arquivo original

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/game/hud/power-bar.ts` (CRIAR novo arquivo)

## Arquivos que Deve Apenas Consultar
- `system/frontend/src/game/hud/power-meter-hud.ts` (referência de lógica existente — somente leitura, NÃO alterar)

## O que Não Deve Mexer
- `power-meter-hud.ts` (não alterar, não deletar)
- Qualquer outro arquivo existente

## Dependências Obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de Aceite
- [ ] Classe `PowerBar` exportada
- [ ] `create(scene: Phaser.Scene): void`
- [ ] `update(power: number, angle: number): void` — power 0–100
- [ ] `setCharging(isCharging: boolean): void` — muda label do botão
- [ ] `onFire(callback: () => void): void` — registra callback de disparo
- [ ] Barra gradiente verde→amarelo→vermelho
- [ ] Marcações a cada 10% na barra
- [ ] Responsivo: `W * 0.40` largura da barra
- [ ] TypeScript sem erros

## Instrução de Execução
Barra desenhada com `Graphics.fillRect` em múltiplos segmentos (ou fillGradientStyle). Botão ATIRAR como `Phaser.GameObjects.Rectangle` + Text, com listener de `pointerdown`. Ângulo exibido como `Text`. Container pai para todo o conjunto.

## Formato do Resumo Final
Criar `.ai-orchestration/agents/007-summary.md` com o template padrão de resumo.
