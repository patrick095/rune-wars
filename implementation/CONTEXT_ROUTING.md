# Rune Wars — Roteamento de Contexto por Agente

Este documento define o contexto mínimo que cada agente deve receber.

## Orquestrador de Agentes
Recebe:
- `README.md`
- `implementation/AI_IMPLEMENTATION_RULES.md`
- `implementation/CURRENT_STATE.md`
- `implementation/IMPLEMENTATION_PLAN.md`
- `implementation/NEXT_STEPS.md`
- spec específico da fase atual

Não recebe código inteiro, exceto quando necessário para planejar correção.

## Orquestrador de Spec
Recebe:
- docs de design afetados pela decisão;
- changelog;
- pending decisions.

Objetivo: atualizar documentação sem mexer no código.

## Dev Frontend
Recebe somente:
- arquivos Angular/Phaser da feature;
- contratos TypeScript necessários;
- docs de UI/controles;
- critérios de aceite.

Não recebe:
- specs de guilda/mercado se estiver fazendo física de tiro;
- backend completo se estiver fazendo tela local.

## Dev Mobile
Recebe somente:
- telas/HUD mobile;
- input touch;
- responsividade;
- performance mobile;
- specs de controles.

## Dev Backend
Recebe somente:
- módulos NestJS envolvidos;
- contratos DTO/eventos;
- regras de domínio necessárias.

Só entra em fases posteriores.

## Databaser
Recebe somente:
- entidades persistentes da fase;
- migrations;
- docs de economia/personagem quando necessário.

Só entra quando houver persistência real.

## Product Owner
Recebe:
- objetivo da fase;
- critérios de aceite;
- specs de produto relevantes;
- CURRENT_STATE.

Não recebe implementação inteira.

## Analista de Produto
Recebe:
- comportamento esperado;
- impacto na experiência;
- riscos de escopo.

## Analista de Desenvolvimento
Recebe:
- arquitetura técnica;
- plano de implementação;
- riscos técnicos;
- contratos.

## Analista de Design
Recebe:
- mapas;
- armas;
- UI;
- áudio quando necessário.

## Analista Sonoro
Recebe:
- `docs/13-audio-sonorizacao.md`;
- lista de ações/armas da fase;
- assets de áudio disponíveis.

## QA / Analista de Qualidade / Analista de Teste
Recebe:
- critérios de aceite;
- feature implementada;
- como rodar;
- arquivos alterados;
- checklist esperado.

Não recebe specs não relacionados.

## UI/UX
Recebe:
- fluxos de tela;
- foco mobile;
- controles;
- menu principal;
- HUD de combate.
