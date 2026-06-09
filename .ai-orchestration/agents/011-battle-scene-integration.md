# Sub-spec — Agent 011: BattleScene Integration

## Objetivo
Integrar todos os novos componentes em `battle.scene.ts`:
- Substituir `CombatHud` pelo `BattleHud`
- Instanciar `BattleInputController`
- Integrar `MapModifierManager` no loop de projétil
- Integrar `TurnTimer` no ciclo de turno
- Integrar `CharacterSprite + CharacterAnimator` substituindo sprites atuais

## Contexto Mínimo Necessário
- Arquivo principal: `system/frontend/src/game/scenes/battle.scene.ts`
- O timer deve ser iniciado ao início do turno do jogador local
- `timer.pauseForCharge()` chamado quando player inicia charge (pressiona espaço)
- `MapModifierManager.checkProjectileCollision(x, y)` chamado dentro do loop `animateAlongPath`
- `BattleHud.update(state)` chamado a cada frame (em `update()` da scene)
- `BattleInputController.attach(scene)` chamado no `create()`
- NÃO remover `CombatHud` e `PowerMeterHud` ainda — apenas comentar/desativar e usar novo
- `CharacterSprite` substituindo a criação de sprites de personagem existente

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/game/scenes/battle.scene.ts` (ALTERAR)

## Arquivos que Deve Apenas Consultar (não alterar)
- `system/frontend/src/game/hud/battle-hud.ts`
- `system/frontend/src/game/hud/turn-timer.ts`
- `system/frontend/src/game/input/battle-input-controller.ts`
- `system/frontend/src/game/map/map-modifier-manager.ts`
- `system/frontend/src/game/character/character-sprite.ts`
- `system/frontend/src/game/character/character-animator.ts`
- `system/frontend/src/game/projectiles/projectile-renderer.ts`
- `system/frontend/src/game/hud/combat-hud.ts` (referência — não alterar)
- `system/frontend/src/game/hud/power-meter-hud.ts` (referência — não alterar)

## O que Não Deve Mexer
- `combat-hud.ts`, `power-meter-hud.ts` (não alterar, não deletar)
- Qualquer outro arquivo fora de `battle.scene.ts`
- Lógica de física, dano, terreno, AI

## Dependências Obrigatórias
- Agents 001, 008, 009, 010 devem estar concluídos
- (002, 003, 004, 005, 006, 007 são dependências transitivas via 009)

## Critérios de Aceite
- [ ] `BattleHud` instanciado em `create()` e atualizado em `update()`
- [ ] `BattleInputController` instanciado e attached em `create()`
- [ ] Timer inicia ao começo do turno local
- [ ] Timer pausa quando charge começa
- [ ] `MapModifierManager.trySpawn()` chamado ao fim de cada rodada
- [ ] `checkProjectileCollision()` chamado dentro do loop de animação do projétil
- [ ] `CharacterSprite` criado para player e enemy
- [ ] `CharacterAnimator.transition()` chamado nos eventos corretos (shoot, damage, die)
- [ ] TypeScript sem erros após integração
- [ ] `npx tsc --noEmit` passa (verificar no resumo)

## Assunção Documentada
Se a assinatura de `animateAlongPath` não permitir injeção de callback por ponto, o agente deve registrar como bloqueio e propor alternativa (wrapper ou evento).

## Instrução de Execução
Ler `battle.scene.ts` completamente antes de alterar. Identificar: onde HUD é criado, onde turno muda, onde projétil é animado, onde personagens são criados. Fazer alterações cirúrgicas. Usar `// [v1.5.0]` como marcador de cada alteração para facilitar revisão.

## Formato do Resumo Final
Criar `.ai-orchestration/agents/011-summary.md` com o template padrão de resumo.
