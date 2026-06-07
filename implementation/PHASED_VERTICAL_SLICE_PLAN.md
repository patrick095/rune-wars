# Rune Wars — Plano de Implementação Testável v1.2

Objetivo: implementar Rune Wars de forma incremental, sempre com algo jogável ao final de cada fase.

## Fase 0 — Setup Jogável Local
Meta: abrir o jogo no navegador com Angular + Phaser.

Entregáveis:
- projeto Angular criado;
- Phaser integrado em uma rota `/playground`;
- canvas responsivo mobile/desktop;
- tela de debug inicial;
- personagem e inimigo desenhados de forma simples;
- botão para reiniciar partida.

Critério de aceite:
- roda no navegador desktop;
- roda no navegador mobile;
- sem backend obrigatório.

## Fase 1 — Tiro, Vento e IA Local
Meta: simular PvP contra IA.

Entregáveis:
- turno do jogador;
- turno da IA;
- ângulo;
- força;
- vento mudando todo turno;
- tiro parabólico;
- dano básico;
- HP;
- vitória/derrota.

Debug obrigatório:
- alterar vento;
- alterar HP;
- alterar dano da arma;
- resetar partida.

## Fase 2 — Terreno Destrutível e Indestrutível
Meta: validar o principal diferencial do jogo.

Entregáveis:
- mapa com material destrutível;
- mapa com material indestrutível com textura visual distinta;
- explosão removendo terreno destrutível;
- indestrutível não sofre dano;
- personagens se reposicionam conforme terreno.

## Fase 3 — Armas e Física por Arma
Meta: cada arma ser diferente de verdade.

Entregáveis mínimos:
- Canhão;
- Arco Longo;
- TNT;
- Boomerangue;
- Livro de Gelo;
- Poções.

Cada arma deve ter:
- peso/gravity scale;
- sensibilidade ao vento;
- dano;
- área de impacto;
- som temporário ou placeholder;
- descrição no painel de debug.

## Fase 4 — Personagem Customizável e Atributos
Meta: testar builds sem login e sem banco.

Entregáveis:
- painel para editar level;
- editar Força, Agilidade, Vitalidade e Sorte;
- recalcular dano, defesa, HP, mobilidade e chance de efeito rúnico;
- salvar configuração no localStorage;
- presets: DPS, Tank, Sorte, Escavador, Engenheiro.

## Fase 5 — Efeitos Rúnicos
Meta: crítico vira efeito especial, não só dano.

Entregáveis:
- chance de efeito baseada em Sorte;
- sangramento;
- gelo/imobilização;
- cegueira/simulação visual;
- redução de força do tiro;
- bloqueio de consumíveis;
- teleporte aleatório.

## Fase 6 — Itens Secundários e Consumíveis
Meta: aumentar estratégia de PvP.

Itens secundários:
- Escudo;
- Livro de Cura;
- Orbe de Camuflagem;
- Totem de Proteção;
- Kit/Construtor Rúnico.

Consumíveis:
- Teleporte;
- Teleporte Aliado;
- Cura individual;
- Cura em massa;
- Mira/Disparo de Calibração;
- Gelo;
- Invisibilidade.

Regra:
- máximo 3 consumíveis por partida;
- consumível com projétil consome turno;
- cura individual não consome turno.

## Fase 7 — Construção de Terreno
Meta: validar Engenheiro.

Entregáveis:
- linha rúnica gerando terreno onde o projétil passa;
- bloco rúnico fixo ao primeiro impacto;
- terreno criado não sofre gravidade;
- terreno criado pode ser destruído;
- limite de construção por jogador.

## Fase 8 — Academia
Meta: permitir aprender e testar armas.

Entregáveis:
- campo de tiro;
- escolha livre de arma;
- escolha de vento;
- alvos fixos e móveis;
- tutorial visual de ângulo/força;
- modo treino sem derrota.

## Fase 9 — Dungeon Local Simulada
Meta: PvE testável antes de backend.

Entregáveis:
- 1 andar completo local;
- objetivo + boss;
- IA simples de monstros;
- sala/lobby entre fases;
- trocar armas/itens no lobby;
- dificuldade/trilha simples.

## Fase 10 — Backend Mínimo
Meta: persistência básica.

Entregáveis:
- NestJS;
- PostgreSQL;
- personagem local/persistido;
- inventário simples;
- salvar build;
- salvar progresso de dungeon.

## Fase 11 — Multiplayer PvP
Meta: PvP real.

Entregáveis:
- WebSocket;
- sala 1v1;
- servidor autoritativo para turno, vento, dano e terreno;
- reconexão básica;
- replay/debug de eventos da partida.

## Fase 12 — Sistemas Avançados
Depois do core divertido:
- ranqueado individual;
- ranqueado duplas;
- PvP guilda até 4v4;
- guildas;
- mercado;
- craft;
- upgrade;
- rankings;
- dungeons completas.
