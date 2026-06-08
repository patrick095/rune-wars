# Agent 027 — v1.0.0 Dungeon Andares 2–5

## Objetivo
Implementar os Andares 2–5 da dungeon com chefes únicos, 4 trilhas de dificuldade, e dungeon multiplayer (até 4 jogadores via WebSocket).

## Contexto mínimo necessário

### Andares:
- Andar 2: Minas Perdidas, 3 fases, Chefe: Mestre Escavador
- Andar 3: Floresta Corrompida, 3 fases, Chefe: Guardião Corrompido
- Andar 4: Fortaleza Rúnica, 4 fases, Chefe: Comandante + Trono Rúnico
- Andar 5: Núcleo do Caos, 4 fases, Chefes: Coração do Caos + Avatar do Caos

### Trilhas de dificuldade:
| Trilha | IA | Mecânica extra | Recompensa |
|--------|----|----|-----|
| Iniciados | Básica | Minimal | Comum |
| Aventureiros | Intermediária | Chefe muda em 50% | Incomum |
| Campeões | Avançada | Chefe muda em 50%+10% | Raro |
| Heróis | Máxima | Invocações, padrões adaptativos | Épico/Lendário |

### Multiplayer: lobby para até 4 jogadores, turnos sincronizados via WS, XP de guilda se membros suficientes

## Arquivos autorizados a criar/alterar
```
system/backend/src/
  dungeon/
    dungeon.module.ts (expandir)
    dungeon.service.ts (adicionar andares 2–5)
    dungeon-gateway.ts (WebSocket multiplayer)
    entities/dungeon-progress.entity.ts (adicionar trilha)
    floors/
      floor2.ts, floor3.ts, floor4.ts, floor5.ts
    difficulty/
      difficulty-config.ts
system/frontend/src/app/shared/game-core/
  maps/
    (adicionar mapas dos andares 2–5)
```

## Arquivos apenas para consulta
```
system/backend/src/dungeon/
  (estrutura existente do Andar 1)
system/backend/src/battle/battle.gateway.ts
```

## O que NÃO mexer
- AuthModule, InventoryModule, RankingModule
- Frontend components existentes

## Dependências obrigatórias
- Agentes 018+019+020 concluídos

## Critérios de aceite
- Andares 2–5 iniciam sem erro
- 4 trilhas com comportamento de IA distinto
- Dungeon multiplayer aceita até 4 jogadores no lobby
- XP de guilda creditada quando grupo tem membros de mesma guilda

## Memory

### Objetivo
Andares 2–5, 4 trilhas de dificuldade, multiplayer dungeon.

### Contexto permitido
Tabela de andares + trilhas + spec multiplayer.

### Arquivos autorizados
Os listados.

### Dependências
019+020 concluídos.

### Restrições
- Reaproveitr DungeonEngine do Andar 1 para os novos andares.
- Trilha Heróis: padrões adaptativos = chefe muda estratégia baseado nas armas do jogador.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-027.md`.

## Limpeza pós-versão
Após v1.0.0 completa: deletar `v1.0.0.md` da raiz.
