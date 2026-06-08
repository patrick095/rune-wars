# Agent 006 — Power Meter HUD

## Objetivo
Diagnosticar por que a barra de força não atualiza visualmente durante o mousedown e implementar o `PowerMeterHUD` como objeto Phaser nativo (substituindo overlay HTML/Angular).

## Contexto mínimo necessário
- O power meter atual é um componente HTML/CSS/Angular sobre o canvas Phaser. O `forceValue` é calculado corretamente mas o componente visual não reage durante `mousedown` porque o Angular change detection não dispara enquanto o mouse está pressionado fora da zona do Angular.
- A solução é migrar para Phaser nativo com `scene.add.rectangle()` e `scene.add.text()` com `setScrollFactor(0)` para fixar na câmera.
- Stack: Angular 19 + Phaser 3.80, TypeScript

## Arquivos autorizados a alterar
- Novo arquivo: `system/frontend/src/app/shared/game-core/hud/power-meter-hud.ts` (criar)
- Arquivo de BattleScene (remover overlay HTML do power meter e instanciar PowerMeterHUD)
- Arquivo de template HTML/SCSS da BattleScene (remover elemento DOM do power meter)

## Arquivos a consultar
- `system/frontend/src/app/shared/game-core/` (toda a pasta)
- `system/frontend/src/app/` (encontrar BattleScene e componente HTML da batalha)

## O que NÃO mexer
- Cálculo de força (forceValue) — já funciona
- weapon-system.ts, projectile-physics.ts
- Backend

## Dependências obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de aceite
- `PowerMeterHUD` implementado conforme spec do v1.2.0.md seção 18 Fix 1
- Barra cresce visualmente ao segurar botão de disparo
- Valor numérico (%) corresponde exatamente ao estado visual
- Cor muda: verde (0–40%), amarelo/laranja (40–70%), vermelho (70–100%)
- `npm run build` passa sem erros TypeScript

## Spec técnica (do v1.2.0.md)
```typescript
// power-meter-hud.ts (em game-core/hud/ ou game/hud/)
export class PowerMeterHUD {
  private bg: Phaser.GameObjects.Rectangle;
  private fill: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.bg = scene.add.rectangle(x, y, 200, 20, 0x333333).setScrollFactor(0);
    this.fill = scene.add.rectangle(x - 100, y, 0, 20, 0x00ff88).setScrollFactor(0).setOrigin(0, 0.5);
    this.label = scene.add.text(x, y + 16, '0%', { fontSize: '12px' }).setScrollFactor(0).setOrigin(0.5);
  }

  update(force: number) { // force: 0–100
    this.fill.width = force * 2; // fill de 0 a 200px
    this.fill.setFillStyle(force > 70 ? 0xff4444 : force > 40 ? 0xffaa00 : 0x00ff88);
    this.label.setText(`${Math.round(force)}%`);
  }
}
```

## Memory — Agent 006

### Objetivo
Migrar power meter do DOM Angular para objeto Phaser nativo.

### Contexto permitido
- Toda a pasta `game-core/`
- Componente Angular de batalha (para remover overlay HTML)

### Arquivos autorizados
- `game-core/hud/power-meter-hud.ts` (criar)
- BattleScene (integrar PowerMeterHUD no update())
- Template HTML da batalha (remover elemento DOM do power meter)

### Dependências
- Nenhuma

### Restrições
- Não alterar cálculo de força (forceValue) existente
- Não alterar weapon-system, projectile-physics

### Critérios de aceite
- Barra visual cresce durante mousedown sem depender de Angular change detection
- `npm run build` passa
