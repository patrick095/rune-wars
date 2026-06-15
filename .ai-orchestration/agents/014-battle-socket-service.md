# Sub-spec — Agent 014: BattleSocketService (Frontend)

## Objetivo
Criar `BattleSocketService` como Angular service isolado para encapsular toda a comunicação WebSocket da batalha. A `BattleScene` não deve acessar o socket diretamente — recebe dados via callbacks/eventos do service. Este agente pode rodar em paralelo com os agentes de backend (011–013) pois só cria um serviço Angular sem lógica de jogo.

## Arquivos que pode criar/alterar
- `system/frontend/src/app/shared/services/battle-socket.service.ts` (CRIAR)
- `system/frontend/src/app/shared/services/` (criar pasta se não existir)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/types.ts` — tipos existentes
- Qualquer service Angular existente no projeto para entender o padrão (ex: procurar outros `.service.ts`)
- `system/backend/src/battle/dto/battle-action.dto.ts` — para espelhar interface no frontend

## O que NÃO deve mexer
- `battle.scene.ts` (Agent 015 fará isso)
- Qualquer lógica de jogo existente
- Backend

## Dependências obrigatórias
- Agent 001 (interfaces — para copiar tipos de ActionResult, WindState, etc.)

## Interface do service (obrigatória)

```typescript
@Injectable({ providedIn: 'root' })
export class BattleSocketService {
  // Emitir ações para o servidor
  emitAction(dto: BattleActionPayload): void;
  
  // Observables/callbacks para a BattleScene
  onActionResult(callback: (result: ActionResult) => void): void;
  onAiAction(callback: (result: AiActionResult) => void): void;
  onTurn(callback: (turnData: TurnData) => void): void;
  onViolation(callback: (data: ViolationData) => void): void;
  onGameOver(callback: (data: GameOverData) => void): void;
  
  // Cleanup
  removeListeners(): void;
}
```

## Tipos que o service deve definir (ou importar de types.ts)
- `BattleActionPayload` espelha o DTO do backend
- `ActionResult` — mesmos campos do backend
- `AiActionResult` — campos do evento `battle:ai_action`
- `TurnData` — campos do evento `battle:turn`

## Critérios de aceite
- [ ] Angular `@Injectable()` service criado
- [ ] Encapsula toda a lógica de WebSocket (emit + on)
- [ ] `BattleScene` pode usar sem acessar socket diretamente
- [ ] Tipos compatíveis com os payloads do backend
- [ ] `removeListeners()` para cleanup

## Instrução para execução

```
Você é um desenvolvedor Angular sênior no projeto Rune Wars.

Crie um Angular service que encapsula a comunicação WebSocket da batalha.

1. Explore o projeto para entender como o WebSocket/socket.io é usado no frontend:
   find system/frontend/src -name "*.service.ts" | head -20
   grep -r "socket" system/frontend/src --include="*.ts" -l

2. Leia os tipos existentes:
   system/frontend/src/app/shared/game-core/types.ts

3. Crie: system/frontend/src/app/shared/services/battle-socket.service.ts

O service deve:
- Ser @Injectable({ providedIn: 'root' })
- Ter métodos para emitir ações: emitAction(dto)
- Ter métodos onActionResult(), onAiAction(), onTurn(), onViolation(), onGameOver() que registram callbacks
- Ter removeListeners() para cleanup
- Adaptar ao padrão de socket.io já usado no projeto (use o mesmo socket/service existente se houver)

Tipos necessários (defina no mesmo arquivo ou importe):
- BattleActionPayload: { type, angle?, force?, playerX?, consumableId?, secondaryItemId?, targetX? }
- ActionResult: { valid, path, impactX, impactY, damageDealt, terrainDelta, playerStates, nextTurnPlayerId, wind, gameOver, winner? }

Resumo:
# Resumo — Agent 014: BattleSocketService
## Status / O que foi feito / Arquivos criados/alterados / Decisões tomadas / Bugs encontrados
## Como a BattleScene deve usar este service (breve exemplo)
```

## Memory — Agent 014

### Objetivo
Criar BattleSocketService Angular para encapsular WebSocket de batalha.

### Arquivos autorizados
- CRIAR: system/frontend/src/app/shared/services/battle-socket.service.ts

### Dependências
- Agent 001 (para espelhar tipos)

### Restrições
- Sem lógica de jogo
- Não modificar battle.scene.ts
- Adaptar ao padrão de socket.io existente no projeto
