# Agente 011 — BattleScene: Weapon Angle Limits

## Objetivo
Criar a constante `WEAPON_ANGLE_LIMITS` com ranges de ângulo por tipo de arma, integrar o clamping em `changeAngle()` e em `switchWeapon()` (ou equivalente) na `BattleScene`.

## Contexto mínimo necessário
- `BattleScene` em `system/frontend/src/game/scenes/battle.scene.ts`
- Verificar quais tipos de arma existem atualmente no projeto antes de definir os limites
- Verificar como `changeAngle()` e `switchWeapon()` estão implementados atualmente

## Tabela de limites por arma

```typescript
export interface WeaponAngleLimits {
  minAngle: number;
  maxAngle: number;
}

export const WEAPON_ANGLE_LIMITS: Record<string, WeaponAngleLimits> = {
  default:  { minAngle: 5,  maxAngle: 85 },
  mortar:   { minAngle: 45, maxAngle: 85 },
  sniper:   { minAngle: 5,  maxAngle: 30 },
  grenade:  { minAngle: 30, maxAngle: 75 },
  drill:    { minAngle: 5,  maxAngle: 45 },
  bouncer:  { minAngle: 10, maxAngle: 80 },
};

function getWeaponAngleLimits(weapon: string): WeaponAngleLimits {
  return WEAPON_ANGLE_LIMITS[weapon] ?? WEAPON_ANGLE_LIMITS['default'];
}
```

## Integração no BattleScene

No método `changeAngle()`:
```typescript
private changeAngle(delta: number): void {
  const limits = getWeaponAngleLimits(this.currentWeapon);
  this.currentAngle = Math.max(limits.minAngle, Math.min(limits.maxAngle, this.currentAngle + delta));
  this.updateAngleDisplay();
}
```

Ao trocar de arma (método existente ou criar `switchWeapon`):
```typescript
private switchWeapon(weapon: string): void {
  this.currentWeapon = weapon;
  const limits = getWeaponAngleLimits(weapon);
  this.currentAngle = Math.max(limits.minAngle, Math.min(limits.maxAngle, this.currentAngle));
  this.updateAngleDisplay();
}
```

## Localização da constante
- Pode ser definida no topo de `battle.scene.ts` OU em `system/frontend/src/app/shared/game-core/weapon-definition.ts`
- Preferir `weapon-definition.ts` se já houver tipos de arma definidos lá

## Arquivos que pode alterar
- `system/frontend/src/game/scenes/battle.scene.ts`
- `system/frontend/src/app/shared/game-core/weapon-definition.ts` (se for o local mais adequado para a constante)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/weapon-definition.ts`
- `system/frontend/src/app/shared/game-core/types.ts`

## O que NÃO deve mexer
- Lógica de dano por tipo de arma
- PowerBar (agente 010)
- Map drag (agente 008)
- Controles de ângulo (agente 009)

## Dependências obrigatórias
- **Agente 010** concluído: ler estado atual de `battle.scene.ts`

## Critérios de aceite
- [ ] `WEAPON_ANGLE_LIMITS` definido com todos os tipos listados
- [ ] `getWeaponAngleLimits()` com fallback para 'default'
- [ ] `changeAngle()` clampado pelos limites da arma atual
- [ ] Ao trocar de arma, ângulo atual é clampado automaticamente
- [ ] Mortar: não permite ângulo < 45°
- [ ] Sniper: não permite ângulo > 30°
- [ ] `npx tsc --noEmit` sem erros

## Restrições
- **ATENÇÃO**: ler `battle.scene.ts` após agente 010 antes de editar
- Se `this.currentWeapon` não existir como propriedade, adicioná-la com tipo string e valor default 'default'
- Adaptar os nomes dos tipos de arma para os nomes reais usados no projeto (verificar `weapon-definition.ts`)

## Memory

### Objetivo
Criar WEAPON_ANGLE_LIMITS e integrar clamping em changeAngle/switchWeapon.

### Contexto permitido
- `system/frontend/src/game/scenes/battle.scene.ts` (editar — ler estado pós-010)
- `system/frontend/src/app/shared/game-core/weapon-definition.ts` (ler + editar se adequado)

### Arquivos autorizados
- `battle.scene.ts`
- `weapon-definition.ts` (apenas para adicionar a constante se fizer sentido)

### Dependências
- Agente 010 concluído

### Restrições
- Adaptar nomes de armas para os nomes reais do projeto
- Fallback para 'default' se arma não mapeada
- Não alterar lógica de dano

### Critérios de aceite
- Clamping por arma funcional
- Mortar ≥ 45°, Sniper ≤ 30°
- `npx tsc --noEmit` sem erros

## Formato do resumo final
Criar `.ai-orchestration/agents/011-battlescene-weapon-angle-limits-DONE.md` seguindo o formato padrão de resumo.
