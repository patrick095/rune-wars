# Limpeza Final — v1.2.0

## Checklist antes de remover .ai-orchestration/

- [ ] Resumo final permanente criado em `docs/implementations/2026-06-08-v1.2.0-assets-inventario-cofre-mapas.md`
- [ ] Todos os arquivos alterados registrados em FILES_CHANGED.md
- [ ] Nenhum bug CRÍTICO pendente
- [ ] Nenhum agente BLOQUEADO
- [ ] Nenhuma decisão obrigatória pendente (P1 resolvido)
- [ ] `npm run build` passa sem erros
- [ ] TypeScript typecheck passa sem erros
- [ ] Todos os 49 assets presentes (sem 404)

## Depois de confirmar o checklist acima

1. Criar `docs/implementations/2026-06-08-v1.2.0-assets-inventario-cofre-mapas.md`
2. Criar `COMO_JOGAR.md` com instruções para beta testers
3. Atualizar `implementation/CHANGELOG.md`
4. Atualizar `implementation/CURRENT_STATE.md`
5. Deletar `v1.2.0.md` da raiz (conforme regra do projeto)
6. Remover `.ai-orchestration/`
7. Commit: `feat: rune wars v1.2.0 — assets, inventário, cofre, mapas`

## Regra de segurança
NUNCA remover `.ai-orchestration/` antes de criar o resumo permanente.
NUNCA remover arquivos fora de `.ai-orchestration/` durante a limpeza.
