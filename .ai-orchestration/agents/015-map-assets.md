# Agent 015 — Map Assets (Tilesets + Backgrounds)

## Objetivo
Criar os assets visuais (backgrounds e tilesets) para os 3 novos mapas battle: `deep_mines`, `arcane_ruins`, `runic_forest`. Registrar no preload da cena de batalha.

## Contexto mínimo necessário
- Estilo: mesmo das imagens painted do hub (isométrico RPG premium com texturas ricas)
- **deep_mines**: cavernas de minério — tons escuros de pedra, veios de cristal azul, iluminação de tocha laranja
- **arcane_ruins**: ruínas de templo flutuante — pedra cinza desgastada, runas roxas incandescentes, névoa mística
- **runic_forest**: floresta densa rúnica — verde escuro, raízes gigantes, névoa azul, pontos de luz rúnica

Backgrounds: PNG de cena completa (~1920×600px ou maior) para uso como camada de fundo no Phaser
Tilesets: sprites de tile individuais para terreno (se necessário pelo terrain-engine)

## Arquivos autorizados a criar
- `system/frontend/src/assets/maps/deep_mines/` (background + tileset)
- `system/frontend/src/assets/maps/arcane_ruins/` (background + tileset)
- `system/frontend/src/assets/maps/runic_forest/` (background + tileset)
- Registrar no preload da BattleScene

## Arquivos a consultar
- Cena de batalha Phaser (ver como mapas existentes carregam assets)
- `system/frontend/src/assets/hub/backgrounds/hub_forest_painted.png` (referência de estilo)
- JSONs criados pelo Agent 014

## O que NÃO mexer
- terrain-engine.ts
- Mapas existentes (castle, plains)
- Backend

## Dependências obrigatórias
- Agent 014 (JSONs criados, estrutura de diretórios conhecida)

## Critérios de aceite
- Background para cada um dos 3 mapas
- Tilesets criados se necessário (dependendo de como terrain-engine carrega)
- Registrados no preload da cena
- Nenhum erro 404 ao carregar os mapas novos

## Memory — Agent 015

### Objetivo
Criar assets visuais (backgrounds + tilesets) para 3 novos mapas.

### Contexto permitido
- Cena de batalha Phaser (para entender preload de mapas)
- JSONs dos mapas do Agent 014

### Arquivos autorizados
- `assets/maps/deep_mines/`, `assets/maps/arcane_ruins/`, `assets/maps/runic_forest/`

### Dependências
- Agent 014 (JSONs dos mapas)

### Restrições
- Não alterar terrain-engine.ts nem mapas existentes

### Critérios de aceite
- Background de cada mapa presente e carregando sem 404
