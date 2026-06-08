# Resumo Agente 007

**Status:** Concluído

**Arquivos criados/modificados:**
- `system/frontend/src/app/shared/game-core/weapon-definition.ts` — criado: interfaces `ProjectilePhysicsProfile` e `WeaponDefinition`
- `system/frontend/src/app/shared/game-core/weapon-system.ts` — criado: classe `WeaponSystem` com as 6 armas e métodos `getAll()`, `getById()`, `getDefault()`
- `system/frontend/src/app/shared/game-core/projectile-physics.ts` — modificado: parâmetro opcional `physicsProfile`, campo `time` nos pontos, lógica de boomerang com `BOOMERANG_REVERSAL_TIME = 800` ms

**Decisões:**
- `physicsProfile` é opcional em `simulate()` para manter compatibilidade retroativa com callers existentes; quando ausente, `gravityScale` e `windInfluence` continuam sendo lidos de `config`
- O campo `time` (ms acumulados) foi adicionado a cada ponto do path para permitir trigger correto da inversão de boomerang e para uso futuro por outros sistemas
- Boomerang implementado com simples inversão de `vx` em `BOOMERANG_REVERSAL_TIME = 800` ms, sem Bezier, conforme especificado
- `getAll()` retorna uma cópia rasa do array via `slice()` para evitar mutação externa da constante privada
- `getDefault()` usa `!` (non-null assertion) pois `cannon` é sempre presente na lista estática
- Zero imports de Phaser ou Angular em todos os arquivos
