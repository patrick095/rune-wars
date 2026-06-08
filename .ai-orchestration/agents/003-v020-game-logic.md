# Agent 003 — v0.2.0 Game Logic (TypeScript Puro)

## Objetivo
Implementar toda a lógica de jogo da v0.2.0 em TypeScript puro, desacoplada do Phaser: turnos, vento, física de projétil, cálculo de dano e IA local.

## Contexto mínimo necessário
- Todos os módulos em `system/frontend/src/app/shared/game-core/`
- Zero dependência de Phaser ou Angular nestes arquivos
- Física: `velocityX += wind * dt`, `velocityY += GRAVITY * dt` por frame
- Dano por distância: 0–10px=100%, 10–30px=75%, 30–60px=50%, 60–100px=25%, >100=0
- IA: calcula ângulo ideal + margem de erro por dificuldade (Fácil ±20°, Médio ±10°, Difícil ±5°)

## Arquivos autorizados a criar/alterar
```
system/frontend/src/app/shared/game-core/
  turn-manager.ts
  wind-system.ts
  damage-calculator.ts
  projectile-physics.ts
  ai-local.ts
  player-stats.ts
  projectile-config.ts
```

## Arquivos apenas para consulta
- `system/frontend/src/app/shared/game-core/types.ts` (do agente 002)

## O que NÃO mexer
- Qualquer arquivo Phaser, Angular component, Dockerfile

## Dependências obrigatórias
- Agentes 001 + 002 concluídos (estrutura de pastas existe)

## Interfaces obrigatórias
```ts
// player-stats.ts
export interface PlayerStats { hp: number; maxHp: number; x: number; y: number; isPlayer: boolean; }
// projectile-config.ts
export interface ProjectileConfig { angle: number; force: number; gravityScale: number; windInfluence: number; baseDamage: number; }
// wind-system.ts
export interface WindState { direction: number; intensity: number; } // direction: -1 a 1
```

## Critérios de aceite
- `TurnManager.nextTurn()` alterna entre player e AI
- `WindSystem.generate()` retorna WindState aleatório
- `ProjectilePhysics.simulate(config, wind)` retorna array de posições {x,y}
- `DamageCalculator.calculate(impactX,impactY,targetX,targetY,base)` retorna número
- `AiLocal.calculateShot(aiPos, playerPos, wind, difficulty)` retorna {angle, force}
- Todos os arquivos sem import de Phaser ou Angular

## Memory

### Objetivo
Módulos TS puros: turnos, vento, física, dano, IA.

### Contexto permitido
Interfaces acima + fórmulas de física e dano.

### Arquivos autorizados
Os 7 arquivos listados.

### Dependências
Agentes 001+002 concluídos.

### Restrições
- Zero imports de Phaser.
- Funções puras e testáveis.
- `ProjectilePhysics` retorna array de pontos (path), não renderiza.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-003.md`.

## Limpeza pós-versão
Após v0.2.0 completa (003+004): deletar `v0.2.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Frontend** | `agents/dev-frontend.md` | Regras de game-core TS puro: zero Phaser/Angular, funções puras, estrutura de pastas |

**Instrução:** Carregar `dev-frontend.md`. A regra crítica desta skill para este agente é: todo código em `shared/game-core/` deve ser TypeScript puro, sem nenhum import de Phaser ou Angular. Respeitar a ordem de membros de classe.
