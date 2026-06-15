# Implementar Tudo — v1.8.0 Motor Autoritativo no Backend

## Objetivo Geral

Migrar toda a lógica crítica de partida (física, dano, terreno, HP, turno, IA, consumíveis) do cliente Phaser para o backend NestJS, tornando o servidor a única fonte de verdade. O cliente passa a ser uma camada de apresentação pura.

---

## Estratégia

1. **Portar** os módulos de game-core do frontend para um novo módulo `game-engine` no backend, removendo dependências de Phaser e adicionando suporte a Node.js (ex: `sharp` para PNG).
2. **Criar** o pipeline autoritativo no `GameEngineService`.
3. **Refatorar** o `BattleGateway` para delegar ao `GameEngineService`.
4. **Adaptar** o frontend (`BattleScene` + novo `BattleSocketService`) para modo thin-client.
5. **Validar** com typecheck + build antes de fechar.

---

## Fila de Execução

### Fase 1 — Fundação (sequencial, sem dependências entre si — pode paralelo)
- **Agent 001** — Interfaces e Types (`game-state.interface.ts`, DTOs do gateway)
- **Agent 002** — Estrutura do módulo `game-engine` (pastas, module, barrel exports)

### Fase 2 — Port de Physics (paralelo entre si, depende de Fase 1)
- **Agent 003** — `projectile-physics.ts` (port do frontend)
- **Agent 004** — `damage-calculator.ts` (port do frontend)
- **Agent 005** — `wind-system.ts` (port do frontend)
- **Agent 006** — `terrain-engine.ts` + `terrain-loader.ts` (port adaptado + sharp)

### Fase 3 — Port de Items e Status (paralelo, depende de Fase 1)
- **Agent 007** — `weapon-definition.ts` + `weapon-system.ts` (port)
- **Agent 008** — `consumable-system.ts` + `secondary-item-system.ts` (port)
- **Agent 009** — `shot-modifier-system.ts` + `status-effect-manager.ts` (port)

### Fase 4 — Port de IA (depende de Fase 2 e 3)
- **Agent 010** — `ai-local.ts`, `ai-strategy.ts`, `ai-decision-maker.ts`, `ai-action-generator.ts` (port)

### Fase 5 — Validação e Segurança (depende de Fase 1)
- **Agent 011** — `action-validator.ts` + `violation-tracker.ts`

### Fase 6 — GameEngineService (depende de Fases 2, 3, 4, 5)
- **Agent 012** — `game-engine.service.ts` (pipeline completo: validar → simular → aplicar → broadcast)

### Fase 7 — BattleGateway (depende de Fase 6)
- **Agent 013** — Refatorar `battle.gateway.ts` + atualizar `battle.module.ts`

### Fase 8 — Frontend Thin Client (pode começar após Fase 1, mas integrar após Fase 7)
- **Agent 014** — `BattleSocketService` (Angular service isolado)
- **Agent 015** — Adaptar `BattleScene` para thin client (remover cálculos locais, adicionar listeners)

### Fase 9 — Validação Final
- **Agent 016** — Typecheck backend + frontend + build production

---

## Mapa de Dependências

```
001 (interfaces) ──┬──► 003 (physics)
                   ├──► 004 (damage)
                   ├──► 005 (wind)
                   ├──► 006 (terrain)
                   ├──► 007 (weapons)
                   ├──► 008 (consumables)
                   ├──► 009 (status/shot)
                   ├──► 011 (validator)
                   └──► 014 (BattleSocketService)

002 (structure) ───► [todos os ports]

003+004+005+006 ───► 010 (AI) ────► 012 (GameEngineService)
007+008+009 ────────────────────────────────────►│
011 (validator) ────────────────────────────────►│
                                                  ▼
                                            013 (Gateway)
                                                  │
                                    ┌─────────────┘
                                    ▼
                              015 (BattleScene thin client)
                                    │
                                    ▼
                              016 (typecheck + build)
```

---

## Subagentes

| # | Nome | Escopo | Pode Paralelizar |
|---|------|--------|-----------------|
| 001 | Interfaces e Types | game-state.interface.ts, DTOs | Sim (Fase 1) |
| 002 | Estrutura do Módulo | game-engine/ structure | Sim (Fase 1) |
| 003 | Projectile Physics | physics/projectile-physics.ts | Sim (Fase 2) |
| 004 | Damage Calculator | physics/damage-calculator.ts | Sim (Fase 2) |
| 005 | Wind System | physics/wind-system.ts | Sim (Fase 2) |
| 006 | Terrain Engine | physics/terrain-engine.ts + terrain-loader.ts | Sim (Fase 2) |
| 007 | Weapon Definition | items/weapon-definition.ts | Sim (Fase 3) |
| 008 | Consumable System | items/consumable-system.ts + secondary | Sim (Fase 3) |
| 009 | Status + Shot Modifier | items/status-effect-manager.ts + shot-modifier | Sim (Fase 3) |
| 010 | AI Engine | ai/*.ts | Não (depende 003-009) |
| 011 | Validator + Tracker | validation/action-validator.ts + violation-tracker.ts | Sim (Fase 5) |
| 012 | GameEngineService | game-engine.service.ts | Não (depende tudo) |
| 013 | BattleGateway | battle.gateway.ts, battle.module.ts | Não (depende 012) |
| 014 | BattleSocketService | Angular service frontend | Sim (Fase 8) |
| 015 | BattleScene Thin Client | battle.scene.ts adaptações | Não (depende 013+014) |
| 016 | Validação Final | typecheck + build | Não (depende tudo) |

---

## Instruções de Execução

### Para iniciar um subagente:
1. Abrir o arquivo `.ai-orchestration/agents/NNN-nome.md`
2. Copiar o bloco `## Instrução para execução`
3. Criar novo chat com o contexto mínimo descrito
4. Aguardar resumo final no formato especificado
5. Salvar resumo em `.ai-orchestration/agents/NNN-nome-resumo.md`
6. Atualizar `ORCHESTRATION_STATE.md` e `AGENTS_QUEUE.md`
7. Liberar dependentes se necessário

### Para paralelizar:
- Fases 2 e 3 podem ser executadas em 4 chats simultâneos
- Agent 001 e 002 podem rodar simultaneamente

---

## Como lidar com bugs

- **CRÍTICO** (bloqueia próximas fases): Criar agente corretivo imediatamente; não liberar dependentes.
- **IMPORTANTE** (deve corrigir antes da consolidação): Registrar em BUGS_AND_BLOCKERS.md; criar agente corretivo antes da Fase 9.
- **BAIXO** (pode tratar no final): Acumular em BUGS_AND_BLOCKERS.md; tratar após Agent 016.

Se bug surgir no port de física e travar o `GameEngineService` → criar Agent 012b (hotfix) antes de continuar.

---

## Como lidar com conflitos

- Se dois agentes modificarem o mesmo arquivo: o último agente a terminar deve ler a versão atual antes de escrever.
- Conflito de tipos: Agent 001 é a fonte de verdade. Agentes de port devem adaptar-se às interfaces definidas lá.
- Se um port divergir do original: registrar em DECISIONS_LOG.md e garantir que os testes comparam output idêntico.

---

## Como finalizar

1. Todos os agentes 001–015 concluídos com status `Concluído`.
2. Agent 016 (typecheck + build) passou sem erros.
3. Checklist de CA01–CA10 validado manualmente.
4. Criar resumo final em `docs/implementations/2026-06-15-v1.8.0-motor-autoritativo.md`.
5. Remover `.ai-orchestration/`.
6. Perguntar ao usuário sobre commit.
