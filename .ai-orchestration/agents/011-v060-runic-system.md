# Agent 011 — v0.6.0 RunicEffectSystem (TypeScript Puro)

## Objetivo
Implementar `RunicEffectSystem`, `StatusEffectManager` e a função `rollRunicEffect()` em TypeScript puro.

## Contexto mínimo necessário

### 7 efeitos:
- `BLEED` — perde % HP por N turnos
- `FREEZE` — não pode mover por N turnos
- `BLIND` — não vê ângulo por N turnos
- `WEAK_SHOT` — força limitada a 40% por N turnos
- `ITEM_BLOCK` — itens bloqueados por N turnos
- `RANDOM_TELEPORT` — reposiciona aleatoriamente no mapa
- `VULNERABILITY` — recebe 1.5x dano por N turnos

### Efeito por arma:
- cannon → VULNERABILITY(2) | longbow → BLIND(1) | tnt → RANDOM_TELEPORT
- boomerang → VULNERABILITY(1) | ice-book → FREEZE(2) | potion → BLEED(2, 5%HP/turno)

### Chance: `Math.min(0.05 + luck * 0.003, 0.75)`

## Arquivos autorizados a criar/alterar
```
system/frontend/src/app/shared/game-core/
  runic-effect-system.ts
  status-effect-manager.ts
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  weapon-definition.ts
  player-stats.ts
```

## O que NÃO mexer
- Qualquer arquivo Phaser/Angular/Docker
- Outros arquivos game-core

## Dependências obrigatórias
- Agentes 009 + 010 concluídos

## Interfaces obrigatórias
```ts
export type RunicEffectType = 'BLEED'|'FREEZE'|'BLIND'|'WEAK_SHOT'|'ITEM_BLOCK'|'RANDOM_TELEPORT'|'VULNERABILITY';
export interface RunicEffect { type: RunicEffectType; duration: number; value?: number; }
export class StatusEffectManager {
  apply(playerId: string, effect: RunicEffect): void
  tick(playerId: string): void  // decrementa duration, aplica BLEED, remove expirados
  hasEffect(playerId: string, type: RunicEffectType): boolean
  getEffects(playerId: string): RunicEffect[]
}
export function rollRunicEffect(luck: number): boolean
export function getWeaponRunicEffect(weaponId: string): RunicEffect | null
```

## Critérios de aceite
- `rollRunicEffect(0)` retorna true ~5% das vezes
- `rollRunicEffect(100)` retorna true ~35% das vezes (capped)
- `StatusEffectManager.tick()` decrementa duration e remove expirados
- BLEED aplica dano no tick
- `getWeaponRunicEffect('cannon')` retorna VULNERABILITY(2)

## Memory

### Objetivo
RunicEffectSystem e StatusEffectManager TS puros.

### Contexto permitido
Tabela de efeitos por arma + fórmula de chance + interfaces.

### Arquivos autorizados
Os 2 listados.

### Dependências
009+010 concluídos.

### Restrições
- Zero imports de Phaser/Angular.
- StatusEffectManager armazena por `playerId` string.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-011.md`.

## Limpeza pós-versão
Após v0.6.0 completa (011+012): deletar `v0.6.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Frontend** | `agents/dev-frontend.md` | game-core TS puro: SOLID, funções puras e testáveis |

**Instrução:** `dev-frontend.md`. `RunicEffectSystem` e `StatusEffectManager` são game-core TS puro. `StatusEffectManager` usa Map internamente — prefixo `_` nas propriedades privadas.
