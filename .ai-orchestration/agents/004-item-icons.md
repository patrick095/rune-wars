# Agent 004 — Item Icons (Secundários + Consumíveis)

## Objetivo
Gerar (via IA de imagem) e posicionar os 5 ícones de itens secundários + 5 ícones de consumíveis (todos 48x48px).

## Contexto mínimo necessário
- Ler specs em `system/frontend/src/assets/items/ASSET_SPEC.md` (criado pelo Agent 001)
- Itens secundários: shield, healing-book, camouflage-orb, protection-totem, runic-builder
- Consumíveis: teleport, heal, ice-throw, invisibility, calibration-shot
- Referência de IDs em `system/frontend/src/app/shared/game-core/secondary-item-system.ts` e `consumable-system.ts`

## Arquivos autorizados a alterar
- `system/frontend/src/assets/items/secondary/*.png` (criar)
- `system/frontend/src/assets/items/consumables/*.png` (criar)
- Seção preload() da cena Phaser relevante

## Arquivos a consultar
- `system/frontend/src/assets/items/ASSET_SPEC.md`
- `system/frontend/src/app/shared/game-core/secondary-item-system.ts`
- `system/frontend/src/app/shared/game-core/consumable-system.ts`

## O que NÃO mexer
- Lógica dos sistemas de itens
- Backend

## Dependências obrigatórias
- Agent 001 concluído

## Critérios de aceite
- 10 PNGs presentes (5 secundários + 5 consumíveis)
- IDs consistentes com os sistemas existentes
- Registrados no preload da cena relevante

## Memory — Agent 004

### Objetivo
Gerar e posicionar 10 ícones de itens (5 secundários + 5 consumíveis).

### Arquivos autorizados
- `system/frontend/src/assets/items/secondary/*.png`
- `system/frontend/src/assets/items/consumables/*.png`

### Dependências
- Agent 001

### Critérios de aceite
- 10 PNGs presentes, IDs consistentes com sistemas existentes
