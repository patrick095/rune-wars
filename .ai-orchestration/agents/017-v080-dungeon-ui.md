# Agent 017 — v0.8.0 Dungeon UI + Lobby + Rewards

## Objetivo
Criar o Lobby de Dungeon Angular (entre fases), telas de vitória/derrota do andar, e persistência de recompensas no localStorage.

## Contexto mínimo necessário
- Lobby entre fases: resultado anterior, troca de arma/item/consumíveis, HP atual, botões "Continuar" e "Abandonar"
- Recompensas localStorage key: `'dungeon_progress'` com `{ floor1Completed, localXp, localGold, lastCompletedAt }`
- Rota Angular: `/dungeon`
- 3 tentativas por andar; ao 0 → tela de falha + voltar ao menu

## Arquivos autorizados a criar/alterar
```
system/frontend/src/
  app/
    dungeon/
      dungeon.component.ts
      dungeon.component.html
      dungeon.component.scss
      dungeon-lobby/
        dungeon-lobby.component.ts
        dungeon-lobby.component.html
      dungeon-result/
        dungeon-result.component.ts
        dungeon-result.component.html
    app.routes.ts (adicionar /dungeon)
    shared/
      services/
        dungeon-storage.service.ts
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  dungeon-engine.ts
  dungeon-types.ts
  weapon-system.ts
  secondary-item-system.ts
  consumable-system.ts
  player-stats.ts
```

## O que NÃO mexer
- `dungeon-engine.ts` (015), `monster-ai.ts` (016), DungeonScene (016)

## Dependências obrigatórias
- Agente 016 concluído

## Critérios de aceite
- Rota `/dungeon` inicia Andar 1 fase 1
- Lobby aparece entre todas as fases
- Troca de arma no lobby reflete na próxima fase
- Tela de vitória do andar salva recompensas em localStorage
- Tela de falha aparece após 3 derrotas, volta ao menu
- Botão "Abandonar" volta ao menu sem salvar recompensas

## Memory

### Objetivo
UI Angular da Dungeon: lobby, resultado, persistência.

### Contexto permitido
APIs de DungeonEngine (015) + WeaponSystem + estrutura de recompensas localStorage.

### Arquivos autorizados
Os listados.

### Dependências
016 concluído.

### Restrições
- `DungeonStorageService` encapsula todo localStorage de dungeon.
- Não duplicar lógica de batalha — a DungeonScene (016) gerencia o combate.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-017.md`.

## Limpeza pós-versão
Após v0.8.0 completa (015+016+017): deletar `v0.8.0.md` da raiz.
