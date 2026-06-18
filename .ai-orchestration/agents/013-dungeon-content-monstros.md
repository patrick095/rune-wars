# Agente 013 — Dungeon Content + Monstros/Bosses (game-core)

## Memory — Dungeon Content

### Objetivo
Criar a definição declarativa dos andares/estágios/monstros/bosses e a lógica de IA/escala em TypeScript puro (game-core), pronta para a cena consumir. SEM Phaser/rendering aqui.

### Contexto permitido
- Spec §10.7 (Andar 1), §10.8 (HP/dano por dificuldade ×1/×1.5/×3/×7 + HP base de boss = round(50×danoMédioParty)), §10.9 (Andar 2), §10.10 (escalonamento de boss por dificuldade — `bossPhasePlan(difficulty)`), §10.11 (enemy phase em lote), §14.4/§14.5.
- Novos `EnemyType`: `ACID_BAT`, `GIANT_BAT_BOSS`, `MYSTIC_BEETLE_NPC`, `CORRUPTED_BEETLE`, `TREANT_BOSS`.
- Comportamentos: morcego (mover L/R + cuspe ácido condicional); besouro corrompido (avançar + arremesso de lança); bosses (seletor de padrão por fase/dificuldade, alvo por cluster, invocação, AoE, ×5 spread, 1-hit). 5 estágios: f1-s1 (travessia/portal, barreiras, morcegos), f1-s2 (boss Morcego Gigante), f2-s1 (proteger NPC besouro, 10 rodadas, +2 morcegos/turno), f2-s2 (matar 10 besouros corrompidos), f2-s3 (boss Treant).

### Arquivos autorizados (criar/editar)
- `system/frontend/src/app/shared/game-core/dungeon-content.ts` (NOVO — andares/estágios/monstros/bosses declarativos)
- `system/frontend/src/app/shared/game-core/monster-ai.ts` (estender — comportamentos)
- `system/frontend/src/app/shared/game-core/dungeon-types.ts` (estender — EnemyType, tipos de estágio/objetivo)
- `system/frontend/src/app/shared/game-core/dungeon-engine.ts` (substituir/expandir; manter compat onde possível)
- `system/frontend/src/app/shared/game-core/__tests__/` (testes)

### Arquivos apenas de consulta
- rarity.ts (001), damage-calculator.ts, weapon-system.ts, weapon-definition.ts

### O que NÃO mexer
- `dungeon/` (componentes/cena Phaser — Agente 014), backend, UI.

### Dependências obrigatórias
- **001** (raridade no cálculo de dano da party p/ HP de boss).

### API pública (contrato p/ 014)
`DUNGEON_CONTENT` (estágios), `EnemyType`, `createEnemy(type, difficulty)`, `bossPhasePlan(difficulty)`, `resolveEnemyPhase(state)` (lote), `computeBossMaxHp(party, difficulty)`.

### Critérios de aceite (§25.7)
- 5 estágios definidos; bosses escalam padrões por dificuldade (fácil=fase1, médio=1+2, difícil=1+2+3, heróico=pula fase); HP/dano ×1/×1.5/×3/×7; enemy phase em lote (spawns +2/turno, invocações).
- Testes (escala, seletor de padrão, enemy phase, HP de boss). `tsc --noEmit` passa.

### Checklist granular
- [ ] 13.1 EnemyType + tipos de estágio/objetivo em dungeon-types
- [ ] 13.2 Escala de HP/dano por dificuldade + computeBossMaxHp
- [ ] 13.3 IA morcego ácido + besouro corrompido
- [ ] 13.4 bossPhasePlan + seletor de padrão (Morcego Gigante)
- [ ] 13.5 Padrões do Treant (fases 1/2/3)
- [ ] 13.6 resolveEnemyPhase (lote, spawns acumulativos)
- [ ] 13.7 DUNGEON_CONTENT (5 estágios + objetivos)
- [ ] 13.8 Testes + typecheck

### Comando de execução
"Implemente o Agente 013 conforme o arquivo. Atualize o checklist granular após cada item. Gere `013-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
