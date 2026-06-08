# Rune Wars — Changelog de Implementação

## v1.2.0 — 2026-06-08
- Adicionados ~49 assets visuais placeholder (6 sprites de personagem 64×64, 6 ícones de arma, 5 secundários, 5 consumíveis, 10 equipment, 11 materiais) com specs de prompt IA para substituição futura.
- Implementado `PowerMeterHUD` como objeto Phaser nativo encapsulado em `system/frontend/src/game/hud/power-meter-hud.ts`.
- Implementado `GhostTrace` em `system/frontend/src/game/hud/ghost-trace.ts` — linha pontilhada da trajetória do último tiro, apaga no início do turno do jogador.
- Unificado InputController: DungeonScene e AcademyScene agora têm barra de força animada e controles de teclado idênticos à BattleScene.
- Adicionados componentes Angular standalone: `ItemSlotComponent`, `ItemTooltipComponent`, `EquipmentSlotsComponent`, `InventoryGridComponent`, `VaultGridComponent`, `LoadoutModalComponent`.
- Adicionados tipos `InventoryItem`, `ItemStats`, `ItemCategory`, `EquipmentSlotType` em `game-core/types.ts`.
- Integrado sistema de inventário no `CharacterComponent`: abas Personagem | Inventário | Cofre, drag-and-drop entre slots.
- Criado `InventoryService` com fallback mock para endpoints não disponíveis.
- Implementado Vault Backend completo: `VaultModule` NestJS com entidades, service, controller, 5 endpoints REST protegidos por JWT. Taxa: 3% para gold, 100 gold fixo para item.
- Criados 3 novos mapas battle em JSON: `deep_mines`, `arcane_ruins`, `runic_forest` (cada um com terreno escavável e 8 spawn points implícitos).
- Criado `GameEventBusService` — canal Angular/Phaser via `Subject<>`. HubScene emite eventos em vez de navegar.
- Implementado overlay system no `AppComponent`: renderiza telas Angular sobre canvas Phaser sem destruir a cena.

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
