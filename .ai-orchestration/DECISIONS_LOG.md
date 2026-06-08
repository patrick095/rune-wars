# Decisões da Implementação

| Data/Hora | Decisão | Motivo | Impacto |
| --------- | ------- | ------ | ------- |
| 2026-06-08 | Login redireciona para `/hub` em vez de `/playground` | Spec v1.1.0 determina Floresta Rúnica como tela inicial pós-login | Modifica login.component.ts |
| 2026-06-08 | Ferreiro usa rota `/craft` como primary link | Rota mais completa; `/upgrade` pode ser acessada por dentro do craft | Mapeamento POI → rota |
| 2026-06-08 | Assets em `system/frontend/src/assets/hub/` | Padrão de organização por feature já usado no projeto | Cria novo diretório |
| 2026-06-08 | Labels dos POIs como overlay Angular (não Phaser) | Melhor integração com responsive e acessibilidade | hub.component.html + SCSS |
| 2026-06-08 | Não há POI para `rankings` no spec v1.1.0 | Rankings não mencionado como local da Floresta Rúnica | Sem POI de rankings no hub |
