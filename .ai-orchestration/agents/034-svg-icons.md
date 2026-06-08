# Sub-spec — Agente 034: SVG Icons & UI Assets

## Objetivo
Criar todos os SVGs de ícones dos POIs e elementos de UI do hub da Floresta Rúnica, seguindo rigorosamente a diretriz oficial de arte do Rune Wars: 2D HD cartoon fantasy premium, cores vivas, alto contraste, linhas limpas, não-realista, não-infantil-exagerado.

## Identidade do Art Director
Este agente opera com plenas capacidades de Art Director. Antes de criar qualquer asset, consultar `docs/15-diretriz-arte.md` e o contexto do `agents/art-director.md`.

## Contexto mínimo necessário
- `docs/15-diretriz-arte.md` (paleta oficial, regras visuais)
- `agents/art-director.md` (skill do Art Director)
- `v1.1.0.md` seções 2, 8 e 14 (especificação dos ícones e paleta)
- `.ai-orchestration/agents/033-resumo.md` (se disponível)

## Paleta obrigatória por ícone
| Ícone | Cor dominante | Acento |
|-------|---------------|--------|
| icon_pvp.svg | Vermelho ofensivo `#E63946` | Runas douradas `#F4A226` |
| icon_dungeon.svg | Roxo arcano `#7B2FBE` | Cristal azul `#3A9AD9` |
| icon_village.svg | Dourado antigo `#F4A226` | Verde mágico `#4CAF50` |
| icon_market.svg | Dourado antigo `#F4A226` | Bronze `#CD7F32` |
| icon_blacksmith.svg | Cinza-azulado rúnico `#4A7FA5` | Dourado `#F4A226` |
| icon_guild.svg | Verde profundo `#2D6A4F` | Dourado `#F4A226` |
| icon_academy.svg | Azul rúnico `#3A9AD9` | Verde `#4CAF50` |
| icon_character.svg | Roxo claro `#9B72CF` | Dourado `#F4A226` |
| frame_rune_label.svg | Azul rúnico `#3A9AD9` | Glow sutil |
| frame_mobile_dock.svg | Roxo escuro `#2D1B4E` | Borda rúnica azul |

## Arquivos autorizados a criar
```
system/frontend/src/assets/hub/icons/icon_pvp.svg
system/frontend/src/assets/hub/icons/icon_dungeon.svg
system/frontend/src/assets/hub/icons/icon_village.svg
system/frontend/src/assets/hub/icons/icon_market.svg
system/frontend/src/assets/hub/icons/icon_blacksmith.svg
system/frontend/src/assets/hub/icons/icon_guild.svg
system/frontend/src/assets/hub/icons/icon_academy.svg
system/frontend/src/assets/hub/icons/icon_character.svg
system/frontend/src/assets/hub/ui/frame_rune_label.svg
system/frontend/src/assets/hub/ui/frame_mobile_dock.svg
```

## O que não deve mexer
- Nenhum arquivo TypeScript
- Nenhum arquivo de rotas
- Nenhum componente Angular existente

## Dependências
- Agente 033 (opcional — pode criar sem o resumo, mas deve validar paleta manualmente)

## Regras de criação SVG
1. ViewBox `0 0 64 64` para ícones de POI
2. Fundo transparente (sem `<rect>` de fundo)
3. Stroke com `stroke-linecap="round"` e `stroke-linejoin="round"`
4. Traço mínimo 2.5px, máximo 3.5px
5. Formas limpas, sem detalhes micro excessivos
6. Silhueta reconhecível em `24x24px`
7. Frame label: ViewBox `0 0 200 40`, bordas rúnicas discretas
8. Frame dock mobile: ViewBox `0 0 360 72`, base arredondada com brilho

## Critérios de aceite
- [ ] 8 ícones de POI criados em SVG
- [ ] 2 frames de UI criados em SVG
- [ ] Cada ícone reconhecível em tamanho 24x24
- [ ] Paleta oficial respeitada por ícone
- [ ] Fundo transparente em todos
- [ ] Linhas limpas, sem excesso de detalhes
- [ ] Silhueta única por ícone (sem confundir PvP com Dungeon, por exemplo)

## Instrução de execução
```
Crie os SVGs listados seguindo rigorosamente a paleta e as regras visuais do Rune Wars. Consulte docs/15-diretriz-arte.md antes de começar. Cada ícone deve comunicar sua função em menos de 1 segundo. Crie os diretórios necessários. Salve o resumo em .ai-orchestration/agents/034-resumo.md.
```

## Checklist Art Director
- [ ] Diretriz oficial de arte consultada
- [ ] Gameplay legível em mobile (silhueta clara em 24px)
- [ ] Visual não realista e não infantil exagerado
- [ ] Paleta respeita verde mágico, azul rúnico, roxo arcano, dourado antigo e vermelho ofensivo
- [ ] Cada ícone tem cor dominante própria e silhueta única

---

## Memory — Agente 034: SVG Icons

### Objetivo
Criar 10 SVGs (8 ícones POI + 2 frames UI) para o hub da Floresta Rúnica.

### Contexto permitido
docs/15-diretriz-arte.md, agents/art-director.md, v1.1.0.md seções 2 e 14.

### Arquivos autorizados
Criar apenas em `system/frontend/src/assets/hub/icons/` e `system/frontend/src/assets/hub/ui/`.

### Dependências
033 (opcional).

### Restrições
Não tocar em TypeScript, rotas, componentes ou SCSS existentes.

### Critérios de aceite
10 SVGs criados, paleta respeitada, silhuetas únicas e legíveis em 24px.
