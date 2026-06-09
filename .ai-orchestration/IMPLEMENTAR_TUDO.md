# Implementar Tudo — v1.5.0

## Objetivo Geral
Implementar Rune Wars v1.5.0: sistema de modificadores de mapa efêmeros, personagens com sprites compostos em layers por equipamento com animações por estado, HUD responsivo completo, e unificação de controles entre PvP/Dungeon/Academy.

## Estratégia
Trabalho dividido em 13 subagentes. 9 podem ser executados em paralelo na Fase 1 (sem dependências entre si). Cada agente tem contexto fechado e escopo mínimo. O código é implementado com fallbacks para assets que ainda não existem (os assets físicos são um pipeline de arte separado, fora do escopo de código).

Arquivos existentes críticos (`combat-hud.ts`, `power-meter-hud.ts`) são mantidos intactos até a validação final para permitir rollback.

---

## Fila de Execução

### Fase 1 — Execução Paralela (todos podem rodar ao mesmo tempo)
- **001** — BattleInputController (`game/input/battle-input-controller.ts`)
- **002** — TurnTimer (`game/hud/turn-timer.ts`)
- **003** — WindDisplay (`game/hud/wind-display.ts`)
- **004** — ConsumableDock (`game/hud/consumable-dock.ts`)
- **005** — ModifierDock (`game/hud/modifier-dock.ts`)
- **006** — PlayerStatusBar (`game/hud/player-status-bar.ts`)
- **007** — PowerBar (`game/hud/power-bar.ts`)
- **008** — MapModifier + MapModifierManager (`game/map/`)
- **010** — CharacterSprite + CharacterAnimator (`game/character/`)

### Fase 2 — Composição (aguardar Fase 1 concluída)
- **009** — BattleHud (`game/hud/battle-hud.ts`)
  - Aguarda: 002, 003, 004, 005, 006, 007

### Fase 3 — Integração (aguardar 009)
- **011** — BattleScene Integration (`battle.scene.ts`)
  - Aguarda: 001, 008, 009, 010

### Fase 4 — Unificação + Validação (aguardar 011)
- **012** — Mode Unification (academy.scene.ts, dungeon, pvp)
  - Aguarda: 011
- **013** — QA + Typecheck Final
  - Aguarda: 011, 012

---

## Mapa de Dependências

```
001 ──────────────────────────────────────────┐
002 ──┐                                       │
003 ──┤                                       │
004 ──┤→ 009 ──────────────────────────────→ 011 ──→ 012 ──→ 013
005 ──┤                                       │
006 ──┤                                       │
007 ──┘                                       │
008 ──────────────────────────────────────────┤
010 ──────────────────────────────────────────┘
```

---

## Subagentes

| # | Nome | Arquivo(s) Criado(s) | Depende de | Paralelo OK |
|---|------|---------------------|------------|-------------|
| 001 | BattleInputController | `game/input/battle-input-controller.ts` | — | ✅ |
| 002 | TurnTimer | `game/hud/turn-timer.ts` | — | ✅ |
| 003 | WindDisplay | `game/hud/wind-display.ts` | — | ✅ |
| 004 | ConsumableDock | `game/hud/consumable-dock.ts` | — | ✅ |
| 005 | ModifierDock | `game/hud/modifier-dock.ts` | — | ✅ |
| 006 | PlayerStatusBar | `game/hud/player-status-bar.ts` | — | ✅ |
| 007 | PowerBar | `game/hud/power-bar.ts` | — | ✅ |
| 008 | MapModifier | `game/map/map-modifier.ts` + `map-modifier-manager.ts` | — | ✅ |
| 009 | BattleHud | `game/hud/battle-hud.ts` | 002–007 | ❌ |
| 010 | CharacterSprite | `game/character/character-sprite.ts` + `character-animator.ts` | — | ✅ |
| 011 | BattleScene Integration | `game/scenes/battle.scene.ts` (alterar) | 001,008,009,010 | ❌ |
| 012 | Mode Unification | academy.scene.ts + dungeon + battle-host | 011 | ❌ |
| 013 | QA + Typecheck | — | 011,012 | ❌ |

---

## Instruções de Execução

### Como executar um agente
Para cada agente, spawnar um subagente com o contexto do arquivo `.ai-orchestration/agents/00X-nome.md` como instrução principal.

### Prompt template para spawn de agente
```
Você é um subagente de implementação do Rune Wars v1.5.0.
Leia o sub-spec completo em `.ai-orchestration/agents/00X-nome.md` e execute exatamente o que está especificado.
Contexto do projeto: Angular 17 + Phaser 3 frontend em `system/frontend/src/`.
Ao finalizar, crie o arquivo de resumo indicado no sub-spec.
Atualize `.ai-orchestration/FILES_CHANGED.md` com cada arquivo que alterar.
```

### Regras de execução
1. Nunca executar agente bloqueado sem confirmar que dependências foram concluídas
2. Ler o resumo do agente anterior antes de liberar agente dependente
3. Se agente retornar status "Bloqueado", criar novo sub-spec corretivo antes de continuar
4. Registrar cada arquivo alterado em `FILES_CHANGED.md` imediatamente

---

## Como lidar com bugs

### Bug CRÍTICO (bloqueia próximas fases)
1. Registrar em `BUGS_AND_BLOCKERS.md` como Crítico
2. Criar novo sub-spec corretivo (numerado como 0XX-fix-nome.md)
3. Executar corretivo antes de liberar agentes dependentes
4. Não avançar para fase seguinte

### Bug IMPORTANTE (não bloqueia fase atual)
1. Registrar em `BUGS_AND_BLOCKERS.md` como Importante
2. Acumular para resolver antes da consolidação final
3. Criar sub-spec corretivo antes do Agent 013

### Bug BAIXO
1. Registrar em `BUGS_AND_BLOCKERS.md` como Baixo
2. Resolver após tudo concluído ou deixar documentado

---

## Como lidar com conflitos

Se dois agentes alterarem o mesmo arquivo (não previsto):
1. O segundo agente deve ler o arquivo após as alterações do primeiro
2. Registrar o conflito em `BUGS_AND_BLOCKERS.md`
3. O Agent 011 tem autoridade para reconciliar conflitos em `battle.scene.ts`

---

## Como finalizar

1. Todos os 13 agentes com status "Concluído" em `AGENTS_QUEUE.md`
2. `npx tsc --noEmit` passando (Agent 013)
3. `npm run build` passando (Agent 013)
4. Criar resumo final em `docs/implementations/2026-06-09-v1.5.0-spec.md`
5. Validar checklist em `FINAL_CLEANUP.md`
6. Remover `.ai-orchestration/` com `rm -rf .ai-orchestration/`
7. Perguntar ao usuário sobre commit

---

## Arquivos que NÃO devem ser deletados durante a implementação
- `system/frontend/src/game/hud/combat-hud.ts`
- `system/frontend/src/game/hud/power-meter-hud.ts`
- `system/frontend/src/game/hud/movement-budget-hud.ts`
- `system/frontend/src/game/hud/effects-hud.ts`

Estes são mantidos para rollback seguro até a validação final.
