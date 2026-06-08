# Agent 002 — v0.1.0 Angular + Phaser Setup

## Objetivo
Criar o projeto Angular com Phaser integrado, rota /playground com canvas responsivo, dois sprites placeholder, overlay de debug e botão de reinício.

## Contexto mínimo necessário
- Angular 19+ standalone components
- Phaser 3.x integrado como módulo Angular
- Canvas mobile-first (100% viewport, sem scroll horizontal)
- Sem backend, sem autenticação
- Dois sprites simples: jogador (azul) e inimigo (vermelho)

## Arquivos autorizados a criar/alterar
```
system/frontend/
  src/
    app/
      playground/
        playground.component.ts
        playground.component.html
        playground.component.scss
        phaser-container/
          phaser-container.component.ts
        debug-overlay/
          debug-overlay.component.ts
          debug-overlay.component.html
      app.routes.ts
      app.component.ts
      app.config.ts
    game/
      scenes/
        boot.scene.ts
        playground.scene.ts
    shared/
      game-core/
        types.ts
  angular.json
  package.json
  tsconfig.json
  tsconfig.app.json
```

## Arquivos apenas para consulta
- `devops/docker-compose.yml` (para entender porta 4200)

## O que NÃO mexer
- Qualquer arquivo em `devops/`

## Dependências obrigatórias
Nenhuma (pode executar em paralelo com 001)

## Interfaces de contrato obrigatórias
```ts
// system/frontend/src/app/shared/game-core/types.ts
export interface GameConfig {
  width: number;
  height: number;
  debugMode: boolean;
}
export interface PlayerSprite {
  x: number;
  y: number;
  color: number; // hex placeholder
}
```

## Critérios de aceite
- `ng serve` (ou docker) abre `http://localhost:4200/playground`
- Canvas ocupa 100% da tela no mobile e desktop
- Dois sprites visíveis no canvas
- Botão "Reiniciar" reinicia a cena sem recarregar página
- Overlay de debug exibe FPS e resolução
- Console sem erros críticos
- SSR desabilitado para rotas de jogo

## Memory

### Objetivo
Projeto Angular + Phaser rodando com canvas responsivo e dois sprites.

### Contexto permitido
Interfaces de contrato acima + estrutura de pastas permitida.

### Arquivos autorizados
Todos listados na seção "Arquivos autorizados".

### Dependências
Nenhuma.

### Restrições
- Não instalar SSR Angular.
- Usar `WebGL` renderer com fallback `Canvas` no Phaser.
- Componentes standalone (não NgModule).
- PhaserContainerComponent deve fazer `destroy()` no ngOnDestroy.
- BootScene: apenas preload. PlaygroundScene: sprites e botão.

### Critérios de aceite
Canvas responsivo, dois sprites, debug overlay, botão reinício.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-002.md`.

## Limpeza pós-versão
Após v0.1.0 completa: deletar `v0.1.0.md` da raiz.
