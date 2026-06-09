# Implementar Tudo — v1.3.0

## Objetivo Geral

Implementar duas features principais:
1. **Seleção/Criação de Personagem antes do Hub** — fluxo de identidade do jogador (guard, tela, criação, deleção, ActiveCharacterService)
2. **Melhorias de Controles e UX Mobile na BattleScene** — mapa navegável, controles de ângulo refinados, barra de força redesenhada, ângulos limitados por arma

---

## Estratégia

- Parte 1 tem uma cadeia de dependências: backend entity → backend service → frontend model/service → componente/guard → integrações
- Parte 2 tem 4 sub-features que todas tocam `battle.scene.ts` — devem rodar **sequencialmente** entre si para evitar conflito
- Parte 1 e Parte 2 são **independentes entre si** no nível macro — podem ser desenvolvidas em paralelo desde que o agente de raça da BattleScene (007) coordene com o agente da BattleScene mobile (008-011)
- TypeScript QA roda ao final como validação cruzada

---

## Fila de Execução

### Fase 1 — Fundação (pode rodar em paralelo)
- **001** — Backend: Character Entity + Migration
- **003** — Frontend: Character Model + ActiveCharacterService

### Fase 2 — Backend Service (depende de 001)
- **002** — Backend: CharacterService validações + Controller DELETE

### Fase 3 — Execução Paralela (depende de 003 para frontend; 002 deve estar concluído antes de 005)
Pode executar em paralelo:
- **004** — Frontend: characterGuard + Rotas
- **006** — Frontend: Integrações (CharacterComponent, InventoryService, VaultService, Hub)
- **007** — BattleScene: Race do Personagem Ativo
- **008** — BattleScene: Navegação de Mapa por Arrasto

### Fase 4 — Execução Dependente
- **005** — Frontend: CharacterSelectComponent (aguarda 002 + 003 + 004)
- **009** — BattleScene: Controles de Ângulo Mobile (aguarda 008)
- **010** — BattleScene: PowerBar Redesign (aguarda 009)
- **011** — BattleScene: Weapon Angle Limits (aguarda 010)

### Fase 5 — QA e Validação
- **012** — TypeScript QA: typecheck backend + frontend, build check

### Fase 6 — Consolidação
- **013** — Orquestrador: leitura de resumos, validação de critérios, resumo final

---

## Mapa de Dependências

```
001 ──► 002 ──► 005
003 ──► 004 ──► 005
003 ──► 006
003 ──► 007
003 ──► 008 ──► 009 ──► 010 ──► 011
001 + 002 + 003 + 004 + 005 + 006 + 007 + 008 + 009 + 010 + 011 ──► 012 ──► 013
```

---

## Subagentes

| # | Nome | Escopo |
|---|------|--------|
| 001 | Backend: Character Entity + Migration | Adicionar `race`, `UNIQUE` no `name`, criar migration TypeORM |
| 002 | Backend: CharacterService + Controller DELETE | Validações (5 chars, nome único, raça), endpoint DELETE |
| 003 | Frontend: Character Model + ActiveCharacterService | `character.model.ts`, `ActiveCharacterService` |
| 004 | Frontend: characterGuard + Rotas | `character.guard.ts`, `app.routes.ts` |
| 005 | Frontend: CharacterSelectComponent | Tela completa com cards, modal de criação, deleção |
| 006 | Frontend: Integrações de Serviço | CharacterComponent, InventoryService, VaultService, link no Hub |
| 007 | BattleScene: Race do Personagem Ativo | Substituir `human_battle` hardcoded pela raça do personagem ativo |
| 008 | BattleScene: Map Drag | `setupMapDrag()`, câmera manual desktop+mobile |
| 009 | BattleScene: Angle Controls | Mobile detection, botões HUD, hold-to-repeat, throttle teclado |
| 010 | BattleScene: PowerBar Redesign | Régua marcações, ghost último tiro, sem número externo |
| 011 | BattleScene: Weapon Angle Limits | `WEAPON_ANGLE_LIMITS`, clamping em changeAngle/switchWeapon |
| 012 | TypeScript QA | `npx tsc --noEmit` backend + frontend, relatório de erros |
| 013 | Orquestrador Final | Leitura de resumos, validação critérios de aceite, resumo final |

---

## Instruções de Execução

1. Leia este arquivo e `ORCHESTRATION_STATE.md` antes de executar qualquer agente
2. Execute agentes da **Fase 1** em paralelo (001 + 003)
3. Ao concluir 001, execute **002**
4. Ao concluir 003, execute **004**, **006**, **007**, **008** em paralelo
5. Ao concluir 002 + 003 + 004: execute **005**
6. Ao concluir 008: execute **009**; ao concluir 009: execute **010**; ao concluir 010: execute **011**
7. Ao concluir todos (001-011): execute **012**
8. Ao concluir 012 (sem erros críticos): execute **013**

Após cada agente: atualizar `ORCHESTRATION_STATE.md`, `AGENTS_QUEUE.md`, `BUGS_AND_BLOCKERS.md`, `FILES_CHANGED.md` e o resumo do agente em `agents/`.

---

## Como lidar com bugs

- **CRÍTICO** (bloqueia próximas fases): interromper agentes dependentes, criar subagente corretivo imediatamente
- **IMPORTANTE** (deve ser resolvido antes da consolidação): anotar em `BUGS_AND_BLOCKERS.md`, corrigir antes do 012
- **BAIXO** (pode ser tratado no final): acumular para o 013

Exemplos críticos:
- TypeORM migration falha → bloqueia todo o backend
- `ActiveCharacterService` com tipo errado → bloqueia 004, 005, 006, 007
- BattleScene não compila após 008 → bloqueia 009, 010, 011

---

## Como lidar com conflitos

- Agentes 007, 008, 009, 010, 011 todos tocam `battle.scene.ts` — executar SEQUENCIALMENTE
- Se dois agentes modificarem o mesmo arquivo inesperadamente, o segundo deve ler o estado atual do arquivo antes de editar
- Usar `git diff` para verificar conflitos antes de continuar

---

## Como finalizar

1. Todos os 013 agentes concluídos
2. `npx tsc --noEmit` sem erros em backend e frontend
3. Build do frontend sem erros (`ng build`)
4. Criterios de aceite validados (ver spec seção 25 e P2.9)
5. Criar resumo final em `docs/implementations/2026-06-08-v1.3.0-character-select-battle-ux.md`
6. Remover pasta `.ai-orchestration/`
