# Rune Wars — Estado Atual da Implementação v1.2

## Estado do projeto
Projeto em fase de especificação e preparação para implementação por IA.

## Objetivo da versão v1.2
Ajustar os specs para implementação incremental, testável e econômica em tokens, usando agentes altamente especializados e contexto isolado.

## Decisões principais adicionadas
- O projeto será implementado 100% com auxílio de Claude/Codex/agentes.
- Prioridade 1: o jogo precisa funcionar como esperado.
- Prioridade 2: economizar tokens.
- Cada agente deve receber somente o contexto necessário.
- Agentes não compartilham contexto diretamente; registram progresso em documentos de implementação.
- Cada alteração precisa atualizar documentação de continuidade.
- Usuários, guildas, mercado e economia persistente ficam para fases finais.
- Primeiras fases priorizam gameplay local testável.
- Personagem deve ser altamente customizável desde cedo para testes.
- Painel debug/sandbox deve permitir alterar level, atributos, armas, itens, mapa, vento e IA.

## Última alteração
- Data: 2026-06-07
- Agente: ChatGPT
- Tarefa: Atualizar specs v1.2 para fluxo realista de implementação por IA.
- Arquivos alterados:
  - `implementation/AI_IMPLEMENTATION_RULES.md`
  - `implementation/CONTEXT_ROUTING.md`
  - `implementation/PHASED_VERTICAL_SLICE_PLAN.md`
  - `implementation/CURRENT_STATE.md`
  - `implementation/NEXT_STEPS.md`
  - `implementation/IMPLEMENTATION_PLAN.md`
  - `agents/*.md`
  - `README.md`
- Como testar:
  - Usar este pacote como fonte de contexto no Claude/Codex.
  - Começar pela Fase 0 do plano vertical.
- Estado atual:
  - Specs prontos para orientar implementação incremental.
- Próximo passo:
  - Criar projeto Angular + Phaser e implementar Fase 0.
