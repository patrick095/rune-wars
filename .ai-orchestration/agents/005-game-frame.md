# Agent-005 — Game Frame (Feat B1: Resolução Fixa com Moldura)

## Status
Pendente

## Objetivo
Implementar game frame com resolução máxima 1920×1080 e aspect ratio 16:9. Em monitores maiores, o jogo aparece centralizado com bordas escuras. Criar `game-config.ts` com as constantes e atualizar `app.component.scss` e `app.component.html`.

## Memory

### Objetivo
Feat B1: CSS letterbox com resolução máxima e moldura sutil.

### Contexto permitido
- `app.component.html`: adicionar estrutura game-shell / game-frame
- `app.component.scss`: adicionar estilos CSS
- `app.component.ts`: atualizar referência para game-frame (Phaser deve usar `parent: 'game-frame'`)
- Criar `src/app/shared/game-core/game-config.ts`

### Arquivos autorizados a alterar
- `src/app/app.component.html`
- `src/app/app.component.scss`
- `src/app/app.component.ts`
- `src/app/shared/game-core/game-config.ts` (criar)

### Arquivos apenas consulta
- `src/app/hub/hub.component.ts` (consultar como Phaser é inicializado para entender `parent`)

### O que NÃO alterar
- Lógica de roteamento Angular (Agent-006 faz isso)
- Qualquer lógica de gameplay

### Dependências
- Pode rodar em paralelo com Agent-001-004 e Agent-006-008
- Agent-006 vai alterar app.component.ts e html também — coordenar para evitar conflito

### Critérios de aceite
- `game-config.ts` exporta `GAME_MAX_WIDTH = 1920` e `GAME_MAX_HEIGHT = 1080`
- `.game-shell`: `width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background: #000`
- `.game-frame`: `width: min(100vw, calc(100vh * 16/9)); height: min(100vh, calc(100vw * 9/16)); max-width: 1920px; max-height: 1080px; overflow: hidden; box-shadow: 0 0 0 2px #2a2a4a, 0 0 40px rgba(0,0,0,0.8)`
- Phaser usa `parent: 'game-frame'` e lê dimensões reais do elemento
- TypeScript sem erros

### Instrução de execução
```
Implemente a Feat B1 do spec v1.4.0 (Game Resolution Frame).
Criar src/app/shared/game-core/game-config.ts com GAME_MAX_WIDTH = 1920 e GAME_MAX_HEIGHT = 1080.
Em app.component.html, envolver todo o conteúdo em <div class="game-shell"><div class="game-frame" id="game-frame">...</div></div>.
Em app.component.scss, adicionar os estilos .game-shell e .game-frame conforme spec.
Em app.component.ts, verificar onde Phaser é inicializado e garantir que usa parent: 'game-frame'; se o Phaser é inicializado nos componentes filhos (hub, pvp), verificar se já usa getElementById ou document.body e deixar uma nota.
Atualizar .ai-orchestration/ após cada arquivo alterado.
IMPORTANTE: não alterar a lógica de roteamento — Agent-006 fará isso.
```

## Riscos ou pendências
- Agent-006 também altera `app.component.html` — coordenar estrutura base aqui, Agent-006 adiciona o switch de telas dentro do game-frame
- Verificar se `min()` CSS funciona no target de browsers (Safari 16+)
