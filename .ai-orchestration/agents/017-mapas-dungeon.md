# Agente 017 — Mapas de Dungeon (terreno json)

## Memory — Mapas Dungeon

### Objetivo
Produzir os 5 mapas de dungeon (json de terreno no formato do motor bitmap) para os estágios f1-s1, f1-s2, f2-s1, f2-s2, f2-s3, com layout coerente com os objetivos (barreiras, câmara de boss, posições de NPC/pedra mística, ninho de raízes).

### Contexto permitido
- Spec §10.7/§10.9 (layout dos estágios), §27 (dimensões dos backgrounds 2200×900; WORLD 3344×1882).
- f1-s1: corredor caverna com teto, 5 barreiras triangulares (gargalos), portal à direita.
- f1-s2: câmara alta e plana, cobertura baixa.
- f2-s1: caverna→floresta, pedra mística azul à direita.
- f2-s2: raízes escuras, pedras vermelhas, pedra mística à direita.
- f2-s3: câmara maior, ninho de raízes + pedra roxa à esquerda (boss spawna acima).

### Arquivos autorizados (criar/editar)
- `system/frontend/src/app/shared/game-core/maps/dungeon-f1-s1.json` (NOVO)
- `.../maps/dungeon-f1-s2.json`, `dungeon-f2-s1.json`, `dungeon-f2-s2.json`, `dungeon-f2-s3.json` (NOVOS)

### Arquivos apenas de consulta
- `system/frontend/src/app/shared/game-core/maps/dungeon-cave-*.json` (formato existente)
- `terrain-types.ts`, `terrain-engine.ts` (schema do terreno)

### O que NÃO mexer
- Código da cena (014), conteúdo (013), backend.

### Dependências obrigatórias
- Nenhuma (apenas dados; segue formato existente).

### Critérios de aceite
- 5 jsons válidos no schema de terreno; pontos-chave (barreiras/portal/pedra/ninho) representados; carregam sem erro no motor.

### Checklist granular
- [ ] 17.1 dungeon-f1-s1.json (barreiras + portal)
- [ ] 17.2 dungeon-f1-s2.json (câmara boss)
- [ ] 17.3 dungeon-f2-s1.json (pedra azul)
- [ ] 17.4 dungeon-f2-s2.json (raízes/pedra)
- [ ] 17.5 dungeon-f2-s3.json (ninho/pedra roxa)
- [ ] 17.6 Validar schema (carrega no terreno)

### Comando de execução
"Implemente o Agente 017 conforme o arquivo. Atualize o checklist granular após cada item. Gere `017-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
