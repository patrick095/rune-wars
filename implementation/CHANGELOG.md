# Rune Wars — Changelog de Implementação

## v0.8.0 — 2026-06-07
- Adicionado `DungeonEngine` em TypeScript puro com fases, objetivos, vidas e recompensas locais.
- Adicionados mapas do Andar 1: Entrada da Caverna, Salão dos Morcegos e Covil do Golem Menor.
- Adicionado `MonsterAiSystem` com níveis EASY, INTERMEDIATE e BOSS.
- Adicionado Golem Menor com mudança de comportamento em 50% de HP.
- Adicionada `DungeonScene` em Phaser com batalha local, inimigos distintos, objetivo de proteção e evento de conclusão.
- Adicionada rota `/dungeon` com lobby entre fases, seleção de arma/item/consumível e telas de vitória/derrota.
- Adicionado `DungeonStorageService` para persistir `dungeon_progress` no `localStorage`.
- Corrigido spawn inicial de inimigos em `/playground` e `/dungeon` para não depender da largura bruta da tela como coordenada de mapa.
- Adicionados controles por teclado em `/playground` e `/dungeon`: setas esquerda/direita movem, cima/baixo ajustam ângulo continuamente e espaço dispara.
- Corrigida IA local em `/playground` para mirar por simulação de trajetória e corrigido reset de HP/turnos/efeitos ao clicar em "Jogar Novamente".
- Corrigidos ângulos quebrados por teclado, preview de trajetória instável e movimento no castelo que puxava o jogador para plataformas suspensas.
- IA local agora tenta reposicionar quando está sem tiro viável contra o jogador.
- Corrigido sumiço da linha de trajetória após "Jogar Novamente" recriando o indicador visual no reset da cena.

## v1.2 — 2026-06-07
- Ajustado o pacote para implementação 100% orientada por IA.
- Adicionadas regras de economia de tokens.
- Adicionado isolamento de contexto por agente.
- Adicionado plano de fases testáveis.
- Adicionado foco inicial em gameplay local antes de usuários/guildas/mercado.
- Adicionado requisito de painel debug/customização de personagem desde cedo.
- Atualizados agentes para funcionarem como especialistas com contexto mínimo.
