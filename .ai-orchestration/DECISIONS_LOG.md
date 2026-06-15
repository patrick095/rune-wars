# Decisões da Implementação

| Data/Hora | Decisão | Motivo | Impacto |
| --------- | ------- | ------ | ------- |
| 2026-06-15 | N=3 violações → turno passado; N=6 → derrota | Conforme spec; evita punição severa por lag | ViolationTracker, GameEngineService |
| 2026-06-15 | Tolerância de posição: ±80px | Conforme spec; cobre lag de ~100ms | ActionValidator |
| 2026-06-15 | Violações apenas em memória (sem persistência) | Escopo v1.8.0; persistência vai para v1.9.0 | Nenhuma migration necessária |
| 2026-06-15 | Copiar código para backend/src/game-engine/ (sem monorepo) | Evita complexidade de workspace; conforme decisão do spec | Estrutura de pastas |
| 2026-06-15 | Usar `sharp` para carregar PNG de terreno | Não depende de Phaser no backend; alternativa: @napi-rs/canvas | TerrainLoader |
| 2026-06-15 | IA roda integralmente no servidor | vsAI e Dungeon precisam ser server-side para evitar cheat | AI Engine port |
| 2026-06-15 | Terreno sync via delta { cx, cy, radius } | Bitmap 6.3MB seria inviável; delta é suficiente | TerrainEngine, BattleGateway |
| 2026-06-15 | Sem client-side prediction | Turn-based com baixa frequência; tolerância de latência alta | BattleScene simplificação |
| 2026-06-15 | characterId via client.data (JWT) — nunca do payload | Segurança: payload pode ser forjado | BattleGateway |
| 2026-06-15 | Força inválida: clampar na 1ª ocorrência + registrar violação | Tratamento gracioso para clientes com bug; 2ª ocorrência já é suspeito | ActionValidator |
