# Estado da Orquestração — v1.8.0

> **Este arquivo É o IMPLEMENTATION_STATE / ponto de retomada.** A seção
> "Checklist Granular de Itens" abaixo é atualizada **após CADA item atômico
> concluído** (não só ao fim do agente). Se o limite de tokens/contexto acabar,
> a retomada começa exatamente no primeiro item `[ ]` (pendente) seguindo a
> ordem da fila.

## Status geral
Não iniciado  ← (Não iniciado | Em andamento | Bloqueado | Em validação | Finalizado)

## Spec original
`docs/implementations/2026-06-18-v1.8.0-spec.md` (v1.8.0: Raridade, Ferreiro, Academia, Dungeon Andares 1–2, Portais, Economia de Ouro).

## Objetivo geral
Entregar as 7 frentes da v1.8.0 com batalha client-side e lobby/portais/progresso autoritativos no backend, em blocos compiláveis e testáveis isolados.

## Última ação concluída
Planejamento concluído: `.ai-orchestration/` criado com 19 sub-specs, fila, mapa de dependências e checklist granular. Nenhuma implementação iniciada.

## Próxima ação recomendada
Iniciar **Fase 1** pelo Agente **001 — Raridade Core** (item 1.1). Em paralelo podem rodar 003, 006, 017, 018 (sem dependências).

## Fase atual
Fase 0 — Planejamento (concluída). Próxima: Fase 1.

## Agente atual
— (nenhum em execução)

## Agentes concluídos
- (nenhum)

## Agentes pendentes
- 001–019 (todos)

## Agentes bloqueados
- (nenhum)

## Dependências liberadas
- (nenhuma ainda)

## Bugs críticos
- (nenhum)

## Decisões tomadas (resumo; detalhe em DECISIONS_LOG.md)
- Modo de execução: orquestrador inline com checkpoint **por item** (resumo abaixo).
- Espelho de raridade no backend: caminho a confirmar pelo Agente 001 (preferir `game-engine/items/`).

## Decisões pendentes
- Caminho exato do util de raridade no backend (001 decide e registra).
- Pasta do PortalService: `dungeon-rewards` (novo módulo) — confirmar no 007.

---

## Checklist Granular de Itens (ATUALIZAR APÓS CADA ITEM)

> Marcar `[x]` imediatamente ao concluir o item e atualizar "Última ação concluída"
> + "Próxima ação recomendada" acima. Status por item: ` ` pendente · `~` em
> andamento · `x` concluído · `!` bloqueado.

### FASE 1 — Fundação (paralelo: 001, 003, 006, 017, 018)
**Agente 001 — Raridade Core**
- [ ] 1.1 Criar rarity.ts (tipos + RARITY_BONUS/COLORS/LABEL/SUFFIX)
- [ ] 1.2 getPrimaryStatKey + applyRarity
- [ ] 1.3 formatItemName + normalizeRarity
- [ ] 1.4 Espelho backend rarity.util.ts
- [ ] 1.5 Testes rarity.spec.ts
- [ ] 1.6 typecheck front + back

**Agente 003 — Economia de Ouro**
- [ ] 3.1 Confirmar coluna gold
- [ ] 3.2 addGold
- [ ] 3.3 spendGold (400)
- [ ] 3.4 Expor gold no controller
- [ ] 3.5 typecheck + build backend

**Agente 006 — Gate (DungeonProgress)**
- [ ] 6.1 Coluna cleared_by_difficulty
- [ ] 6.2 canAccessFloor
- [ ] 6.3 recordFloorClear
- [ ] 6.4 Migration de referência
- [ ] 6.5 Testes + typecheck/build

**Agente 017 — Mapas de Dungeon**
- [ ] 17.1 dungeon-f1-s1.json
- [ ] 17.2 dungeon-f1-s2.json
- [ ] 17.3 dungeon-f2-s1.json
- [ ] 17.4 dungeon-f2-s2.json
- [ ] 17.5 dungeon-f2-s3.json
- [ ] 17.6 Validar schema

**Agente 018 — Prompts de Assets**
- [ ] 18.1 Backgrounds/mapas
- [ ] 18.2 Monstros + NPC + bosses
- [ ] 18.3 VFX/projéteis
- [ ] 18.4 Objetos de cenário
- [ ] 18.5 Ícones (pedra 0–5, fragmentos) + portais

### FASE 2 — Catálogo + Backend de domínio
**Agente 002 — Catálogo (após 001)**
- [ ] 2.1 fragment_* (6)
- [ ] 2.2 enhancement_stone
- [ ] 2.3 Ícones por nível da pedra
- [ ] 2.4 Helper de exibição
- [ ] 2.5 typecheck front

**Agente 004 — Craft Backend (após 001, 002)**
- [ ] 4.1 POST /craft/combine (validação)
- [ ] 4.2 Rolagem 30/20/10% + item R+1
- [ ] 4.3 Consumo em falha
- [ ] 4.4 POST /craft/dismantle (70/60/50%)
- [ ] 4.5 Bloqueio Heroico + consumo
- [ ] 4.6 Normalizar/aposentar receita legada
- [ ] 4.7 Testes + typecheck/build

**Agente 005 — Upgrade Backend (após 002, 003)**
- [ ] 5.1 computeChance + mapa luck→% + clamp
- [ ] 5.2 Tabelas pedra/item
- [ ] 5.3 POST /upgrade/item
- [ ] 5.4 POST /upgrade/stone
- [ ] 5.5 GET /upgrade/chance estendido
- [ ] 5.6 Transação atômica ouro+insumos
- [ ] 5.7 Testes + typecheck/build

**Agente 007 — PortalService (após 001, 002, 003)**
- [ ] 7.1 Tipo Portal + portal-pools.ts
- [ ] 7.2 generatePortals dungeon normal
- [ ] 7.3 generatePortals dungeon boss
- [ ] 7.4 generatePortals PvP
- [ ] 7.5 select (1/2, unicidade, auto-pick)
- [ ] 7.6 Concessão item/pedra/ouro
- [ ] 7.7 Reveal + ganhos
- [ ] 7.8 Testes + typecheck/build

**Agente 010 — Raridade Display+Combate (após 001)**
- [ ] 10.1 Exibição inventário/cofre
- [ ] 10.2 Exibição slots equipamento
- [ ] 10.3 Labels pvp-room/lobby
- [ ] 10.4 Loadout: applyRarity + upgrade
- [ ] 10.5 typecheck + build frontend

**Agente 013 — Dungeon Content (após 001)**
- [ ] 13.1 EnemyType + tipos de estágio
- [ ] 13.2 Escala HP/dano + computeBossMaxHp
- [ ] 13.3 IA morcego + besouro corrompido
- [ ] 13.4 bossPhasePlan + seletor (Morcego)
- [ ] 13.5 Padrões do Treant
- [ ] 13.6 resolveEnemyPhase (lote)
- [ ] 13.7 DUNGEON_CONTENT (5 estágios)
- [ ] 13.8 Testes + typecheck

**Agente 012 — Academia (após 001)**
- [ ] 12.1 AcademyConfigPanel
- [ ] 12.2 AcademyScene (terreno+vento+física)
- [ ] 12.3 Alvo fixed/mobile
- [ ] 12.4 Alvo dummy_player
- [ ] 12.5 HUD + Voltar
- [ ] 12.6 typecheck + build frontend

### FASE 3 — Integração de domínio + UI
**Agente 008 — Dungeon Salas (após 006, 007)**
- [ ] 8.1 Estender entity
- [ ] 8.2 GET/POST rooms (gate)
- [ ] 8.3 join/leave/ready
- [ ] 8.4 settings + start
- [ ] 8.5 stage-complete (portais+clear)
- [ ] 8.6 regroup + cleanup TTL
- [ ] 8.7 Migration + testes + typecheck/build

**Agente 009 — PvP Rewards Hook (após 007)**
- [ ] 9.1 Coluna reward_state
- [ ] 9.2 Endpoint rewards
- [ ] 9.3 select/concessão
- [ ] 9.4 Gancho fim de partida
- [ ] 9.5 Testes + typecheck/build

**Agente 011 — Ferreiro UI (após 002, 004, 005)**
- [ ] 11.1 GameScreen +ferreiro/dungeon-lobby/dungeon-room + redirect
- [ ] 11.2 FerreiroComponent (header ouro + abas)
- [ ] 11.3 Aba Craft
- [ ] 11.4 Aba Desmontagem
- [ ] 11.5 Aba Aprimoramento
- [ ] 11.6 Slots inventário + estados
- [ ] 11.7 @case AppComponent + POI hub
- [ ] 11.8 typecheck + build frontend

**Agente 016 — RewardPortals UI (após 007, 009)**
- [ ] 16.1 RewardPortalsComponent (8/16)
- [ ] 16.2 Timer 10s + auto-pick
- [ ] 16.3 Seleção 1/2 + unicidade
- [ ] 16.4 select + reveal/ganhos
- [ ] 16.5 Gatilho fim PvP (pvp.component)
- [ ] 16.6 typecheck + build frontend

**Agente 014 — DungeonScene (após 013, 017)**
- [ ] 14.1 Loader de estágio
- [ ] 14.2 Enemy phase em lote
- [ ] 14.3 f1-s1 + f1-s2
- [ ] 14.4 f2-s1 (NPC + balões)
- [ ] 14.5 f2-s2 + f2-s3
- [ ] 14.6 Padrões de boss por dificuldade
- [ ] 14.7 stage-finished → stage-complete (008) → RewardPortals (016)
- [ ] 14.8 typecheck + build frontend

**Agente 015 — Dungeon Lobby/Room UI (após 008; 011 p/ GameScreen)**
- [ ] 15.1 DungeonLobbyComponent
- [ ] 15.2 Modal criar (gate)
- [ ] 15.3 Entrar (bloqueio)
- [ ] 15.4 DungeonRoomComponent
- [ ] 15.5 Inventário + regroup
- [ ] 15.6 storage→endpoints + @case
- [ ] 15.7 typecheck + build frontend

### FASE 4 — Consolidação
**Agente 019 — Integração + Docs + QA (após TODOS)**
- [ ] 19.1 Ler resumos + conflitos
- [ ] 19.2 Validar critérios §25 (1–9)
- [ ] 19.3 tsc + nest build (backend)
- [ ] 19.4 tsc + ng build (frontend)
- [ ] 19.5 Correções de integração
- [ ] 19.6 docs/05 + docs/07
- [ ] 19.7 implementation-summary
- [ ] 19.8 Checklist §26 + preparar limpeza

---

## Como retomar
Para continuar esta implementação, leia primeiro:
1. `.ai-orchestration/ORCHESTRATION_STATE.md` (este arquivo) — vá ao primeiro item `[ ]` na ordem da fila.
2. `.ai-orchestration/AGENTS_QUEUE.md`
3. `.ai-orchestration/BUGS_AND_BLOCKERS.md`
4. `.ai-orchestration/FILES_CHANGED.md`
5. O sub-spec do agente atual em `.ai-orchestration/agents/NNN-*.md` e seu `*.summary.md` (se parcial).

Depois continue exatamente da seção "Próxima ação recomendada".
