# Rune Wars — Plano de Implementação v1.2

Este plano substitui a ideia de tentar implementar o jogo completo de uma vez.

## Estratégia
Implementar por vertical slices jogáveis, sempre com foco em testar diversão, física, mobile e controle de terreno.

## Ordem macro
1. Setup local Angular + Phaser.
2. PvP local contra IA.
3. Terreno destrutível/indestrutível.
4. Armas com física própria.
5. Customização total do personagem para testes.
6. Efeitos rúnicos.
7. Consumíveis e secundários.
8. Construção de terreno.
9. Academia.
10. Dungeon local.
11. Backend mínimo.
12. Multiplayer.
13. Sistemas persistentes: usuários, guildas, mercado, craft, rankings.

## Regra de fase
Nenhuma fase pode terminar apenas com código invisível.
Toda fase precisa deixar algo testável.

## Regra de documentação
Cada PR/tarefa deve atualizar:
- `implementation/CURRENT_STATE.md`
- `implementation/CHANGELOG.md`
- `implementation/NEXT_STEPS.md` se necessário

## Agentes por fase inicial

### Fase 0
- Dev Frontend
- Dev Mobile
- UI/UX
- Analista de Teste

### Fase 1
- Dev Frontend
- Analista de Desenvolvimento
- Analista de Design
- Analista de Teste

### Fase 2
- Dev Frontend
- Analista de Design
- Analista de Qualidade

### Fase 3
- Dev Frontend
- Analista Sonoro
- Analista de Design
- QA/Teste

### Fase 4
- Dev Frontend
- Product Owner
- Analista de Produto
- QA/Teste

## Observação
Backend, Databaser, guildas, mercado e autenticação entram somente quando o gameplay local já estiver divertido e validado.
