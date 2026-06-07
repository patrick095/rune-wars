# Rune Wars — Agentes e Skills v1.2

Esta pasta contém agentes especializados para implementar Rune Wars usando Claude/Codex com economia máxima de tokens.

## Princípio central
Cada agente recebe apenas o contexto necessário para a tarefa atual.

## Agentes disponíveis
- Dev Backend
- Dev Frontend
- Dev Mobile
- Databaser
- Product Owner
- Analista de Produto
- Analista de Desenvolvimento
- Analista de Design
- Analista Sonoro
- Analista de Qualidade
- Analista de Teste
- UI/UX
- Orquestrador de Spec
- Orquestrador de Agentes

## Fluxo recomendado
1. O Orquestrador de Agentes lê `implementation/CURRENT_STATE.md` e `NEXT_STEPS.md`.
2. Ele divide a próxima fase em tarefas pequenas.
3. Para cada tarefa, escolhe o agente correto.
4. O agente recebe contexto mínimo.
5. O agente implementa ou analisa.
6. O agente atualiza os documentos de continuidade.
7. QA/Teste valida antes de avançar.

## Regra de ouro
Nunca envie o pacote inteiro para todos os agentes. Isso desperdiça tokens e aumenta risco de perda de contexto.
