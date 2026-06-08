# Resumo — Agente 038: Hub Art Pass

## Status
Concluído

## Alterações realizadas

### `system/frontend/src/game/scenes/hub.scene.ts`
- Adicionado campo `private poiObjects: Map<string, Phaser.GameObjects.Rectangle>`
- Adicionado campo `private playerShadow: Phaser.GameObjects.Ellipse`
- `preload()` atualizado para carregar todos os assets SVG reais (backgrounds, POIs, player, icons) com graceful degradation via evento `loaderror`
- `create()` atualizado com: shadow do jogador, camadas renomeadas para paths SVG corretos, fade-in de câmera ao final
- Adicionado método `_setupPlayerAnimations()` — idle bob Y ±3px + shadow scale pulse
- Adicionado método `_createAmbientParticles()` — 18 partículas mágicas com fade e float aleatório
- `_createBackgroundLayer()` recebe agora `fallbackColor` explícito ao invés de lookup por string
- `_createPoi()` atualizado: usa Image ao invés de Rectangle quando asset SVG está disponível; armazena POI no Map; chama `applyHoverState(this, ...)` e `removeHoverState(this, ...)` com assinatura atualizada

### `system/frontend/src/game/hub/hub-interactions.ts`
- `applyHoverState` reescrita com `scene.tweens.add()` (scale 1.0→1.04, 150ms, Sine.Out) + stroke
- `removeHoverState` reescrita com `scene.tweens.add()` (scale 1.04→1.0, 120ms, Sine.Out) + remove stroke
- `applyPressedState` atualizada para scale 0.96 com yoyo (estava 0.95 sem yoyo explícito)
- Todas as três funções recebem `scene: Phaser.Scene` como primeiro parâmetro

### `system/frontend/src/app/hub/hub.component.scss`
- Substituição completa pelo spec do art pass
- Background alterado para `#0D0628`
- `.hub-dock` com `backdrop-filter: blur(4px)`, `transition: opacity 0.3s`, `env(safe-area-inset-bottom)`
- `.dock-item` com `min-width/height`, `border-radius`, `:active` scale, `:focus-visible` outline
- `.poi-label` reposicionada (`bottom: 88px`) com transição de Y (slide-up ao aparecer)
- Nova seção `.hub-shortcuts-desktop` para atalhos no canto superior direito

### `system/frontend/src/app/hub/hub.component.html`
- Migrado de `*ngFor`/`*ngIf` para sintaxe Angular 17+ (`@for`, `@if`)
- Adicionado `aria-label` no canvas, `role="main"`, `role="tooltip"`, `aria-live="polite"`
- `.dock-item` com `type="button"` e `aria-label` composto (label + subtitle)
- `img` com atributos `width`/`height` explícitos

### `system/frontend/src/app/hub/hub.component.ts`
- Removidos imports `NgFor` e `NgIf` (desnecessários com nova sintaxe de controle de fluxo)
- Mantido apenas `CommonModule`

## Microanimações implementadas
1. **Idle bob do jogador** — Y ±3px, 1500ms, Sine.InOut, yoyo, repeat infinito
2. **Pulsação da sombra** — scaleX 1.0→0.9, sincronizado com bob, repeat infinito
3. **Partículas mágicas ambientes** — 18 círculos com cores da paleta oficial, alpha fadeIn/fadeOut 2000–4000ms, float upward com yoyo
4. **Fade-in de câmera** — 400ms ao entrar na cena
5. **Hover do POI** — scale 1.0→1.04 em 150ms (Sine.Out) via tween
6. **PointerOut do POI** — reverter scale 1.04→1.0 em 120ms (Sine.Out)
7. **Pressed do POI** — scale 0.96 em 80ms com yoyo (Sine.In)

## Estados de POI implementados
- **Normal**: retângulo ou imagem SVG com opacidade 0.7
- **Hover**: tween scale 1.04 + stroke com accentColor do POI
- **PointerOut**: tween scale 1.0 + sem stroke
- **Pressed**: tween scale 0.96 yoyo + fade-out câmera → navegação

## Observações
- A transparência do retângulo interativo é `0` quando o asset SVG existe (apenas hit-area), evitando sobreposição visual
- O `_setupPlayerAnimations` recebe `Phaser.GameObjects.GameObject` para aceitar tanto Rectangle quanto Image
- typecheck (`npx tsc --noEmit`) passou sem erros após todas as alterações
- Assets SVG ainda não existem em disco — fallback via `loaderror` mantido como no spec
