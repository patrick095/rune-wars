# Sub-spec — Agent 003: Projectile Physics

## Objetivo
Portar `projectile-physics.ts` do frontend para o backend, removendo qualquer dependência de Phaser. O resultado deve ser uma classe TypeScript pura que simula trajetória de projétil dado ângulo, força, vento e estado de terreno.

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/physics/projectile-physics.ts` (CRIAR)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/projectile-physics.ts` — fonte original
- `system/frontend/src/app/shared/game-core/projectile-config.ts` — configurações
- `system/frontend/src/app/shared/game-core/types.ts` — tipos compartilhados
- `system/backend/src/game-engine/game-state.interface.ts` — interfaces do servidor (criado por Agent 001)

## O que NÃO deve mexer
- Arquivos de frontend
- Qualquer outro arquivo do backend além do alvo

## Dependências obrigatórias
- Agent 001 (game-state.interface.ts deve existir para importar WindState e Point types)
- Agent 002 (pasta physics/ deve existir)

## Critérios de aceite
- [ ] Sem nenhuma importação de Phaser (`import * from 'phaser'`)
- [ ] Classe `ProjectilePhysics` com método `simulate(params): Point[]` retornando path completo
- [ ] Aceita `WindState` como parâmetro
- [ ] Aceita callback de colisão com terreno (ou interface de TerrainEngine)
- [ ] Output idêntico ao frontend para os mesmos inputs (a ser verificado em teste de paridade)

## Instrução para execução

```
Você é um desenvolvedor TypeScript sênior trabalhando no projeto Rune Wars (NestJS + Angular/Phaser).

Sua tarefa é portar o sistema de física de projétil do frontend para o backend.

1. Leia o arquivo fonte:
   system/frontend/src/app/shared/game-core/projectile-physics.ts

2. Leia as configurações:
   system/frontend/src/app/shared/game-core/projectile-config.ts
   system/frontend/src/app/shared/game-core/types.ts

3. Leia as interfaces do backend:
   system/backend/src/game-engine/game-state.interface.ts

4. Crie system/backend/src/game-engine/physics/projectile-physics.ts

REGRAS OBRIGATÓRIAS:
- ZERO importações de Phaser
- TypeScript puro, compatível com Node.js
- Manter a mesma lógica de física (determinística)
- Se o original usa `Phaser.Math.Vector2`, substituir por objeto { x: number, y: number }
- Se o original usa `Phaser.Geom.Rectangle`, substituir por interface própria
- Preservar toda a lógica de simulação de trajetória

Ao terminar, crie um resumo no formato:
# Resumo — Agent 003: Projectile Physics
## Status
## O que foi feito
## Arquivos alterados
## Arquivos consultados
## Decisões tomadas
## Bugs encontrados
## Riscos ou pendências
## Impacto em outros agentes
```

## Memory — Agent 003

### Objetivo
Portar projectile-physics.ts do frontend para backend/src/game-engine/physics/, sem Phaser.

### Contexto permitido
- Frontend: system/frontend/src/app/shared/game-core/ (CONSULTA)
- Backend: system/backend/src/game-engine/physics/ (ESCRITA)

### Arquivos autorizados
- CRIAR: system/backend/src/game-engine/physics/projectile-physics.ts

### Dependências
- Agent 001 (game-state.interface.ts)
- Agent 002 (pasta physics/ existe)

### Restrições
- Sem Phaser
- Sem modificar frontend
- Lógica idêntica ao original

### Critérios de aceite
- simulate() retorna Point[]
- Aceita WindState
- Zero imports de Phaser
