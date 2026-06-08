# Sub-spec — Agente 033: Hub Spec Validator

## Objetivo
Consolidar o spec do v1.1.0 com a realidade do frontend v1.0.0. Validar nomes exatos das rotas, componentes e serviços existentes. Produzir o mapeamento final POI → rota e a lista definitiva de placeholders necessários.

## Contexto mínimo necessário
- `v1.1.0.md` (spec completo da Floresta Rúnica)
- `system/frontend/src/app/app.routes.ts` (rotas reais)
- `system/frontend/src/app/auth/login/login.component.ts` (redirecionamento pós-login)
- `system/frontend/src/app/shared/services/auth.service.ts`
- `system/frontend/src/game/scenes/` (lista de cenas Phaser existentes)

## Arquivos autorizados a alterar
Nenhum. Este agente é read-only.

## Arquivos autorizados a consultar
- `v1.1.0.md`
- `system/frontend/src/app/app.routes.ts`
- `system/frontend/src/app/auth/login/login.component.ts`
- `system/frontend/src/app/shared/services/auth.service.ts`
- `system/frontend/src/game/scenes/*.ts`

## O que não deve mexer
Tudo. Apenas leitura e documentação.

## Dependências
Nenhuma. Primeiro agente.

## Critérios de aceite
- [ ] Mapeamento POI → rota validado contra rotas reais
- [ ] Lista completa de assets placeholder documentada
- [ ] Redirecionamento pós-login atual identificado (`/playground`)
- [ ] Estrutura de diretórios para novo código definida
- [ ] Confirmação de que nenhuma rota nova precisa ser criada (apenas `/hub`)

## Instrução de execução
```
Leia os arquivos listados no contexto. Valide cada POI do v1.1.0.md contra as rotas reais em app.routes.ts. Documente o mapeamento final, o redirecionamento pós-login atual e a estrutura de arquivos que o Agente 037 deverá criar. Não altere nenhum arquivo. Salve o resumo em .ai-orchestration/agents/033-resumo.md.
```

## Formato obrigatório do resumo final
```md
# Resumo — Agente 033: Hub Spec Validator

## Status
Concluído

## Mapeamento POI → Rota Validado
| POI | Feature key | Rota real |
|-----|-------------|-----------|
| ... | ... | ... |

## Redirecionamento pós-login atual
...

## Estrutura de arquivos a criar
...

## Assets placeholder necessários
...

## Observações
...
```

---

## Memory — Agente 033: Hub Spec Validator

### Objetivo
Consolidar spec v1.1.0 com rotas reais do frontend, sem alterar nenhum arquivo.

### Contexto permitido
Apenas os arquivos listados acima. Não ler módulos de feature.

### Arquivos autorizados
Read-only: app.routes.ts, login.component.ts, auth.service.ts, cenas Phaser, v1.1.0.md

### Dependências
Nenhuma.

### Restrições
Não criar nem modificar arquivos do projeto.

### Critérios de aceite
Mapeamento POI → rota 100% validado contra rotas reais.
