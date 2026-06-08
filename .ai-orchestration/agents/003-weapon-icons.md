# Agent 003 — Weapon Icons

## Objetivo
Gerar (via IA de imagem) e posicionar os 6 ícones de arma (48x48px) + 6 sprites de batalha para uso no inventário e na cena de batalha.

## Contexto mínimo necessário
- Ler specs em `system/frontend/src/assets/items/ASSET_SPEC.md` (criado pelo Agent 001)
- Armas: cannon, longbow, tnt, boomerang, ice-book, potion
- Ícones 48x48px PNG transparente para inventário
- Sprites de batalha: tamanho contextual (~64-96px) para uso no Phaser
- Referência de IDs das armas em `system/frontend/src/app/shared/game-core/weapon-definition.ts`

## Arquivos autorizados a alterar
- `system/frontend/src/assets/items/weapons/*.png` (criar)
- Arquivo Phaser de preload (somente seção `preload()`)

## Arquivos a consultar
- `system/frontend/src/assets/items/ASSET_SPEC.md`
- `system/frontend/src/app/shared/game-core/weapon-definition.ts`

## O que NÃO mexer
- weapon-system.ts, weapon-definition.ts (lógica)
- Componentes Angular
- Backend

## Dependências obrigatórias
- Agent 001 concluído

## Critérios de aceite
- 12 PNGs presentes: 6 ícones + 6 sprites de batalha
- Nomenclatura consistente com IDs do weapon-definition.ts
- Registrados no preload da cena relevante

## Memory — Agent 003

### Objetivo
Gerar e posicionar ícones e sprites de 6 armas.

### Contexto permitido
- Specs do Agent 001
- weapon-definition.ts (somente leitura de IDs)

### Arquivos autorizados
- `system/frontend/src/assets/items/weapons/*.png`
- Seção preload() da cena Phaser

### Dependências
- Agent 001

### Restrições
- Não alterar lógica de armas

### Critérios de aceite
- 12 PNGs (6 ícones + 6 sprites de batalha) presentes e carregando
