# Sub-spec — Agent 011: QA Build + Validação Final

## Objetivo
Validar que toda a implementação da v1.7.0 está correta:
1. Build backend sem erros TypeScript
2. Build frontend sem erros TypeScript
3. Verificar que critérios de aceite principais estão atendidos via inspeção de código
4. Registrar qualquer bug encontrado com classificação de criticidade

## Dependências
- TODOS os agentes anteriores (001 a 010) devem estar concluídos

## Contexto mínimo necessário
- Sistema completo: `system/backend/` e `system/frontend/`
- `npm run build` disponível em ambos os projetos
- Todos os resumos dos agentes anteriores em `.ai-orchestration/agents/*-result.md`

## Arquivos autorizados a alterar
- NENHUM arquivo do projeto (somente leitura e execução de comandos)
- Criar `.ai-orchestration/agents/011-qa-build-result.md`

## Passos a executar

### 1. Ler todos os resumos dos agentes
Ler os arquivos `*-result.md` em `.ai-orchestration/agents/` para entender o que foi feito, bugs reportados e pendências.

### 2. Build backend
```bash
cd system/backend && npm run build
```
- Registrar erros TypeScript encontrados
- Classificar como CRÍTICO se houver erros de compilação

### 3. Build frontend
```bash
cd system/frontend && npm run build
```
- Registrar erros TypeScript encontrados
- Classificar como CRÍTICO se houver erros de compilação

### 4. Verificação de código dos critérios de aceite

Para cada critério, verificar via leitura de código:

**Inventário:**
- [ ] `inventory.service.ts` usa `/api/characters/${id}/inventory`
- [ ] `getItemDefinition()` é chamado para resolver itens
- [ ] Fallback "Item Desconhecido" implementado
- [ ] equipItem usa `PUT /api/characters/:id/inventory/:itemId/equip`

**Cofre:**
- [ ] `VaultScreenComponent` existe em `app/vault/`
- [ ] GameNavigatorService tem 'vault' como GameScreen
- [ ] AppComponent renderiza VaultScreenComponent condicionalmente

**Admin Panel:**
- [ ] `AdminInventoryPanelComponent` existe em `app/admin/`
- [ ] HubComponent tem `@HostListener('document:keydown')` com verificação `is_admin`
- [ ] Endpoints `/api/admin/*` existem no backend com `AdminGuard`

**PvP Room:**
- [ ] `pvp-room.component.html` tem 4 slots de equipe
- [ ] Carrossel com `MAPS` array e thumbnail implementado
- [ ] `consumableSelection: (string|null)[]` de 5 posições
- [ ] `selectConsumable()` com verificação de slot cheio
- [ ] Botão PRONTO presente e chama `onReady()`

**Consumíveis:**
- [ ] `ConsumableInventoryService` existe
- [ ] `character_consumable` entity criada

**Backend:**
- [ ] `AdminModule` registrado no `AppModule`
- [ ] `ConsumableInventoryModule` registrado no `AppModule`
- [ ] `is_admin` em `user.entity.ts`
- [ ] `isAdmin` no JWT (auth.service.ts)

### 5. Verificar riscos conhecidos
- Verificar se `ITEM_CATALOG` tem fallback para item_base_ids desconhecidos
- Verificar se `pvp_room` migration usou `ADD COLUMN IF NOT EXISTS`

### 6. Classificar bugs encontrados
Registrar em `.ai-orchestration/BUGS_AND_BLOCKERS.md`:
- CRÍTICO: build falha, endpoint 404 esperado, auth guard ausente
- IMPORTANTE: funcionalidade incompleta mas build passa
- BAIXO: visual off, edge case não coberto

## Critérios de aceite
- [ ] `npm run build` passa no backend sem erros
- [ ] `npm run build` passa no frontend sem erros
- [ ] Nenhum bug CRÍTICO não resolvido
- [ ] Todos os arquivos novos existem nos caminhos esperados
- [ ] `FILES_CHANGED.md` atualizado com todos os arquivos alterados

## Formato do resumo final
Criar `.ai-orchestration/agents/011-qa-build-result.md` com:
- Status dos builds
- Lista de bugs encontrados por criticidade
- Recomendação: APROVADO para commit ou BLOQUEADO (listar correções necessárias)

## Memory

### Objetivo
Validar build backend e frontend, verificar critérios de aceite por inspeção de código, classificar bugs.

### Contexto permitido
Todo o projeto system/backend/ e system/frontend/. Somente leitura de código e execução de builds.

### Arquivos autorizados
Somente criar 011-qa-build-result.md e atualizar BUGS_AND_BLOCKERS.md e FILES_CHANGED.md.

### Dependências
Todos os 10 agentes anteriores (001-010) concluídos.

### Restrições
NÃO alterar código do projeto. NÃO corrigir bugs encontrados — apenas registrar.

### Critérios de aceite
Builds passando, checklist de critérios validado, relatório final criado.
