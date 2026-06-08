# Agent 009 — v0.5.0 AttributeSystem (TypeScript Puro)

## Objetivo
Implementar `PlayerStats` completo com 4 atributos, `AttributeCalculator` com todas as fórmulas, `WeaponRequirements` e função `canUseWeapon()`.

## Contexto mínimo necessário

### Atributos e fórmulas:
```ts
maxHp = 200 + vitality * 20
damage = 1.0 + strength * 0.02
defense = Math.min(agility * 0.005, 0.6)
mobility = 30 + agility * 2
runicChance = Math.min(0.05 + luck * 0.003, 0.75)
totalPoints = (level - 1) * 4
```

### Requisitos de armas:
| Arma | Força mín | Agi mín | Nível mín |
|------|-----------|---------|-----------|
| cannon | 20 | — | 5 |
| longbow | — | 15 | 1 |
| tnt | 15 | — | 3 |
| boomerang | — | 10 | 1 |
| ice-book | — | — | 1 |
| potion | — | — | 1 |

## Arquivos autorizados a criar/alterar
```
system/frontend/src/app/shared/game-core/
  player-stats.ts (atualizar/substituir versão v0.2.0)
  attribute-calculator.ts
  weapon-requirements.ts
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  weapon-definition.ts
  damage-calculator.ts
```

## O que NÃO mexer
- `weapon-definition.ts` (agente 007) — apenas adicionar `requirements?: WeaponRequirements`
- Qualquer arquivo Phaser/Angular/Docker

## Dependências obrigatórias
- Agentes 007 + 008 concluídos

## Interface `PlayerStats` obrigatória
```ts
export interface PlayerStats {
  level: number; strength: number; agility: number; vitality: number; luck: number;
  readonly maxHp: number; readonly damage: number; readonly defense: number;
  readonly mobility: number; readonly runicChance: number;
}
export interface WeaponRequirements {
  minStrength?: number; minAgility?: number; minVitality?: number;
  minLuck?: number; minLevel?: number;
}
export function canUseWeapon(stats: PlayerStats, weapon: WeaponDefinition): boolean
```

## Critérios de aceite
- `AttributeCalculator.calculate(base)` retorna PlayerStats com derivados corretos
- `canUseWeapon()` retorna false se requisito não atendido
- `totalPoints` validado: soma atributos ≤ (level-1)*4
- `WeaponDefinition.requirements` populado para cannon, longbow, tnt, boomerang

## Memory

### Objetivo
PlayerStats, AttributeCalculator, requisitos de armas — TS puro.

### Contexto permitido
Fórmulas + tabela de requisitos + interface WeaponDefinition.

### Arquivos autorizados
Os 3 listados.

### Dependências
007+008 concluídos.

### Restrições
- `PlayerStats` substitui versão anterior (v0.2.0 tinha versão simplificada).
- Derivados são `readonly` calculados pelo AttributeCalculator.
- Não alterar lógica de Phaser.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-009.md`.

## Limpeza pós-versão
Após v0.5.0 completa (009+010): deletar `v0.5.0.md` da raiz.
