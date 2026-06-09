# Sub-spec — Agent 002: TurnTimer

## Objetivo
Criar `game/hud/turn-timer.ts` — timer de turno de 20 segundos com anel circular SVG/Graphics do Phaser, pausa no charge, auto-disparo a 100% de força, e pulsação visual conforme urgência.

## Contexto Mínimo Necessário
- Stack: Phaser 3
- Posição: centro-topo do canvas, acima do WindDisplay
- Timer: 20s regressivos
- Estados:
  - 20s→10s: anel branco, sem pulsação
  - 10s→5s: anel amarelo + pulsação lenta
  - 5s→0s: anel vermelho + pulsação rápida
  - Charge ativo: anel congela em azul, label "Carregando..."
  - Pós-disparo: anel some
- Ao chegar a 0 sem charge: emite evento `turn:expired`
- Ao atingir 100% de força: emite evento `charge:autofire`
- HUD responsivo: posição calculada via `scene.scale.width` / `scene.scale.height`

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/game/hud/turn-timer.ts` (CRIAR)

## Arquivos que Deve Apenas Consultar
- `system/frontend/src/game/hud/power-meter-hud.ts` (padrão de construção de HUD Phaser)

## O que Não Deve Mexer
- Nenhum arquivo existente

## Dependências Obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de Aceite
- [ ] Classe `TurnTimer` exportada
- [ ] `start(scene: Phaser.Scene): void` — inicia contagem
- [ ] `pauseForCharge(): void` — pausa visualmente, muda para azul
- [ ] `stop(): void` — remove da cena (cleanup)
- [ ] `onPowerMax(): void` — dispara auto-fire
- [ ] Anel circular desenhado com `Phaser.GameObjects.Graphics`
- [ ] Pulsação implementada com `scene.tweens`
- [ ] Responsivo: posição relativa a `scene.scale.width/height`
- [ ] TypeScript sem erros

## Instrução de Execução
Implementar usando `Phaser.Time.TimerEvent` para contagem e `Graphics` para o anel. O anel é redesenhado a cada tick (não usar tween de ângulo no Graphics — usar `clear()` + `arc()`). Tweens de escala/alpha para pulsação. Emitir eventos via `scene.events.emit`.

## Formato do Resumo Final
Criar `.ai-orchestration/agents/002-summary.md` com o template padrão de resumo.
