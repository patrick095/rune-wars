# Agente 019 — Integração + Docs + QA final (consolidação)

## Memory — Consolidação

### Objetivo
Consolidar a entrega: validar integração entre módulos, rodar typecheck+build (backend e frontend), validar os critérios de aceite (§25), atualizar docs e produzir o resumo de implementação.

### Contexto permitido
- Spec §20 (QA), §22 (docs), §25 (critérios de aceite), §26 (checklist final).
- Validação obrigatória antes do commit: `cd system/backend && npx tsc --noEmit && nest build`; `cd system/frontend && npx tsc --noEmit && ng build`.

### Arquivos autorizados (criar/editar)
- `docs/05-*` (raridade 4 tiers), `docs/07-*` (andares 1–2)
- `docs/implementations/2026-06-18-v1.8.0-implementation-summary.md` (NOVO)
- Pequenos fixes de integração apontados pelos resumos (com registro em DECISIONS_LOG)

### Arquivos apenas de consulta
- Todos os `*.summary.md` em `.ai-orchestration/agents/`
- `.ai-orchestration/FILES_CHANGED.md`, `BUGS_AND_BLOCKERS.md`

### O que NÃO mexer
- Reescrever features inteiras (apenas integração/correção pontual).

### Dependências obrigatórias
- **TODOS** os agentes 001–018 concluídos.

### Critérios de aceite (§25 inteiro)
- Os 9 critérios de aceite verificados; typecheck + build verdes nos dois lados; docs atualizados; resumo final criado.

### Checklist granular
- [ ] 19.1 Ler todos os resumos + conferir conflitos
- [ ] 19.2 Validar critérios §25 (1–9)
- [ ] 19.3 `tsc --noEmit && nest build` (backend)
- [ ] 19.4 `tsc --noEmit && ng build` (frontend)
- [ ] 19.5 Corrigir integrações pontuais (se houver)
- [ ] 19.6 Atualizar docs/05 e docs/07
- [ ] 19.7 Criar implementation-summary
- [ ] 19.8 Checklist final §26 + preparar limpeza .ai-orchestration

### Comando de execução
"Implemente o Agente 019 conforme o arquivo. Atualize o checklist granular após cada item. Gere `019-*.summary.md` ao final."

### Formato do resumo final
Template padrão + tabela de validação dos 9 critérios de aceite.
