# Agente 008 — BattleScene: Navegação de Mapa por Arrasto

## Objetivo
Implementar `setupMapDrag()` na `BattleScene` para permitir que o jogador navegue o mapa clicando e arrastando (desktop) ou com touch drag de 1 dedo (mobile), sem interferir com outras ações de jogo.

## Contexto mínimo necessário
- Phaser 3 com câmera configurada com bounds (`setBounds`)
- A câmera atual pode estar em modo `startFollow` durante animações — o drag deve coexistir com isso
- Input do Phaser: `this.input.on('pointerdown'/'pointermove'/'pointerup')`
- Disponível em todo momento (turno do jogador E da IA), exceto durante animações de tiro/movimento onde a câmera segue automaticamente

## Implementação exigida

```typescript
private isDraggingMap = false;
private dragStartX = 0;
private dragStartY = 0;
private cameraStartScrollX = 0;
private cameraStartScrollY = 0;

setupMapDrag(): void {
  this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
    if (p.button === 0 || p.wasTouch) {
      this.isDraggingMap = true;
      this.dragStartX = p.x;
      this.dragStartY = p.y;
      this.cameraStartScrollX = this.cameras.main.scrollX;
      this.cameraStartScrollY = this.cameras.main.scrollY;
    }
  });
  this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
    if (!this.isDraggingMap || !p.isDown) return;
    const dx = this.dragStartX - p.x;
    const dy = this.dragStartY - p.y;
    this.cameras.main.setScroll(
      this.cameraStartScrollX + dx,
      this.cameraStartScrollY + dy
    );
  });
  this.input.on('pointerup', () => { this.isDraggingMap = false; });
}
```

Chamar `setupMapDrag()` no `create()` da cena.

**Conflito com câmera follow:**
- Se a câmera estiver em modo `startFollow`, o arrasto manual deve suspender o follow temporariamente (`this.cameras.main.stopFollow()`)
- Ao soltar (`pointerup`), retomar o follow apenas se estava ativo antes do drag
- Implementar flag `private wasFollowing = false` para controlar isso

## Arquivos que pode alterar
- `system/frontend/src/game/scenes/battle.scene.ts`

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/types.ts`

## O que NÃO deve mexer
- Lógica de turno, dano, física
- HUD e botões existentes
- Controles de ângulo (agente 009)

## Dependências obrigatórias
- Ler o estado atual de `battle.scene.ts` após agente 007 ter feito suas alterações

## Critérios de aceite
- [ ] `setupMapDrag()` implementado e chamado no `create()`
- [ ] Arrasto move a câmera dentro dos bounds do mapa
- [ ] Arrasto funciona com mouse (button 0) e touch
- [ ] Arrasto não dispara tiro
- [ ] Câmera volta a seguir o personagem após o drag quando estava em follow mode
- [ ] `npx tsc --noEmit` sem erros

## Restrições
- **ATENÇÃO**: agentes 007, 009, 010, 011 também modificam `battle.scene.ts` — este agente deve ler o arquivo atualizado pelo agente 007 antes de editar
- Não remover eventos de input existentes — apenas adicionar novos
- A câmera NÃO pode sair dos bounds — confiar no `setBounds` do Phaser

## Memory

### Objetivo
Implementar setupMapDrag() na BattleScene para arrastar o mapa com mouse e touch.

### Contexto permitido
- `system/frontend/src/game/scenes/battle.scene.ts` (editar — ler estado pós-007 antes de editar)

### Arquivos autorizados
- `system/frontend/src/game/scenes/battle.scene.ts`

### Dependências
- Agente 007 concluído (ler o arquivo atualizado)

### Restrições
- Não conflitar com lógica de turno existente
- Suspender câmera follow durante drag, retomar ao soltar
- Não remover event listeners existentes

### Critérios de aceite
- Drag funciona em mouse e touch
- Câmera não sai dos bounds
- `npx tsc --noEmit` sem erros

## Formato do resumo final
Criar `.ai-orchestration/agents/008-battlescene-map-drag-DONE.md` seguindo o formato padrão de resumo.
