# Agente 007 — BattleScene: Race do Personagem Ativo

## Objetivo
Substituir a string `'human_battle'` e `'human_idle'` hardcoded na `BattleScene` pela raça do personagem ativo, lida do localStorage (`rw_character_id` → buscar race em localStorage ou via config da cena).

## Contexto mínimo necessário
- Phaser 3 dentro de Angular 17
- `BattleScene` em `system/frontend/src/game/scenes/battle.scene.ts`
- Assets em `assets/characters/{race}_battle.png` e `assets/characters/{race}_idle.png`
- Raças disponíveis: `human`, `dwarf`, `elf`
- A `BattleScene` é inicializada com uma config (`BattleConfig` ou similar) — verificar como os dados são passados para a cena
- O localStorage tem `rw_character_id` mas não a race diretamente — a race pode ser passada via `BattleConfig` ou lida de um outro localStorage key

## Estratégia recomendada
1. Verificar como `BattleScene` recebe dados ao ser iniciada (via `scene.start('BattleScene', config)`)
2. A forma mais simples: adicionar `playerRace: string` ao `BattleConfig`
3. O componente que inicia a batalha (`PvpComponent` ou similar) deve passar a race do `ActiveCharacterService` via `BattleConfig`
4. Na `BattleScene`, usar `this.scene.settings.data.playerRace ?? 'human'` para carregar o sprite correto

## Arquivos que pode alterar
- `system/frontend/src/game/scenes/battle.scene.ts`
- O componente que inicia a batalha (provavelmente `pvp.component.ts` — verificar)
- `system/frontend/src/app/shared/game-core/types.ts` (se BattleConfig está definido lá — apenas adicionar `playerRace?: string`)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/services/active-character.service.ts`
- `system/frontend/src/app/shared/models/character.model.ts`
- `system/frontend/src/app/pvp/pvp.component.ts`
- `system/frontend/src/app/playground/phaser-container/phaser-container.component.ts`

## O que NÃO deve mexer
- Lógica de batalha (projéteis, física, dano)
- `active-character.service.ts` (agente 003)
- Backend

## Dependências obrigatórias
- **Agente 003**: `Character` model com campo `race` existe

## Critérios de aceite
- [ ] `BattleScene` não usa mais `'human_battle'` nem `'human_idle'` hardcoded
- [ ] Sprite do jogador usa a raça passada via config (fallback: `'human'`)
- [ ] O componente que inicia a batalha passa `playerRace` via config da cena
- [ ] `npx tsc --noEmit` sem erros

## Restrições
- Não quebrar o fluxo de início de batalha existente
- Fallback para `'human'` se race não disponível (graceful degradation)
- Não injetar serviços Angular dentro do Phaser Scene diretamente — passar dados via `scene.start()` config

## Memory

### Objetivo
Substituir sprite hardcoded 'human_battle' pela raça do personagem ativo na BattleScene.

### Contexto permitido
- `system/frontend/src/game/scenes/battle.scene.ts`
- `system/frontend/src/app/pvp/pvp.component.ts`
- `system/frontend/src/app/shared/game-core/types.ts`
- `system/frontend/src/app/shared/services/active-character.service.ts` (somente leitura)

### Arquivos autorizados
- `battle.scene.ts` (editar — ATENÇÃO: agentes 008-011 também editam este arquivo — não conflitar)
- `pvp.component.ts` ou componente que inicia a cena (editar)
- `types.ts` (editar apenas para adicionar `playerRace?: string`)

### Dependências
- Agente 003 concluído

### Restrições
- Não injetar Angular services diretamente no Phaser
- Passar race via scene.start() config
- Fallback para 'human'
- Não tocar em lógica de física, dano ou turno

### Critérios de aceite
- Sprite usa raça correta
- `npx tsc --noEmit` sem erros

## Formato do resumo final
Criar `.ai-orchestration/agents/007-battlescene-race-integration-DONE.md` seguindo o formato padrão de resumo.
