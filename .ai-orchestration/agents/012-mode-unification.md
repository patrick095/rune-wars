# Sub-spec — Agent 012: Mode Unification (PvP + Dungeon + Academy)

## Objetivo
Garantir que PvP (`battle-host.component.ts`), Dungeon (`dungeon.component.ts`) e Academy (`academy.scene.ts`) instanciam o mesmo `BattleHud` e `BattleInputController`. Unificar controles, física e consumíveis nos três modos.

## Contexto Mínimo Necessário
- PvP: `system/frontend/src/app/battle/battle-host.component.ts` + `battle.scene.ts`
- Academy: `system/frontend/src/game/scenes/academy.scene.ts`
- Dungeon: `system/frontend/src/app/dungeon/` (identificar o componente principal)
- Todos devem usar `BattleInputController` e `BattleHud`
- Se a dungeon/academy tiver lógica de input duplicada, ela deve ser removida/desativada e substituída pelo controller unificado
- NÃO alterar lógica de IA ou de geração de dungeon

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/app/battle/battle-host.component.ts`
- `system/frontend/src/app/pvp/pvp-room/pvp-room.component.ts`
- `system/frontend/src/game/scenes/academy.scene.ts`
- Componente principal de dungeon (identificar ao ler)

## Arquivos que Deve Apenas Consultar (não alterar)
- `system/frontend/src/game/hud/battle-hud.ts`
- `system/frontend/src/game/input/battle-input-controller.ts`
- `system/frontend/src/game/scenes/battle.scene.ts`

## O que Não Deve Mexer
- Lógica de IA de dungeon
- Lógica de geração procedural
- Backend/WebSocket
- Qualquer arquivo de roteamento/auth

## Dependências Obrigatórias
- Agent 011 (BattleScene Integration) deve estar concluído

## Critérios de Aceite
- [ ] Academy usa `BattleInputController` e `BattleHud`
- [ ] Dungeon usa `BattleInputController` e `BattleHud`
- [ ] PvP já usa via `battle.scene.ts` (validar)
- [ ] Consumíveis Q/W/E/R/T funcionam nos três modos
- [ ] Modificadores 1–5 funcionam nos três modos
- [ ] Timer de turno funciona nos três modos
- [ ] TypeScript sem erros
- [ ] `npx tsc --noEmit` passa (verificar no resumo)

## Instrução de Execução
Ler cada componente/scene antes de alterar. Identificar input existente e desativar se duplicado. Se academy.scene.ts for similar a battle.scene.ts, pode reusar o mesmo padrão de integração do Agent 011.

## Formato do Resumo Final
Criar `.ai-orchestration/agents/012-summary.md` com o template padrão de resumo.
