# Decisões da Implementação — v1.8.0

| Data/Hora | Decisão | Motivo | Impacto |
| --------- | ------- | ------ | ------- |
| 2026-06-18 | Quebra em 19 sub-specs + 1 orquestrador | Spec com 7 frentes; escopos fechados e testáveis isolados (§24) | Fila em 4 fases |
| 2026-06-18 | Checkpoint **por item** em ORCHESTRATION_STATE.md (≈110 itens) | Pedido do usuário: retomar exatamente onde parou se acabar o token | Atualizar estado após cada item |
| 2026-06-18 | Agente 011 é dono do `GameScreen` (adiciona ferreiro+dungeon-lobby+dungeon-room) | Evitar conflito de edição com o Agente 015 no mesmo arquivo | 015 só consome os valores |
| 2026-06-18 | `Character.gold` já existe; 003 só adiciona métodos/exposição | Coluna presente em character.entity.ts | Sem migration p/ gold |
| 2026-06-18 | Decisões de negócio herdadas do spec (D1–D18, §7) | Já aprovadas no /spec | — |

> Decisões pendentes (a registrar quando resolvidas):
> - Caminho do util de raridade no backend (Agente 001).
> - Pasta do PortalService = `dungeon-rewards` (Agente 007 confirma).
