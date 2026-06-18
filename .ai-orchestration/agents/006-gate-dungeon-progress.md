# Agente 006 — Gate de Andar (DungeonProgress)

## Memory — Gate

### Objetivo
Adicionar o gate de andar por dificuldade ao `DungeonProgress`: coluna `cleared_by_difficulty` (jsonb, default `{easy:0,medium:0,hard:0,heroic:0}`) e métodos `recordFloorClear` / `canAccessFloor`.

### Contexto permitido
- Spec §10.5, §13.4. Andar N exige `clearedByDifficulty[dificuldade] >= N-1`.
- Ao vencer o boss do andar: `clearedByDifficulty[dif] = max(atual, andar)`.
- `synchronize:true` aplica a coluna (sem migration obrigatória; criar migration de referência).

### Arquivos autorizados (criar/editar)
- `system/backend/src/dungeon/dungeon-progress.entity.ts` (+coluna)
- `system/backend/src/dungeon/dungeon.service.ts` (recordFloorClear/canAccessFloor)
- `system/backend/src/dungeon/dungeon.controller.ts` (se precisar expor)

### Arquivos apenas de consulta
- Nenhum crítico.

### O que NÃO mexer
- dungeon-floors (salas — Agente 008 consome estes métodos), portais.

### Dependências obrigatórias
- Nenhuma.

### API pública (contrato)
`DungeonService.canAccessFloor(characterId, floor, difficulty): Promise<boolean>`, `DungeonService.recordFloorClear(characterId, floor, difficulty): Promise<void>`.

### Critérios de aceite
- Coluna com default seguro; gate calcula corretamente; clear atualiza max.
- Testes (canAccessFloor, recordFloorClear). `tsc --noEmit && nest build` passam.

### Checklist granular
- [ ] 6.1 Coluna `cleared_by_difficulty` (jsonb default)
- [ ] 6.2 `canAccessFloor`
- [ ] 6.3 `recordFloorClear`
- [ ] 6.4 Migration de referência
- [ ] 6.5 Testes + typecheck/build backend

### Comando de execução
"Implemente o Agente 006 conforme o arquivo. Atualize o checklist granular após cada item. Gere `006-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
