# Resumo Agente 004

**Status:** Concluído

## Arquivos criados/modificados

### Criados
- `system/frontend/src/game/scenes/battle.scene.ts` — BattleScene Phaser completa com PvP, animação de projétil, controles mobile-first, trajetória, vitória/derrota
- `system/frontend/src/game/hud/combat-hud.ts` — Classe CombatHud gerenciando textos de HP, vento e turno
- `system/frontend/src/game/ui/trajectory-indicator.ts` — Indicador de trajetória pontilhada usando Phaser.GameObjects.Graphics
- `system/frontend/src/game/ui/result-overlay.ts` — Overlay semitransparente de vitória/derrota com botão "Jogar Novamente"
- `.ai-orchestration/agents/resumo-004.md` — este arquivo

### Modificados
- `system/frontend/src/game/scenes/boot.scene.ts` — BootScene agora inicia BattleScene ao invés de PlaygroundScene
- `system/frontend/src/app/playground/phaser-container/phaser-container.component.ts` — Adicionado BattleScene no array de scenes do Phaser
- `system/frontend/src/app/playground/debug-overlay/debug-overlay.component.ts` — Expandido com controles v0.2.0: slider de vento, inputs de HP, dano base, select de dificuldade, botão resetar

## Decisões

- **window['battleScene'] como ref global**: seguindo a especificação, é a abordagem mais simples para comunicação debug-overlay → BattleScene sem injeção de dependência Angular/Phaser
- **Animação via `time.addEvent` com delay 16ms**: seguindo especificação; detecção de hit ocorre a cada frame verificando distância ao alvo (dx < 30, dy < 40) e interseção com o solo
- **AI atira com ângulo espelhado (180 - angle)**: a AiLocal calcula o ângulo apontando para a esquerda (direção do jogador), mas o projétil parte da direita; espelhar o ângulo garante a trajetória correta
- **Barra de força**: preenchimento via setInterval no Angular side (não Phaser update loop) para manter simplicidade; ao soltar, dispara com o powerValue acumulado
- **TrajectoryIndicator**: exibe apenas os primeiros 15 pontos com dots alternados para visual pontilhado
- **ResultOverlay**: usa Container Phaser para agrupar fundo, texto e botão; bg reposicionado com offset negativo pois o Container centra no (width/2, height/2)
- **PlaygroundScene mantida**: não foi removida, apenas BattleScene virou destino padrão do BootScene; mantém compatibilidade sem breaking change
