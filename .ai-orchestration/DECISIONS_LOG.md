# Decisões da Implementação

| Data/Hora | Decisão | Motivo | Impacto |
| --------- | ------- | ------ | ------- |
| 2026-06-08 | Limite de 5 personagens por conta | Padrão MMO/PvP, simplifica UX | Backend: validação no create |
| 2026-06-08 | Nome único globalmente (não por usuário) | Evita confusão em rankings PvP | Backend: UNIQUE constraint + 409 Conflict |
| 2026-06-08 | Persistência via localStorage `rw_character_id` | Suficiente para MVP, sem sessão server-side | Frontend: ActiveCharacterService |
| 2026-06-08 | Raças: human, dwarf, elf (assets já existem) | Aproveitar assets existentes | Backend: race VARCHAR(20), Frontend: imagens idle/battle |
| 2026-06-08 | Personagem criado zerado (atributos = 0) | Edição posterior em /character | Backend: defaults = 0 |
| 2026-06-08 | DELETE de personagem ativo → limpa localStorage e redireciona | UX intuitiva, evita estado inválido | Frontend: characterGuard + clearActive() |
| 2026-06-08 | Botões de ângulo visíveis APENAS em mobile | Não poluir interface desktop | BattleScene: matchMedia('pointer: coarse') |
| 2026-06-08 | Hold-to-repeat: 400ms delay + 80ms interval | Equilíbrio entre responsividade e controle | BattleScene: setTimeout + setInterval |
| 2026-06-08 | Throttle teclado: 100ms | Evitar saltos múltiplos em keypresses rápidos | BattleScene: lastAngleKeyTime |
| 2026-06-08 | BattleScene: agentes 007-011 executam sequencialmente | Todos tocam battle.scene.ts — conflito garantido em paralelo | Ordem de execução da fila |
| 2026-06-08 | Ghost do último tiro: 40% alpha da cor da barra | Visibilidade sem sobrepor leitura atual | PowerBarHUD refactor |
