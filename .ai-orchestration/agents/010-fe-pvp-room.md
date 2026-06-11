# Sub-spec — Agent 010: FE PvpRoomComponent Redesign Completo

## Objetivo
Redesenhar completamente o `PvpRoomComponent` conforme o layout da imagem de referência (spec seção 12):
- 4 slots de equipe
- Carrossel de mapa com thumbnail
- Seleção de modo de batalha
- Inventário de consumíveis do personagem (real via backend)
- 5 slots de seleção de consumíveis (repetíveis)
- Botão PRONTO

## Dependências
- Agent 005 (BE PvP Room) — novos endpoints de close/kick/ready devem existir
- Agent 008 (FE ConsumableInventoryService) — para carregar e exibir inventário de consumíveis

## Contexto mínimo necessário
- Frontend Angular 17 em `system/frontend/src/app/pvp/`
- Arquivos atuais: `pvp-room.component.ts`, `pvp-room.component.html`, `pvp-room.component.scss`
- O sistema atual usa polling de 3s para atualizar o estado da sala
- `ConsumableInventoryService` em `shared/services/consumable-inventory.service.ts` (Agent 008)
- Assets de mapas: `assets/maps/{slug}/background.png` (slugs: plains, mystic-castle, deep-mines, arcane-ruins, runic-forest)
- Assets de consumíveis: `assets/items/consumables/` e `assets/rune-wars/items/consumable/`
- Background do hub: `assets/hub/hub_background_painted.png`

## Arquivos autorizados a alterar
- `system/frontend/src/app/pvp/pvp-room.component.ts`
- `system/frontend/src/app/pvp/pvp-room.component.html`
- `system/frontend/src/app/pvp/pvp-room.component.scss`

## Arquivos a consultar (somente leitura)
- `system/frontend/src/app/shared/services/consumable-inventory.service.ts`
- `system/frontend/src/app/pvp/pvp.service.ts` (ou como se chama o service pvp no frontend)
- `system/frontend/src/app/shared/services/auth.service.ts` — para obter characterId atual

## O que NÃO mexer
- `pvp-lobby.component.*`
- `pvp.service.ts` (backend service no frontend — não confundir com pvp.service.ts do backend)
- Outros componentes fora de `pvp/`

## Layout a implementar

```
┌─────────────────────────────────────────────────────┐
│ ← SALA PvP              [💎 15,320] [🪙 2,845,700]   │
├──────────────────────────┬──────────────────────────┤
│    SUA EQUIPE            │   SELEÇÃO DE MAPA        │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐   │  ┌──────────────────┐    │
│  │ 1│ │+2│ │+3│ │+4│   │  │  [thumbnail mapa] │    │
│  └──┘ └──┘ └──┘ └──┘   │  └──────────────────┘    │
│                         │  ← FLORESTA RÚNICA →      │
│                         │  ●●●●●                    │
│                         ├──────────────────────────┤
│  CONSUMÍVEIS            │   SELEÇÃO DE MODO        │
│  SELECIONADOS           │  [RANKEADA][LIVRE][GUILD] │
│  ┌─┐┌─┐┌─┐┌─┐┌─┐      │                          │
│  └─┘└─┘└─┘└─┘└─┘      ├──────────────────────────┤
│  INVENTÁRIO CONSUMÍVEIS │          [PRONTO]         │
│  [ícone x12][ícone x9] │                          │
└──────────────────────────┴──────────────────────────┘
```

## Estado do componente a implementar

```typescript
interface SlotState {
  player: { characterId: string; name: string; level: number; rating: number } | null;
  closed: boolean;
}

// Propriedades:
slots: SlotState[] = Array(4).fill(null).map(() => ({ player: null, closed: false }));
selectedMode: 'ranked' | 'free' | 'guild' = 'ranked';
selectedMapIndex = 0;
consumableSelection: (string | null)[] = Array(5).fill(null);
consumableInventory: { id: string; quantity: number; name: string; iconPath: string }[] = [];
isOwner = false;
currentCharacterId: string = '';

readonly MAPS = [
  { slug: 'plains', name: 'Planícies' },
  { slug: 'mystic-castle', name: 'Castelo Místico' },
  { slug: 'deep-mines', name: 'Minas Profundas' },
  { slug: 'arcane-ruins', name: 'Ruínas Arcanas' },
  { slug: 'runic-forest', name: 'Floresta Rúnica' },
];
```

## Métodos a implementar

```typescript
// Carrossel
get selectedMap() { return this.MAPS[this.selectedMapIndex]; }
get mapThumbnailUrl() { return `assets/maps/${this.selectedMap.slug}/background.png`; }
nextMap() { this.selectedMapIndex = (this.selectedMapIndex + 1) % this.MAPS.length; }
prevMap() { this.selectedMapIndex = (this.selectedMapIndex - 1 + this.MAPS.length) % this.MAPS.length; }

// Consumíveis
selectConsumable(consumableId: string): void {
  const nextSlot = this.consumableSelection.findIndex(s => s === null);
  if (nextSlot === -1) { /* toast: slots cheios */ return; }
  this.consumableSelection[nextSlot] = consumableId;
}
removeConsumable(slotIndex: number): void {
  this.consumableSelection[slotIndex] = null;
}

// Slots de equipe (somente dono)
closeSlot(slotIndex: number): void { /* POST /pvp/rooms/:id/slots/:index/close */ }
kickPlayer(slotIndex: number): void { /* modal de confirmação → POST .../kick */ }

// PRONTO
onReady(): void {
  const selection = this.consumableSelection.filter(s => s !== null);
  /* PATCH /pvp/rooms/:id/ready com { characterId, consumableSelection: selection } */
}
```

## Regras de negócio a implementar (RN18–RN22)
- RN18/RN19: Dono pode fechar/reabrir vaga vazia (toggle via close endpoint)
- RN20: Dono pode chutar jogador (modal de confirmação antes de chutar; dono não pode chutar a si mesmo)
- RN21: Modo "Batalha de Guilds" aparece desabilitado se personagem não tem guild
- RN22: Botão "PRONTO" substitui os botões "Jogar vs CPU" e "Aguardar Jogador"

## SCSS
- Background: `assets/hub/hub_background_painted.png` com `overlay rgba(0,0,0,0.7)` no topo
- Slots de equipe: bordas douradas ornamentadas (inspirar nos slots do character component)
- Slot 1 (líder): destaque visual diferente
- Carrossel: setas `<` `>` laterais, dots de paginação abaixo
- Modos: 3 botões com ícone, botão selecionado com borda roxa luminosa
- Consumíveis selecionados: 5 slots numerados, borda laranja
- Botão PRONTO: laranja/dourado, full-width na coluna direita inferior

## Critérios de aceite
- [ ] 4 slots de equipe exibidos corretamente
- [ ] Thumbnail do mapa muda ao navegar no carrossel
- [ ] Seleção de modo: 3 opções, botão ativo destacado
- [ ] Inventário de consumíveis carrega do backend via ConsumableInventoryService
- [ ] Click em consumível do inventário preenche próximo slot livre
- [ ] Mesmo consumível pode ser adicionado múltiplas vezes (5 slots independentes)
- [ ] Remover consumível de slot libera o slot
- [ ] Toast quando todos os 5 slots estão preenchidos
- [ ] Dono pode fechar/abrir vaga vazia
- [ ] Dono vê modal ao clicar em slot com player
- [ ] Botão "PRONTO" existe e chama endpoint de ready
- [ ] Player sem consumíveis vê inventário vazio sem crash
- [ ] Build frontend sem erros TypeScript

## Formato do resumo final
Criar `.ai-orchestration/agents/010-fe-pvp-room-result.md`

## Memory

### Objetivo
Redesenhar completamente PvpRoomComponent: 4 slots, carrossel de mapa, modos, consumíveis (5 slots repetíveis), botão PRONTO.

### Contexto permitido
Frontend Angular. system/frontend/src/app/pvp/ apenas.

### Arquivos autorizados
pvp-room.component.ts, pvp-room.component.html, pvp-room.component.scss

### Dependências
Agent 005 (endpoints close/kick/ready), Agent 008 (ConsumableInventoryService)

### Restrições
NÃO alterar pvp-lobby.component ou pvp.service.ts. NÃO criar subcomponentes em arquivos separados (usar inline).

### Critérios de aceite
Layout fiel ao spec, carrossel, modos, consumíveis reais, close/kick/ready funcionando, build limpo.
