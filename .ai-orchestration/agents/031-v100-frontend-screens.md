# Agent 031 — v1.0.0 Frontend: Todas as Novas Telas

## Objetivo
Criar todas as telas Angular da v1.0.0: inventário completo, craft, upgrade, mercado, guilda, rankings, matchmaking ranqueado, criação de personagem com raça, e integrar dungeon multiplayer.

## Contexto mínimo necessário

### Telas a criar:
1. `/character/create` — criação com escolha de raça (Humano/Anão/Elfo) + distribuição de atributos iniciais
2. `/inventory` — todos os 9 slots de equipamento com drag & drop ou botões equipar/desequipar
3. `/craft` — listagem de receitas, materiais necessários, botão craft com feedback de chance
4. `/upgrade` — selecionar item, mostrar tabela de chances, resultado com animação
5. `/market` — listagem com filtros (tipo, raridade, arma), botões comprar/listar, histórico
6. `/guild` — membros, banco, chat, botão para PvP de guildas
7. `/rankings` — tabs: Diário/Semanal/Mensal/Geral × Solo/Duplas/Guildas
8. `/matchmaking` (expandir v0.9.0) — adicionar opção de ranqueado vs. casual
9. `/dungeon` (expandir v0.8.0) — adicionar seleção de trilha e lobby multiplayer

### Fluxo de criação de personagem: ao primeiro login sem personagem → redirecionar para `/character/create`

## Arquivos autorizados a criar/alterar
```
system/frontend/src/app/
  character/
    create/
      character-create.component.ts
      character-create.component.html
      character-create.component.scss
  inventory/
    inventory.component.ts, .html, .scss
    equipment-slot/equipment-slot.component.ts
  craft/
    craft.component.ts, .html, .scss
  upgrade/
    upgrade.component.ts, .html, .scss
  market/
    market.component.ts, .html, .scss
    market-list/market-list.component.ts
  guild/
    guild.component.ts, .html, .scss
    guild-chat/guild-chat.component.ts
  rankings/
    rankings.component.ts, .html, .scss
  app.routes.ts (adicionar todas as rotas)
  shared/
    services/
      market.service.ts, guild.service.ts, craft.service.ts,
      upgrade.service.ts, ranking.service.ts
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/services/
  auth.service.ts, battle-socket.service.ts
system/frontend/src/app/
  character/character.component.ts
  matchmaking/matchmaking.component.ts
  dungeon/dungeon.component.ts
```

## O que NÃO mexer
- game-core TS puro
- BattleScene, TerrainEngine

## Dependências obrigatórias
- Agentes 023–030 todos concluídos

## Critérios de aceite
- Criação de personagem com raça funcional
- Inventário exibe todos os slots, equipar/desequipar funciona
- Craft mostra chance real baseada na Sorte do personagem
- Mercado lista itens com filtros, compra debita ouro
- Chat de guilda funciona em tempo real
- Rankings exibem top 100 por período e modalidade
- Mobile-first: todas as telas funcionam em 375px

## Memory

### Objetivo
Todas as telas Angular v1.0.0 com integração ao backend.

### Contexto permitido
Lista de telas + serviços já criados no backend.

### Arquivos autorizados
Os listados.

### Dependências
023–030 todos concluídos.

### Restrições
- Reutilizar serviços existentes (AuthService, BattleSocketService).
- Cada tela tem seu próprio service injetado.
- Lazy loading para todas as rotas.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-031.md`.

## Limpeza pós-versão
Após v1.0.0 completa: deletar `v1.0.0.md` da raiz.
