# Agent 023 — v1.0.0 Progressão Real (XP, Level, Raças)

## Objetivo
Implementar sistema de XP/level-up automático no backend, raças com bônus, e integrar progressão real com CharacterModule.

## Contexto mínimo necessário

### Fórmula de XP: `Math.floor(100 * level * level * 0.5)`
### Ganho de XP por atividade:
- Vitória PvP casual=30, ranqueado=80, derrota ranqueado=20
- Fase dungeon=50–150, chefe dungeon=150–400

### Raças:
- Humano: +5% XP ganho
- Anão: +5% chance de sucesso em craft/upgrade
- Elfo: +5% chance de material raro em dungeon

### Level-up: ao atingir XP necessário → level++, +4 pontos de atributo disponíveis

## Arquivos autorizados a criar/alterar
```
system/backend/src/
  character/
    character.service.ts (adicionar addXp(), levelUp())
    entities/character.entity.ts (adicionar race, availablePoints)
    dto/update-character.dto.ts
  progression/
    progression.module.ts
    progression.service.ts
    xp-rewards.ts
  migrations/ (nova migration para race + availablePoints)
```

## Arquivos apenas para consulta
- `system/backend/src/character/` (estrutura existente)
- `system/backend/src/battle/battle.service.ts`

## O que NÃO mexer
- AuthModule, InventoryModule, BattleGateway
- Qualquer arquivo de frontend

## Dependências obrigatórias
- Agentes 018+019+020+021+022 concluídos

## Critérios de aceite
- `addXp(characterId, amount)` verifica level-up automático
- Humano recebe 5% a mais de XP em todas as fontes
- `availablePoints` incrementa +4 por level-up
- `character.race` é definido na criação e não pode ser alterado
- Migration adiciona colunas `race` e `available_points` sem breaking change

## Memory

### Objetivo
XP, level-up, raças no backend.

### Contexto permitido
Fórmula de XP + tabela de raças + ganho por atividade.

### Arquivos autorizados
Os listados.

### Dependências
019+020 concluídos.

### Restrições
- Race é immutable após criação.
- Level-up é atômico (usar transação TypeORM).

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-023.md`.

## Limpeza pós-versão
Após v1.0.0 completa (023–032): deletar `v1.0.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Backend** | `agents/dev-backend.md` | NestJS service com lógica de XP/level-up, transações atômicas |
| **Databaser** | `agents/databaser.md` | Migration para race + available_points, constraint race immutable |

**Instrução:** `dev-backend` para ProgressionService. `databaser` para a migration — adicionar `race VARCHAR(20) NOT NULL DEFAULT 'human'` e `available_points INT DEFAULT 0` com constraint de imutabilidade para race após criação.
