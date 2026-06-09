# Agent-006 — Game Navigator (Feat B2: Single-Screen + GameNavigatorService)

## Status
Pendente

## Objetivo
Converter a navegação Angular Router para single-screen após o login. Criar `GameNavigatorService` com signal para controlar a tela ativa. Simplificar `app.routes.ts` (manter rotas de login/register/character-select, adicionar `/game`). Em `app.component.ts`, substituir router-outlet por `@switch` nas telas do jogo. Transição com opacity 200ms.

## Memory

### Objetivo
Feat B2: criar GameNavigatorService e converter app para single-screen pós-login.

### Contexto permitido
- `src/app/app.component.ts`: refatorar para usar GameNavigatorService
- `src/app/app.component.html`: substituir router-outlet por @switch para telas do jogo
- `src/app/app.routes.ts`: simplificar, adicionar rota /game
- `src/app/shared/services/game-navigator.service.ts`: criar
- Consultar `src/app/hub/hub.component.ts`, `src/app/pvp/pvp.component.ts` para entender o que existe atualmente

### Arquivos autorizados a alterar
- `src/app/app.component.ts`
- `src/app/app.component.html`
- `src/app/app.routes.ts`
- `src/app/shared/services/game-navigator.service.ts` (criar)

### Arquivos apenas consulta
- `src/app/hub/hub.component.ts`
- `src/app/pvp/pvp.component.ts`
- `src/app/character-select/character-select.component.ts`

### O que NÃO alterar
- Os componentes filhos (hub, pvp, etc.) — apenas o app.component
- Lógica de autenticação/login

### Dependências
- Pode rodar em paralelo com Agent-001-005 e 007-008
- Agent-005 adiciona game-frame no HTML — este agente deve criar o conteúdo *dentro* do game-frame
- Agent-013 depende deste agente

### Critérios de aceite
- `GameNavigatorService` com signal `screen` e método `goTo(screen: GameScreen)`
- `GameScreen` type com todos os valores: `'hub' | 'playground' | 'pvp-lobby' | 'pvp-room' | 'battle' | 'dungeon' | 'character' | 'craft' | 'upgrade' | 'market' | 'guild' | 'rankings' | 'academy'`
- `app.routes.ts` tem rota `/game` carregando `AppShellComponent` (que é o próprio AppComponent ou um novo)
- URL permanece `/game` durante toda a navegação pós-login
- Transição: `opacity 0→1` em 200ms ao trocar tela
- TypeScript sem erros

### Instrução de execução
```
Implemente a Feat B2 do spec v1.4.0 (Single-Screen Architecture).
Criar src/app/shared/services/game-navigator.service.ts com signal _screen, screen readonly, método goTo, e método launchBattle com BattleConfig.
Definir o type GameScreen com todos os valores listados no spec.
Em app.routes.ts, simplificar para manter login/register/character-select como rotas e adicionar /game.
Em app.component.ts (ou AppShellComponent novo), usar @switch (ou [hidden]) para trocar entre telas baseado no signal do GameNavigatorService.
Adicionar transição CSS de opacity 200ms.
IMPORTANTE: o conteúdo deve ficar dentro do .game-frame que Agent-005 criou.
Atualizar .ai-orchestration/ após cada arquivo alterado.
```

## Riscos ou pendências
- Conflito com Agent-005 em `app.component.html` — Agent-005 cria a estrutura externa (game-shell/game-frame), este agente cria o conteúdo interno
- Componentes existentes (hub, dungeon, etc.) podem usar `Router.navigate` internamente — não alterar isso agora, apenas o app.component
