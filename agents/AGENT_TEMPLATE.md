# Template de Skill — Rune Wars

Use este template para criar novas skills. Cada arquivo em `agents/` é uma skill especializada, não um agente genérico.

---

## Estrutura obrigatória de uma skill

```md
# Skill — [Nome]

## Identidade
[Quem é, o que faz, escopo exclusivo]

---

## Regras Globais
[Regras de código/análise aplicáveis a esta skill — extraídas de ~/ia/]

---

## Regras Específicas
[Regras da especialidade — estrutura de pastas, padrões técnicos, etc.]

---

## Contexto mínimo recomendado
[Quais arquivos consultar antes de agir]

---

## Saída obrigatória ao finalizar
[O que atualizar em implementation/ ou docs/]

## Checklist de conclusão
- [ ] Item verificável 1
- [ ] Item verificável 2
```

---

## Skills disponíveis

| Arquivo | Especialidade | Fase |
|---------|--------------|------|
| `dev-frontend.md` | Angular, Phaser 3, game-core TS, mobile | v0.1.0+ |
| `dev-backend.md` | NestJS, WebSocket, APIs REST | v0.9.0+ |
| `dev-mobile.md` | Touch controls, responsividade, performance mobile | v0.1.0+ |
| `devops.md` | Docker, docker-compose, CI/CD, infra | v0.1.0+ |
| `databaser.md` | PostgreSQL, TypeORM, migrations, índices | v0.9.0+ |
| `analista-de-desenvolvimento.md` | Arquitetura, contratos, riscos técnicos | Qualquer |
| `analista-de-design.md` | Game design, balanceamento, mapas, mecânicas | Qualquer |
| `analista-de-produto.md` | Jornada do jogador, MVP, retenção | Qualquer |
| `analista-de-qualidade.md` | QA, critérios de aceite, regressão | Qualquer |
| `analista-de-teste.md` | Planos de teste, casos críticos, bugs | Qualquer |
| `analista-sonoro.md` | Identidade sonora, SFX, integração Phaser | v0.4.0+ |
| `orquestrador-de-agentes.md` | Distribuir tarefas, sequenciar, consolidar | Qualquer |
| `orquestrador-de-spec.md` | Transformar decisões em docs, quebrar specs | Qualquer |
| `product-owner.md` | Critérios de aceite, priorização, anti-scope-creep | Qualquer |
| `ui-ux.md` | Interface mobile-first, HUD, fluxos de tela | Qualquer |

---

## Regra de ouro
Nunca envie o projeto inteiro para uma skill. Cada skill recebe apenas o contexto necessário para sua tarefa atual.

---

## Fontes de regras globais

As regras incorporadas nas skills vêm de:
- `~/ia/global.txt` — padrões de código globais (SOLID, Clean Code, etc.)
- `~/ia/frontend.txt` — estrutura Angular + boas práticas frontend
- `~/ia/backend.txt` — estrutura NestJS + boas práticas backend
- `~/ia/devops.txt` — infra, containers, CI/CD
