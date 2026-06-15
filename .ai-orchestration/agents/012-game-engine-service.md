# Sub-spec — Agent 012: GameEngineService

## Objetivo
Criar o `GameEngineService` — orquestrador principal do motor autoritativo. Implementa o pipeline completo: validar → simular → aplicar → broadcast. Este é o agente mais complexo; deve integrar TODOS os módulos portados pelos agentes anteriores.

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/game-engine.service.ts` (CRIAR)
- `system/backend/src/game-engine/game-engine.module.ts` (MODIFICAR — registrar GameEngineService)

## Arquivos que deve apenas consultar
- `system/backend/src/game-engine/game-state.interface.ts`
- `system/backend/src/game-engine/physics/projectile-physics.ts`
- `system/backend/src/game-engine/physics/damage-calculator.ts`
- `system/backend/src/game-engine/physics/wind-system.ts`
- `system/backend/src/game-engine/physics/terrain-engine.ts`
- `system/backend/src/game-engine/physics/terrain-loader.ts`
- `system/backend/src/game-engine/items/weapon-definition.ts`
- `system/backend/src/game-engine/items/consumable-system.ts`
- `system/backend/src/game-engine/items/secondary-item-system.ts`
- `system/backend/src/game-engine/items/shot-modifier-system.ts`
- `system/backend/src/game-engine/items/status-effect-manager.ts`
- `system/backend/src/game-engine/ai/ai-decision-maker.ts`
- `system/backend/src/game-engine/validation/action-validator.ts`
- `system/backend/src/game-engine/validation/violation-tracker.ts`
- `system/backend/src/battle/dto/battle-action.dto.ts`
- `system/backend/src/battle/matchmaking.service.ts`

## O que NÃO deve mexer
- `battle.gateway.ts` — Agent 013 fará isso
- Arquivos de frontend
- Arquivos já criados pelos outros agentes (apenas importar)

## Dependências obrigatórias
- Todos os agentes 001–011 devem estar concluídos

## Pipeline obrigatório (do spec)

```typescript
async processAction(roomId, characterId, dto): Promise<ActionResult> {
  // 1. Validar turno
  // 2. Validar status effects (FREEZE bloqueia shoot)
  // 3. Validar inputs numéricos (ActionValidator)
  // 4. Validar posição (RN04 — ±80px, registrar violação mas não rejeitar)
  // 5. Executar ação: shoot | move | use_consumable | pass_turn | use_secondary
}
```

## Métodos obrigatórios
- `createRoom(roomId, config): void` — inicializa ServerBattleState
- `processAction(roomId, characterId, dto): Promise<ActionResult>`
- `getState(roomId): ServerBattleState`
- `removeRoom(roomId): void` — limpeza de memória
- `computeAiAction(roomId): Promise<ActionResult>` — para vsAI/Dungeon (chama AiDecisionMaker)
- `getRoomTerrainLog(roomId): TerrainDelta[]` — para reconexão

## Logs obrigatórios (do spec)
```
[GameEngine] [roomId] Turno #N iniciado — jogador: char, vento: { dir, int }
[GameEngine] [roomId] Ação: shoot angle=X force=Y — impacto em (X, Y) — dano: N
[GameEngine] [roomId] Escavação: cx=X cy=Y r=R — delta emitido
[GameEngine] [roomId] Violação detectada [char]: REASON (desvio: Xpx) [N/3]
[GameEngine] [roomId] Penalidade aplicada [char]: turno passado (3ª violação)
[GameEngine] [roomId] Partida encerrada — vencedor: char em N turnos
```

## Critérios de aceite
- [ ] `processAction()` implementa TODOS os 5 passos do pipeline
- [ ] Estado gerenciado em Map<roomId, ServerBattleState> (em memória)
- [ ] `computeAiAction()` existe e funciona para vsAI/Dungeon
- [ ] Limpeza de estado ao finalizar partida (`removeRoom()`)
- [ ] Todos os logs do spec implementados
- [ ] Decorador `@Injectable()` do NestJS
- [ ] Performance < 100ms por processAction (CA10 do spec)

## Instrução para execução

```
Você é um desenvolvedor TypeScript/NestJS sênior no projeto Rune Wars.

Crie o GameEngineService — o coração do motor autoritativo v1.8.0.

ANTES DE IMPLEMENTAR, leia todos esses arquivos que você vai usar:
1. system/backend/src/game-engine/game-state.interface.ts
2. system/backend/src/game-engine/physics/projectile-physics.ts
3. system/backend/src/game-engine/physics/damage-calculator.ts
4. system/backend/src/game-engine/physics/wind-system.ts
5. system/backend/src/game-engine/physics/terrain-engine.ts
6. system/backend/src/game-engine/physics/terrain-loader.ts
7. system/backend/src/game-engine/items/*.ts (todos)
8. system/backend/src/game-engine/ai/ai-decision-maker.ts
9. system/backend/src/game-engine/validation/action-validator.ts
10. system/backend/src/game-engine/validation/violation-tracker.ts
11. system/backend/src/battle/dto/battle-action.dto.ts
12. system/backend/src/battle/matchmaking.service.ts

Depois crie: system/backend/src/game-engine/game-engine.service.ts

O service deve:
1. Ser @Injectable() do NestJS
2. Manter um Map<string, ServerBattleState> de salas em memória
3. Implementar processAction() com o pipeline completo (5 etapas do spec v1.8.0)
4. Implementar createRoom(), getState(), removeRoom(), computeAiAction(), getRoomTerrainLog()
5. Emitir todos os logs no formato [GameEngine] [roomId] descrito no spec

Pipeline em processAction():
1. Validar turno (se não é o turno do characterId → ViolationTracker.record + retornar inválido)
2. Validar status effects (FREEZE bloqueia shoot via StatusEffectManager)
3. Validar inputs numéricos (ActionValidator.validate)
4. Validar posição (Math.abs(reportedX - player.x) > POSITION_TOLERANCE_PX → violation mas NÃO rejeitar ação)
5. Executar ação (switch em dto.type)

Para shoot:
- ProjectilePhysics.simulate() → path[]
- TerrainEngine.excavate() para cada hit
- DamageCalculator.calculate()
- Atualizar HP do alvo
- WindSystem.generate() novo vento
- Retornar ActionResult completo

Para computeAiAction():
- AiDecisionMaker.decide(state, aiPlayerId)
- Chamar processAction() com o resultado
- Retornar ActionResult

Atualize game-engine.module.ts para registrar GameEngineService como provider e export.

Resumo final:
# Resumo — Agent 012: GameEngineService
## Status
## O que foi feito
## Arquivos alterados
## Decisões tomadas
## Bugs encontrados
## Riscos ou pendências
## Recomendações para o orquestrador (especialmente: algo que o Agent 013 precisa saber)
```

## Memory — Agent 012

### Objetivo
Criar GameEngineService com pipeline completo: validar → simular → aplicar → broadcast.

### Arquivos autorizados
- CRIAR: game-engine.service.ts
- MODIFICAR: game-engine.module.ts (registrar provider)

### Dependências
- Todos os agentes 001–011

### Restrições
- Estado em Map em memória
- Limpeza de estado ao finalizar
- Logs no formato [GameEngine]
- Performance < 100ms por ação
