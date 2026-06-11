# Sub-spec — Agent 009: FE AdminInventoryPanelComponent + HubComponent keydown 'I'

## Objetivo
1. Criar `AdminInventoryPanelComponent` como overlay Angular para admin inspecionar/editar inventários
2. Registrar listener de tecla "I" no `HubComponent` para abrir o painel (somente admins)

## Dependências
- Agent 003 (BE Auth+Admin) — endpoints `/api/admin/*` devem existir e JWT deve ter `isAdmin`
- Agent 008 (FE ConsumableInventoryService) — para seção "Adicionar Consumível" do painel

## Contexto mínimo necessário
- Frontend Angular 17 em `system/frontend/src/app/`
- `system/frontend/src/app/hub/hub.component.ts` — componente do hub onde se registra a tecla
- `system/frontend/src/app/shared/services/` — AuthService para verificar is_admin
- `system/frontend/src/app/shared/game-core/item-catalog.ts` — para listar itens no dropdown
- `ConsumableInventoryService` em `shared/services/consumable-inventory.service.ts` (Agent 008)

## Arquivos a criar
- `system/frontend/src/app/admin/admin-inventory-panel.component.ts`
- `system/frontend/src/app/admin/admin-inventory-panel.component.html`
- `system/frontend/src/app/admin/admin-inventory-panel.component.scss`

## Arquivos autorizados a alterar
- `system/frontend/src/app/hub/hub.component.ts`
- `system/frontend/src/app/hub/hub.component.html`

## Arquivos a consultar (somente leitura)
- `system/frontend/src/app/shared/services/auth.service.ts` — como obter currentUser com is_admin
- `system/frontend/src/app/shared/game-core/item-catalog.ts`
- `system/frontend/src/app/shared/services/consumable-inventory.service.ts`
- Qualquer overlay existente no hub para padrão de template

## O que NÃO mexer
- `CharacterComponent`, `InventoryService`
- Outros overlays fora do hub

## Implementações exigidas

### AdminInventoryPanelComponent
**Template layout:**
```
[ADMIN PANEL] [badge ADMIN vermelho]            [X]
────────────────────────────────────────────────
BUSCAR PERSONAGEM:  [input com debounce]
[lista de resultados: nome | nível | email]
────────────────────────────────────────────────
INVENTÁRIO DE: [NomePersonagem]
[grid 6×6 read-only de ItemSlot com tooltip]
Itens equipados marcados
────────────────────────────────────────────────
ADICIONAR ITEM:
  Categoria: [select]  Item: [select]  Qtd: [input]  [Adicionar]
ADICIONAR CONSUMÍVEL:
  Consumível: [select dos 5]  Qtd: [input]  [Adicionar]
────────────────────────────────────────────────
```

**Lógica:**
- Busca de personagens: `GET /api/admin/characters?search=X` com debounce 300ms
- Ao selecionar personagem: `GET /api/admin/characters/:id/inventory`
- Adicionar item: `POST /api/admin/characters/:id/inventory/add` com `{ item_base_id, rarity: 'common', quantity }`
- Adicionar consumível: `POST /api/admin/characters/:id/consumables/add`
- Feedback: toast de sucesso/erro após cada ação
- `@Input() visible: boolean`
- `@Output() close: EventEmitter<void>`

**Estilo:**
- `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999`
- Modal centralizado (max-width: 800px)
- Fundo escuro com borda dourada
- Badge "ADMIN" vermelho no header

### HubComponent
```typescript
@HostListener('document:keydown', ['$event'])
onKeydown(event: KeyboardEvent): void {
  if ((event.key === 'i' || event.key === 'I') && this.currentUser?.is_admin) {
    this.showAdminPanel = !this.showAdminPanel;
  }
}
```

- `currentUser` deve ser carregado do `AuthService` (verificar se já existe ou adicionar `ngOnInit`)
- `showAdminPanel: boolean = false`
- Adicionar `<app-admin-inventory-panel [visible]="showAdminPanel" (close)="showAdminPanel = false">` no template

## Critérios de aceite
- [ ] Tecla "I" no hub abre painel somente para admins
- [ ] Tecla "I" para não-admin: nada acontece, sem erro no console
- [ ] Busca de personagens funciona com debounce
- [ ] Inventário do personagem selecionado é exibido
- [ ] Adicionar item chama endpoint e exibe feedback
- [ ] Adicionar consumível chama endpoint e exibe feedback
- [ ] Overlay fecha ao clicar X ou pressionar "I" novamente
- [ ] Build frontend sem erros TypeScript

## Formato do resumo final
Criar `.ai-orchestration/agents/009-fe-admin-panel-result.md`

## Memory

### Objetivo
Criar AdminInventoryPanelComponent e registrar keydown 'I' no HubComponent.

### Contexto permitido
Frontend Angular. system/frontend/src/app/admin/ (novo) e system/frontend/src/app/hub/.

### Arquivos autorizados
admin-inventory-panel.component.* (novo), hub.component.ts, hub.component.html

### Dependências
Agent 003 (endpoints admin backend), Agent 008 (ConsumableInventoryService)

### Restrições
NÃO alterar CharacterComponent ou outros overlays. Tecla 'I' só abre para is_admin === true.

### Critérios de aceite
Overlay funcional, busca com debounce, add item/consumible com feedback, keydown somente admin, build limpo.
