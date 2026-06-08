# Sub-spec — Agente 038: Hub Art Pass

## Objetivo
Aplicar o art pass completo na Floresta Rúnica: substituir placeholders pelos assets SVG criados pelos Agentes 034/035, implementar microanimações de ambiente, aplicar paleta oficial em todos os elementos Phaser/CSS, implementar estados visuais dos POIs (normal/hover/pressed/locked/notification) e validar a experiência visual em desktop e mobile.

## Identidade do Art Director
Este agente opera com plenas capacidades de Art Director. Consultar `docs/15-diretriz-arte.md` antes de qualquer decisão visual.

## Contexto mínimo necessário
- `docs/15-diretriz-arte.md` (paleta oficial, regras visuais)
- `agents/art-director.md` (skill do Art Director)
- `v1.1.0.md` seções 2, 6, 8, 12 (direção de arte, hierarquia visual, interações, animações)
- `system/frontend/src/game/scenes/hub.scene.ts` (implementação do Agente 037)
- `system/frontend/src/app/hub/hub.component.scss` (estilos do componente)
- `system/frontend/src/assets/hub/` (assets dos Agentes 034/035)

## Arquivos autorizados a modificar
```
system/frontend/src/game/scenes/hub.scene.ts        (visual Phaser: assets, animações, glow, states)
system/frontend/src/game/hub/hub-interactions.ts    (feedback visual por estado)
system/frontend/src/app/hub/hub.component.scss      (estilos Angular: dock, labels, overlay)
system/frontend/src/app/hub/hub.component.html      (ajustes de template se necessário)
```

## O que não deve mexer
- app.routes.ts
- login.component.ts
- Nenhum módulo de feature
- Nenhuma lógica de negócio (somente visual)

## Dependências
- Agente 037 (obrigatório — estrutura base deve existir)
- Agentes 034 e 035 (obrigatório — assets devem estar disponíveis)

## Microanimações a implementar

### Ambiente (Phaser Tweens)
| Elemento | Animação | Duração | Easing |
|----------|----------|---------|--------|
| Runas da Árvore Central | Pulso alpha 0.6→1.0→0.6 | 2000ms | Sine.InOut |
| Portal da Dungeon | Scale 0.95→1.05→0.95 + alpha | 1800ms | Sine.InOut |
| Bandeiras da Arena | Rotação leve ±3° | 1500ms | Sine.InOut |
| Brasas da Forja | Partículas Phaser (5 partículas) | contínuo | — |
| Lanternas do Mercado | Swing alpha 0.7→1.0→0.7 | 2200ms | Sine.InOut |
| Estandartes da Guilda | Float Y ±4px | 1900ms | Sine.InOut |
| Alvos da Academia | Rotação lenta 360° | 8000ms | Linear |
| Folhas foreground | Float Y ±6px + alpha sutil | 3000ms | Sine.InOut |
| Partículas mágicas | Phaser Particles (10 max, alpha baixo) | contínuo | — |

### Estados dos POIs
```ts
// Normal: sem animação especial, leve alpha glow (0.2)
// Hover: glow sprite ativo (fx_rune_hover_blue/gold), scale 1.0→1.03, cursor pointer
// Pressed: scale 1.03→0.97→1.0, pulso rápido (200ms)
// Locked: dessaturar (tint cinza), cadeado discreto, sem hover agressivo
// Notification: brilho animado pequeno no canto superior, scale badge
```

### Transições
- Entrada no hub: fadeIn Alpha 0→1, 400ms
- Sair para feature: partículas convergem ao centro, fade out 300ms
- Voltar ao hub: fade in no ponto do local + personagem reaparece

## Estados visuais obrigatórios por POI

| Estado | Implementação Phaser |
|--------|---------------------|
| Normal | Sprite POI com alpha 0.9, glow discreto static |
| Hover | setTint(accentColor), glow sprite ativo, label visível |
| Pressed | scale tween rápido (200ms), setTint mais escuro |
| Navigating | emitParticles(), camera.fade(300) |
| Locked | setTint(0x888888), lock icon depth+1 |
| Notification | badge animado no canto (alpha 0.8→1.0→0.8) |

## SCSS do dock mobile
```scss
.hub-dock {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: linear-gradient(to top, rgba(30, 10, 60, 0.92), transparent);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 16px env(safe-area-inset-bottom);
  z-index: 100;

  .dock-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px;
    min-width: 52px;
    min-height: 52px;
    border-radius: 12px;
    transition: background 0.15s, transform 0.1s;
    cursor: pointer;

    &:active { transform: scale(0.92); background: rgba(58, 154, 217, 0.2); }

    img { width: 28px; height: 28px; }
    span { font-size: 9px; color: rgba(255,255,255,0.8); letter-spacing: 0.3px; }
  }
}

.hub-shortcuts-desktop {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
  // ... recolhível
}
```

## Labels dos POIs
- Renderizar como overlay Angular (não Phaser) sobre o canvas
- Posição absoluta calculada por projeção câmera Phaser → DOM
- Formato: ícone SVG pequeno + nome + subtexto
- Visível apenas ao focar/hover, `opacity: 0` por padrão
- Transição: `opacity 0.2s ease`
- Background: `frame_rune_label.svg` como background-image

## Checklist Art Director
- [ ] docs/15-diretriz-arte.md consultado
- [ ] Gameplay legível em mobile (POIs distintos, labels legíveis)
- [ ] Visual não realista e não infantil exagerado
- [ ] Terreno/personagem/labels continuam claros após animações
- [ ] Paleta respeita verde mágico, azul rúnico, roxo arcano, dourado antigo e vermelho ofensivo
- [ ] Nenhuma animação compete com feedback de interação
- [ ] Partículas: máx 10 simultâneas, alpha ≤ 0.6
- [ ] Dock mobile: áreas de toque ≥ 52px

## Critérios de aceite
- [ ] Assets SVG dos Agentes 034/035 carregados corretamente na HubScene
- [ ] 9 microanimações de ambiente implementadas
- [ ] Estados hover/pressed funcionando em desktop
- [ ] Estados tap1/tap2 funcionando em mobile
- [ ] Dock mobile estilizado conforme SCSS spec
- [ ] Labels visuais aparecem ao focar e somem ao desfoco
- [ ] Transição de entrada/saída do hub implementada
- [ ] Paleta oficial aplicada em todos os elementos
- [ ] `npm run build` passa

## Instrução de execução
```
Consulte docs/15-diretriz-arte.md antes de começar. Leia hub.scene.ts do Agente 037 para entender a estrutura atual. Aplique o art pass completo: substitua placeholders pelos assets, implemente microanimações com Phaser Tweens, implemente estados dos POIs, estilize o dock mobile conforme spec SCSS. Valide visualmente no código — não assuma que está correto sem rever. Salve resumo em .ai-orchestration/agents/038-resumo.md.
```

---

## Memory — Agente 038: Hub Art Pass

### Objetivo
Art pass completo da Floresta Rúnica: substituir placeholders, microanimações, estados de POI, dock SCSS.

### Contexto permitido
docs/15-diretriz-arte.md, agents/art-director.md, v1.1.0.md seções 2/6/8/12, hub.scene.ts, hub.component.scss, assets hub/.

### Arquivos autorizados
Modificar hub.scene.ts, hub-interactions.ts, hub.component.scss, hub.component.html (ajustes).

### Dependências
037 (obrigatório), 034 e 035 (obrigatório).

### Restrições
Apenas visual. Nenhuma lógica de negócio, rota ou módulo de feature.

### Critérios de aceite
Assets carregados, 9 microanimações, estados de POI, dock estilizado, build passa.
