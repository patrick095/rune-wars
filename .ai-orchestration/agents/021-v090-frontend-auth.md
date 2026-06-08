# Agent 021 — v0.9.0 Frontend: Auth UI + JWT

## Objetivo
Criar telas de login e registro Angular, implementar `AuthService` com JWT, interceptor HTTP para token, e sincronizar personagem do localStorage com o backend no primeiro login.

## Contexto mínimo necessário
- Endpoints: `POST /auth/register`, `POST /auth/login` → retorna `{ access_token: string }`
- JWT armazenado em localStorage key `'rw_token'`
- Interceptor: adiciona `Authorization: Bearer <token>` em todas as requests
- Migração localStorage→backend: ao primeiro login, enviar build salva em `'runewars_build'` para `PUT /character/:id`

## Arquivos autorizados a criar/alterar
```
system/frontend/src/
  app/
    auth/
      login/
        login.component.ts
        login.component.html
        login.component.scss
      register/
        register.component.ts
        register.component.html
        register.component.scss
    app.routes.ts (adicionar /login, /register)
    shared/
      services/
        auth.service.ts
      interceptors/
        jwt.interceptor.ts
      guards/
        auth.guard.ts
```

## Arquivos apenas para consulta
- `system/frontend/src/app/shared/services/character-storage.service.ts`
- `system/frontend/src/app/character/character-presets.ts`

## O que NÃO mexer
- BattleScene, TerrainEngine, qualquer lógica de jogo
- `devops/`

## Dependências obrigatórias
- Agente 017 concluído (pode rodar em paralelo com 018, 019)

## Critérios de aceite
- Tela de registro cria conta e redireciona ao login
- Tela de login retorna JWT e redireciona ao menu
- JWT interceptor adiciona token em todas as requests
- Build do localStorage é enviada ao backend no primeiro login
- `AuthGuard` protege rotas que requerem autenticação
- Logout limpa token do localStorage

## Memory

### Objetivo
Login/registro Angular + JWT interceptor + migração localStorage.

### Contexto permitido
Endpoints de auth + spec de JWT + migração de build.

### Arquivos autorizados
Os listados.

### Dependências
017 concluído.

### Restrições
- Não alterar componentes de jogo.
- JWT armazenado apenas em localStorage (não cookie nesta versão).
- `AuthService.isAuthenticated()` verifica presença e validade do token.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-021.md`.

## Limpeza pós-versão
Após v0.9.0 completa: deletar `v0.9.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Frontend** | `agents/dev-frontend.md` | Angular standalone, services, interceptors, guards |
| **UI/UX** | `agents/ui-ux.md` | Layout das telas login/registro — fluxo de onboarding |

**Instrução:** `dev-frontend` para código. `ui-ux` apenas para o fluxo Login → Menu (seção "Fluxos de tela") — garantir que o caminho até jogar é rápido e simples.
