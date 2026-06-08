# Agent 005 — Craft & Material Icons

## Objetivo
Gerar (via IA de imagem) e posicionar os 10 ícones de itens craftáveis (48x48px) + 11 ícones de materiais de craft (32x32px).

## Contexto mínimo necessário
- Ler specs em `system/frontend/src/assets/items/ASSET_SPEC.md` (criado pelo Agent 001)
- Craftáveis: sword_iron, sword_steel, bow_wood, staff_runic, armor_leather, helmet_iron, boots_swift, ring_luck, necklace_vitality, bracelet_strength
- Materiais: iron_ore, steel_bar, hardwood, fiber, rune_crystal, leather, agility_crystal, gold_nugget, luck_gem, life_crystal, strength_gem
- Referência de IDs em `system/frontend/src/app/shared/game-core/` (arquivos de craft/items)

## Arquivos autorizados a alterar
- `system/frontend/src/assets/items/equipment/*.png` (craftáveis)
- `system/frontend/src/assets/items/materials/*.png` (materiais 32x32)
- Seção preload() da cena Phaser relevante

## Arquivos a consultar
- `system/frontend/src/assets/items/ASSET_SPEC.md`
- `system/frontend/src/app/shared/game-core/` (IDs dos itens)

## O que NÃO mexer
- Lógica de craft
- Backend

## Dependências obrigatórias
- Agent 001 concluído

## Critérios de aceite
- 10 PNGs de equipment (48x48) presentes
- 11 PNGs de materiais (32x32) presentes
- IDs consistentes com sistema de craft existente
- Registrados no preload

## Memory — Agent 005

### Objetivo
Gerar e posicionar 21 ícones de craft (10 equipment + 11 materiais).

### Arquivos autorizados
- `system/frontend/src/assets/items/equipment/*.png`
- `system/frontend/src/assets/items/materials/*.png`

### Dependências
- Agent 001

### Critérios de aceite
- 21 PNGs presentes, IDs consistentes com craft system
