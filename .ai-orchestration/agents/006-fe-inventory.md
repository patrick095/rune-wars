# Sub-spec — Agent 006: FE Inventory Fix + CharacterComponent Equip/Unequip

## Objetivo
1. Corrigir `InventoryService` para usar endpoints corretos e resolver itens via `ITEM_CATALOG`
2. Corrigir `CharacterComponent` para fazer equip/unequip real via backend
3. Corrigir `EquipmentSlotsComponent.onDrop()` para emitir evento correto

## Dependências
- Agent 002 (ITEM_CATALOG) — `item-catalog.ts` deve existir

## Contexto mínimo necessário
- Frontend Angular 17 em `system/frontend/src/app/`
- Arquivos-chave: `shared/services/inventory.service.ts`, `character/character.component.ts`
- Endpoint real de inventário: `GET /api/characters/:id/inventory` (retorna `ItemInstance[]`)
- Endpoint real de equip: `PUT /api/characters/:id/inventory/:itemId/equip` com `{ slot: string | null }`
- ITEM_CATALOG em `shared/game-core/item-catalog.ts` (criado por Agent 002)

## Arquivos autorizados a alterar
- `system/frontend/src/app/shared/services/inventory.service.ts`
- `system/frontend/src/app/character/character.component.ts`
- `system/frontend/src/app/character/character.component.html` (se necessário para equip/unequip)
- Qualquer subcomponente em `system/frontend/src/app/character/` que tenha `onDrop()` de equipment vazio

## Arquivos a consultar (somente leitura)
- `system/frontend/src/app/shared/game-core/item-catalog.ts` (Agent 002)
- `system/backend/src/inventory/item-instance.entity.ts` — estrutura do ItemInstance
- `system/backend/src/inventory/inventory.controller.ts` — confirmar endpoints

## O que NÃO mexer
- `VaultService`, `VaultGridComponent`
- Módulos de batalha, craft, mercado
- `AdminInventoryPanelComponent` (Agent 009)

## Implementações exigidas

### InventoryService
```typescript
// Corrigir getInventory():
getInventory(characterId: string): Observable<InventoryItem[]> {
  return this.http.get<ItemInstance[]>(`/api/characters/${characterId}/inventory`)
    .pipe(map(instances => instances.map(i => this.resolveItem(i))));
}

// Novo método privado:
private resolveItem(instance: ItemInstance): InventoryItem {
  const def = getItemDefinition(instance.item_base_id);
  return { ...instance, ...def };
}

// Corrigir equipItem():
equipItem(characterId: string, itemId: string, slot: string): Observable<unknown> {
  return this.http.put(`/api/characters/${characterId}/inventory/${itemId}/equip`, { slot });
}

// Corrigir unequipItem():
unequipItem(characterId: string, itemId: string): Observable<unknown> {
  return this.http.put(`/api/characters/${characterId}/inventory/${itemId}/equip`, { slot: null });
}
```

### CharacterComponent
- `loadInventory()`: já chama `inventoryService.getInventory()` — após corrigir service, passará a funcionar com dados reais
- Adicionar `onEquip(item: InventoryItem)`: chama `inventoryService.equipItem()`, recarrega inventário
- Adicionar `onUnequip(slot: EquipmentSlotType)`: chama `inventoryService.unequipItem()`, recarrega inventário
- Ao inicializar: itens com `equipped_slot !== null` devem ir para `equippedItems` (map por slot)
- Mostrar loading spinner enquanto carrega
- Mostrar mensagem "Inventário vazio" quando array vazio

### EquipmentSlotsComponent (se existir em character/)
- `onDrop(event)`: implementar emissão de `(itemDropped)` com o item arrastado

### Regras de negócio (RN03–RN05)
- weapon → slot mainHand
- secondary → offHand
- armor → chest
- head → head
- legs → legs
- accessory → accessory1 (se livre) ou accessory2

## Critérios de aceite
- [ ] `getInventory()` chama `/api/characters/:id/inventory`
- [ ] Itens exibem nome e ícone resolvidos do ITEM_CATALOG
- [ ] item_base_id desconhecido → "Item Desconhecido" sem quebrar UI
- [ ] Equip chama backend e atualiza UI
- [ ] Unequip chama backend e atualiza UI
- [ ] Loading spinner visível durante carregamento
- [ ] Build frontend sem erros TypeScript

## Formato do resumo final
Criar `.ai-orchestration/agents/006-fe-inventory-result.md`

## Memory

### Objetivo
Corrigir InventoryService (endpoints + ITEM_CATALOG) e CharacterComponent (equip/unequip reais).

### Contexto permitido
Frontend Angular. system/frontend/src/app/shared/services/ e system/frontend/src/app/character/.

### Arquivos autorizados
inventory.service.ts, character.component.ts, character.component.html, subcomponentes de equipment em character/

### Dependências
Agent 002 (ITEM_CATALOG deve existir em shared/game-core/item-catalog.ts)

### Restrições
NÃO alterar VaultService, módulos de batalha, craft ou mercado.

### Critérios de aceite
Endpoints corretos, resolução via ITEM_CATALOG, equip/unequip real, fallback para item desconhecido, build limpo.
