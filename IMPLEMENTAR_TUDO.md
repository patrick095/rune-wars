# Implementar Tudo — Rune Wars v1.2.0

## Objetivo Geral

Entregar a v1.2.0 jogável e testável por beta testers. Esta versão concentra:
- ~49 assets visuais (personagens, armas, itens, materiais)
- Power meter funcional no Phaser (sem depender do Angular change detection)
- Ghost trace (linha pontilhada do último tiro)
- Paridade desktop = playground
- Inventário clássico RPG (36 slots 6×6 + 10 slots de equipamento)
- Cofre compartilhado (60 slots 6×10) com taxa de retirada
- 3 novos mapas battle (total 5) com áreas de escavação e 8 spawns
- Canvas único (overlay Angular sobre Phaser sem destruir a cena)

---

## Estratégia

- 18 agentes especializados com contexto mínimo e fechado
- Fase 1: 7 agents independentes rodam em paralelo (assets, fixes, backend vault, mapas, eventbus)
- Assets gerados via prompts de IA de imagem (Agent 001 cria specs; agents 002–005 posicionam as imagens)
- Componentes de inventário têm cadeia: ItemSlot → Grids → Integração → Vault Frontend
- Canvas único pode rodar em paralelo com tudo
- QA final somente após todos os agents 001–017 concluídos
- **P1 (taxa cofre)**: `VAULT_ITEM_FEE = 100 gold` como default configurável até confirmação

---

## Fila de Execução

### Rodada 1 — 7 Agents Paralelos (sem dependências)

| Agent | Objetivo |
|-------|----------|
| **001** | Criar specs e prompts para todos os 49 assets |
| **006** | PowerMeterHUD — migrar barra de força para Phaser nativo |
| **008** | Desktop Parity — unificar InputController |
| **009** | ItemSlot + Tooltip components (base do inventário) |
| **012** | Vault backend — entidades, migrations, endpoints |
| **014** | Map JSONs — 3 novos mapas |
| **016** | EventBus + HubScene refactor |

### Rodada 2 — 8 Agents (desbloqueados após rodada 1)

| Agent | Aguarda | Objetivo |
|-------|---------|----------|
| **002** | 001 | Character sprites |
| **003** | 001 | Weapon icons + battle sprites |
| **004** | 001 | Item icons (secundários + consumíveis) |
| **005** | 001 | Craft + material icons |
| **007** | 006 | Ghost trace |
| **010** | 009 | Equipment slots + Inventory grid |
| **015** | 014 | Map assets (backgrounds + tilesets) |
| **017** | 016 | AppComponent overlay system |

### Rodada 3 — 1 Agent

| Agent | Aguarda | Objetivo |
|-------|---------|----------|
| **011** | 009 + 010 | Character + Inventory integration |

### Rodada 4 — 1 Agent

| Agent | Aguarda | Objetivo |
|-------|---------|----------|
| **013** | 012 + 011 | Vault frontend (grid 6×10 + aba Cofre) |

### Rodada 5 — Finalização

| Agent | Aguarda | Objetivo |
|-------|---------|----------|
| **018** | Todos (001–017) | Integration QA + critérios de aceite |

---

## Mapa de Dependências

```
001 ──┬──► 002
      ├──► 003
      ├──► 004
      └──► 005

006 ──────► 007

009 ──┬──► 010 ──► 011 ──► 013
      └──────────► 011        ▲
                              │
012 ──────────────────────────┘

014 ──────► 015

016 ──────► 017

[001–017 completos] ──► 018
```

---

## Subagentes

| # | Nome | Depende de | Paralelo com |
|---|------|-----------|--------------|
| 001 | Asset Spec & Prompts | — | 006, 008, 009, 012, 014, 016 |
| 002 | Character Sprites | 001 | 003, 004, 005 |
| 003 | Weapon Icons | 001 | 002, 004, 005 |
| 004 | Item Icons | 001 | 002, 003, 005 |
| 005 | Craft & Material Icons | 001 | 002, 003, 004 |
| 006 | Power Meter HUD | — | 001, 008, 009, 012, 014, 016 |
| 007 | Ghost Trace | 006 | 010, 015, 017 |
| 008 | Desktop Parity | — | todos da rodada 1 |
| 009 | ItemSlot + Tooltip | — | 001, 006, 008, 012, 014, 016 |
| 010 | Equipment + Inventory Grid | 009 | 002–005, 007, 015, 017 |
| 011 | Character Inventory Integration | 009, 010 | 002–005, 007, 015, 017 |
| 012 | Vault Backend | — | 001, 006, 008, 009, 014, 016 |
| 013 | Vault Frontend | 012, 011 | — |
| 014 | Map JSONs | — | 001, 006, 008, 009, 012, 016 |
| 015 | Map Assets | 014 | 002–007, 010, 017 |
| 016 | EventBus + HubScene Refactor | — | 001, 006, 008, 009, 012, 014 |
| 017 | AppComponent Overlay System | 016 | 002–007, 010, 015 |
| 018 | Integration QA | 001–017 | — |

Specs completos: `.ai-orchestration/agents/`

---

## Instruções de Execução

### Antes de cada agent:
1. Verificar `.ai-orchestration/AGENTS_QUEUE.md` — confirmar que agent está pronto
2. Confirmar que dependências estão concluídas (resumos `*-resumo.md`)
3. Ler o spec em `.ai-orchestration/agents/NNN-nome.md`

### Após cada agent:
1. Criar `.ai-orchestration/agents/NNN-nome-resumo.md`
2. Atualizar `ORCHESTRATION_STATE.md`
3. Atualizar `AGENTS_QUEUE.md`
4. Atualizar `FILES_CHANGED.md`
5. Atualizar `BUGS_AND_BLOCKERS.md` se necessário

### Para retomar após interrupção:
```
Leia .ai-orchestration/ORCHESTRATION_STATE.md e continue da "Próxima ação recomendada".
```

---

## Como lidar com bugs

| Severidade | Critério | Ação |
|------------|----------|------|
| CRÍTICO | Bloqueia próxima fase | Criar agent corretivo imediatamente, bloquear dependentes |
| IMPORTANTE | Deve ser corrigido antes do QA | Registrar, corrigir antes do Agent 018 |
| BAIXO | Cosmético / não bloqueia | Registrar, corrigir durante Agent 018 |

---

## Como lidar com conflitos

- Dois agents editando o mesmo arquivo: o segundo lê o estado atual antes de alterar
- Conflito de tipos TypeScript: resolver no agent que introduziu o tipo
- Build quebrado após merge: criar agent corretivo com escopo fechado

---

## Como finalizar

Após Agent 018 validar todos os critérios:
1. Criar `docs/implementations/2026-06-08-v1.2.0-assets-inventario-cofre-mapas.md`
2. Criar `COMO_JOGAR.md` para beta testers
3. Atualizar `implementation/CHANGELOG.md`
4. Atualizar `implementation/CURRENT_STATE.md`
5. Deletar `v1.2.0.md` da raiz (regra do projeto)
6. Commit: `feat: rune wars v1.2.0 — assets, inventário, cofre, mapas`
7. Remover `.ai-orchestration/`

---

## Critérios de Aceite Finais (v1.2.0.md seção 27)

- [ ] ~49 assets presentes sem placeholder
- [ ] Barra de força cresce visualmente ao segurar
- [ ] Linha ghost aparece após disparo
- [ ] Inventário grid 6×6 funcional + drag-drop com equipamento
- [ ] Cofre grid 6×10, depositar gratuito, retirar cobra taxa
- [ ] Retirar gold cobra exatamente 3%
- [ ] Cofre compartilhado entre personagens da mesma conta
- [ ] 5 mapas battle disponíveis (castle, plains + 3 novos)
- [ ] Cada mapa novo tem área escavável
- [ ] 8 spawn points funcionais nos mapas novos
- [ ] Desktop = playground (comportamento de tiro)
- [ ] Hub POIs abrem sem navegar fora do canvas
- [ ] `npm run build` passa frontend e backend
- [ ] TypeScript sem erros

---

*Plano criado em: 2026-06-08 | Spec: v1.2.0.md | 18 agents*
