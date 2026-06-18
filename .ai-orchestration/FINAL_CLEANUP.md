# Limpeza Final — v1.8.0

> Executar SOMENTE após o Agente 019 e com todos os itens do checklist abaixo `✅`.
> Nunca remover `.ai-orchestration/` antes de criar o resumo permanente.

## Pré-requisitos para limpeza
- [ ] Resumo permanente criado em `docs/implementations/2026-06-18-v1.8.0-implementation-summary.md`
- [ ] `FILES_CHANGED.md` completo
- [ ] Nenhum bug CRÍTICO pendente em `BUGS_AND_BLOCKERS.md`
- [ ] Nenhum agente bloqueado em `AGENTS_QUEUE.md`
- [ ] Nenhuma decisão obrigatória pendente em `DECISIONS_LOG.md`
- [ ] `cd system/backend && npx tsc --noEmit && nest build` OK
- [ ] `cd system/frontend && npx tsc --noEmit && ng build` OK
- [ ] Critérios de aceite §25 (1–9) validados

## Comando de limpeza (após todos os ✅)
```bash
rm -rf .ai-orchestration/
```

## Pergunta de commit obrigatória (após limpeza)
Perguntar ao usuário: commitar agora / depois / revisar. Nunca commitar sem aprovação explícita.

> Se QUALQUER pré-requisito falhar: NÃO remover a pasta e registrar o motivo aqui.
