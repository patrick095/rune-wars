# 11 — Roadmap

## Objetivo do roadmap

Organizar o desenvolvimento do Rune Wars em fases realistas.

## Fase 0 — Protótipo técnico

Objetivo:

Validar se Angular + Phaser + NestJS funciona bem para o núcleo do jogo.

Entregas:

- Projeto Angular integrado com Phaser.
- Backend NestJS com WebSocket.
- Mapa 2D simples.
- Personagem se movendo.
- Tiro com ângulo e força.
- Vento básico.
- Dano simples.
- Turnos 1v1.

## Fase 1 — MVP PvP 1v1

Objetivo:

Criar primeira versão jogável do PvP.

Entregas:

- Login simples.
- Criação de personagem.
- 4 atributos.
- PvP 1v1 casual.
- 3 a 5 armas.
- Terreno destrutível simples.
- Vento por turno.
- HP/dano.
- Consumíveis básicos.
- Matchmaking simples.

## Fase 2 — Progressão básica

Entregas:

- XP.
- Level até 100.
- 4 pontos por nível.
- Inventário.
- Equipar armas/armaduras.
- Requisitos de armas.
- Acessórios simples.
- Ranking básico.

## Fase 3 — Economia e craft

Entregas:

- Mercado.
- Craft.
- Desmontagem de itens.
- Pedras.
- Upgrade de equipamentos.
- Raridades.
- Itens transferíveis/vinculados/não transferíveis.

## Fase 4 — PvP ranqueado

Entregas:

- Ranqueado individual.
- Ranqueado em duplas.
- Rankings diário/semanal/mensal/geral.
- Matchmaking por ranking e força de combate.
- Recompensas controladas.

## Fase 5 — Dungeons v1

Entregas:

- Dungeon principal.
- 5 andares iniciais.
- Trilhas de dificuldade.
- Lobby de dungeon até 8 jogadores.
- Fases por andar.
- Chefes multifase.
- Recompensas PvE.

## Fase 6 — Guildas

Entregas:

- Criação de guilda.
- Membros e cargos.
- Chat de guilda.
- XP da guilda.
- Banco da guilda.
- Construções iniciais.
- Bônus PvE.

## Fase 7 — PvP de Guildas

Entregas:

- PvP de guildas até 4v4.
- Ranking de guildas.
- Recompensas cosméticas.
- Eventos de guilda.

## Fase 8 — Academia

Entregas:

- Treino de tiro.
- Treino de vento.
- Treino de armas.
- Treino de consumíveis.
- Treino de escavação.
- Treino de construção.

## Pós-lançamento

Possibilidades:

- Novos andares.
- Novas armas.
- Novas raças.
- Novos mapas PvP.
- Eventos sazonais.
- Boss mundial.
- Mais sistemas de guilda.
- Cosméticos.
- Passe não pay-to-win.

---

# Ajuste v1.2 — Roadmap Orientado a IA e Testabilidade

## Prioridade das primeiras fases
O início do desenvolvimento deve priorizar um jogo local testável, sem depender de login, backend, guildas ou mercado.

## Primeiro objetivo jogável
- Angular + Phaser funcionando.
- PvP local contra IA.
- Vento por turno.
- Tiro parabólico.
- HP e vitória/derrota.
- Terreno destrutível e indestrutível.
- Painel de debug/customização.

## Customização inicial obrigatória
Desde as primeiras fases, o jogo deve permitir alterar livremente:
- level;
- Força;
- Agilidade;
- Vitalidade;
- Sorte;
- arma;
- item secundário;
- consumíveis;
- mapa;
- vento;
- comportamento da IA.

O objetivo é permitir testar e se divertir ao final de cada etapa, mesmo antes de existir progressão real.

## Sistemas adiados para fases finais
- Autenticação completa.
- Usuários reais.
- Guildas persistentes.
- Mercado.
- Economia global.
- Rankings persistentes.
- Craft persistente.

Esses sistemas só entram depois que o core gameplay estiver validado.
