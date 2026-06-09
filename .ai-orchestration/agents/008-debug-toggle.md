# Agent-008 — Debug Toggle (Feat B4: Menu Debug via Tecla "O")

## Status
Pendente

## Objetivo
Mover o debug menu de sempre visível para toggle via tecla "O". Adicionar `@Input() visible` no `DebugOverlayComponent`. Mostrar hint "🛠" no canto quando debug está oculto e existe batalha ativa.

## Memory

### Objetivo
Feat B4: debug toggle tecla "O" e hint visual quando oculto.

### Contexto permitido
- `src/app/debug-overlay/debug-overlay.component.ts`: adicionar @Input() visible
- `src/app/app.component.ts`: @HostListener para keydown 'O', state debugVisible
- `src/app/app.component.html`: [visible]="debugVisible" no app-debug-overlay + hint visual

### Arquivos autorizados a alterar
- `src/app/debug-overlay/debug-overlay.component.ts`
- `src/app/debug-overlay/debug-overlay.component.html` (se necessário)
- `src/app/app.component.ts`
- `src/app/app.component.html`
- `src/app/app.component.scss`

### O que NÃO alterar
- Lógica interna do debug overlay (apenas o controle de visibilidade)

### Dependências
- Pode rodar em paralelo com Agent-001-007
- Ligeiramente dependente de Agent-005/006 que alteram app.component

### Critérios de aceite
- Tecla "O" (maiúscula ou minúscula) togglea `debugVisible`
- `DebugOverlayComponent` tem `@Input() visible = false`
- Quando `!debugVisible && hasBattle`: mostra hint 🛠 no canto superior direito
- Debug oculto por padrão (debugVisible começa false)
- TypeScript sem erros

### Instrução de execução
```
Implemente a Feat B4 do spec v1.4.0 (Debug Toggle).
Em debug-overlay.component.ts, adicionar @Input() visible = false.
No template do debug-overlay, envolver tudo em *ngIf="visible" (ou @if no Angular 17).
Em app.component.ts, adicionar propriedade debugVisible = false e @HostListener('document:keydown') que togla debugVisible quando e.key === 'o' || e.key === 'O'.
Em app.component.html, passar [visible]="debugVisible" para app-debug-overlay.
Adicionar hint: <div class="debug-hint" *ngIf="!debugVisible && hasBattle">🛠</div>.
Estilizar .debug-hint conforme spec (position: absolute; top: 8px; right: 8px; opacity: 0.3).
Atualizar .ai-orchestration/ após cada alteração.
```

## Riscos ou pendências
- Verificar se `hasBattle` já existe como propriedade em app.component.ts ou precisa ser criada
- Agent-006/007 também alteram app.component — verificar conflitos após todos concluírem
