# Rune Wars — Regras de Implementação por IA v1.2

Este projeto será implementado usando Claude/Codex/agentes de IA. A prioridade absoluta é manter o projeto funcionando e economizar tokens.

## Regra 1 — O jogo precisa funcionar
Nenhum agente pode finalizar uma tarefa sem deixar o projeto em estado executável, testável ou com rollback/documentação clara do que ficou pendente.

## Regra 2 — Economia máxima de tokens
Cada agente deve receber apenas o contexto necessário para a tarefa atual.

Não enviar para todos os agentes:
- todos os specs;
- histórico completo do projeto;
- arquivos irrelevantes;
- decisões de áreas que não afetam a tarefa.

## Regra 3 — Contexto isolado por agente
Agentes não devem compartilhar contexto entre si diretamente.

Fluxo correto:
1. Orquestrador de agentes lê o estado atual.
2. Orquestrador separa tarefas pequenas.
3. Cada agente recebe apenas:
   - objetivo da tarefa;
   - arquivos relevantes;
   - contratos/interfaces necessários;
   - critérios de aceite;
   - instrução obrigatória de atualizar documentos.
4. Agente executa.
5. Agente atualiza `implementation/CURRENT_STATE.md`, `implementation/CHANGELOG.md` e, quando necessário, `implementation/NEXT_STEPS.md`.

## Regra 4 — Documentação de continuidade obrigatória
Toda alteração precisa registrar:
- o que foi feito;
- quais arquivos foram alterados;
- como testar;
- o que ficou pendente;
- riscos conhecidos;
- próximo passo recomendado.

Isso permite continuar em outra IA caso acabe limite de tokens.

## Regra 5 — Fases sempre testáveis
Cada fase deve terminar com algo que possa ser aberto, executado e testado.

Prioridade de implementação:
1. Gameplay local testável.
2. Física, tiro, vento, terreno e IA.
3. Customização/debug do personagem.
4. Itens, armas e efeitos.
5. PvP local/simulado.
6. Dungeon local/simulada.
7. Backend mínimo.
8. Multiplayer real.
9. Conta, usuários, guildas, mercado e economia.

## Regra 6 — Usuários, guildas e mercado ficam para o final
Nada de antecipar complexidade de autenticação, mercado real, guildas persistentes ou economia global antes do core gameplay estar divertido.

## Regra 7 — Painel de teste/debug desde o início
O jogo deve permitir alterar facilmente:
- level;
- atributos;
- HP;
- arma;
- item secundário;
- consumíveis;
- mapa;
- vento;
- IA;
- dano físico/mítico;
- defesa física/mítica;
- chance de efeito rúnico.

Objetivo: testar rapidamente e se divertir ao final de cada fase.

## Regra 8 — Não reescrever sem necessidade
Antes de refatorar, o agente deve justificar:
- qual problema real está resolvendo;
- risco da refatoração;
- alternativa menor.

## Regra 9 — Contratos estáveis
Quando criar uma interface de domínio, evitar quebrar sem necessidade.

Exemplos:
- `WeaponDefinition`
- `PlayerStats`
- `ProjectileConfig`
- `TerrainMaterial`
- `RunicEffect`
- `ConsumableDefinition`

## Regra 10 — Testes mínimos por fase
Cada fase precisa ter pelo menos:
- teste manual documentado;
- checklist de aceite;
- se possível, testes unitários da lógica pura.
