# Rune Wars Spec v1.2

Rune Wars é um MMORPG 2D mobile-first focado em batalhas PvP por turnos estilo Gunbound/DDTank, com fantasia, física de projéteis, terreno destrutível/construível, dungeons, guildas, craft e economia.

## Objetivo deste pacote
Servir como base de implementação do Rune Wars usando Claude/Codex/agentes de IA com:

1. projeto sempre funcionando;
2. economia máxima de tokens;
3. agentes especializados;
4. contexto mínimo por tarefa;
5. continuidade mesmo se acabar limite de tokens.

## Pastas

- `docs/` — Game Design, sistemas e arquitetura.
- `agents/` — skills/agentes especializados.
- `implementation/` — estado atual, plano, regras de IA e continuidade.
- `system/backend/` — backend da aplicação, APIs, regras de servidor, integrações e serviços internos.
- `system/frontend/` — frontend para navegador, incluindo interface web, cliente do jogo e assets usados pelo cliente.
- `devops/` — infraestrutura do projeto, Docker, compose, scripts de ambiente, banco de dados, Redis, cache, filas e serviços auxiliares.

## Organização obrigatória da implementação

Todo código de backend deve ser implementado dentro de `system/backend/`.
Todo código de frontend para navegador deve ser implementado dentro de `system/frontend/`.
Toda configuração de infraestrutura deve ficar em `devops/`, incluindo Docker, Docker Compose, banco de dados, Redis, cache e demais serviços de suporte.

O projeto inteiro deve rodar via Docker. Backend, frontend, banco de dados, Redis, cache e qualquer outro serviço necessário devem ter configuração versionada em `devops/`, permitindo subir o ambiente completo sem depender de serviços instalados diretamente na máquina do desenvolvedor.

## Ordem recomendada de leitura

1. `implementation/AI_IMPLEMENTATION_RULES.md`
2. `implementation/PHASED_VERTICAL_SLICE_PLAN.md`
3. `implementation/CONTEXT_ROUTING.md`
4. `implementation/CURRENT_STATE.md`
5. `implementation/NEXT_STEPS.md`
6. Specs específicos da fase atual em `docs/`

## Importante
Não tente implementar tudo de uma vez.

Primeiro objetivo real:
- Angular + Phaser rodando;
- PvP local contra IA;
- mobile-first;
- física divertida;
- terreno destrutível/construível;
- personagem customizável para testes.

Usuários, guildas, mercado e economia real ficam para depois.
