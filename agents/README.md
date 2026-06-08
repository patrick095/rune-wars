# Rune Wars — Skills v2.0

Esta pasta contém **skills especializadas** para implementar Rune Wars com economia máxima de tokens. Cada arquivo é uma skill completa com identidade, regras globais, regras de especialidade, contexto mínimo e checklist de conclusão.

## Princípio central
Cada skill recebe apenas o contexto necessário para a tarefa atual. Nunca o projeto inteiro.

## Skills disponíveis

### Implementação
| Skill | Arquivo | Escopo | Fase |
|-------|---------|--------|------|
| Dev Frontend | `dev-frontend.md` | Angular + Phaser + game-core TS | v0.1.0+ |
| Dev Backend | `dev-backend.md` | NestJS + WebSocket + APIs | v0.9.0+ |
| Dev Mobile | `dev-mobile.md` | Touch controls + responsividade | v0.1.0+ |
| DevOps | `devops.md` | Docker + infra + CI/CD | v0.1.0+ |
| Databaser | `databaser.md` | PostgreSQL + TypeORM + migrations | v0.9.0+ |

### Análise
| Skill | Arquivo | Responsabilidade |
|-------|---------|-----------------|
| Analista de Desenvolvimento | `analista-de-desenvolvimento.md` | Arquitetura, contratos, riscos |
| Analista de Design | `analista-de-design.md` | Game design, balanceamento, mapas |
| Analista de Produto | `analista-de-produto.md` | Jornada do jogador, MVP, retenção |
| Analista de Qualidade | `analista-de-qualidade.md` | QA, critérios de aceite, regressão |
| Analista de Teste | `analista-de-teste.md` | Planos de teste, casos críticos, bugs |
| Analista Sonoro | `analista-sonoro.md` | SFX por arma/ação, integração Phaser |

### Produto e Orquestração
| Skill | Arquivo | Responsabilidade |
|-------|---------|-----------------|
| Product Owner | `product-owner.md` | Critérios de aceite, anti-scope-creep |
| UI/UX | `ui-ux.md` | Interface mobile-first, HUD, fluxos |
| Orquestrador de Agentes | `orquestrador-de-agentes.md` | Distribuir tarefas, sequenciar, paralelizar |
| Orquestrador de Spec | `orquestrador-de-spec.md` | Transformar decisões em docs |

## Mapeamento skill × agente de orquestração

| Agente (.ai-orchestration) | Skills usadas |
|---------------------------|--------------|
| 001-v010-devops-setup | `devops` |
| 002-v010-angular-phaser | `dev-frontend`, `dev-mobile` |
| 003-v020-game-logic | `dev-frontend` |
| 004-v020-ai-battle | `dev-frontend`, `dev-mobile`, `ui-ux` |
| 005-v030-terrain-engine | `dev-frontend` |
| 006-v030-terrain-render | `dev-frontend`, `dev-mobile` |
| 007-v040-weapon-system | `dev-frontend` |
| 008-v040-weapon-phaser | `dev-frontend`, `analista-sonoro` |
| 009-v050-attribute-system | `dev-frontend` |
| 010-v050-character-ui | `dev-frontend`, `ui-ux`, `dev-mobile` |
| 011-v060-runic-system | `dev-frontend` |
| 012-v060-items-consumables | `dev-frontend`, `ui-ux` |
| 013-v070-terrain-construction | `dev-frontend` |
| 014-v070-academy | `dev-frontend`, `ui-ux`, `dev-mobile` |
| 015-v080-dungeon-engine | `dev-frontend`, `analista-de-design` |
| 016-v080-dungeon-ai | `dev-frontend`, `analista-de-design` |
| 017-v080-dungeon-ui | `dev-frontend`, `ui-ux` |
| 018-v090-devops | `devops` |
| 019-v090-backend-auth-char | `dev-backend`, `databaser` |
| 020-v090-backend-battle | `dev-backend` |
| 021-v090-frontend-auth | `dev-frontend`, `ui-ux` |
| 022-v090-frontend-pvp | `dev-frontend` |
| 023-v100-progression | `dev-backend`, `databaser` |
| 024-v100-inventory | `dev-backend`, `databaser` |
| 025-v100-ranked-pvp | `dev-backend` |
| 026-v100-rankings | `dev-backend` |
| 027-v100-dungeon-floors | `dev-backend`, `analista-de-design` |
| 028-v100-craft-upgrade | `dev-backend`, `databaser` |
| 029-v100-market | `dev-backend`, `databaser` |
| 030-v100-guilds | `dev-backend` |
| 031-v100-frontend-screens | `dev-frontend`, `ui-ux`, `dev-mobile` |
| 032-v100-qa-consolidation | `analista-de-qualidade`, `analista-de-teste` |

## Fluxo recomendado de uso
1. `orquestrador-de-agentes` lê `.ai-orchestration/ORCHESTRATION_STATE.md`.
2. Identifica próximos agentes da fila.
3. Para cada agente, carrega as skills indicadas na tabela acima.
4. Extrai apenas o contexto necessário do spec da versão.
5. Executa o agente com as skills + contexto mínimo.
6. Atualiza estado de orquestração.
7. Deleta `vX.Y.Z.md` após versão completa.

## Fontes das regras globais
- `~/ia/global.txt` — padrões de código (SOLID, Clean Code)
- `~/ia/frontend.txt` — estrutura Angular
- `~/ia/backend.txt` — estrutura NestJS
- `~/ia/devops.txt` — infra e containers
