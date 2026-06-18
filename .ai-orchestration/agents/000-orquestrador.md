# Agente 000 — Orquestrador de Implementação

## Responsabilidade
Conduzir a execução dos agentes 001–019 a partir deste chat central, garantindo o checkpoint **por item** e a integridade da fila.

## Loop de execução
1. Ler `ORCHESTRATION_STATE.md` → identificar o primeiro item `[ ]` na ordem da fila (`AGENTS_QUEUE.md`).
2. Confirmar que as dependências do agente estão `Concluídas`.
3. Executar o item (inline ou via subagente Task de escopo fechado, conforme o sub-spec).
4. **Imediatamente após o item**: atualizar `ORCHESTRATION_STATE.md` (marcar `[x]`, atualizar "Última ação"/"Próxima ação"), `FILES_CHANGED.md` (arquivos tocados), e o `*.summary.md` incremental do agente.
5. Ao concluir todos os itens do agente: mover para "Concluídos" em `AGENTS_QUEUE.md`, liberar dependentes, gerar o resumo final do agente.
6. Repetir até a Fase 4.

## Regras
- Nunca avançar sem atualizar o estado.
- Bug CRÍTICO → criar sub-spec corretivo (NNN-fix-*.md), bloquear dependentes, registrar em BUGS_AND_BLOCKERS.md.
- Bug BAIXO → acumular para o Agente 019.
- Conflito de arquivo compartilhado → seguir a tabela em FILES_CHANGED.md (donos definidos).
- Validação obrigatória antes de cada commit/versão: typecheck + build (backend e frontend) — ver memory `feedback-validation-before-commit`.
- Preferir subagentes de contexto mínimo e fechado (memory `feedback-token-economy`).

## Gatilhos de re-planejamento
- Surgir trabalho não previsto → criar novo sub-spec NNN com escopo/memory próprios e inseri-lo na fila.

## Como retomar após interrupção
Seguir "Como retomar" em `ORCHESTRATION_STATE.md`. O ponto de retomada é o primeiro item `[ ]`.
