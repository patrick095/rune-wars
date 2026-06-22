# 07 — Dungeons

## Conceito

Rune Wars possui uma dungeon principal estruturada por andares, estágios e dificuldades. O objetivo é concentrar os jogadores em um sistema expansível, com salas compartilhadas, progresso por dificuldade, portais de recompensa e batalhas client-side em Phaser.

## Arquitetura da v1.8.0

Lobby, salas, progresso e portais são coordenados pelo backend. A batalha de cada estágio roda no cliente, usando `DungeonScene`, `DungeonEngine`, mapas de terreno e conteúdo local de monstros.

Na v1.8.0 não há sincronização de combate co-op em tempo real; a sala e as recompensas são autoritativas no backend.

## Salas

As salas de dungeon seguem o padrão do PvP:

- Lista de salas com andar, dificuldade, status e quantidade de jogadores.
- Criar sala escolhendo andar e dificuldade.
- Até 4 jogadores por sala.
- Entrada bloqueada quando a sala está cheia, em batalha ou em seleção de portal.
- Dono da sala pode alterar andar e dificuldade antes do início.
- Jogadores escolhem consumíveis e marcam PRONTO.
- Dono inicia o estágio quando a party estiver preparada.

Entre estágios, a sala volta para estado de regroup para ajustes de equipamento, consumíveis e inventário.

## Gate de Andar

O progresso é salvo por dificuldade.

Para acessar o Andar 2 em uma dificuldade, o personagem precisa ter vencido o Andar 1 naquela mesma dificuldade.

O campo `cleared_by_difficulty` registra o maior andar concluído por trilha:

- `easy`
- `medium`
- `hard`
- `heroic`

## Dificuldades

As dificuldades atuais são:

| Dificuldade | Multiplicador de HP/Dano | Padrão de boss |
|---|---:|---|
| Fácil | x1.0 | Fase 1 |
| Médio | x1.5 | Fases 1 + 2 |
| Difícil | x3.0 | Fases 1 + 2 + 3 |
| Heroico | x7.0 | Começa em padrão avançado |

Internamente, elas mapeiam para as trilhas legadas `initiates`, `adventurers`, `champions` e `heroes`.

## Andar 1 — Entrada da Caverna

Tema: caverna rúnica em tons marrons, com obstáculos rochosos e ameaça de morcegos.

### Estágio 1 — Entrada da Caverna

- Tipo: travessia.
- Objetivo: alcançar o portal de saída.
- Função: ensinar leitura de terreno, deslocamento e obstáculos.

### Estágio 2 — Salão dos Morcegos

- Tipo: boss.
- Boss: Morcego Gigante.
- Mecânicas: padrões por dificuldade, ataques ácidos e pressão de posicionamento.

## Andar 2 — Floresta Subterrânea

Tema: transição de caverna para raízes corrompidas, cristais místicos e energia roxa/vermelha.

### Estágio 1 — Besouro Místico

- Tipo: proteção.
- Objetivo: proteger o NPC Besouro Místico por 10 turnos.
- Inimigos: morcegos ácidos em ondas.

### Estágio 2 — Raízes Corrompidas

- Tipo: derrotar todos.
- Objetivo: eliminar 10 inimigos.
- Inimigos: besouros corrompidos e morcegos ácidos.

### Estágio 3 — Câmara do Treant

- Tipo: boss.
- Boss: Treant da Corrupção.
- Mecânicas: stomp em área, explosões de raiz, invocação e golpe de alto impacto conforme fase/dificuldade.

## Enemy Phase

Monstros agem em lote durante a fase inimiga. A resolução é sequencial rápida no cliente, com pequena cadência visual entre inimigos, e depois o turno volta ao jogador.

## Portais de Recompensa

Ao fim de cada estágio normal, a sala gera 8 portais e cada jogador escolhe 1.

Ao fim de boss, a sala gera 16 portais e cada jogador escolhe 2.

Ao fim de PvP, a sala gera 8 portais e cada jogador escolhe 1.

Há timer de 10 segundos e seleção automática quando o jogador não escolhe a tempo. O backend mantém o contexto autoritativo, concede ouro, itens ou pedras e retorna o reveal/ganhos.

## Recompensas

Dungeons entregam:

- Ouro.
- Equipamentos de raridade por dificuldade.
- Pedras de aprimoramento.
- Progresso de gate por dificuldade.

Heroico não dropa em portal; itens Heroicos vêm do craft.

## Conteúdo Futuro

Andares 3 a 5 permanecem no roadmap. A estrutura de sala, gate, conteúdo por estágio, mapas e portais já permite adicionar novos andares sem reescrever o fluxo base.
