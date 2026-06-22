# 05 — Economia, Craft e Aprimoramento

## Filosofia econômica

Rune Wars deve ter uma economia forte entre jogadores. O jogo não deve vender diretamente os melhores itens; eles devem vir de dungeons, PvP, rankings, craft e mercado entre jogadores.

## Ouro

Cada personagem possui saldo de ouro persistido e começa com 0.

Ouro é ganho principalmente em portais de recompensa de PvP e dungeon. Ouro é gasto no Ferreiro, especialmente nas tentativas de aprimoramento de itens e pedras.

Saldo insuficiente bloqueia a tentativa antes de consumir insumos.

## Raridades

A v1.8.0 padroniza quatro tiers de raridade:

| Raridade | id | Bonus do status primário |
|---|---:|---:|
| Comum | `common` | 0% |
| Incomum | `uncommon` | 2% |
| Raro | `rare` | 4% |
| Heroico | `heroic` | 7% |

O bonus é aplicado ao status primário do item e aparece no combate. Itens Heroicos são exclusivos de craft; portais não dropam Heroico.

Valores legados `epic` e `legendary` são normalizados para o modelo atual.

## Ferreiro

O Ferreiro é a tela única para craft, desmontagem e aprimoramento. Ele usa sempre o personagem ativo, o inventário real e o ouro real do personagem.

As abas funcionais da v1.8.0 são:

- Craft
- Desmontagem
- Aprimoramento

A tela mantém espaço para abas futuras.

## Fragmentos

Fragmentos são materiais gerados pela desmontagem e usados no craft.

Tipos:

- `fragment_weapon`
- `fragment_armor`
- `fragment_head`
- `fragment_legs`
- `fragment_accessory`
- `fragment_secondary`

Cada fragmento carrega uma raridade (`common`, `uncommon` ou `rare`) e representa a categoria do equipamento desmontado.

## Craft

Craft combina 3 fragmentos da mesma categoria e mesma raridade para tentar criar um equipamento aleatório daquela categoria com raridade superior.

| Insumo | Resultado em sucesso | Chance |
|---|---|---:|
| 3 fragmentos Comuns | Item Incomum | 30% |
| 3 fragmentos Incomuns | Item Raro | 20% |
| 3 fragmentos Raros | Item Heroico | 10% |

Em sucesso, o equipamento é criado. Em falha, os 3 fragmentos são consumidos. Fragmentos Heroicos não são combináveis.

## Desmontagem

Desmontagem consome um equipamento e tenta gerar 1 fragmento da mesma categoria e raridade.

| Raridade do item | Chance de fragmento |
|---|---:|
| Comum | 70% |
| Incomum | 60% |
| Raro | 50% |

Itens Heroicos não podem ser desmontados na v1.8.0.

Em sucesso, o fragmento é criado. Em falha, o item ainda é consumido.

## Pedras de Aprimoramento

Existe um tipo principal de pedra: `enhancement_stone`. Ela pode ter nível +0 a +5, armazenado em `upgrade_level`.

Pedras podem ser obtidas em portais e também podem ser aprimoradas no Ferreiro.

## Aprimoramento de Pedras

| Resultado | Chance base | Custo |
|---|---:|---:|
| Pedra +1 | 80% | 1.000 ouro |
| Pedra +2 | 65% | 2.000 ouro |
| Pedra +3 | 50% | 4.000 ouro |
| Pedra +4 | 35% | 8.000 ouro |
| Pedra +5 | 20% | 10.000 ouro |

Cada tentativa usa 3 pedras do nível anterior. Em falha, as pedras e o ouro são consumidos.

## Aprimoramento de Equipamentos

Equipamentos podem ir de +0 a +10.

| Resultado | Pedra exigida | Chance base | Custo |
|---|---:|---:|---:|
| +1 | 3 pedras +0 | 80% | 1.000 ouro |
| +2 | 3 pedras +1 | 70% | 2.000 ouro |
| +3 | 3 pedras +2 | 60% | 4.000 ouro |
| +4 | 3 pedras +3 | 50% | 8.000 ouro |
| +5 | 3 pedras +4 | 40% | 16.000 ouro |
| +6 | 3 pedras +5 | 30% | 32.000 ouro |
| +7 | 3 pedras +5 | 25% | 65.000 ouro |
| +8 | 3 pedras +5 | 20% | 130.000 ouro |
| +9 | 3 pedras +5 | 15% | 250.000 ouro |
| +10 | 3 pedras +5 | 10% | 500.000 ouro |

Em falha, o item não quebra e não perde nível. Apenas pedras e ouro são consumidos.

## Sorte e Bonus Aditivos

A chance final usa:

`chanceFinal = chanceBase + bonusSorte + bonusRaca + bonusEvento + bonusGuild`

Na v1.8.0, Sorte usa `luck * 0.005`; bonus de raça, evento e guilda entram como hooks aditivos. A chance final é limitada a 100%.

## Mercado

Jogadores podem negociar equipamentos, materiais, pedras de aprimoramento, consumíveis e itens raros quando as regras de vínculo permitirem.

## Motivo do sistema

O sistema cria demanda constante por equipamentos dropados, fragmentos, pedras e ouro. Também abre espaço para papéis sociais como PvP player, artesão, coletor, comerciante e especialista em upgrade.
