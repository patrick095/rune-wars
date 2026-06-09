# Agente 003 — Frontend: Character Model + ActiveCharacterService

## Objetivo
Criar a interface TypeScript `Character` e o `ActiveCharacterService` que gerencia o personagem ativo na sessão via localStorage (`rw_character_id`).

## Contexto mínimo necessário
- Angular 17 standalone
- `ApiService` já existe em `system/frontend/src/app/shared/services/api.service.ts`
- `localStorage` key: `rw_character_id`
- `PvpComponent` já lê `rw_character_id` — o novo serviço deve salvar com essa mesma key
- O serviço usa `BehaviorSubject` para reatividade

## Arquivos que pode alterar
- `system/frontend/src/app/shared/models/character.model.ts` (criar)
- `system/frontend/src/app/shared/services/active-character.service.ts` (criar)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/services/api.service.ts` (entender interface do ApiService)
- `system/frontend/src/app/shared/services/auth.service.ts` (entender padrões do projeto)
- `system/frontend/src/app/pvp/pvp.component.ts` (verificar uso de `rw_character_id`)

## O que NÃO deve mexer
- `app.routes.ts` (escopo do agente 004)
- `character.guard.ts` (escopo do agente 004)
- Qualquer componente (escopos de outros agentes)
- Backend

## Dependências obrigatórias
- Nenhuma (agente fundação do frontend)

## Critérios de aceite
- [ ] `character.model.ts` exporta interface `Character` com campos: `id: string`, `name: string`, `race: 'human' | 'dwarf' | 'elf'`, `level: number`, `xp: number`, `strength: number`, `agility: number`, `vitality: number`, `luck: number`, `gold: number`, `created_at: string`
- [ ] `ActiveCharacterService` é `@Injectable({ providedIn: 'root' })`
- [ ] `ActiveCharacterService` tem: `character$` (Observable), `character` (getter), `characterId` (getter), `setActive(char)`, `clearActive()`, `getSavedId()`, `loadFromStorage(api)`
- [ ] `loadFromStorage` usa `firstValueFrom` e retorna `Promise<boolean>`
- [ ] `setActive` salva no localStorage `rw_character_id`
- [ ] `clearActive` remove do localStorage `rw_character_id`
- [ ] `npx tsc --noEmit` sem erros em `system/frontend`

## Restrições
- `characterId` deve ser `string | null` (UUID, não number)
- Não usar `CharacterStorageService` existente — esse é um serviço novo, diferente
- Não modificar `CharacterStorageService`

## Memory

### Objetivo
Criar `character.model.ts` e `ActiveCharacterService`.

### Contexto permitido
- Angular 17 standalone
- `system/frontend/src/app/shared/services/api.service.ts` (somente leitura)
- `system/frontend/src/app/pvp/pvp.component.ts` (somente leitura — verificar key localStorage)

### Arquivos autorizados
- `system/frontend/src/app/shared/models/character.model.ts` (criar)
- `system/frontend/src/app/shared/services/active-character.service.ts` (criar)

### Dependências
- Nenhuma

### Restrições
- Não alterar nenhum componente existente
- characterId é string (UUID), não number
- localStorage key: `rw_character_id`

### Critérios de aceite
- Interface Character com todos os campos
- ActiveCharacterService com BehaviorSubject + loadFromStorage async
- `npx tsc --noEmit` sem erros

## Formato do resumo final
Criar `.ai-orchestration/agents/003-frontend-model-active-character-service-DONE.md` seguindo o formato padrão de resumo.
