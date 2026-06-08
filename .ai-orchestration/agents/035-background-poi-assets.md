# Sub-spec — Agente 035: Background, POI & FX Assets

## Objetivo
Criar todos os assets visuais de fundo (backgrounds), pontos de interesse (POIs) e efeitos (FX) do hub da Floresta Rúnica como placeholders CSS/SVG/Canvas altamente estilizados que comuniquem visualmente a identidade final, além de gerar prompts profissionais para geração de imagem dos assets finais.

## Identidade do Art Director
Este agente opera com plenas capacidades de Art Director. Antes de criar qualquer asset, consultar `docs/15-diretriz-arte.md`.

## Contexto mínimo necessário
- `docs/15-diretriz-arte.md` (paleta oficial, regras visuais)
- `agents/art-director.md` (skill do Art Director)
- `v1.1.0.md` seções 2, 4, 5, 12, 14 e 15 (spec visual completo dos locais e assets)

## Assets a criar

### Placeholders SVG para backgrounds (camadas parallax)
```
system/frontend/src/assets/hub/backgrounds/hub_forest_sky.svg
system/frontend/src/assets/hub/backgrounds/hub_forest_back_trees.svg
system/frontend/src/assets/hub/backgrounds/hub_forest_ground.svg
system/frontend/src/assets/hub/backgrounds/hub_forest_foreground_leaves.svg
```

### Placeholders SVG para POIs (pontos de interesse)
```
system/frontend/src/assets/hub/poi/poi_runic_tree.svg      (Centro — azul rúnico)
system/frontend/src/assets/hub/poi/poi_pvp_arena.svg       (Topo-centro — vermelho)
system/frontend/src/assets/hub/poi/poi_dungeon_entrance.svg (Topo-direita — roxo)
system/frontend/src/assets/hub/poi/poi_main_village.svg    (Baixo-centro — dourado)
system/frontend/src/assets/hub/poi/poi_market.svg          (Baixo-esquerda — dourado/bronze)
system/frontend/src/assets/hub/poi/poi_blacksmith.svg      (Baixo-direita — azul/dourado)
system/frontend/src/assets/hub/poi/poi_guild_hall.svg      (Topo-esquerda — verde/dourado)
system/frontend/src/assets/hub/poi/poi_academy.svg         (Extremo baixo-direita — azul)
```

### Placeholders SVG para personagem (hub idle/walk)
```
system/frontend/src/assets/hub/player/player_hub_idle.svg
system/frontend/src/assets/hub/player/player_hub_shadow.svg
```

### Arquivo de prompts para geração de imagem final
```
system/frontend/src/assets/hub/ASSET_PROMPTS.md
```

## Especificações por asset

### Backgrounds
- `hub_forest_sky.svg`: 2200x900, gradiente azul-roxo com ilhas flutuantes distantes esquematizadas, estrelas/runas no céu
- `hub_forest_back_trees.svg`: 2200x600, silhuetas de árvores em verde escuro com copas luminosas, camada parallax
- `hub_forest_ground.svg`: 2200x400, clareira de grama mágica com pedras rúnicas, path de luz suave
- `hub_forest_foreground_leaves.svg`: folhas/galhos frontais em verde brilhante, layer decorativo

### POIs — regras visuais
Cada POI deve ter:
1. Silhueta central distinta e reconhecível
2. Cor dominante do local (ver tabela no spec)
3. Brilho/glow discreto na cor dominante
4. Altura mínima 120px na cena

| POI | Cor dominante | Elementos obrigatórios |
|-----|---------------|----------------------|
| Árvore Rúnica | Azul `#3A9AD9` | Raízes brilhantes, runas no tronco, copa frondosa |
| Arena PvP | Vermelho `#E63946` | Arcos de coliseu, bandeiras, runas ofensivas |
| Dungeon | Roxo `#7B2FBE` | Caverna, portal brilhante, cristais |
| Vila | Dourado `#F4A226` | Telhados pontudos, janelas acesas, flores |
| Mercado | Dourado/Bronze `#CD7F32` | Tendas, baús, balança, lanternas |
| Ferreiro | Azul/Dourado `#4A7FA5` | Forja, bigorna, brasas azuis |
| Guilda | Verde/Dourado `#2D6A4F` | Árvore-salão, brasões, estandartes |
| Academia | Azul claro `#3A9AD9` | Alvos, manequins, campo aberto |

### FX Placeholders (SVG animado com CSS)
```
system/frontend/src/assets/hub/fx/fx_rune_hover_blue.svg    (glow de foco azul)
system/frontend/src/assets/hub/fx/fx_rune_hover_gold.svg    (glow de foco dourado)
system/frontend/src/assets/hub/fx/fx_portal_purple.svg      (portal da dungeon respirando)
system/frontend/src/assets/hub/fx/fx_forge_sparks.svg       (faíscas da forja)
system/frontend/src/assets/hub/fx/fx_transition_rune.svg    (transição entre hub e tela)
```

### Personagem Hub
- `player_hub_idle.svg`: personagem compacto, cabeça levemente maior, postura neutra com arma, cor neutra (placeholder)
- `player_hub_shadow.svg`: elipse de sombra discreta abaixo do personagem

## Arquivo ASSET_PROMPTS.md
Deve conter prompts prontos para uso com geradores de imagem (Midjourney, DALL-E, Stable Diffusion) para cada asset final. Usar os prompts base do v1.1.0.md seção 15 e expandir com:
- Dimensões recomendadas
- Estilo específico
- Elementos obrigatórios
- Restrições visuais
- Exemplo de prompt negativo

## O que não deve mexer
- Nenhum arquivo TypeScript
- Nenhum SCSS
- Nenhum componente Angular
- Nenhum arquivo de rota

## Dependências
- Agente 033 (recomendado para confirmar posicionamento dos POIs)
- Pode rodar em paralelo com Agente 034

## Critérios de aceite
- [ ] 4 backgrounds SVG criados (sky, back trees, ground, foreground)
- [ ] 8 POIs SVG criados com cores dominantes corretas
- [ ] 2 assets de personagem SVG criados
- [ ] 5 FX SVG criados com animação CSS simples
- [ ] ASSET_PROMPTS.md com prompts completos para todos os assets
- [ ] Cada POI comunica sua função visualmente sem texto
- [ ] Todos os SVGs têm fundo transparente exceto backgrounds completos
- [ ] Paleta oficial respeitada

## Instrução de execução
```
Consulte docs/15-diretriz-arte.md e v1.1.0.md seções 2, 4, 5, 12, 14 e 15. Crie os assets SVG placeholder com alta fidelidade à identidade visual da Floresta Rúnica. Para os FX, use animações CSS simples (keyframes) dentro do SVG ou como atributo `style`. Crie ASSET_PROMPTS.md com prompts profissionais. Crie os diretórios necessários. Salve resumo em .ai-orchestration/agents/035-resumo.md.
```

## Checklist Art Director
- [ ] docs/15-diretriz-arte.md consultado antes de criar qualquer asset
- [ ] Cada POI tem silhueta única e cor dominante própria
- [ ] Backgrounds têm depth visual (distante → próximo)
- [ ] Personagem tem proporção correta (cabeça maior, corpo compacto)
- [ ] FX são sutis, não competem com interação
- [ ] Prompts especificam "2D HD cartoon fantasy premium, non-realistic, high contrast"

---

## Memory — Agente 035: Background & POI Assets

### Objetivo
Criar placeholders SVG de alta fidelidade para todos os assets visuais do hub + arquivo de prompts para geração de imagem final.

### Contexto permitido
docs/15-diretriz-arte.md, agents/art-director.md, v1.1.0.md seções 2/4/5/12/14/15.

### Arquivos autorizados
Criar apenas em `system/frontend/src/assets/hub/`.

### Dependências
033 recomendado, paralelo com 034.

### Restrições
Não tocar em TypeScript, Angular, rotas ou SCSS existentes.

### Critérios de aceite
19 arquivos SVG + ASSET_PROMPTS.md criados com identidade visual correta.
