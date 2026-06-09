# Agente 002 — Backend: CharacterService Validações + Controller DELETE

## Objetivo
Adicionar validações ao `CharacterService.create()` (limite de 5 personagens, nome único global, raça válida) e criar endpoint `DELETE /characters/:id` no controller e service.

## Contexto mínimo necessário
- NestJS com TypeORM
- `CharacterService` em `system/backend/src/character/character.service.ts`
- `CharacterController` em `system/backend/src/character/character.controller.ts`
- Entidade `Character` já terá campo `race` e UNIQUE em `name` (concluído pelo agente 001)
- JWT guard já protege todos os endpoints

## Arquivos que pode alterar
- `system/backend/src/character/character.service.ts`
- `system/backend/src/character/character.controller.ts`

## Arquivos que deve apenas consultar
- `system/backend/src/character/character.entity.ts` (ler campos disponíveis)
- `system/backend/src/auth/jwt-auth.guard.ts` (entender estrutura do guard)

## O que NÃO deve mexer
- `character.entity.ts` (escopo do agente 001)
- Migrations (escopo do agente 001)
- Qualquer arquivo do frontend

## Dependências obrigatórias
- **Agente 001** deve ter concluído: `character.entity.ts` tem `race` e `name` com UNIQUE

## Critérios de aceite
- [ ] `CharacterService.create()` valida:
  - limite de 5 personagens (count por userId) → `BadRequestException('Limite de 5 personagens atingido')`
  - nome único global → `ConflictException('Este nome já está em uso')`
  - raça válida (['human','dwarf','elf']) → `BadRequestException('Raça inválida')`
- [ ] `CharacterService.delete(id, userId)` remove apenas personagens do userId
- [ ] `CharacterController` tem `@Delete(':id')` chamando `service.delete(id, req.user.userId)`
- [ ] Imports corretos: `BadRequestException`, `ConflictException`, `Delete` importados
- [ ] Backend compila sem erros (`npx tsc --noEmit`)

## Restrições
- O backend deve retornar 404 se o personagem não pertencer ao userId (não expor personagens de outros)
- O `findOne` existente já pode ter essa lógica — verificar e reutilizar
- Não adicionar logs além do mínimo necessário (apenas `console.log` ou `Logger` se já houver padrão no arquivo)

## Memory

### Objetivo
Adicionar validações ao CharacterService.create e criar endpoint DELETE /characters/:id.

### Contexto permitido
- `system/backend/src/character/character.service.ts`
- `system/backend/src/character/character.controller.ts`
- `system/backend/src/character/character.entity.ts` (somente leitura)

### Arquivos autorizados
- `character.service.ts` (editar)
- `character.controller.ts` (editar)

### Dependências
- Agente 001 concluído (race + UNIQUE no name)

### Restrições
- Não alterar entity, migrations, frontend

### Critérios de aceite
- Validações: limite 5, nome único, raça válida
- DELETE endpoint com verificação de userId
- `npx tsc --noEmit` sem erros

## Formato do resumo final
Criar `.ai-orchestration/agents/002-backend-service-controller-delete-DONE.md` seguindo o formato padrão de resumo.
