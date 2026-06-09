# Agent-016 — Terrain Textures PNG (Fix A7: Texturas PNG com Fallback)

## Status
Pendente

## Objetivo
Atualizar `terrain-textures.ts` para usar PNGs externos quando disponíveis, com fallback programático. Atualizar `terrain-renderer.ts` para usar `scene.add.image` no background quando PNG existir. Adicionar preload em `battle.scene.ts`.

## Memory

### Objetivo
Fix A7: sistema de texturas PNG com fallback programático quando PNGs não disponíveis.

### Contexto permitido
- `src/app/shared/game-core/terrain-textures.ts`: verificar textura existente antes de gerar
- `src/app/shared/game-core/terrain-renderer.ts`: usar image no background quando PNG carregado
- `src/app/shared/game-core/battle.scene.ts`: adicionar preload() para carregar PNGs

### Arquivos autorizados a alterar
- `src/app/shared/game-core/terrain-textures.ts`
- `src/app/shared/game-core/terrain-renderer.ts`
- `src/app/shared/game-core/battle.scene.ts` (apenas preload)

### O que NÃO alterar
- A lógica de geração programática existente (apenas adicionar verificação antes)

### Dependências
- Agent-015 deve estar concluído (grid expandido antes de ajustar renderer)

### Critérios de aceite
- `terrain-textures.ts`: `initTerrainTextures` verifica `scene.textures.exists(key)` antes de gerar via canvas
- Se PNG existe: usar diretamente; se não: gerar programaticamente (comportamento atual)
- `terrain-renderer.ts`: substituir `scene.add.rectangle` do background por `scene.add.image` quando key de background PNG existir (com fallback para rectangle se não existir)
- `battle.scene.ts` preload: `this.load.image('terrain_plains_bg', 'assets/terrain/plains_bg.png')` etc. para cada mapa/bioma
- Sistema funciona mesmo com zero PNGs disponíveis (fallback total)
- Criar README: `public/assets/terrain/README.md` listando PNGs esperados e dimensões
- TypeScript sem erros

### Instrução de execução
```
Implemente o Fix A7 do spec v1.4.0 (Terrain Textures PNG).
Em terrain-textures.ts, para cada geração de textura via canvas, verificar primeiro se scene.textures.exists(key). Se sim, pular a geração.
Em terrain-renderer.ts, verificar se a key de background PNG existe. Se sim, usar scene.add.image(x, y, key); se não, usar o método atual (rectangle ou geração programática).
Em battle.scene.ts, adicionar método preload() com this.load.image() para cada combinação mapa/bioma conforme lista no spec.
Criar public/assets/terrain/README.md listando todos os PNGs esperados (nome, dimensões, uso).
Atualizar .ai-orchestration/ após cada arquivo alterado.
```

## Riscos ou pendências
- PNGs ainda não existem — o sistema deve funcionar 100% sem eles
- Verificar se a escala do background image está correta para cobrir 3600×1280
- Se battle.scene.ts não tem preload() definido, criar o método
