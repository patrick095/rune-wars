# Implementar Tudo — v1.4.0

## Objetivo Geral

Implementar o spec v1.4.0 do Rune Wars: corrigir bugs críticos de gameplay, expandir mapas, adicionar modificadores de tiro, implementar lobby PvP, converter para single-screen, resolução fixa com moldura e bloqueio de cliques em modais.

**Spec:** `v1.4.0.md` (ou `docs/implementations/2026-06-09-v1.4.0-spec.md`)

---

## Estratégia

A implementação é dividida em **dois lotes independentes** do spec (A: gameplay, B: arquitetura) e 7 fases de execução. Lote A e Lote B podem começar em paralelo. As fases dentro de cada lote têm dependências sequenciais.

**Regra de estado:** O arquivo `ORCHESTRATION_STATE.md` deve ser atualizado após cada tarefa individual concluída — não apenas ao fim de um agente.

---

## Fila de Execução

### Fase 1 — Bugs Críticos (4 agentes em paralelo)

**Pode executar todos em paralelo:**
- **Agent-001** `001-projectile-renderer.md` — Fix A1: Explosão instantânea
- **Agent-002** `002-death-line.md` — Fix A2: Tiro durante queda + death line
- **Agent-003** `003-spawn-selector.md` — Fix A3: Spawn points inválidos
- **Agent-004** `004-terrain-collision.md` — Fix A4: Movimentação em desnível

**Arquivos em risco de conflito:** `battle.scene.ts` é alterado por Agent-001 (chamada de animateAlongPath) e Agent-002 (guard em startChargingPower). Se executados em paralelo, coordenar merge manual.

---

### Fase 2 — Arquitetura + Backend PvP (5 agentes em paralelo)

**Pode executar todos em paralelo (independentes entre si):**
- **Agent-005** `005-game-frame.md` — Feat B1: Game Frame CSS
- **Agent-006** `006-game-navigator.md` — Feat B2: Single-Screen + GameNavigatorService
- **Agent-007** `007-modal-blocking.md` — Feat B3: Modal Click Blocking
- **Agent-008** `008-debug-toggle.md` — Feat B4: Debug Toggle Tecla O
- **Agent-012** `012-pvp-backend.md` — Feat B5 Backend: PvpRoom + Endpoints + Job

**Arquivos em risco de conflito:** `app.component.ts` e `app.component.html` são alterados por Agent-005, 006, 007 e 008. Ordem sugerida: 005 → 006 → 007 → 008 (cada um constrói sobre o anterior).

---

### Fase 3 — HUD e Core de Modificadores (após Fase 1)

**Aguardar:** Agents 001-004 concluídos.

**Pode executar em paralelo:**
- **Agent-009** `009-combat-hud.md` — Fix A5: HUD Último Turno
- **Agent-010** `010-shot-modifier-system.md` — Fix A8: ShotModifierSystem

---

### Fase 4 — Item Dock + Grid Expansion (após Fase 3)

**Aguardar:** Agent-010 concluído (Agent-011 precisa de ShotModifierSystem).

**Pode executar em paralelo:**
- **Agent-011** `011-item-dock.md` — Fix A9: ItemDock visual (depende Agent-010)
- **Agent-015** `015-grid-expansion.md` — Fix A6: GRID_COLS=450, GRID_ROWS=160

---

### Fase 5 — PvP Frontend + Terrain Textures (após Fase 2 + parcial Fase 4)

**Aguardar:** Agent-006 + Agent-012 + Agent-015 concluídos.

**Pode executar em paralelo:**
- **Agent-013** `013-pvp-lobby-frontend.md` — Feat B5 Frontend: PvpLobbyComponent
- **Agent-016** `016-terrain-textures.md` — Fix A7: PNG com fallback

---

### Fase 6 — PvP Room (após Agent-013)

**Aguardar:** Agent-013 concluído.

- **Agent-014** `014-pvp-room-frontend.md` — Feat B5 Frontend: PvpRoomComponent

---

### Fase 7 — Validação Final

**Aguardar:** Todos os agentes (001-016) concluídos.

- **Agent-017** `017-qa-validation.md` — TypeScript build + checklist completo

---

## Mapa de Dependências

```
001 ──────────────────────────────────────────────────────────► 009, 010
002 ──────────────────────────────────────────────────────────► 009, 010
003 ──────────────────────────────────────────────────────────► 009, 010
004 ──────────────────────────────────────────────────────────► 009, 010
005 ──────────────────────────────────────────────────────────► (contexto para 006, 007, 008)
006 ──────────────────────────────────────────────────────────► 007, 008, 013
007 ──────────────────────────────────────────────────────────► (finaliza app.component)
008 ──────────────────────────────────────────────────────────► (finaliza app.component)
010 ──────────────────────────────────────────────────────────► 011
012 ──────────────────────────────────────────────────────────► 013
013 ──────────────────────────────────────────────────────────► 014
015 ──────────────────────────────────────────────────────────► 016
001-016 ────────────────────────────────────────────────────► 017
```

---

## Subagentes

| # | ID | Fase | Dependências | Arquivo do spec |
|---|----|----|---|---|
| 1 | Agent-001 | 1 | Nenhuma | 001-projectile-renderer.md |
| 2 | Agent-002 | 1 | Nenhuma | 002-death-line.md |
| 3 | Agent-003 | 1 | Nenhuma | 003-spawn-selector.md |
| 4 | Agent-004 | 1 | Nenhuma | 004-terrain-collision.md |
| 5 | Agent-005 | 2 | Nenhuma | 005-game-frame.md |
| 6 | Agent-006 | 2 | Agent-005 (contexto) | 006-game-navigator.md |
| 7 | Agent-007 | 2 | Agent-006 (contexto) | 007-modal-blocking.md |
| 8 | Agent-008 | 2 | Agent-006 (contexto) | 008-debug-toggle.md |
| 9 | Agent-009 | 3 | Agents 001-004 | 009-combat-hud.md |
| 10 | Agent-010 | 3 | Agents 001-004 | 010-shot-modifier-system.md |
| 11 | Agent-011 | 4 | Agent-010 | 011-item-dock.md |
| 12 | Agent-012 | 2 | Nenhuma | 012-pvp-backend.md |
| 13 | Agent-013 | 5 | Agents 006+012 | 013-pvp-lobby-frontend.md |
| 14 | Agent-014 | 6 | Agent-013 | 014-pvp-room-frontend.md |
| 15 | Agent-015 | 4 | Agents 001-004 | 015-grid-expansion.md |
| 16 | Agent-016 | 5 | Agent-015 | 016-terrain-textures.md |
| 17 | Agent-017 | 7 | Agents 001-016 | 017-qa-validation.md |

---

## Instruções de Execução

### Como executar um agente

1. Ler o arquivo de spec do agente em `.ai-orchestration/agents/XXX-nome.md`
2. Verificar se as dependências foram concluídas (ver AGENTS_QUEUE.md)
3. Executar as instruções do campo "Instrução de execução" do spec do agente
4. **Após cada tarefa/TODO concluído dentro do agente**, atualizar:
   - `ORCHESTRATION_STATE.md` — campo "Última ação concluída"
   - `FILES_CHANGED.md` — registrar arquivo alterado
5. **Ao concluir o agente**, atualizar:
   - `AGENTS_QUEUE.md` — mover de "Executando" para "Concluídos"
   - `ORCHESTRATION_STATE.md` — atualizar fase atual e próxima ação
   - `BUGS_AND_BLOCKERS.md` — registrar bugs encontrados
   - Atualizar o arquivo do agente com status, o que foi feito, arquivos alterados

### Como chamar um agente via Agent tool

```
Agent({
  description: "Agent-001 Projectile Renderer Fix",
  prompt: [conteúdo completo do arquivo 001-projectile-renderer.md]
})
```

### Conflito em app.component (Agents 005-008)

Devido ao alto risco de conflito, executar nesta ordem com merge manual entre cada um:
1. Agent-005 (estrutura base do game-frame)
2. Agent-006 (single-screen dentro do game-frame)
3. Agent-007 (pointer-events + backdrop)
4. Agent-008 (debug toggle)

Cada agente lê o app.component atual antes de alterar.

---

## Como lidar com bugs

### Bug CRÍTICO (bloqueia próximas fases)
1. Registrar em `BUGS_AND_BLOCKERS.md` na seção "Críticos"
2. Criar novo subagente corretivo: `bug-XXX-descricao.md`
3. Colocar na fila como prioridade máxima
4. Bloquear agentes dependentes até resolução

### Bug IMPORTANTE (resolve antes da consolidação)
1. Registrar em `BUGS_AND_BLOCKERS.md` na seção "Importantes"
2. Se impacta outros agentes: criar corretivo imediato
3. Se isolado: continuar e resolver no final

### Bug BAIXO
1. Registrar em `BUGS_AND_BLOCKERS.md` na seção "Baixos"
2. Continuar execução
3. Resolver após Agent-017

---

## Como lidar com conflitos

### Conflito em `battle.scene.ts`
Múltiplos agentes alteram este arquivo. Após cada agente, verificar se o próximo deve fazer merge:
- Agent-001 altera linha da chamada `animateAlongPath`
- Agent-002 altera `startChargingPower`
- Agent-009 altera `refreshHud`
- Agent-010 altera `firePlayerShot`
- Agent-011 adiciona docks
- Agent-015 altera zoom da câmera

Estratégia: executar em sequência por arquivo com maior risco, ou fazer merge manual após cada agent.

### Conflito em `app.component`
Executar Agents 005 → 006 → 007 → 008 sequencialmente, cada um lendo o estado atual do arquivo.

---

## Como finalizar

1. Todos os 17 agentes marcados como "Concluídos" em `AGENTS_QUEUE.md`
2. Agent-017 executado com sucesso (build + critérios de aceite)
3. Zero bugs críticos pendentes em `BUGS_AND_BLOCKERS.md`
4. `docs/implementations/2026-06-09-v1.4.0-implementacao.md` criado por Agent-017
5. Validar checklist de segurança da limpeza (ver abaixo)
6. Remover `.ai-orchestration/` com `rm -rf .ai-orchestration/`
7. **Perguntar ao usuário se deseja fazer o commit**

### Checklist de segurança antes de remover `.ai-orchestration/`
- [ ] `docs/implementations/2026-06-09-v1.4.0-implementacao.md` criado
- [ ] `FILES_CHANGED.md` completo com todos os arquivos
- [ ] Zero bugs críticos em `BUGS_AND_BLOCKERS.md`
- [ ] Zero agentes bloqueados em `AGENTS_QUEUE.md`
- [ ] `npm run build` passou (Agent-017 confirma)
- [ ] TypeScript sem erros

**Somente após todos os itens: `rm -rf .ai-orchestration/`**

---

## Pergunta de Commit Obrigatória

Após limpeza, sempre perguntar:

```
Implementação v1.4.0 concluída. Deseja fazer o commit agora?

1. Sim — commitar tudo
2. Não — depois
3. Revisar arquivos antes
```

---

## Notas Importantes

- **Assets PNG** (terrain): não serão criados nesta implementação. O sistema de fallback programático garante que o jogo funciona sem eles.
- **Mapas redesenhados**: plains e castle serão redesenhados como ilhas flutuantes. Os outros 6 mapas serão apenas expandidos (padding com EMPTY).
- **PvP multiplayer real**: o WebSocket existente (`BattleService`) é reaproveitado. Não há nova implementação de tempo real.
- **TypeScript**: `npm run build` deve passar ao final de cada fase antes de avançar.
