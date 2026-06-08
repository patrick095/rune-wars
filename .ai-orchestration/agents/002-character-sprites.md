# Agent 002 — Character Sprites

## Objetivo
Gerar (via IA de imagem) e colocar os 6 sprites de personagem (3 raças × idle/battle) nos diretórios corretos, e registrá-los no preload da cena Phaser.

## Contexto mínimo necessário
- Ler specs em `system/frontend/src/assets/characters/ASSET_SPEC.md` (criado pelo Agent 001)
- Estilo: mesmo das imagens painted do hub (isométrico RPG premium, texturas ricas, proporção chibi)
- Formato: PNG 64x64 fundo transparente
- Localização: `system/frontend/src/assets/characters/`
- Registrar no preload da BattleScene ou cena relevante

## Arquivos autorizados a alterar
- `system/frontend/src/assets/characters/*.png` (criar)
- Arquivo Phaser de preload de assets da BattleScene (somente a seção `preload()`)

## Arquivos a consultar
- `system/frontend/src/assets/characters/ASSET_SPEC.md`
- `system/frontend/src/app/` (encontrar onde fica o preload de assets do battle/hub)

## O que NÃO mexer
- Lógica de jogo
- Componentes Angular
- Backend

## Dependências obrigatórias
- Agent 001 concluído (diretórios e specs criados)

## Critérios de aceite
- 6 PNGs presentes: `human_idle.png`, `human_battle.png`, `dwarf_idle.png`, `dwarf_battle.png`, `elf_idle.png`, `elf_battle.png`
- Assets registrados no preload Phaser com chave correspondente ao ID da raça
- Nenhum erro 404 ao carregar a cena

## Memory — Agent 002

### Objetivo
Gerar e posicionar sprites de 3 raças (human, dwarf, elf) em idle e battle.

### Contexto permitido
- Specs do Agent 001
- Preload da BattleScene Phaser

### Arquivos autorizados
- `system/frontend/src/assets/characters/*.png`
- Seção preload() da cena Phaser relevante

### Dependências
- Agent 001 (specs e diretórios)

### Restrições
- Não alterar lógica de jogo, componentes Angular, backend

### Critérios de aceite
- 6 PNGs presentes e carregando corretamente na cena
