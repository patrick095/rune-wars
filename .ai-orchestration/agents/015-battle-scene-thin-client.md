# Sub-spec — Agent 015: BattleScene Thin Client

## Objetivo
Adaptar `battle.scene.ts` para funcionar como thin client: remover cálculos locais de física/dano/terreno, adicionar listeners para resultados do servidor, e usar `BattleSocketService` para comunicação. Este é o agente de maior risco de regressão — cuidado com os ~4000 linhas da BattleScene.

## Arquivos que pode criar/alterar
- `system/frontend/src/game/scenes/battle.scene.ts` (MODIFICAR)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/services/battle-socket.service.ts` (criado por Agent 014)
- `system/frontend/src/app/shared/game-core/types.ts`
- `system/frontend/src/game/hud/battle-hud.ts`
- `system/frontend/src/game/hud/wind-display.ts`
- `system/frontend/src/game/terrain/terrain-renderer.ts`

## O que NÃO deve mexer
- Renderização Phaser (sprites, animações, HUD)
- Trajectory preview (apenas visual — mantém como está)
- Power bar e angle controls (input)
- BattleSocketService (já criado)
- Backend

## O que deve REMOVER da BattleScene
- Chamadas a `DamageCalculator.calculate()` que aplicam resultado real (manter apenas para preview visual se houver)
- Atualização de HP local (`this.aiStats.hp -= damage` ou equivalente)
- Manutenção de estado de terreno computado localmente (excavações locais após tiro)
- Geração de vento local (`WindSystem.generate()` chamado pelo cliente)
- Lógica de "quem acertou" calculada pelo cliente
- Chamadas a `ProjectilePhysics.simulate()` que determinam resultado real (manter apenas preview)

## O que deve ADICIONAR/ADAPTAR
- Injetar/usar `BattleSocketService`
- Handler `onActionResult(result)`:
  - `animateReceivedPath(result.path, weaponId, onComplete)`
  - Na callback `onComplete`: `applyTerrainDeltas(result.terrainDelta)`
  - `syncPlayerStates(result.playerStates)` — atualizar HP, posição a partir do servidor
  - Se `result.gameOver`: chamar `finishBattle(result.winner === myCharacterId)`
- Handler `onAiAction(result)` — igual ao acima para turno de IA
- Handler `onTurn(turnData)` — iniciar turno com estado do servidor
- Handler `onViolation(data)` — mostrar feedback visual se necessário
- `animateReceivedPath(path, weaponId, cb)` — usa `path[]` do servidor para animar
- `applyTerrainDeltas(deltas)` — chama `terrain.excavate(cx, cy, radius)` com coords recebidas
- `syncPlayerStates(states)` — atualiza HP e posição a partir de `PlayerSnapshot[]`
- Modificar `firePlayerShot(angle, force)` para emitir `battle:action` ao invés de simular

## Novo fluxo de disparo (obrigatório do spec)

```typescript
// REMOVER lógica antiga de cálculo local
// ADICIONAR:
private firePlayerShot(angle: number, force: number) {
  this.battleSocketService.emitAction({
    type: 'shoot', angle, force, playerX: this.playerStats.x
  });
  this.isAnimating = true;
  this.trajectory.clear(); // limpa preview
}

private onActionResult(result: ActionResult) {
  this.animateReceivedPath(result.path, this.playerWeapon.id, () => {
    this.applyTerrainDeltas(result.terrainDelta);
    this.syncPlayerStates(result.playerStates);
    if (result.gameOver) {
      this.finishBattle(result.winner === this.myCharacterId);
    }
  });
}
```

## Critérios de aceite
- [ ] `firePlayerShot()` emite `battle:action` ao invés de simular localmente
- [ ] `onActionResult()` implementado
- [ ] `onAiAction()` implementado
- [ ] HP exibido a partir de `playerStates` do servidor
- [ ] Terreno escavado via `applyTerrainDeltas()` com coords do servidor
- [ ] Vento exibido a partir de `turnData.wind` do servidor
- [ ] Trajectory preview MANTIDO (visual, não influencia resultado)
- [ ] Modo Playground (BootScene) sem regressão — verificar se BattleScene em modo local não quebra
- [ ] `BattleSocketService.removeListeners()` chamado ao destruir a cena

## Atenção ao modo Playground
O spec afirma que modo playground (BootScene) deve continuar 100% client-side sem WebSocket (CA08). Verifique como a BattleScene distingue modos — pode haver um flag `isMultiplayer` ou similar. Em modo local, os listeners do BattleSocketService não devem ser registrados.

## Instrução para execução

```
Você é um desenvolvedor Angular/Phaser sênior no projeto Rune Wars.

Sua tarefa é adaptar battle.scene.ts para funcionar como thin client no v1.8.0.

ATENÇÃO: Este arquivo tem ~4000 linhas. Leia-o COMPLETAMENTE antes de modificar.

1. Leia COMPLETAMENTE:
   system/frontend/src/game/scenes/battle.scene.ts
   
2. Leia o novo service:
   system/frontend/src/app/shared/services/battle-socket.service.ts

3. Identifique e anote:
   - O método que dispara o projétil (provavelmente firePlayerShot ou similar)
   - Como o HP é atualizado atualmente
   - Como o terreno é escavado após tiro
   - Como o vento é gerado
   - Se existe flag de modo (multiplayer vs local/playground)

4. Faça as seguintes alterações:
   a. Modifique firePlayerShot() para emitir battle:action ao invés de calcular
   b. Adicione onActionResult() — anima path recebido, aplica terrain deltas, sync HP
   c. Adicione onAiAction() — mesmo que onActionResult para turno de IA
   d. Adicione onTurn() — inicia turno com dados do servidor
   e. Adicione animateReceivedPath(path, weaponId, cb)
   f. Adicione applyTerrainDeltas(deltas)
   g. Adicione syncPlayerStates(states)
   h. Adapte HP display para usar dados do servidor
   i. Adapte wind display para usar dados do servidor
   j. NO MODO LOCAL (playground): NÃO registrar listeners do BattleSocketService

5. NÃO remova:
   - Trajectory preview (visual)
   - Power bar e angle controls
   - Toda renderização Phaser
   - Animações e efeitos visuais
   - HUD

IMPORTANTE: Não quebre o modo playground. Verifique se há um flag de modo e preserve o comportamento local.

Resumo final:
# Resumo — Agent 015: BattleScene Thin Client
## Status
## O que foi feito
## O que foi removido
## O que foi adicionado
## Arquivos alterados
## Decisões tomadas
## Bugs encontrados
## Modo playground: foi preservado? Como?
## Regressões potenciais
## Recomendações para o orquestrador
```

## Memory — Agent 015

### Objetivo
Adaptar battle.scene.ts para thin client: emit action ao invés de calcular, animar result recebido.

### Arquivos autorizados
- MODIFICAR: system/frontend/src/game/scenes/battle.scene.ts

### Dependências
- Agent 013 (BattleGateway concluído — para saber os eventos)
- Agent 014 (BattleSocketService disponível)

### Restrições
- MANTER trajectory preview, power bar, toda renderização Phaser
- MANTER modo playground funcional (CA08)
- NÃO quebrar animações existentes
- Adicionar animateReceivedPath(), applyTerrainDeltas(), syncPlayerStates()
- Chamar removeListeners() ao destruir a cena
