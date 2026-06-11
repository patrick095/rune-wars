# Sub-spec — Agent 007: FE VaultScreenComponent + GameScreen 'vault'

## Objetivo
1. Criar `VaultScreenComponent` como overlay Angular dedicado para o cofre
2. Registrar `GameScreen: 'vault'` no `GameNavigatorService`
3. Conectar corretamente ao `VaultService` e `InventoryService` existentes

## Dependências
- Agent 006 (FE Inventory Fix) — `InventoryService` deve estar corrigido antes de integrar ao vault

## Contexto mínimo necessário
- Frontend Angular 17 em `system/frontend/src/app/`
- `VaultService` existe e está completo no backend — só precisa integração frontend
- `VaultGridComponent` existe mas pode não estar corretamente conectado
- `InventoryGridComponent` e `ItemSlotComponent` existem para reutilização
- `GameNavigatorService` gerencia telas — verificar padrão de GameScreen existente
- Padrão de overlay: verificar `CharacterComponent` ou outro overlay existente como referência

## Arquivos a criar
- `system/frontend/src/app/vault/vault-screen.component.ts`
- `system/frontend/src/app/vault/vault-screen.component.html`
- `system/frontend/src/app/vault/vault-screen.component.scss`

## Arquivos autorizados a alterar
- `system/frontend/src/app/shared/services/game-navigator.service.ts` — registrar 'vault'
- `system/frontend/src/app/app.component.ts` — incluir VaultScreenComponent no overlay system
- `system/frontend/src/app/app.component.html` — adicionar `<app-vault-screen>` condicional
- `system/frontend/src/app/vault/` — qualquer arquivo existente que precise ajuste

## Arquivos a consultar (somente leitura)
- `system/frontend/src/app/shared/services/vault.service.ts`
- `system/frontend/src/app/vault/vault-grid.component.ts` (se existir)
- `system/frontend/src/app/shared/services/game-navigator.service.ts`
- Qualquer overlay existente como referência de padrão

## O que NÃO mexer
- `CharacterComponent` (não remover aba cofre antiga — apenas criar tela nova; a aba pode ser removida em limpeza posterior se necessário)
- `InventoryService` (Agent 006)
- Outros overlays existentes

## Implementações exigidas

### VaultScreenComponent
- Standalone component com imports: `InventoryGridComponent`, `VaultGridComponent`, `CommonModule`, `FormsModule`
- `ngOnInit()`: carrega inventário + cofre em paralelo via `forkJoin`
- Template: duas colunas — "Inventário" (esquerda, 6×6) e "Cofre" (direita, 6×10)
- Header: gold do personagem + gold no cofre
- DnD entre grids:
  - Soltar inventário → cofre: chamar `vaultService.deposit(itemId, slotIndex)`, recarregar ambos
  - Soltar cofre → inventário: mostrar modal de confirmação (taxa 100g), chamar `vaultService.withdraw(itemId, slotIndex)`, recarregar
- Modal de confirmação: "Retirar item custa 100g. Confirmar?" com botões "Confirmar" e "Cancelar"
- Botão fechar: emite `(close)` ou chama `gameNavigatorService.navigate('hub')`

### GameNavigatorService
- Adicionar 'vault' ao tipo `GameScreen` (verificar como estão definidas as outras telas)
- Registrar transição: 'vault' pode ser aberto de 'hub' e fechado de volta para 'hub'

### AppComponent
- Mostrar `VaultScreenComponent` quando `currentScreen === 'vault'`

### SCSS
- Seguir estilo dark medieval do jogo
- Overlay com `position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000`
- Background semi-transparente escuro
- Duas colunas com borda dourada

## Critérios de aceite
- [ ] Navegação `gameNavigator.navigate('vault')` abre a tela do cofre
- [ ] Inventário e cofre carregam em paralelo
- [ ] Drag do inventário → cofre faz depósito real via backend
- [ ] Drag do cofre → inventário exibe modal de taxa (100g)
- [ ] Confirmar retirada executa corretamente e atualiza UI
- [ ] Botão fechar retorna ao hub
- [ ] Build frontend sem erros TypeScript

## Formato do resumo final
Criar `.ai-orchestration/agents/007-fe-vault-result.md`

## Memory

### Objetivo
Criar VaultScreenComponent como overlay Angular e registrar GameScreen 'vault'.

### Contexto permitido
Frontend Angular. system/frontend/src/app/vault/ e system/frontend/src/app/shared/services/.

### Arquivos autorizados
vault-screen.component.* (novo), game-navigator.service.ts, app.component.ts, app.component.html

### Dependências
Agent 006 (InventoryService corrigido)

### Restrições
NÃO remover CharacterComponent ou sua aba cofre existente. NÃO alterar InventoryService.

### Critérios de aceite
Overlay funcional, DnD com deposit/withdraw, modal de taxa, retorno ao hub, build limpo.
