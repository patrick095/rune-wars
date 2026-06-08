# Agent 001 — Asset Spec & Prompts

## Objetivo
Criar o documento mestre de especificações visuais para geração dos ~49 assets da v1.2.0. Esse agente NÃO gera imagens — ele cria prompts otimizados e specs técnicas detalhadas para cada grupo de assets, e cria a estrutura de diretórios esperada com arquivos placeholder.

## Contexto mínimo necessário
- Estilo visual: RPG fantasy isométrico premium, textura rica, stone/gold/wood com iluminação mágica, fundos transparentes para sprites individuais. Referência: `system/frontend/src/assets/hub/poi-raster/poi_pvp_painted.png` e `hub_forest_painted.png`.
- Personagens têm proporção compacta/chibi como os arqueiros em `poi_academy_painted.png`.
- Ícones devem ser legíveis em 48x48px (armas, itens) e 32x32px (materiais).
- Prompt base: "2D HD fantasy RPG icon, premium painted cartoon style, rich textures, stone/gold/wood materials, magical glow accents, transparent background, highly detailed, game asset"

## Arquivos autorizados a criar
- `system/frontend/src/assets/characters/` (criar diretório + README de placeholder)
- `system/frontend/src/assets/items/weapons/`
- `system/frontend/src/assets/items/secondary/`
- `system/frontend/src/assets/items/consumables/`
- `system/frontend/src/assets/items/equipment/`
- `system/frontend/src/assets/items/materials/`
- `.ai-orchestration/agents/001-asset-spec-prompts-resumo.md`

## Arquivos a consultar
- `system/frontend/src/assets/hub/poi-raster/poi_pvp_painted.png` (estilo)
- `system/frontend/src/assets/hub/poi-raster/poi_academy_painted.png` (proporção personagem)
- `v1.2.0.md` seção 16 (lista completa de assets)

## O que NÃO mexer
- Nenhum arquivo TypeScript, HTML, SCSS
- Nenhum asset existente

## Dependências obrigatórias
- Nenhuma

## Critérios de aceite
- Estrutura de diretórios criada
- Arquivo `assets/characters/ASSET_SPEC.md` com prompts para cada sprite de raça
- Arquivo `assets/items/ASSET_SPEC.md` com prompts para cada grupo de item
- Cada prompt inclui: dimensões, cor dominante, silhueta chave, elementos obrigatórios, mood

## Formato do resumo final
Criar `.ai-orchestration/agents/001-asset-spec-prompts-resumo.md` com status, diretórios criados, e lista de prompts gerados.

---

## Memory — Agent 001

### Objetivo
Criar specs e prompts de geração para 49 assets visuais da v1.2.0.

### Contexto permitido
- Estilo painted do hub (isométrico RPG premium)
- Lista de assets do v1.2.0.md seção 16
- Art style guide em `.claude/skills/rune-wars-art-director/references/art-style-guide-v1.md`

### Arquivos autorizados
- `system/frontend/src/assets/` (somente criar subdiretórios e specs)

### Dependências
- Nenhuma

### Restrições
- Não modificar código TypeScript/HTML/SCSS
- Não gerar imagens — apenas specs e prompts

### Critérios de aceite
- Estrutura de pastas criada
- Prompts completos para todos os 49 assets
- Specs técnicas (dimensão, formato, cor dominante) para cada grupo

---

## Especificações Técnicas por Grupo

### Personagens — 64x64px PNG com fundo transparente

**Prompt base raça:**
"2D fantasy RPG character sprite, [RACE_DESCRIPTION], compact slightly chibi proportions, larger head, visible armor equipment, front-facing idle pose, premium painted cartoon style, rich textures, magical lighting, transparent background, 64x64 game sprite"

| ID | Nome | Visual Descritivo | Cor Dominante |
|----|------|------------------|---------------|
| human_idle | Humano Idle | Guerreiro medieval, armadura simples de aço, elmo com viseira, espada na bainha | Cinza aço + dourado |
| human_battle | Humano Battle | Mesma armadura, pose de combate, arma em destaque | Cinza aço + vermelho |
| dwarf_idle | Anão Idle | Baixo e largo, barba ruiva trançada, capacete de ferreiro com chifres, machado | Marrom + dourado |
| dwarf_battle | Anão Battle | Pose agachada de combate, martelo erguido, centelhas rúnicas | Marrom + laranja |
| elf_idle | Elfo Idle | Alto esguio, orelhas pontudas, manto verde floresta, arco élfico | Verde + prata élfica |
| elf_battle | Elfo Battle | Pose de arqueiro, corda do arco tensionada, brilho rúnico na flecha | Verde + azul rúnico |

### Armas — 48x48px PNG com fundo transparente

**Prompt base arma:**
"2D fantasy RPG weapon icon, [WEAPON_DESCRIPTION], premium painted cartoon style, rich metallic textures, magical glow accent, transparent background, 48x48 game inventory icon, high contrast silhouette"

| ID | Nome | Visual | Cor Dominante |
|----|------|--------|---------------|
| cannon | Canhão | Canhão de ferro medieval pesado, runas gravadas no cano, boca flamejante laranja | Ferro escuro + laranja |
| longbow | Arco Longo | Arco élfico curvado de madeira mágica, corda luminosa azul, runas na madeira | Madeira dourada + azul |
| tnt | TNT | Barril vermelho alquímico com pavio aceso dourado, símbolo rúnico no barril | Vermelho + dourado |
| boomerang | Boomerang | Boomerang com curvas exageradas, trilhas de energia roxa, cristal no centro | Madeira + roxo |
| ice-book | Livro de Gelo | Grimório azul com cristais de gelo nas bordas, páginas abertas com runas brilhantes | Azul gelo + prata |
| potion | Poção | Frasco de vidro vermelho borbulhante, tampa dourada com caveira, brilho interno | Vermelho + dourado |

### Itens Secundários — 48x48px PNG transparente

| ID | Nome | Visual | Cor Dominante |
|----|------|--------|---------------|
| shield | Escudo | Escudo medieval redondo, brasão rúnico dourado no centro, borda de aço | Cinza + dourado |
| healing-book | Livro de Cura | Grimório verde esmeralda, cruz dourada na capa, aura de cura saindo | Verde + dourado |
| camouflage-orb | Orbe de Camuflagem | Esfera translúcida roxa com névoa interna, brilho fantasmagórico | Roxo translúcido |
| protection-totem | Totem de Proteção | Poste de madeira entalhado com runas azuis brilhantes, base de pedra | Madeira + azul rúnico |
| runic-builder | Construtor Rúnico | Bloco de pedra com runas violeta incandescentes, aspecto de construção | Pedra + violeta |

### Consumíveis — 48x48px PNG transparente

| ID | Nome | Visual | Cor Dominante |
|----|------|--------|---------------|
| teleport | Teleporte | Portal miniatura roxo giratório, borda dourada com runas | Roxo + dourado |
| heal | Cura Rápida | Coração dourado com aura verde de vida pulsante | Dourado + verde |
| ice-throw | Lançamento de Gelo | Cristal de gelo aguçado azul brilhante, faíscas de frio | Azul gelo + branco |
| invisibility | Invisibilidade | Manto com estrelas douradas e bordas que desaparecem, efeito translúcido | Azul escuro + dourado |
| calibration-shot | Tiro de Calibração | Alvo laranja com mira central dourada, brilho de precisão | Laranja + dourado |

### Itens Craftáveis — 48x48px PNG transparente

| ID | Nome | Visual | Cor Dominante |
|----|------|--------|---------------|
| sword_iron | Espada de Ferro | Espada reta simples, lâmina de ferro cinza, cabo marrom | Cinza ferro |
| sword_steel | Espada de Aço | Espada mais elaborada, lâmina polida azulada, runas sutis | Aço azulado |
| bow_wood | Arco de Madeira | Arco simples de madeira clara, sem runas | Madeira natural |
| staff_runic | Cajado Rúnico | Cajado longo com cristal roxo no topo pulsante | Madeira + roxo |
| armor_leather | Armadura de Couro | Peitoral marrom com tachas douradas | Couro marrom |
| helmet_iron | Capacete de Ferro | Elmo simples de ferro com viseira | Ferro cinza |
| boots_swift | Botas Velozes | Botas azuis com runas de vento, asas pequenas nas laterais | Azul + dourado |
| ring_luck | Anel da Sorte | Anel dourado com gema verde de trevo de 4 folhas | Dourado + verde |
| necklace_vitality | Colar da Vitalidade | Corrente dourada com pingente de coração vermelho pulsante | Dourado + vermelho |
| bracelet_strength | Pulseira da Força | Bracelete de aço com runas vermelhas de força | Aço + vermelho |

### Materiais — 32x32px PNG transparente

**Prompt base material:**
"2D fantasy RPG crafting material icon, [MATERIAL_DESCRIPTION], premium painted style, transparent background, 32x32 pixel game asset, bold silhouette, vivid colors"

| ID | Nome | Visual | Cor |
|----|------|--------|-----|
| iron_ore | Minério de Ferro | Pedaço rochoso com veias de ferro brilhante | Cinza + marrom |
| steel_bar | Barra de Aço | Lingote metálico azulado polido | Aço azulado |
| hardwood | Madeira Dura | Tronco cortado com veios de madeira escura | Marrom escuro |
| fiber | Fibra | Feixe de fibras entrelaçadas douradas | Dourado claro |
| rune_crystal | Cristal Rúnico | Cristal hexagonal roxo com runas internas brilhantes | Roxo |
| leather | Couro | Pedaço de couro enrolado marrom com textura | Marrom |
| agility_crystal | Cristal de Agilidade | Cristal verde aguçado translúcido com brilho | Verde |
| gold_nugget | Pepita de Ouro | Nugget dourado irregular brilhante | Dourado |
| luck_gem | Gema da Sorte | Gema redonda verde esmeralda com brilho interno | Verde esmeralda |
| life_crystal | Cristal de Vida | Cristal vermelho pulsante com aura de vida | Vermelho |
| strength_gem | Gema da Força | Gema quadrada vermelha escura com fissuras de energia | Vermelho escuro |
