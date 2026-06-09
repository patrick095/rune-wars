# Decisões da Implementação

| Data/Hora | Decisão | Motivo | Impacto |
| --------- | ------- | ------ | ------- |
| 2026-06-09 | Usar v1.4.0.md como spec base | Usuário referenciou v1.2.0.md mas spec não existe; v1.4.0.md é o arquivo não rastreado no git | Nenhum — spec correto identificado |
| 2026-06-09 | 17 subagentes em 7 fases | Volume de trabalho (2 lotes: A bugs+melhorias, B arquitetura) exige paralelismo | Fases 1 e 2 rodam em paralelo entre si |
| 2026-06-09 | Agent-012-pvp-backend na Fase 2 | Backend PvP é independente dos bugs de gameplay | Backend pode ser desenvolvido enquanto bugs são corrigidos |
| 2026-06-09 | Agent-015 (grid) na Fase 4 | Grid expansion depende de Fase 1 concluída para evitar conflitos em terrain-engine.ts | Aguarda confirmação dos bugs críticos de terrain-collision.ts |
| 2026-06-09 | Agent-017-qa apenas no final | Validação só faz sentido após todas as implementações | Última fase obrigatória |
