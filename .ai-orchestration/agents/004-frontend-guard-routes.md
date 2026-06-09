# Agente 004 — Frontend: characterGuard + Rotas

## Objetivo
Criar o `characterGuard` (CanActivateFn) e atualizar `app.routes.ts` para: (1) adicionar rota `/character-select`, (2) aplicar `characterGuard` em todas as rotas protegidas do jogo.

## Contexto mínimo necessário
- Angular 17 standalone com functional guards
- `authGuard` já existe em `system/frontend/src/app/shared/guards/auth.guard.ts` — usar como modelo de padrão
- `ActiveCharacterService` criado pelo agente 003
- Rotas que devem receber `characterGuard`: hub, character, pvp, dungeon, craft, upgrade, market, guild, rankings, dungeon-floors, academy

## Arquivos que pode alterar
- `system/frontend/src/app/shared/guards/character.guard.ts` (criar)
- `system/frontend/src/app/app.routes.ts`

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/guards/auth.guard.ts` (modelo)
- `system/frontend/src/app/shared/services/active-character.service.ts` (agente 003)
- `system/frontend/src/app/shared/services/api.service.ts`

## O que NÃO deve mexer
- Nenhum componente
- Backend
- `auth.guard.ts` (não modificar, apenas consultar)

## Dependências obrigatórias
- **Agente 003** concluído: `ActiveCharacterService` e `Character` model existem

## Critérios de aceite
- [ ] `character.guard.ts` exporta `characterGuard: CanActivateFn`
- [ ] Guard lógica: se `active.character` → true; senão `loadFromStorage(api)` → se true → true; senão redirect para `/character-select`
- [ ] Rota `/character-select` adicionada com `canActivate: [authGuard]` (não characterGuard — usuário deve estar logado mas sem personagem para acessar)
- [ ] `characterGuard` adicionado em: hub, character, pvp, dungeon, craft, upgrade, market, guild, rankings, dungeon-floors, academy
- [ ] `npx tsc --noEmit` sem erros

## Restrições
- `characterGuard` deve vir DEPOIS de `authGuard` no array `canActivate` (ou garantir que authGuard já passou antes)
- A rota `playground` não deve receber `characterGuard` (ferramenta de desenvolvimento)
- Não criar o `CharacterSelectComponent` — apenas registrar a rota com `loadComponent` lazy

## Memory

### Objetivo
Criar `character.guard.ts` e atualizar `app.routes.ts`.

### Contexto permitido
- `system/frontend/src/app/shared/guards/auth.guard.ts` (leitura)
- `system/frontend/src/app/shared/services/active-character.service.ts` (leitura — criado por 003)
- `system/frontend/src/app/app.routes.ts` (editar)

### Arquivos autorizados
- `system/frontend/src/app/shared/guards/character.guard.ts` (criar)
- `system/frontend/src/app/app.routes.ts` (editar)

### Dependências
- Agente 003 concluído

### Restrições
- characterGuard após authGuard no array canActivate
- Rota /character-select: só authGuard, não characterGuard
- Não criar CharacterSelectComponent

### Critérios de aceite
- Guard redireciona para /character-select quando sem personagem ativo
- Rotas protegidas: hub, character, pvp, dungeon, craft, upgrade, market, guild, rankings, dungeon-floors, academy
- `npx tsc --noEmit` sem erros

## Formato do resumo final
Criar `.ai-orchestration/agents/004-frontend-guard-routes-DONE.md` seguindo o formato padrão de resumo.
