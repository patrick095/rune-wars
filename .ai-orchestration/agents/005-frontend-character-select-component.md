# Agente 005 — Frontend: CharacterSelectComponent

## Objetivo
Criar o `CharacterSelectComponent` completo em `/character-select` — tela com cards de personagens, modal de criação, deleção com confirmação, e lógica de seleção/navegação.

## Contexto mínimo necessário
- Angular 17 standalone (sem módulo — usar `imports: []` no componente)
- `ActiveCharacterService` em `system/frontend/src/app/shared/services/active-character.service.ts`
- `ApiService` em `system/frontend/src/app/shared/services/api.service.ts`
- `Character` interface em `system/frontend/src/app/shared/models/character.model.ts`
- Assets de raça: `assets/characters/{race}_idle.png` (human, dwarf, elf)
- Estilo do projeto: dark theme, CSS/SCSS padrão do jogo
- Rota já registrada em `app.routes.ts` pelo agente 004

## Fluxo completo a implementar

### Carregamento
- `ngOnInit`: `GET /api/characters` → lista personagens do usuário
- Loading: mostrar skeleton/spinner
- Erro de API: mensagem + botão "Tentar novamente"

### Seleção
- Clique em "Selecionar": chama `activeCharacter.setActive(char)` → navega para `/hub`
- Se personagem ativo já existe (veio do hub): exibir "Personagem Atual: [nome]" + botão "Voltar ao Hub"

### Criação
- Card "+ Criar Personagem" → abre modal de criação
- Se já tem 5 personagens: card desabilitado (cinza)
- Modal: campo `name` (validação: required, minLength 3, maxLength 50, pattern `^[a-zA-Z0-9_-]+$`)
- Modal: seleção visual de raça (3 opções com imagem idle + nome)
- Submit: `POST /api/characters` com `{ name, race }`
- Se 409: mostrar "Este nome já está em uso" inline no campo
- Sucesso: adicionar à lista + selecionar automaticamente + navegar para /hub

### Deleção
- Botão "Deletar" no card: abre modal de confirmação
- Confirmação: `DELETE /api/characters/:id`
- Se era o ativo: `activeCharacter.clearActive()` e permanecer em /character-select
- Sucesso: remover card da lista

### Logout
- Botão "Sair" no canto superior direito → chama `authService.logout()` → navega para `/login`

## Arquivos que pode alterar
- `system/frontend/src/app/character-select/character-select.component.ts` (criar)
- `system/frontend/src/app/character-select/character-select.component.html` (criar)
- `system/frontend/src/app/character-select/character-select.component.scss` (criar)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/services/active-character.service.ts`
- `system/frontend/src/app/shared/services/api.service.ts`
- `system/frontend/src/app/shared/models/character.model.ts`
- `system/frontend/src/app/shared/services/auth.service.ts`
- `system/frontend/src/app/hub/hub.component.ts` (ver padrão de estilo)
- `system/frontend/src/app/hub/hub.component.html` (ver padrão de estilo)

## O que NÃO deve mexer
- `app.routes.ts` (agente 004)
- `character.guard.ts` (agente 004)
- `active-character.service.ts` (agente 003)
- Backend
- Outros componentes

## Dependências obrigatórias
- **Agente 002**: backend com DELETE endpoint funcional
- **Agente 003**: `ActiveCharacterService` e `Character` model
- **Agente 004**: rota `/character-select` registrada

## Critérios de aceite
- [ ] Componente standalone, lazy-loaded
- [ ] Lista personagens via `GET /api/characters`
- [ ] Card de personagem: imagem `{race}_idle.png`, nome, "Raça • Nível X", botão Selecionar, botão Deletar
- [ ] Card "+ Criar Personagem": desabilitado se 5 personagens
- [ ] Modal de criação com validação em tempo real (sem submit se inválido)
- [ ] Erro 409 exibido inline no campo nome
- [ ] Deleção com confirmação
- [ ] Deleção do personagem ativo limpa localStorage e permanece na tela
- [ ] "Voltar ao Hub" visível quando personagem ativo existe
- [ ] Botão "Sair" funcional
- [ ] `npx tsc --noEmit` sem erros

## Restrições
- Não usar `NgModule` — apenas standalone
- Formulário reativo ou template-driven (preferir ReactiveFormsModule)
- Não fazer requests desnecessários (não verificar nome único em tempo real — apenas ao submeter)

## Memory

### Objetivo
Criar CharacterSelectComponent completo com cards, modal de criação e deleção.

### Contexto permitido
- `system/frontend/src/app/shared/services/active-character.service.ts`
- `system/frontend/src/app/shared/services/api.service.ts`
- `system/frontend/src/app/shared/models/character.model.ts`
- `system/frontend/src/app/shared/services/auth.service.ts`
- `system/frontend/src/app/hub/hub.component.{ts,html}` (referência de estilo)

### Arquivos autorizados
- `system/frontend/src/app/character-select/` (criar todos os arquivos do componente)

### Dependências
- Agentes 002, 003, 004 concluídos

### Restrições
- Standalone, lazy-loaded
- Sem requests desnecessários (não verificar unicidade em tempo real)
- `npx tsc --noEmit` sem erros

### Critérios de aceite
- Fluxo completo: listar, selecionar, criar, deletar, voltar ao hub, sair

## Formato do resumo final
Criar `.ai-orchestration/agents/005-frontend-character-select-component-DONE.md` seguindo o formato padrão de resumo.
