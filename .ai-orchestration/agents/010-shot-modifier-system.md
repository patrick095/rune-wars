# Agent-010 — Shot Modifier System (Fix A8: Sistema de Modificadores de Tiro)

## Status
Pendente

## Objetivo
Criar `ShotModifierSystem` como novo arquivo e integrá-lo em `battle.scene.ts`. O sistema suporta 4 modificadores (shot_plus1, shot_x3, shot_damage_2x, shot_dig_2x). Apenas 1 modificador ativo por vez. Modificadores consumidos ao atirar e ao início do turno do jogador.

## Memory

### Objetivo
Criar ShotModifierSystem e integrá-lo no fluxo de tiro de battle.scene.ts.

### Contexto permitido
- Criar `src/app/shared/game-core/shot-modifier-system.ts`
- `src/app/shared/game-core/battle.scene.ts`: substituir firePlayerShot para usar sistema
- Consultar `src/app/shared/game-core/secondary-item-system.ts` para entender padrão existente

### Arquivos autorizados a alterar
- `src/app/shared/game-core/shot-modifier-system.ts` (criar)
- `src/app/shared/game-core/battle.scene.ts` (integrar no firePlayerShot)

### Arquivos apenas consulta
- `src/app/shared/game-core/secondary-item-system.ts`
- `src/app/shared/game-core/projectile-renderer.ts` (para entender como disparar múltiplos projéteis)

### O que NÃO alterar
- Lógica de consumíveis existente
- Outros sistemas de battle.scene.ts além de firePlayerShot

### Dependências
- Após Fase 1 (Agents 001-004) para não conflitar em battle.scene.ts
- Agent-001 altera animateAlongPath — Agent-010 deve garantir compatibilidade com nova assinatura

### Critérios de aceite
- `ShotModifierType = 'shot_plus1' | 'shot_x3' | 'shot_damage_2x' | 'shot_dig_2x'`
- `ShotModifierSystem.activate(id)`: se mesmo id, deseleciona; se outro, substitui o anterior
- `ShotModifierSystem.resolve(angle, force, weapon)`: retorna `{ shots: ShotConfig[], delayedShots: ShotConfig[] }`
- `shot_x3`: retorna 3 shots com angles (angle-5, angle, angle+5)
- `shot_plus1`: retorna 1 shot + 1 delayedShot com delayMs: 700
- `shot_damage_2x`: baseDamage × 2
- `shot_dig_2x`: excavationRadius × 2
- `consumeAll()` chamado após atirar e ao início do turno do jogador
- IA nunca usa modificadores
- TypeScript sem erros

### Instrução de execução
```
Implemente o Fix A8 do spec v1.4.0 (ShotModifierSystem).
Criar src/app/shared/game-core/shot-modifier-system.ts com a classe conforme spec.
Implementar activate, getActive, isActive, consumeAll, resolve.
Em battle.scene.ts, instanciar ShotModifierSystem.
No método firePlayerShot (ou equivalente), chamar shotModifierSystem.resolve() para obter shots e delayedShots.
Para shots normais, disparar cada um de shots[].
Para delayedShots, usar this.time.delayedCall(700, ...) após o primeiro projétil aterrissar.
Para shot_x3, verificar se ProjectileRenderer suporta múltiplos arcs simultâneos — se não, criar/reutilizar arcs adicionais.
Ao início do turno do jogador, chamar shotModifierSystem.consumeAll().
Adicionar log: [ShotMod] Aplicando ${id} ao tiro.
Atualizar .ai-orchestration/ após cada arquivo alterado.
```

## Riscos ou pendências
- `ProjectileRenderer` pode precisar de pool de arcs para x3 simultâneos — verificar
- O turno do player só termina após o último projétil aterrissar (incluindo shot_plus1 delayed)
