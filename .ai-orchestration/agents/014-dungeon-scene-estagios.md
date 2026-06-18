# Agente 014 — DungeonScene + Estágios (frontend Phaser)

## Memory — DungeonScene

### Objetivo
Estender a `DungeonScene`/`DungeonComponent` para renderizar e jogar os 5 estágios definidos no `dungeon-content.ts`, com enemy phase em lote, padrões de boss por dificuldade e objetivos por estágio; emitir `dungeon:stage-finished` e disparar `stage-complete` no backend (abrindo Portais).

### Contexto permitido
- Spec §14.4 (DungeonScene), §10.7–§10.11, §12 (balões NPC).
- Objetivos: travessia/portal (f1-s1), boss (f1-s2/f2-s3), proteger NPC (f2-s1), matar N (f2-s2).
- Consumir `DUNGEON_CONTENT`, `createEnemy`, `bossPhasePlan`, `resolveEnemyPhase` (Agente 013); mapas (Agente 017); abrir `RewardPortalsComponent` (Agente 016) no fim do estágio.
- Balões de fala do NPC besouro antes dos turnos.

### Arquivos autorizados (criar/editar)
- `system/frontend/src/app/dungeon/dungeon.component.ts/html/scss`
- Arquivo(s) da `DungeonScene` Phaser sob `dungeon/` (localizar; pode estar em dungeon.component ou arquivo dedicado)

### Arquivos apenas de consulta
- `system/frontend/src/app/shared/game-core/dungeon-content.ts`, `monster-ai.ts`, `dungeon-types.ts` (013)
- `terrain-engine.ts`, `projectile-physics.ts`, `wind-system.ts`
- maps `dungeon-f*.json` (017)
- `RewardPortalsComponent` (016), endpoint `stage-complete` (008)

### O que NÃO mexer
- game-core dungeon logic (013), backend, lobby/room UI (015), portais UI internos (016).

### Dependências obrigatórias
- **013** (conteúdo/IA), **017** (mapas). Integra com **016** (portais) e **008** (stage-complete) na fase de wiring.

### Critérios de aceite (§25.7/§25.8)
- 5 estágios jogáveis com monstros/NPC/bosses; enemy phase em lote; padrões de boss por dificuldade; emite stage-finished e abre portais.
- `tsc --noEmit && ng build` passam.

### Checklist granular
- [ ] 14.1 Loader de estágio (mapa + spawns a partir de DUNGEON_CONTENT)
- [ ] 14.2 Enemy phase em lote (≤150ms entre monstros)
- [ ] 14.3 Estágio f1-s1 (travessia/barreiras/portal) + f1-s2 (boss Morcego)
- [ ] 14.4 Estágio f2-s1 (NPC besouro + balões + proteção) 
- [ ] 14.5 Estágio f2-s2 (matar 10) + f2-s3 (boss Treant)
- [ ] 14.6 Padrões de boss por dificuldade (consumindo bossPhasePlan)
- [ ] 14.7 Emitir stage-finished → stage-complete (008) → abrir RewardPortals (016)
- [ ] 14.8 typecheck + build frontend

### Comando de execução
"Implemente o Agente 014 conforme o arquivo. Atualize o checklist granular após cada item. Gere `014-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
