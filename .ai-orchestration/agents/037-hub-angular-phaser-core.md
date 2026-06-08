# Sub-spec — Agente 037: Hub Angular/Phaser Core

## Objetivo
Implementar a estrutura completa do Hub da Floresta Rúnica: componente Angular, cena Phaser, sistema de câmera, POIs clicáveis/tocáveis, navegação por rota, parallax de backgrounds, dock mobile e integração de áudio. Usar placeholders enquanto os assets finais não existem. Redirecionar login pós-sucesso para `/hub`.

## Contexto mínimo necessário
- `v1.1.0.md` seções 3, 7, 9, 10, 11, 16 (funcionalidade, fluxo, câmera, implementação técnica)
- `system/frontend/src/app/app.routes.ts` (rotas existentes)
- `system/frontend/src/app/auth/login/login.component.ts` (pós-login atual → `/playground`)
- `system/frontend/src/game/scenes/playground.scene.ts` (padrão de cena Phaser no projeto)
- `system/frontend/src/app/shared/services/auth.service.ts`
- `.ai-orchestration/agents/033-resumo.md` (mapeamento POI → rota validado)
- `.ai-orchestration/agents/036-resumo.md` ou `system/frontend/src/assets/hub/audio/audio-config.ts`

## Arquivos autorizados a criar
```
system/frontend/src/app/hub/hub.component.ts
system/frontend/src/app/hub/hub.component.html
system/frontend/src/app/hub/hub.component.scss
system/frontend/src/game/scenes/hub.scene.ts
system/frontend/src/game/hub/hub-poi.ts
system/frontend/src/game/hub/hub-camera.ts
system/frontend/src/game/hub/hub-interactions.ts
```

## Arquivos autorizados a modificar
```
system/frontend/src/app/app.routes.ts          (adicionar rota /hub)
system/frontend/src/app/auth/login/login.component.ts  (redirecionar para /hub pós-login)
```

## O que não deve mexer
- Nenhuma outra tela, componente ou serviço existente
- Nenhum arquivo de assets (apenas referenciá-los)
- Nenhum módulo de feature (pvp, dungeon, market, etc.)

## Dependências
- Agente 033 (obrigatório — mapeamento POI → rota)
- Agente 036 (recomendado — audio-config.ts)
- Agentes 034/035 (opcional — assets já podem estar disponíveis)

## Especificações técnicas

### HubPointOfInterest interface (`hub-poi.ts`)
```ts
export interface HubPointOfInterest {
  id: 'pvp' | 'dungeon' | 'village' | 'market' | 'blacksmith' | 'guild' | 'academy';
  label: string;
  subtitle: string;
  x: number;
  y: number;
  width: number;
  height: number;
  iconKey: string;
  poiKey: string;
  route: string;
  accentColor: number;
  hoverSound: string;
  selectSound: string;
}

export const HUB_POIS: HubPointOfInterest[] = [
  { id: 'pvp',        label: 'Arena PvP',   subtitle: 'Duelo e ranqueadas',    x: 770,  y: 200, width: 160, height: 200, iconKey: 'icon_pvp',        poiKey: 'poi_pvp_arena',         route: '/pvp',          accentColor: 0xE63946, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'dungeon',    label: 'Dungeon',     subtitle: 'Andares e recompensas', x: 1650, y: 180, width: 160, height: 210, iconKey: 'icon_dungeon',     poiKey: 'poi_dungeon_entrance',  route: '/dungeon',       accentColor: 0x7B2FBE, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'village',    label: 'Vila',        subtitle: 'Personagem e inventário', x: 950,y: 540, width: 200, height: 180, iconKey: 'icon_village',    poiKey: 'poi_main_village',      route: '/character',    accentColor: 0xF4A226, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'market',     label: 'Mercado',     subtitle: 'Comprar e vender',      x: 280,  y: 520, width: 160, height: 160, iconKey: 'icon_market',     poiKey: 'poi_market',            route: '/market',       accentColor: 0xCD7F32, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'blacksmith', label: 'Ferreiro',    subtitle: 'Craft e upgrade',       x: 1750, y: 500, width: 160, height: 180, iconKey: 'icon_blacksmith', poiKey: 'poi_blacksmith',        route: '/craft',        accentColor: 0x4A7FA5, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'guild',      label: 'Guilda',      subtitle: 'Clã e chat',            x: 200,  y: 220, width: 180, height: 200, iconKey: 'icon_guild',      poiKey: 'poi_guild_hall',        route: '/guild',        accentColor: 0x2D6A4F, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'academy',    label: 'Academia',    subtitle: 'Treino livre',          x: 1900, y: 620, width: 160, height: 160, iconKey: 'icon_academy',    poiKey: 'poi_academy',           route: '/academy',      accentColor: 0x3A9AD9, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
];
```

### HubCamera (`hub-camera.ts`)
```ts
// Parâmetros conforme v1.1.0.md seção 11
cameraBounds = { width: 2200, height: 900 };
followLerp = 0.08;
panDuration = 450;
transitionFadeDuration = 300;
maxZoomDesktop = 1;
minZoomDesktop = 0.85;
mobileZoom = 1.15;
```

### Camadas Phaser (depth ordering)
```
depth 0: background sky (parallax lento)
depth 1: back trees (parallax médio)
depth 2: ground / chão
depth 3: POIs (pontos de interesse)
depth 4: player character
depth 5: foreground leaves (parallax rápido e sutil)
depth 6: FX / glow overlays
depth 7+: UI overlay (labels, labels opacidade, notificações)
```

### HubScene — estrutura obrigatória
```ts
// Fases: preload → create → update
// preload: carregar todos os assets (com fallback se não existir)
// create: criar camadas, POIs, player, câmera, inputs
// update: atualizar parallax, spatial audio, player movement
// Eventos emitidos para Angular: 'navigateTo' com feature key
```

### HubComponent — responsabilidades
```ts
// - Inicializar Phaser.Game dentro do componente
// - Escutar evento 'navigateTo' da HubScene
// - Usar Angular Router para navegar
// - Destruir Phaser.Game no ngOnDestroy
// - Exibir overlay Angular para dock mobile (sobre o canvas)
// - Exibir overlay Angular para atalhos desktop (recolhível)
```

### Dock mobile (`hub.component.html`)
- Overlay Angular, não Phaser
- 5 ícones principais + overflow
- Posição: bottom fixed, sobre o canvas
- Cada ícone usa os SVGs criados pelo Agente 034

### Comportamento de interação com POIs
- Desktop: hover → glow + label; click → pan → confirmação → navigate
- Mobile: tap1 → glow + label; tap2 no mesmo → navigate; tap outro → troca foco
- Botão "Voltar ao centro" sempre visível no mobile

### Graceful degradation
- Se um asset não carregou, usar placeholder retangular com cor do POI
- Se áudio não disponível, silencioso (sem throw)
- Build deve passar com `npm run build` sem warnings de asset

## Critérios de aceite
- [ ] Rota `/hub` adicionada em app.routes.ts com authGuard
- [ ] Login redireciona para `/hub` em vez de `/playground`
- [ ] HubComponent inicializa e destrói Phaser corretamente
- [ ] HubScene renderiza 7 POIs posicionados corretamente
- [ ] Câmera segue player com lerp suave e respeita bounds 2200x900
- [ ] POIs respondem a hover (desktop) e tap (mobile)
- [ ] Labels aparecem ao focar POI e somem ao desfoco
- [ ] Dock mobile exibe atalhos funcionais
- [ ] Cada POI navega para a rota existente correta
- [ ] Parallax funciona nas 3 camadas de background
- [ ] `npm run build` passa sem erros

## Instrução de execução
```
Leia os arquivos de contexto listados. Use playground.scene.ts como referência de padrão Phaser do projeto. Crie todos os arquivos listados. Implemente com placeholders coloridos (retângulos com cor do POI) onde assets não existirem. Adicione rota /hub e modifique login para redirecionar. Garanta que `npm run build` passa. Salve resumo em .ai-orchestration/agents/037-resumo.md.
```

---

## Memory — Agente 037: Hub Angular/Phaser Core

### Objetivo
Implementar HubComponent + HubScene + sistema de câmera + POIs + dock mobile + routing.

### Contexto permitido
v1.1.0.md seções 3/7/9/10/11/16, app.routes.ts, login.component.ts, playground.scene.ts, auth.service.ts, resumos 033 e 036.

### Arquivos autorizados
Criar em hub/ e game/hub/ e game/scenes/hub.scene.ts. Modificar app.routes.ts e login.component.ts.

### Dependências
033 (obrigatório), 036 (recomendado).

### Restrições
Não modificar nenhuma outra tela, serviço ou módulo. Não criar novos sistemas de gameplay.

### Critérios de aceite
Rota /hub funcional, login redireciona, câmera + POIs + dock implementados, build passa.
