# Resumo — Agente 037: Hub Angular/Phaser Core

## Status
Concluído

## Arquivos criados
- `system/frontend/src/game/hub/hub-poi.ts` — Interface `HubPointOfInterest` e array `HUB_POIS` com 7 POIs (pvp, dungeon, village, market, blacksmith, guild, academy)
- `system/frontend/src/game/hub/hub-camera.ts` — Constante `HUB_CAMERA_CONFIG` com dimensões do mundo, lerp, zoom e configurações mobile
- `system/frontend/src/game/hub/hub-interactions.ts` — Funções puras `applyHoverState`, `removeHoverState`, `applyPressedState`
- `system/frontend/src/game/scenes/hub.scene.ts` — `HubScene extends Phaser.Scene` com key 'HubScene'; preload com fallback graceful, depth ordering (sky=0 a ui=7+), 7 POIs interativos, câmera com setBounds+lerp, movimento WASD/setas, eventos `navigateTo`/`poiHover`/`poiHoverEnd`
- `system/frontend/src/app/hub/hub.component.ts` — Angular standalone component; inicializa Phaser na div #hub-canvas, escuta eventos via `ngZone.runOutsideAngular`, destrói game no `ngOnDestroy`
- `system/frontend/src/app/hub/hub.component.html` — Template com dock mobile (`*ngFor`) e overlay de label de POI (`*ngIf`)
- `system/frontend/src/app/hub/hub.component.scss` — Estilos base: hub-container, hub-canvas, hub-dock com `.hidden`, poi-label com `.visible`

## Arquivos modificados
- `system/frontend/src/app/app.routes.ts` — Adicionada rota `/hub` com `authGuard` e lazy load de `HubComponent`, após a rota `playground`
- `system/frontend/src/app/auth/login/login.component.ts` — Redirecionamento pós-login alterado de `/playground` para `/hub`

## Decisões técnicas
- `preload` e `create` não usam o modificador `override` (padrão do projeto — apenas `update` usa); verificado contra `dungeon.scene.ts` e `academy.scene.ts`
- Phaser inicializado com `physics.arcade` (gravity 0) para suportar bounds do jogador sem importar arcade physics nos outros módulos
- Eventos Angular-Phaser via `game.events.emit` / `game.events.on`; Angular escuta dentro de `ngZone.run()` para trigger de change detection
- POIs são `Phaser.GameObjects.Rectangle` com cor `accentColor` como placeholders — sprites podem ser sobrepostos pelo Agente 038 no art pass
- Parallax está estruturado com um array `backgrounds` mas a implementação de offset é placeholder (comentado como `_updateParallax`); implementação completa requer `TileSprite` ou offset manual via `setScrollFactor`
- Assets carregados com `try/catch` no loop + listener `loaderror` para fallback graceful

## Observações
- `npm run build` / `tsc --noEmit` passa sem erros
- O dock mobile detecta mobile por `window.innerWidth <= 768` no `ngOnInit`; não atualiza em resize — se necessário, o Agente 038 pode adicionar `HostListener('window:resize')`
- A cena usa `this.physics.world.setBounds` mas o `player` é um `Rectangle` (não sprite com physics body) — o movimento é feito manualmente em `update` com clamp de coordenadas. Se o Agente 038 converter para sprite com body, o setBounds + `setCollideWorldBounds` funcionará automaticamente
- Rota `/guild` mapeada para o componente `GuildComponent` existente em `app.routes.ts`
