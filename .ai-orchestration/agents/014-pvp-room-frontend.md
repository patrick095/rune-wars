# Agent-014 — PvP Room Frontend (Feat B5 Frontend: PvpRoomComponent)

## Status
Pendente

## Objetivo
Criar `PvpRoomComponent` que mostra o estado da sala (quem entrou), permite selecionar mapa (owner only), e oferece as ações "Jogar vs CPU" e "Aguardar Jogador".

## Memory

### Objetivo
Criar PvpRoomComponent com ações de iniciar batalha CPU ou aguardar jogador real.

### Contexto permitido
- Criar `src/app/pvp/pvp-room/pvp-room.component.ts`
- `src/app/shared/services/game-navigator.service.ts`
- `src/app/pvp/pvp-lobby/pvp-lobby.component.ts` (Agent-013, para entender padrão)

### Arquivos autorizados a alterar/criar
- `src/app/pvp/pvp-room/` (criar componente)
- `src/app/app.component.html` (adicionar case 'pvp-room')

### Arquivos apenas consulta
- `src/app/shared/services/game-navigator.service.ts`
- `src/app/pvp/pvp-lobby/pvp-lobby.component.ts`

### O que NÃO alterar
- BattleService existente
- BattleScene

### Dependências
- Agent-013 (PvpLobbyComponent) deve estar concluído

### Critérios de aceite
- Mostra 2 slots: jogador atual + "Aguardando..." ou nome do segundo jogador
- Owner vê seletor de mapa (dropdown)
- Botão "Jogar vs CPU": chama `navigator.launchBattle({ mode: 'pvp', mapName, vsAI: true })` + DELETE /pvp/rooms/:id
- Botão "Aguardar Jogador": conecta via BattleService WebSocket
- Botão "← Lobby": DELETE /pvp/rooms/:id se owner + `navigator.goTo('pvp-lobby')`
- TypeScript sem erros

### Instrução de execução
```
Implemente a Feat B5 (PvpRoomComponent) do spec v1.4.0.
Criar src/app/pvp/pvp-room/pvp-room.component.ts.
Implementar polling do estado da sala (GET /pvp/rooms/:id a cada 3s).
Mostrar os 2 slots de jogadores conforme layout do spec.
Owner vê dropdown de seleção de mapa.
Botão "Jogar vs CPU": chamar navigator.launchBattle() e fechar sala no backend.
Botão "Aguardar Jogador": conectar via BattleService (modo existente).
Botão "← Lobby": fechar sala se owner, navegar de volta para pvp-lobby.
Em app.component.html, adicionar case 'pvp-room' no switch de telas.
Atualizar .ai-orchestration/ após cada arquivo criado/alterado.
```

## Riscos ou pendências
- `navigator.launchBattle()` precisa suportar `vsAI: true` — verificar se GameNavigatorService tem isso ou precisa adicionar
- Verificar assinatura de BattleService.connect() para o modo PvP aguardando jogador real
