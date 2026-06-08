# Agent 007 — Ghost Trace (Linha de Referência do Último Tiro)

## Objetivo
Implementar o `GhostTrace` — camada Phaser Graphics que exibe a trajetória pontilhada do último projétil disparado. A linha é visível apenas para o jogador local e apaga ao iniciar o próprio turno seguinte.

## Contexto mínimo necessário
- O sistema de projéteis já calcula e registra pontos de trajetória em `projectile-physics.ts`
- A GhostTrace deve escutar o evento de disparo, receber os pontos da trajetória, e redesenhar uma linha pontilhada
- Linha pontilhada: segmentos alternados via `strokeLineShape` com alpha 0.4
- Stack: Phaser 3.80 + TypeScript

## Arquivos autorizados a alterar
- Novo arquivo: `system/frontend/src/app/shared/game-core/hud/ghost-trace.ts` (criar)
- BattleScene: instanciar GhostTrace, registrar pontos ao disparar, limpar ao iniciar turno
- Arquivos de sistema de turno (somente para adicionar hook de "início de turno do jogador local")

## Arquivos a consultar
- `system/frontend/src/app/shared/game-core/projectile-physics.ts`
- `system/frontend/src/app/shared/game-core/turn-manager.ts`
- `system/frontend/src/app/shared/game-core/weapon-system.ts`
- BattleScene (encontrar onde o projétil é disparado)

## O que NÃO mexer
- Lógica de física do projétil
- Turn manager (somente leitura para saber onde hookar)
- Backend

## Dependências obrigatórias
- Agent 006 concluído (para saber a estrutura da BattleScene após a refatoração do power meter)

## Critérios de aceite
- Linha ghost aparece após cada disparo
- Linha corresponde à trajetória real do projétil
- Linha apaga quando o turno do próprio jogador começa
- Linha não é visível para adversários (apenas no cliente local)
- `npm run build` passa

## Spec técnica (do v1.2.0.md)
```typescript
export class GhostTrace {
  private graphics: Phaser.GameObjects.Graphics;
  private lastPoints: {x: number, y: number}[] = [];

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  recordShot(points: {x: number, y: number}[]) {
    this.lastPoints = points;
    this.redraw();
  }

  private redraw() {
    this.graphics.clear();
    if (this.lastPoints.length < 2) return;
    this.graphics.lineStyle(2, 0xffffff, 0.4);
    for (let i = 0; i < this.lastPoints.length - 1; i += 2) {
      this.graphics.strokeLineShape(new Phaser.Geom.Line(
        this.lastPoints[i].x, this.lastPoints[i].y,
        this.lastPoints[i + 1].x, this.lastPoints[i + 1].y
      ));
    }
  }

  clear() {
    this.graphics.clear();
    this.lastPoints = [];
  }
}
```

## Memory — Agent 007

### Objetivo
Implementar ghost trace (linha pontilhada do último tiro).

### Contexto permitido
- `game-core/projectile-physics.ts`
- `game-core/turn-manager.ts`
- BattleScene

### Arquivos autorizados
- `game-core/hud/ghost-trace.ts` (criar)
- BattleScene (integrar)

### Dependências
- Agent 006 (estrutura da BattleScene)

### Restrições
- Não alterar lógica de física ou turno

### Critérios de aceite
- Linha ghost aparece após disparo, apaga no início do turno próprio
