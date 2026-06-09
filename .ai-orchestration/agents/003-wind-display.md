# Sub-spec — Agent 003: WindDisplay

## Objetivo
Criar `game/hud/wind-display.ts` — display de vento estilo Gunbound posicionado no centro-topo do canvas.

## Contexto Mínimo Necessário
- Stack: Phaser 3
- Layout:
  - Caixa fundo escuro semitransparente (200px × 40px), cantos arredondados
  - Label "VENTO" acima da caixa (fonte pequena)
  - Barra horizontal com marcação central (sem vento = centro)
    - 0–30%: azul
    - 30–70%: amarelo
    - 70–100%: vermelho
  - Seta animada indicando direção (← ou →)
  - Valor numérico abaixo da seta (ex: `→ 42`)
  - Linha abaixo: último tiro (Força: X | Ângulo: Y°)
- Responsivo: posição relativa a `scene.scale.width`

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/game/hud/wind-display.ts` (CRIAR)

## Arquivos que Deve Apenas Consultar
- `system/frontend/src/game/hud/combat-hud.ts` (ver como vento é exibido hoje — somente leitura)

## O que Não Deve Mexer
- Nenhum arquivo existente

## Dependências Obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de Aceite
- [ ] Classe `WindDisplay` exportada
- [ ] `create(scene: Phaser.Scene): void`
- [ ] `update(windX: number, windY: number): void` — atualiza visual (windX: -1.0 a 1.0)
- [ ] `setLastShot(force: number, angle: number): void`
- [ ] Seta animada com tween de posição
- [ ] Cor da barra conforme intensidade
- [ ] Responsivo: centro-topo relativo ao canvas
- [ ] TypeScript sem erros

## Instrução de Execução
Usar `Phaser.GameObjects.Graphics` para a caixa e barra. Usar `Phaser.GameObjects.Text` para labels. Seta pode ser um texto (← →) ou triângulo desenhado com Graphics. Tween de `x` na seta para simular movimento. Todos os elementos em Container Phaser para facilitar reposicionamento.

## Formato do Resumo Final
Criar `.ai-orchestration/agents/003-summary.md` com o template padrão de resumo.
