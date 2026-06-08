# Resumo Agente 012

**Status:** Concluído

## Arquivos criados/modificados

### Criados
- `system/frontend/src/app/shared/game-core/secondary-item-system.ts` — Interface `SecondaryItem` e classe `SecondaryItemSystem` com 5 itens (shield, healing-book, camouflage-orb, protection-totem, runic-builder). Método `use()` retorna placeholder para `runic-builder`.
- `system/frontend/src/app/shared/game-core/consumable-system.ts` — Interface `Consumable`, constante `MAX_CONSUMABLES_PER_BATTLE = 3` e classe `ConsumableSystem` com 5 consumíveis (teleport, heal, ice-throw, invisibility, calibration-shot). Lógica de equip com limite de 3.
- `system/frontend/src/game/hud/effects-hud.ts` — Classe `EffectsHud` para Phaser. Exibe efeitos ativos do jogador (esquerda) e da IA (direita) abaixo das barras de HP, com cores e ícones por tipo de efeito, contador de turnos restantes.

### Modificados
- `system/frontend/src/game/scenes/battle.scene.ts` — Integração completa do `StatusEffectManager` e `EffectsHud`:
  - Instanciação de `StatusEffectManager` e `EffectsHud` no `create()`
  - `onProjectileImpact`: roll de efeito rúnico após hit, VULNERABILITY multiplica dano ×1.5, RANDOM_TELEPORT move sprite imediatamente, texto flutuante por tipo de efeito
  - `endTurn`: `statusEffects.tick()` no início de cada turno com dano de BLEED e verificação de game over
  - `adjustAngle`: bloqueado se FREEZE ativo no jogador
  - `startChargingPower`: bloqueado por FREEZE, WEAK_SHOT limita força máxima a 40
  - `updateBlindState()`: oculta ângulo no HUD quando BLIND ativo no jogador
  - `updateFreezeState()`: feedback visual nos botões quando FREEZE ativo
  - `update()`: `EffectsHud.update()` chamado a cada frame
  - Debug API: `applyDebugEffect(target, type)`, `setPlayerLuck(n)`, `getActiveEffects()`
  - `window['battleScene'].setPlayerLuck(n)` exposto para debug
- `system/frontend/src/app/playground/debug-overlay/debug-overlay.component.ts` — Seção "Efeitos v0.6.0":
  - Select com 7 tipos de efeito para jogador e IA, botão Aplicar
  - Input de Sorte do Jogador (0-100)
  - Display de efeitos ativos (pooling a cada 500ms via `getActiveEffects()`)

## Decisões

- `EffectsHud.update()` reconstrói textos a cada frame para simplificar o código (sem diff de estado); o overhead é mínimo para até 7 efeitos por lado.
- A lógica de `lastImpactPoint` foi adicionada na `BattleScene` para suportar o consumível `teleport` (v0.6.0), sem implementar o consumível completo ainda.
- Erros de tipo pré-existentes em `battle.scene.ts` (interface `PlayerStats` incompatível com o shape inline `{ hp, maxHp, x, y }`) não foram corrigidos, pois estão fora do escopo deste agente e eram pré-existentes.
- `runic-builder` mantido como placeholder conforme especificação — método `use()` retorna `"Em breve: v0.7.0"`.
- Luck default de 10 para ambos os personagens conforme especificado; `playerLuck` é configurável via debug API e debug overlay.
