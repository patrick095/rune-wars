# Decisões da Implementação

| Data/Hora | Decisão | Motivo | Impacto |
| --------- | ------- | ------ | ------- |
| 2026-06-10 | ITEM_CATALOG como constante TypeScript estática | Evita migrations complexas ao adicionar novos itens | Frontend apenas |
| 2026-06-10 | Tela de cofre como overlay Angular (GameScreen: 'vault') | Segue padrão overlay já adotado no projeto | GameNavigatorService + novo component |
| 2026-06-10 | Admin Panel via keydown 'I' no HubComponent | Consistente com padrão de overlays do hub | HubComponent + AdminInventoryPanelComponent |
| 2026-06-10 | is_admin como boolean simples no User entity | MVP admin — RBAC seria over-engineering | User entity + JWT + AuthService |
| 2026-06-10 | character_consumable como nova tabela separada | Permite controle de estoque real por personagem | Nova migration + novo módulo backend |
| 2026-06-10 | 5 slots independentes e repetíveis na sala PvP | Conforme pedido: mesmo consumível pode aparecer múltiplas vezes | PvpRoomComponent |
| 2026-06-10 | Thumbnails via assets/maps/{slug}/background.png | Assets já existem, zero processamento | PvpRoomComponent template |
| 2026-06-10 | 4 slots numerados (não 2 times de 4) | Conforme imagem de referência: SUA EQUIPE com slots 1-4 | PvpRoomComponent |
| 2026-06-10 | Frontend não terá tela de loja de consumíveis na v1.7.0 | Fora do escopo definido no spec | Admin Panel é a forma de adicionar consumíveis no dev |
