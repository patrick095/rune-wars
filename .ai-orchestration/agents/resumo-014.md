# Resumo Agente 014

**Status:** Concluído

**Arquivos criados/modificados:**
- `system/frontend/src/game/targets/academy-targets.ts` — Interface AcademyTarget, FIXED_TARGETS (5 alvos), MOVING_TARGETS (3 alvos móveis)
- `system/frontend/src/game/tutorial/tutorial-visual.ts` — Classe TutorialVisual com show/hide usando Container Phaser, localStorage check
- `system/frontend/src/game/scenes/academy.scene.ts` — AcademyScene completa com 4 modos, controles de ângulo/força, alvos, trajetória pontilhada, tutorial
- `system/frontend/src/app/academy/academy.component.ts` — Componente Angular standalone que inicializa Phaser com AcademyScene diretamente
- `system/frontend/src/app/academy/academy.component.html` — Template com painel lateral, selects de modo/arma, botão reset, link de volta
- `system/frontend/src/app/academy/academy.component.scss` — Estilos do layout flex com painel lateral escuro
- `system/frontend/src/app/app.routes.ts` — Rota `/academy` adicionada com lazy load

**Decisões:**
- AcademyScene inicializa Phaser diretamente no componente Angular (sem passar por BootScene), evitando dependência de lógica de roteamento Phaser
- Animação do projétil implementada com `time.delayedCall` recursivo ao invés de tweens, garantindo detecção de colisão frame a frame
- TutorialVisual usa `Phaser.GameObjects.Container` para agrupar todos os elementos do overlay e destruí-los de forma limpa com um único `destroy(true)`
- Alvos posicionados relativamente ao groundY calculado em runtime, não hardcoded, para funcionar com resize
- `window` cast feito com `as unknown as Record<string, unknown>` para compatibilidade com o tsconfig strict do projeto (mesmo padrão do BattleScene)
- Polling de hitCount no Angular com `ChangeDetectorRef.detectChanges()` para não depender de Zone.js dentro do Phaser
