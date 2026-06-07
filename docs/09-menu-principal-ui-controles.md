# 09 — Menu Principal, UI, Mobile e Controles

## Plataforma

Rune Wars será mobile-first.

Também deve rodar no computador via navegador.

Stack planejada:

- Angular para telas, menus, conta, inventário, mercado, guilda, craft, rankings e lobby.
- Phaser para gameplay PvP/dungeon, física, mapa, terreno e combate.
- NestJS no backend.

## Menu principal

O menu principal deve ser uma floresta mágica navegável/visual.

Elementos principais:

### Montanha — Dungeon

Entrada da dungeon na montanha.

Acesso a:

- Seleção de andar.
- Seleção de trilha.
- Lobby da dungeon.
- Ranking PvE.

### Arena — PvP

Área visual de arena.

Acesso a:

- PvP solo ranqueado.
- PvP dupla ranqueado.
- PvP de guildas.
- PvP personalizado/não ranqueado.

### Vila

Centro social/econômico.

Acesso a:

- Guildas.
- Mercado.
- Ferreiro.
- Craft.
- Banco.
- Loja cosmética futura.
- NPCs.

### Academia

Área de treinamento.

Acesso a:

- Campo de tiro.
- Treino por arma.
- Simulador de vento.
- Tutorial de escavação.
- Tutorial de construção.
- Teste de consumíveis.

## Mobile

A interface deve priorizar:

- Botões grandes.
- Personagens legíveis.
- HUD limpo.
- Informações recolhíveis.
- Poucos elementos pequenos.

Controles mobile:

- Botões de movimento.
- Controle de ângulo.
- Controle de força.
- Botão de disparo.
- Acesso rápido a 3 consumíveis.
- Troca/uso de item secundário.

## Navegador desktop

Controles sugeridos:

- Setas/A-D: movimento.
- Cima/baixo: ângulo.
- Espaço: carregar/atirar.
- Números: consumíveis.
- Letras: atalhos de armas/ações.
- Mouse/toque: interação com menus.

## Academia

A academia é essencial porque cada arma possui física própria.

Funcionalidades:

- Treino de ângulo e força.
- Comparação entre armas.
- Simulação de vento.
- Treino de boomerangue/TNT/teleporte.
- Treino de construção rúnica.
- Treino contra bot.

Regra de design:

> Cada arma deve ser aprendida, não apenas equipada.
