# Sub-spec — Agent 008: FE ConsumableInventoryService

## Objetivo
Criar `ConsumableInventoryService` Angular para comunicar com os endpoints de inventário de consumíveis criados pelo Agent 004.

## Dependências
- Agent 004 (BE Consumables) — endpoints `/characters/:id/consumables/*` devem existir

## Contexto mínimo necessário
- Frontend Angular 17 em `system/frontend/src/app/`
- Padrão de services: ver `system/frontend/src/app/shared/services/inventory.service.ts`
- Consumíveis existentes: 'heal', 'teleport', 'ice-throw', 'invisibility', 'calibration-shot'
- Assets: `assets/items/consumables/` e `assets/rune-wars/items/consumable/`

## Arquivos a criar
- `system/frontend/src/app/shared/services/consumable-inventory.service.ts`

## Arquivos autorizados a alterar
- Nenhum arquivo existente precisa ser alterado nesta etapa

## Arquivos a consultar (somente leitura)
- `system/frontend/src/app/shared/services/inventory.service.ts` — padrão de service
- `system/frontend/src/app/shared/game-core/item-catalog.ts` — se consumíveis estiverem lá

## O que NÃO mexer
- Nenhum arquivo existente

## Implementações exigidas

### Interface + Constante
```typescript
export interface CharacterConsumable {
  id: string;
  character_id: string;
  consumable_id: string;
  quantity: number;
}

export interface ConsumableDefinition {
  id: string;
  name: string;
  iconPath: string;
  description: string;
}

export const CONSUMABLE_CATALOG: Record<string, ConsumableDefinition> = {
  'heal': { id: 'heal', name: 'Poção de Cura', iconPath: 'assets/items/consumables/heal.png', description: 'Restaura HP.' },
  'teleport': { id: 'teleport', name: 'Teleporte', iconPath: 'assets/items/consumables/teleport.png', description: 'Teleporta o personagem.' },
  'ice-throw': { id: 'ice-throw', name: 'Lança Gelo', iconPath: 'assets/items/consumables/ice-throw.png', description: 'Congela o alvo.' },
  'invisibility': { id: 'invisibility', name: 'Invisibilidade', iconPath: 'assets/items/consumables/invisibility.png', description: 'Torna o personagem invisível.' },
  'calibration-shot': { id: 'calibration-shot', name: 'Tiro Calibrado', iconPath: 'assets/items/consumables/calibration-shot.png', description: 'Disparo preciso.' },
};
```

### ConsumableInventoryService
```typescript
@Injectable({ providedIn: 'root' })
export class ConsumableInventoryService {
  getConsumables(characterId: string): Observable<CharacterConsumable[]>
  useConsumable(characterId: string, consumableId: string): Observable<unknown>
  addConsumable(characterId: string, consumableId: string, quantity: number): Observable<unknown>
  getConsumableDefinition(consumableId: string): ConsumableDefinition
}
```

- `getConsumables`: `GET /api/characters/${characterId}/consumables`
- `useConsumable`: `POST /api/characters/${characterId}/consumables/use` com `{ consumableId }`
- `addConsumable`: `POST /api/characters/${characterId}/consumables/add` com `{ consumableId, quantity }`
- `getConsumableDefinition`: retorna de `CONSUMABLE_CATALOG[id]` com fallback genérico

## Critérios de aceite
- [ ] Service criado com `providedIn: 'root'`
- [ ] 3 métodos HTTP implementados com tipagem correta
- [ ] `CONSUMABLE_CATALOG` cobre os 5 consumíveis conhecidos
- [ ] `getConsumableDefinition()` tem fallback para id desconhecido
- [ ] Build frontend sem erros TypeScript

## Formato do resumo final
Criar `.ai-orchestration/agents/008-fe-consumable-service-result.md`

## Memory

### Objetivo
Criar ConsumableInventoryService com 3 métodos HTTP e CONSUMABLE_CATALOG com os 5 consumíveis.

### Contexto permitido
Frontend Angular. system/frontend/src/app/shared/services/ apenas.

### Arquivos autorizados
consumable-inventory.service.ts (criar novo apenas)

### Dependências
Agent 004 (endpoints backend devem existir)

### Restrições
NÃO modificar arquivos existentes. Criar apenas o novo service.

### Critérios de aceite
Service criado, 3 métodos, catálogo de consumíveis, fallback, build limpo.
