# Agent-013 — PvP Lobby Frontend (Feat B5 Frontend: PvpLobbyComponent)

## Status
Pendente

## Objetivo
Criar `PvpLobbyComponent` que lista salas disponíveis (polling 5s), permite criar sala e entrar em sala existente. Integrar no `GameNavigatorService` como tela `pvp-lobby`.

## Memory

### Objetivo
Criar PvpLobbyComponent Angular integrado ao GameNavigatorService.

### Contexto permitido
- Criar `src/app/pvp/pvp-lobby/pvp-lobby.component.ts`
- Criar `src/app/pvp/pvp-lobby/pvp-lobby.component.html`
- Criar `src/app/pvp/pvp-lobby/pvp-lobby.component.scss`
- `src/app/shared/services/game-navigator.service.ts` (criado por Agent-006)
- Consultar padrão de componentes existentes para API calls

### Arquivos autorizados a alterar/criar
- `src/app/pvp/pvp-lobby/` (pasta + arquivos do componente)
- `src/app/app.component.html` (adicionar case 'pvp-lobby' no switch de telas)

### Arquivos apenas consulta
- `src/app/shared/services/game-navigator.service.ts`
- `src/app/pvp/pvp.component.ts` (componente pvp existente para entender padrão)

### O que NÃO alterar
- Backend endpoints
- GameNavigatorService

### Dependências
- Agent-006 (GameNavigatorService) deve estar concluído
- Agent-012 (PvP Backend) deve estar concluído (endpoints disponíveis)

### Critérios de aceite
- Polling `GET /pvp/rooms` a cada 5s com `ngOnDestroy` parando o intervalo
- Tabela: Nome | Mapa | Players | [Entrar]
- Botão "Criar Sala": POST /pvp/rooms → navegar para pvp-room com o roomId
- Botão "Entrar": POST /pvp/rooms/:id/join → navegar para pvp-room
- Botão "← Hub": `navigator.goTo('hub')`
- Aparece no switch do AppComponent como caso 'pvp-lobby'
- TypeScript sem erros

### Instrução de execução
```
Implemente a Feat B5 Frontend (PvpLobbyComponent) do spec v1.4.0.
Criar src/app/pvp/pvp-lobby/pvp-lobby.component.ts com polling de salas a cada 5s.
Implementar ngOnInit (iniciar polling) e ngOnDestroy (parar polling).
Criar template HTML conforme layout do spec (tabela de salas, botões Criar/Entrar/Voltar).
Estilizar conforme tema do jogo.
Em app.component.html, adicionar o case 'pvp-lobby' no switch de telas.
Ao criar sala, navegar para 'pvp-room' via GameNavigatorService passando roomId e isOwner: true.
Ao entrar em sala, navegar para 'pvp-room' passando roomId e isOwner: false.
Atualizar .ai-orchestration/ após cada arquivo criado/alterado.
```

## Riscos ou pendências
- Verificar se GameNavigatorService tem forma de passar parâmetros de navegação (roomId) — pode precisar adicionar ao service
- Se o backend não estiver disponível, componente deve mostrar estado de erro gracioso
