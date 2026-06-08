# Agent 007 — v0.4.0 WeaponSystem (TypeScript Puro)

## Objetivo
Implementar o `WeaponSystem` com `WeaponDefinition` para as 6 armas, atualizar `ProjectilePhysics` para receber perfil de física por arma, implementar lógica de boomerangue.

## Contexto mínimo necessário

### 6 armas com seus parâmetros:
| Arma | GravityScale | WindInfluence | ImpactRadius | ExcavRadius | Boomerang |
|------|-------------|---------------|-------------|------------|----------|
| cannon | 1.5 | 0.2 | 50 | 60 | false |
| longbow | 0.8 | 0.8 | 20 | 10 | false |
| tnt | 2.5 | 0.1 | 80 | 100 | false |
| boomerang | 0.6 | 1.0 | 15 | 0 | true |
| ice-book | 0.5 | 0.4 | 30 | 5 | false |
| potion | 1.0 | 0.6 | 40 | 0 | false |

### Boomerang: reverter velocityX após BOOMERANG_REVERSAL_TIME ms

## Arquivos autorizados a criar/alterar
```
system/frontend/src/app/shared/game-core/
  weapon-definition.ts
  weapon-system.ts
  projectile-physics.ts (atualizar para aceitar WeaponDefinition)
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  projectile-config.ts
  terrain-engine.ts
```

## O que NÃO mexer
- Qualquer arquivo Phaser/Angular/Docker
- Outros arquivos game-core (turn-manager, wind-system, etc.)

## Dependências obrigatórias
- Agentes 005 + 006 concluídos

## Interfaces obrigatórias
```ts
export interface WeaponDefinition {
  id: string; name: string; hands: 1|2;
  damageType: 'physical'|'magical'|'mixed';
  baseDamage: number;
  physicsProfile: ProjectilePhysicsProfile;
  impactRadius: number; excavationRadius: number;
  runeEffect?: string;
}
export interface ProjectilePhysicsProfile {
  gravityScale: number; windInfluence: number; initialSpeed: number;
  boomerang?: boolean; bounces?: number;
}
```

## Critérios de aceite
- `WeaponSystem.getAll()` retorna array com as 6 armas
- `WeaponSystem.getById(id)` retorna arma por ID
- `ProjectilePhysics.simulate()` usa `gravityScale` e `windInfluence` da arma
- Boomerang: `velocityX` invertido após `BOOMERANG_REVERSAL_TIME`
- `excavationRadius` disponível para o TerrainEngine ao explodir

## Memory

### Objetivo
WeaponSystem com 6 definições + atualizar ProjectilePhysics.

### Contexto permitido
Tabela de armas + interfaces acima.

### Arquivos autorizados
Os 3 listados.

### Dependências
005+006 concluídos.

### Restrições
- Não alterar assinatura pública de outros módulos além de `projectile-physics.ts`.
- boomerang: não usar Bezier, apenas inversão de velocityX.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-007.md`.

## Limpeza pós-versão
Após v0.4.0 completa (007+008): deletar `v0.4.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Frontend** | `agents/dev-frontend.md` | WeaponSystem é game-core TS puro: SOLID, Clean Code, ordem de membros |

**Instrução:** Carregar `dev-frontend.md`. Regra crítica: `WeaponSystem` é TS puro sem dependências de Phaser. Cada `WeaponDefinition` é um objeto de dados — sem lógica de renderização.
