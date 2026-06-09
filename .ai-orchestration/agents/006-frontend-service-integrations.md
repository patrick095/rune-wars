# Agente 006 — Frontend: Integrações de Serviço

## Objetivo
Atualizar `CharacterComponent`, `InventoryService`, `VaultService` (se hardcoded) e `HubComponent` para usar `ActiveCharacterService` em vez de IDs hardcoded. Adicionar link "Trocar Personagem" no hub.

## Contexto mínimo necessário
- `ActiveCharacterService` criado pelo agente 003
- `CharacterComponent`: usa `characterId = 1` hardcoded → deve usar `activeCharacter.characterId`
- `InventoryService`: recebe `characterId: number` hardcoded em parâmetros → deve receber do caller via `activeCharacter`
- `VaultService`: verificar se tem hardcoded — se sim, atualizar
- `HubComponent`: adicionar link "Trocar Personagem" que navega para `/character-select`

## Arquivos que pode alterar
- `system/frontend/src/app/character/character.component.ts`
- `system/frontend/src/app/shared/services/inventory.service.ts`
- `system/frontend/src/app/shared/services/vault.service.ts`
- `system/frontend/src/app/hub/hub.component.ts`
- `system/frontend/src/app/hub/hub.component.html`

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/services/active-character.service.ts` (agente 003)
- `system/frontend/src/app/shared/models/character.model.ts` (agente 003)
- `system/frontend/src/app/shared/services/api.service.ts`
- `system/frontend/src/app/dungeon/dungeon.component.ts` (verificar uso de characterId)

## O que NÃO deve mexer
- `character.guard.ts` (agente 004)
- `app.routes.ts` (agente 004)
- `active-character.service.ts` (agente 003)
- `CharacterSelectComponent` (agente 005)
- Backend
- `PvpComponent` — já lê `rw_character_id` do localStorage, funciona automaticamente

## Dependências obrigatórias
- **Agente 003**: `ActiveCharacterService` existe

## Tarefas específicas

### CharacterComponent
- Remover `characterId = 1` hardcoded
- Injetar `ActiveCharacterService`
- Usar `this.activeCharacter.characterId` nas chamadas de API
- Ao salvar stats com sucesso: chamar `activeCharacter.setActive(updatedCharacter)` para manter o estado sincronizado

### InventoryService
- A assinatura atual é `getInventory(characterId: number)` — mudar para `getInventory(characterId: string)`
- Verificar se componentes que chamam `getInventory` passam o ID — atualizar para passar `activeCharacter.characterId`
- Importante: `characterId` agora é `string` (UUID), não `number`

### VaultService
- Ler o arquivo e verificar se há `characterId` hardcoded
- Se houver: injetar `ActiveCharacterService` e usar o ID dinâmico
- Se não houver: registrar no resumo que não foi necessário alterar

### HubComponent
- Adicionar link/botão "Trocar Personagem" no template
- Ao clicar: navegar para `/character-select` (sem limpar o personagem ativo — o usuário pode cancelar)
- Exibir nome do personagem ativo no hub (ex: "Jogando como: [nome]")

## Critérios de aceite
- [ ] `CharacterComponent` não tem mais `characterId = 1`
- [ ] `InventoryService.getInventory()` aceita `characterId: string`
- [ ] VaultService atualizado se necessário
- [ ] Hub exibe nome do personagem ativo
- [ ] Hub tem link "Trocar Personagem" navegando para `/character-select`
- [ ] `npx tsc --noEmit` sem erros

## Restrições
- Não quebrar componentes que chamam `InventoryService` — verificar todos os callers
- O link "Trocar Personagem" NÃO deve limpar `activeCharacter` — isso é intencional (permite cancelar a troca)

## Memory

### Objetivo
Atualizar CharacterComponent, InventoryService, VaultService e HubComponent para usar ActiveCharacterService.

### Contexto permitido
- `system/frontend/src/app/shared/services/active-character.service.ts`
- `system/frontend/src/app/character/character.component.ts`
- `system/frontend/src/app/shared/services/inventory.service.ts`
- `system/frontend/src/app/shared/services/vault.service.ts`
- `system/frontend/src/app/hub/hub.component.{ts,html}`

### Arquivos autorizados
- Os 5 arquivos acima (editar)

### Dependências
- Agente 003 concluído

### Restrições
- Não limpar personagem ativo ao navegar para /character-select pelo hub
- characterId agora é string (UUID)
- Verificar todos os callers do InventoryService antes de mudar assinatura

### Critérios de aceite
- Zero `characterId = 1` hardcoded restantes
- Hub com nome do personagem + link "Trocar Personagem"
- `npx tsc --noEmit` sem erros

## Formato do resumo final
Criar `.ai-orchestration/agents/006-frontend-service-integrations-DONE.md` seguindo o formato padrão de resumo.
