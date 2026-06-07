# 13 — Áudio e Sonorização

## Decisão central

Áudio é parte essencial da identidade do Rune Wars. Nenhuma ação importante deve acontecer sem feedback sonoro.

O objetivo é criar uma identidade sonora memorável, mesmo com baixo custo inicial.

## Estratégia de baixo custo

No MVP/Alpha, utilizar sons gratuitos com licença segura, preferencialmente CC0, de fontes como Kenney, OpenGameArt e bibliotecas próprias editadas no Audacity.

No Beta, priorizar produção/customização dos sons mais importantes:

- Disparo das armas principais.
- Impacto e explosões.
- Efeitos rúnicos.
- Sucesso/falha de craft.
- Item +10.
- Vitória/derrota.
- Música do menu principal.
- Música PvP.
- Música dungeon.

## Identidade sonora por arma

Cada arma deve ter som próprio e reconhecível.

### Exemplos

- Canhão: carregamento pesado, disparo grave, impacto forte e eco.
- Arco Longo: tensionamento da corda, flecha cortando vento, impacto leve.
- Besta: clique mecânico, disparo seco, perfuração.
- Mosquete: estouro seco, fumaça, recuo.
- TNT: pavio, tensão curta, explosão grande.
- Boomerangue: whoosh circular e retorno.
- Poções: vidro, líquido, explosão química.
- Livro de Fogo: conjuração arcana e chama.
- Livro de Gelo: cristalização e estalo gelado.
- Livro das Sombras: som abafado, distorcido, misterioso.
- Orbe de Camuflagem: energia suave, distorção.
- Totem de Proteção: invocação, impacto bloqueado.
- Kit/Construtor Rúnico: criação mágica de terreno, som de runas surgindo.

## Sons de progressão

### Craft

- Início do craft.
- Sucesso comum.
- Sucesso raro.
- Sucesso épico/lendário.
- Falha de craft.

A falha deve soar como “quase conseguiu”, não como punição extrema.

### Upgrade

- Tentativa de upgrade.
- Sucesso +1 a +4: som simples.
- Sucesso +5 a +9: som mais forte.
- Sucesso +10: som único, memorável e raro.
- Falha de upgrade: som de energia se dissipando.

## Efeitos rúnicos

Cada efeito precisa de áudio próprio:

- Sangramento.
- Envenenamento.
- Cegueira.
- Imobilização.
- Sem mira.
- Perda de força.
- Teleporte aleatório.
- Bloqueio de itens.
- Vulnerabilidade.

## Ambientes

### Menu principal — Floresta Mágica

- Vento leve.
- Pássaros.
- Água.
- Sons mágicos sutis.

### Vila

- Ferreiro martelando.
- Mercado.
- NPCs ao fundo.
- Portas, baús, interface.

### Arena PvP

- Multidão distante.
- Tambores leves.
- Energia de combate.

### Dungeon

- Eco.
- Runas.
- Som ambiente escuro.
- Chefes com temas específicos.

## Música dinâmica em chefes

Chefes podem alterar música ao mudar de fase:

- 100% a 50%: tema base.
- 50% a 10%: tema mais intenso.
- 10% a 0%: tema crítico/final.

## Regra de implementação

Criar um `AudioManager` central no frontend para:

- Carregar sons por categoria.
- Controlar volume global, música, efeitos e interface.
- Aplicar variação de pitch/volume para reduzir repetição.
- Mapear som por arma, efeito, ação e ambiente.
