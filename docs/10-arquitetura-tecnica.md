# 10 — Arquitetura Técnica

## Stack decidida

### Frontend

- Angular
- Phaser
- TypeScript

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Redis
- WebSocket

## Separação Angular + Phaser

Angular controla:

- Autenticação
- Menus
- Inventário
- Mercado
- Guildas
- Craft
- Rankings
- Lobby
- Perfil

Phaser controla:

- PvP
- Dungeon
- Física
- Renderização do combate
- HUD dentro da batalha
- Terreno
- Animações

## Backend autoritativo

O backend deve ser a fonte da verdade para:

- Dano
- Posição
- Vento
- Turnos
- Uso de itens
- Efeitos rúnicos
- Críticos
- Destruição de terreno
- Construção de terreno
- Recompensas
- Resultado da partida

O client pode prever visualmente, mas o servidor confirma.

## Comunicação em combate

Fluxo:

```text
Angular/Phaser
↓ WebSocket
NestJS Gateway
↓
Sala PvP/Dungeon
↓
Estado autoritativo
```

## Módulos backend sugeridos

- AuthModule
- AccountModule
- CharacterModule
- AttributeModule
- InventoryModule
- ItemModule
- EquipmentModule
- WeaponModule
- CraftModule
- UpgradeModule
- MarketModule
- GuildModule
- RankingModule
- MatchmakingModule
- BattleModule
- DungeonModule
- PvPModule
- EconomyModule
- AssetModule

## Banco de dados

PostgreSQL para:

- Usuários
- Personagens
- Atributos
- Inventário
- Itens
- Equipamentos
- Guildas
- Mercado
- Histórico
- Rankings
- Progresso de dungeon

Redis para:

- Salas em tempo real
- Matchmaking
- Estado temporário de partidas
- Locks
- Cache

## Entidades iniciais

### User

- id
- email/login
- senha/hash ou provedor
- createdAt

### Character

- id
- userId
- name
- race
- level
- xp
- strength
- agility
- vitality
- luck

### ItemInstance

- id
- ownerId
- itemBaseId
- rarity
- upgradeLevel
- boundType
- attributes
- createdAt

### WeaponBase

- id
- name
- hands
- damageType
- baseDamage
- physicsProfile
- runeEffect
- requirements

### Guild

- id
- name
- level
- xp
- bankSize
- technologies

### BattleRoom

- id
- type
- mode
- players
- state
- createdAt

### DungeonProgress

- characterId
- floor
- trail
- completed

## Estado de batalha

Deve conter:

- Jogadores
- Posições
- HP
- Status ativos
- Terreno
- Objetos construídos
- Vento
- Turno atual
- Tempo restante
- Projéteis ativos
- Histórico de ações

## Terreno

Precisa de uma representação eficiente.

Possibilidades:

- Grid de pixels/blocos.
- Máscara bitmap.
- Tilemap destrutível.
- Polígonos simplificados.

Para MVP, usar abordagem simples e evoluir.

## Segurança

- Nunca confiar no client para dano/recompensa.
- Validar ações no servidor.
- Impedir uso de item não equipado.
- Impedir movimentação inválida.
- Impedir alteração local de atributos.

## Assets

Assets podem ser hospedados em R2/S3/CDN.

Tipos:

- Sprites
- Mapas
- Ícones
- Sons
- Animações

## MVP técnico recomendado

1. Angular shell.
2. Login simples.
3. Personagem.
4. Lobby PvP.
5. Phaser com mapa 2D.
6. WebSocket.
7. Turnos.
8. Vento.
9. 3 armas.
10. Dano e HP.
11. Terreno destrutível simples.

---

# Ajuste v1.2 — Arquitetura para Implementação Incremental

## Fase inicial sem backend obrigatório
O jogo deve começar funcionando localmente no navegador, usando Angular + Phaser e estado em memória/localStorage.

## Backend entra depois
NestJS, PostgreSQL e Redis entram apenas quando o PvP local e o gameplay principal estiverem validados.

## Módulos locais iniciais sugeridos
- `game-core`: regras puras de turno, dano, vento e atributos.
- `projectile-physics`: física de projéteis.
- `terrain-engine`: terreno destrutível/construível.
- `weapon-system`: definições de armas.
- `debug-sandbox`: customização livre para testes.
- `ai-local`: IA simples para PvP local.

## Separação recomendada
Toda regra de jogo deve ser criada em TypeScript puro sempre que possível, sem depender diretamente do Phaser.

Phaser deve renderizar e capturar input, mas regras como dano, atributos, vento, efeitos rúnicos e validação de turno devem ficar isoladas.

Isso facilita:
- testes unitários;
- futura validação no backend;
- economia de tokens;
- manutenção por agentes diferentes.
