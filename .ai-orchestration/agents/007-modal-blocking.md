# Agent-007 — Modal Blocking (Feat B3: Bloqueio de Cliques em Modais)

## Status
Pendente

## Objetivo
Implementar bloqueio de cliques em modais via três mecanismos: z-index CSS automático, `pointer-events: none` no canvas quando modal ativo, e backdrop em modais flutuantes.

## Memory

### Objetivo
Feat B3: garantir que modais bloqueiam cliques no que está atrás.

### Contexto permitido
- `src/app/app.component.ts`: adicionar effect que observa navigator.screen e togla pointer-events no canvas
- `src/app/app.component.html`: adicionar backdrop para modais flutuantes
- `src/app/app.component.scss`: estilos do backdrop e z-index

### Arquivos autorizados a alterar
- `src/app/app.component.ts`
- `src/app/app.component.html`
- `src/app/app.component.scss`

### Arquivos apenas consulta
- `src/app/shared/services/game-navigator.service.ts` (criado por Agent-006)

### O que NÃO alterar
- Componentes modais individuais
- Lógica de gameplay

### Dependências
- Agent-006 deve criar GameNavigatorService antes (mas pode ser desenvolvido em paralelo — assumir que o service existirá)

### Critérios de aceite
- Canvas Phaser recebe `pointer-events: none` quando `screen !== 'hub'`
- Backdrop semitransparente aparece para modais flutuantes (character, etc.)
- Clique no backdrop fecha o modal (`navigator.goTo('hub')`)
- z-index do modal > z-index do backdrop > z-index do canvas
- TypeScript sem erros

### Instrução de execução
```
Implemente a Feat B3 do spec v1.4.0 (Modal Click Blocking).
Em app.component.ts, usar effect() do Angular Signals para observar navigator.screen().
Quando screen !== 'hub', setar canvas?.style.pointerEvents = 'none'; caso contrário, resetar.
Em app.component.html, adicionar .modal-backdrop quando modal flutuante estiver ativo.
Em app.component.scss, estilizar .modal-backdrop (z-index: 199, background: rgba(0,0,0,0.6)) e garantir que modais têm z-index >= 200.
Atualizar .ai-orchestration/ após cada alteração.
```

## Riscos ou pendências
- O canvas do Hub Phaser pode não ter um ID fixo — verificar como é renderizado
- Agent-006 e Agent-007 ambos alteram app.component.ts — rodar depois de Agent-006 ou coordenar
