# Agent 024 — v1.0.0 Inventário Completo

## Objetivo
Expandir o InventoryModule para suportar todos os slots de equipamento, tipos de vínculo e lógica de equipar/desequipar com validação.

## Contexto mínimo necessário

### Slots:
arma-principal, item-secundario, armadura, capacete, botas, anel, colar, brinco, pulseira

### Tipos de vínculo:
- `transferable` — vendável no mercado livremente
- `bind-on-equip` — vendável antes de equipar; víncula ao equipar
- `no-trade` — nunca pode ser vendido ou trocado

### Regra de item-secundario: só disponível se arma-principal for 1 mão

## Arquivos autorizados a criar/alterar
```
system/backend/src/
  inventory/
    inventory.module.ts
    inventory.controller.ts
    inventory.service.ts (expandir)
    entities/item-instance.entity.ts (adicionar bind_type, bound_to_character)
    dto/equip-item.dto.ts
  migrations/ (nova migration para bind_type, bound_to_character)
```

## Arquivos apenas para consulta
- `system/backend/src/inventory/` (estrutura existente)
- `system/backend/src/character/entities/character.entity.ts`

## O que NÃO mexer
- AuthModule, CharacterModule, BattleGateway
- Frontend

## Dependências obrigatórias
- Agentes 018+019 concluídos

## Critérios de aceite
- `POST /inventory/equip` valida slot correto para o tipo de item
- Item `bind-on-equip` torna-se `bound_to_character=true` ao equipar
- Item com `no-trade` ou `bound_to_character=true` retorna erro ao tentar listar no mercado
- Arma 2 mãos automaticamente desequipa item-secundario

## Memory

### Objetivo
InventoryModule completo com todos os slots e tipos de vínculo.

### Contexto permitido
Lista de slots + tipos de vínculo + regras de 2 mãos.

### Arquivos autorizados
Os listados.

### Dependências
019 concluído.

### Restrições
- `equipped_slot` na entidade aceita todos os 9 slots.
- Validação de slot correto (arma vai em arma-principal, etc.).

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-024.md`.

## Limpeza pós-versão
Após v1.0.0 completa: deletar `v1.0.0.md` da raiz.
