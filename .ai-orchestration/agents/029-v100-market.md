# Agent 029 — v1.0.0 Mercado P2P

## Objetivo
Implementar `MarketModule` com listagem de itens para venda, compra, cancelamento, histórico, busca e taxa de 5%.

## Contexto mínimo necessário
- Apenas itens `transferable` (ou `bind-on-equip` não equipados) podem ser listados
- TTL de listagem: 7 dias
- Taxa de transação: 5% do preço (anti-inflação)
- Busca por: tipo de item, raridade, nome de arma

```ts
interface MarketListing { id, sellerId, itemInstanceId, price, createdAt, expiresAt }
```

## Arquivos autorizados a criar/alterar
```
system/backend/src/
  market/
    market.module.ts
    market.service.ts
    market.controller.ts
    entities/market-listing.entity.ts
    dto/create-listing.dto.ts
  economy/
    economy.module.ts
    economy.service.ts
  migrations/ (market_listing)
```

## Arquivos apenas para consulta
```
system/backend/src/
  inventory/inventory.service.ts
  inventory/entities/item-instance.entity.ts
  character/character.service.ts
```

## O que NÃO mexer
- AuthModule, BattleGateway, CraftModule

## Dependências obrigatórias
- Agentes 019+024 concluídos

## Critérios de aceite
- `POST /market/list` valida bind_type antes de aceitar
- `POST /market/buy/:id` transfere item + subtrai taxa do ouro do comprador
- `POST /market/cancel/:id` só o vendedor pode cancelar
- `GET /market` suporta filtros de tipo, raridade, arma
- Histórico de transações disponível em `GET /market/history`
- Logs de todas as transações para auditoria

## Memory

### Objetivo
MarketModule P2P com taxa, filtros, histórico e validação de vínculo.

### Contexto permitido
Spec de MarketListing + regras de bind_type + taxa de 5%.

### Arquivos autorizados
Os listados.

### Dependências
019+024 concluídos.

### Restrições
- Compra é transação atômica: transferir item + cobrar ouro + registrar log.
- Itens com `bound_to_character=true` nunca podem ser listados.
- Cron job para expirar listagens após 7 dias.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-029.md`.

## Limpeza pós-versão
Após v1.0.0 completa: deletar `v1.0.0.md` da raiz.
