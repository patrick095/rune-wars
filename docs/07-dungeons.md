# 07 — Dungeons

## Conceito

Rune Wars terá uma dungeon principal estruturada por andares e trilhas de dificuldade.

O foco é concentrar os jogadores em um único sistema expansível, evitando dezenas de dungeons abandonadas.

## Estrutura geral

- O jogador começa podendo entrar apenas no Andar 1.
- Para acessar o Andar 2, precisa concluir o Andar 1.
- Cada andar possui pelo menos duas fases: uma fase de objetivo e uma fase de chefão.
- Andares mais altos podem ter subchefes e mais fases.
- Grupo de até 8 jogadores.
- Ao criar uma sala, os jogadores entram em um lobby da dungeon.
- No lobby, podem trocar armas, armaduras, consumíveis, itens secundários e estratégia.
- Ao iniciar uma fase, o grupo fica nela até vencer ou perder.
- Ao final de cada fase, o grupo retorna ao lobby para se preparar para a próxima.

## Trilhas de dificuldade

As trilhas usam os mesmos andares, porém alteram força, inteligência dos monstros, mecânicas e recompensas.

### Trilha dos Iniciados

- IA básica.
- Chefes com poucas mecânicas.
- Ideal para aprender.

### Trilha dos Aventureiros

- IA intermediária.
- Chefes com mudança de padrão ao chegar em 50% de vida.

### Trilha dos Campeões

- IA avançada.
- Monstros priorizam alvos, usam terreno e combinam efeitos.
- Chefes mudam em 50% e 10% de vida.

### Trilha dos Heróis

- IA máxima.
- Chefes com múltiplas fases, invocações, destruição de terreno e padrões adaptativos.
- Recompensas superiores.

## Andares iniciais — v1.0

### Andar 1 — Cavernas dos Iniciados

Tema: caverna rúnica inicial.

Fases:

1. Entrada da Caverna
   - Objetivo: derrotar criaturas simples e atravessar pequenos obstáculos.
   - Ensina movimentação, vento, tiro e terreno destrutível.

2. Salão dos Morcegos
   - Objetivo: proteger um cristal por alguns turnos.
   - Estratégia: tank, controle de área e posicionamento.

3. Covil do Golem Menor
   - Chefão: Golem Menor.
   - Mecânica: ataques lentos, pedras caindo e cobertura destrutível.

Estratégia central: aprendizado das mecânicas base.

### Andar 2 — Minas Perdidas

Tema: minas antigas e cristais instáveis.

Fases:

1. Túneis Instáveis
   - Objetivo: abrir caminho até uma saída bloqueada.
   - Estratégia: escavador e TNT.

2. Câmara de Cristais
   - Objetivo: destruir cristais corrompidos enquanto monstros aparecem.
   - Estratégia: divisão de funções e dano em área.

3. Mestre Escavador
   - Chefão: criatura que escava e derruba plataformas.
   - Em dificuldades altas, cria túneis e tenta separar o grupo.

Estratégia central: escavação e controle de mapa.

### Andar 3 — Floresta Corrompida

Tema: raízes, veneno e terreno vivo.

Fases:

1. Bosque Envenenado
   - Objetivo: sobreviver e destruir fontes de veneno.
   - Estratégia: cura, vitalidade e posicionamento.

2. Raízes Aprisionadoras
   - Objetivo: escoltar um NPC preso por raízes.
   - Estratégia: proteção, construção de terreno e cura.

3. Guardião Corrompido
   - Chefão: árvore viva que usa veneno, raízes e cobertura.
   - Em 50%, espalha veneno no mapa.
   - Em 10%, invoca raízes e reduz áreas seguras.

Estratégia central: suporte, antiveneno, cura e construção defensiva.

### Andar 4 — Fortaleza Rúnica

Tema: castelo mágico antigo.

Fases:

1. Muralhas da Fortaleza
   - Objetivo: invadir atravessando defesas e torres.
   - Estratégia: precisão, cobertura e boomerangue.

2. Pátio dos Sentinelas
   - Objetivo: derrotar ondas de guardiões.
   - Estratégia: tank e DPS coordenado.

3. Comandante Rúnico
   - Subchefe: usa escudo, desarme e bloqueio de itens.

4. Trono Rúnico
   - Chefão: alterna defesa física e mágica.
   - Exige troca de armas/builds entre fases.

Estratégia central: adaptação entre dano físico, mágico e misto.

### Andar 5 — Núcleo do Caos

Tema: magia instável, teleporte e runas caóticas.

Fases:

1. Portal Instável
   - Objetivo: ativar cristais em ordem enquanto o mapa muda.
   - Estratégia: mobilidade, teleporte e construção.

2. Câmara das Runas
   - Objetivo: sobreviver a padrões de ataques rúnicos.
   - Estratégia: leitura, defesa e coordenação.

3. Coração do Caos
   - Subchefe: alterna debuffs, cegueira e deslocamentos.

4. Avatar do Caos
   - Chefão final do ciclo inicial.
   - Em 50%, altera gravidade/vento.
   - Em 10%, destrói partes do mapa e força reconstrução estratégica.

Estratégia central: domínio completo de todas as mecânicas.

## IA e fases dos monstros

Monstros e chefes podem mudar comportamento por vida:

- 100% a 50%: fase normal.
- 50% a 10%: fase avançada.
- 10% a 0%: fase desesperada.

Em dificuldades mais altas, a IA pode:

- Priorizar healer.
- Usar cobertura.
- Escavar.
- Evitar áreas perigosas.
- Forçar reposicionamento.
- Reagir a estratégias repetidas.

## Recompensas

Dungeons entregam:

- XP individual.
- XP de guilda quando houver membros suficientes da mesma guilda.
- Ouro.
- Materiais.
- Equipamentos.
- Armaduras para uso ou desmontagem.
- Pedras/fragmentos indiretos via desmontagem.
- Itens raros em dificuldades maiores.
