# Agent 016 — GameEventBus + HubScene Refactor

## Objetivo
Criar o `GameEventBusService` Angular para comunicação Hub↔Overlay, e refatorar a `HubScene` para substituir `router.navigate()` por emissão de eventos. O canvas Phaser não deve mais ser destruído ao navegar entre seções do jogo.

## Contexto mínimo necessário
- Stack: Angular 19 + Phaser 3.80
- O problema: ao navegar entre rotas Angular, o canvas Phaser é destruído e recriado, quebrando a imersão
- A solução: `GameEventBusService` usa `Subject<>` para comunicar entre Phaser e Angular. HubScene emite eventos em vez de navegar. AppComponent renderiza overlays sobre o canvas sem trocar de rota.
- Este agente faz APENAS o EventBus e a refatoração da HubScene. O AppComponent overlay é o Agent 017.

## Arquivos autorizados a criar
- `system/frontend/src/app/shared/services/game-event-bus.service.ts`

## Arquivos autorizados a alterar
- `system/frontend/src/app/hub/hub.component.ts` (substituir router.navigate por eventBus.openScreen$)
- HubScene Phaser (onde os POIs chamam router.navigate — substituir por eventBus)

## Arquivos a consultar
- `system/frontend/src/app/hub/hub.component.ts`
- Cena Phaser do hub (encontrar com find onde fica a HubScene)
- `system/frontend/src/app/app.routes.ts` (mapear rotas existentes)

## O que NÃO mexer
- AppComponent (escopo do Agent 017)
- Rotas Angular (não deletar — apenas deixar de usar para navegação in-game)
- Backend
- game-core

## Dependências obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de aceite
- `GameEventBusService` criado com: `openScreen$: Subject<{screen: string, data?: any}>` e `closeScreen$: Subject<void>()`
- HubScene emite eventos via eventBus em vez de navegar
- `npm run build` passa (sem quebrar rotas existentes)

## Spec técnica (do v1.2.0.md)
```typescript
@Injectable({ providedIn: 'root' })
export class GameEventBusService {
  openScreen$ = new Subject<{ screen: string, data?: any }>();
  closeScreen$ = new Subject<void>();
}
```

Em vez de `router.navigate(['/character'])`:
```typescript
this.eventBus.openScreen$.next({ screen: 'character' });
```

## Memory — Agent 016

### Objetivo
Criar GameEventBusService e refatorar HubScene para usar eventos em vez de router.navigate.

### Contexto permitido
- `hub.component.ts`
- HubScene Phaser
- `app.routes.ts`

### Arquivos autorizados
- `shared/services/game-event-bus.service.ts` (criar)
- `hub.component.ts` (alterar)
- HubScene (alterar)

### Dependências
- Nenhuma

### Restrições
- Não alterar AppComponent (Agent 017), não deletar rotas existentes, não tocar backend

### Critérios de aceite
- EventBus criado, HubScene usa eventos, build passa
