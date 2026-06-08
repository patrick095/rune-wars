# Implementar Tudo — v1.1.0: Floresta Rúnica

## Objetivo Geral
Substituir a tela inicial pós-login por um hub jogável e imersivo chamado **Floresta Rúnica**. O personagem aparece dentro do mundo em uma clareira mágica com 7 pontos de interesse (POIs) que representam as funcionalidades existentes do Rune Wars (PvP, Dungeon, Vila, Mercado, Ferreiro, Guilda, Academia). Nenhum sistema novo de gameplay é criado.

---

## Estratégia
- 7 agentes especializados com contexto mínimo e fechado
- Agente 033 valida rotas antes de qualquer implementação
- Agentes 034, 035, 036 (arte e áudio) podem rodar em paralelo com 033
- Agente 037 implementa a estrutura completa do hub
- Agente 038 aplica o art pass completo (arte, animações, estados visuais)
- Agente 039 valida tudo e registra bugs

---

## Fila de Execução

### Fase 1 — Preparação (solo, rápido)
- **033** — Hub Spec Validator *(obrigatório antes de 037)*

### Fase 2 — Arte + Áudio em Paralelo
Pode executar em paralelo (após 033, ou simultâneos com cautela):
- **034** — SVG Icons & UI Assets
- **035** — Background, POI & FX Assets
- **036** — Audio Spec & Placeholders

### Fase 3 — Core Implementation
Aguardar 033 finalizar antes de iniciar:
- **037** — Hub Angular/Phaser Core

> 037 pode rodar em paralelo com 034/035/036 desde que 033 esteja concluído

### Fase 4 — Art Pass
Aguardar 037 + 034 + 035 finalizarem:
- **038** — Hub Art Pass

### Fase 5 — QA e Validação Final
Aguardar 037 + 038 finalizarem:
- **039** — Hub QA

---

## Mapa de Dependências

```
033 ──────────────────────────────────────────► 037
033 ──► (034 paralelo)                          │
033 ──► (035 paralelo)                          │
033 ──► (036 paralelo)                          │
                                                │
034 ──────────────────────────────────► 038 ◄──┘
035 ──────────────────────────────────► 038
037 ──────────────────────────────────► 038
                                        │
                              037 ──► 039
                              038 ──► 039
```

---

## Subagentes

| # | Nome | Tipo | Depende de | Paralelo com |
|---|------|------|-----------|--------------|
| 033 | Hub Spec Validator | read-only | — | — |
| 034 | SVG Icons & UI Assets | art-director | 033 (opcional) | 035, 036 |
| 035 | Background, POI & FX Assets | art-director | 033 (opcional) | 034, 036 |
| 036 | Audio Spec & Placeholders | spec | 033 (opcional) | 034, 035 |
| 037 | Hub Angular/Phaser Core | frontend | 033 (obrigatório) | 034, 035, 036 |
| 038 | Hub Art Pass | art-director + frontend | 037, 034, 035 | — |
| 039 | Hub QA | qa | 037, 038 | — |

---

## Instruções de Execução

### Como executar cada agente
Abra um novo chat (ou continue este) e execute:
```
Leia .ai-orchestration/agents/0XX-nome-agente.md e siga a instrução de execução descrita no arquivo.
```

### Antes de cada agente
1. Verificar `.ai-orchestration/AGENTS_QUEUE.md` — confirmar que agente está pronto
2. Confirmar que dependências obrigatórias estão concluídas
3. Ler resumos das dependências em `.ai-orchestration/agents/`

### Após cada agente
Atualizar obrigatoriamente:
1. `.ai-orchestration/ORCHESTRATION_STATE.md`
2. `.ai-orchestration/AGENTS_QUEUE.md`
3. `.ai-orchestration/FILES_CHANGED.md`
4. `.ai-orchestration/BUGS_AND_BLOCKERS.md` (se bugs encontrados)

### Para retomar após interrupção
```
Leia .ai-orchestration/ORCHESTRATION_STATE.md e continue da "Próxima ação recomendada".
```

---

## Como lidar com bugs

### Classificação
- **CRÍTICO**: bloqueia próximas fases — interromper e criar subagente corretivo imediatamente
- **IMPORTANTE**: deve ser resolvido antes de 039 — criar subagente corretivo
- **BAIXO**: acumular e corrigir durante ou após 039

### Processo
1. Agente registra bug em `.ai-orchestration/BUGS_AND_BLOCKERS.md`
2. Orquestrador classifica e decide ação
3. CRÍTICO → sub-spec corretivo antes de avançar
4. IMPORTANTE → sub-spec corretivo antes de iniciar 039
5. BAIXO → listar para correção final

---

## Como lidar com conflitos

Arquivos com maior risco de conflito entre agentes:
- `hub.scene.ts` — 037 cria, 038 modifica
- `hub.component.scss` — 037 cria, 038 modifica

Regra: agente posterior lê o arquivo atual, faz merge consciente e registra decisão em `DECISIONS_LOG.md`.

---

## Como finalizar

Após Agente 039 concluir com todos os critérios PASS:

1. Criar resumo final em `docs/implementations/2026-06-08-v1.1.0-floresta-runica.md`
2. Atualizar `implementation/CHANGELOG.md`
3. Atualizar `implementation/CURRENT_STATE.md`
4. Atualizar `docs/09-menu-principal-ui-controles.md` com nova navegação hub
5. Deletar `v1.1.0.md` da raiz (regra do projeto)
6. Remover `.ai-orchestration/` após confirmar resumo permanente criado

---

## Sub-specs completos dos Agentes

Todos em `.ai-orchestration/agents/`:

| Arquivo | Conteúdo |
|---------|----------|
| [033-hub-spec-validator.md](.ai-orchestration/agents/033-hub-spec-validator.md) | Valida rotas reais, mapeamento POI → rota, read-only |
| [034-svg-icons.md](.ai-orchestration/agents/034-svg-icons.md) | Cria 8 ícones POI + 2 frames UI em SVG |
| [035-background-poi-assets.md](.ai-orchestration/agents/035-background-poi-assets.md) | Cria backgrounds, POIs, FX e player em SVG + ASSET_PROMPTS.md |
| [036-audio-spec.md](.ai-orchestration/agents/036-audio-spec.md) | Cria audio-config.ts e spec técnico de 15 sons |
| [037-hub-angular-phaser-core.md](.ai-orchestration/agents/037-hub-angular-phaser-core.md) | HubComponent + HubScene + câmera + POIs + dock + routing |
| [038-hub-art-pass.md](.ai-orchestration/agents/038-hub-art-pass.md) | Substitui placeholders, microanimações, estados POI, SCSS dock |
| [039-hub-qa.md](.ai-orchestration/agents/039-hub-qa.md) | QA completo: build, navegação, mobile, acessibilidade |

---

## Skill Art Director

Agentes 034, 035 e 038 operam com a skill Art Director (`agents/art-director.md`).

Regras obrigatórias:
1. Ler `docs/15-diretriz-arte.md` antes de qualquer decisão visual
2. Paleta: verde mágico `#4CAF50`, azul rúnico `#3A9AD9`, roxo arcano `#7B2FBE`, dourado antigo `#F4A226`, vermelho ofensivo `#E63946`
3. Leitura ≤ 1 segundo em mobile
4. Nunca realista, nunca infantil exagerado
5. Silhueta única e cor dominante própria por POI

---

## Critérios de Aceite Finais

- [ ] Após login, jogador é levado à Floresta Rúnica
- [ ] Personagem visível no hub
- [ ] 7 locais existem e são identificáveis
- [ ] Cada local navega para funcionalidade existente (sem sistema novo)
- [ ] Hub funciona em desktop e mobile
- [ ] Hover/tap/foco visual em todos os POIs
- [ ] Dock/atalhos rápidos como fallback
- [ ] Câmera com bounds 2200x900, follow lerp 0.08, pan suave
- [ ] Direção de arte cartoon fantasy premium 2D HD aplicada
- [ ] Legível em menos de 1 segundo
- [ ] `npm run build` passa sem erros
