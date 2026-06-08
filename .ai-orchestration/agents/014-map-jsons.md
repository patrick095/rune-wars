# Agent 014 — Map JSONs (3 Novos Mapas Battle)

## Objetivo
Criar os 3 novos mapas battle em formato JSON compatível com `terrain-engine.ts`: `deep_mines`, `arcane_ruins`, `runic_forest`. Cada mapa deve ter 8 spawn points, pelo menos 1 área de escavação marcada como `terrain_type: excavatable`, e dimensões mínimas de 2000×800px de área jogável.

## Contexto mínimo necessário
- Ler `terrain-engine.ts` para entender o formato JSON exato esperado
- Ler os mapas existentes (`castle.json`, `plains.json`) para replicar a estrutura
- Spawn points: `spawnPoints: [{x, y, team}]` — 4 por time (time 1 e time 2)
- Terreno escavável: `terrain_type: "excavatable"` nas camadas relevantes
- Mapas novos devem ter áreas estratégicas: cover, plataformas, túneis

## Arquivos a consultar
- `system/frontend/src/app/shared/game-core/terrain-engine.ts`
- `system/frontend/src/app/shared/game-core/terrain-types.ts`
- Mapas existentes (encontrar localização com find)

## Arquivos autorizados a criar
- JSON de `deep_mines` (localização a descobrir consultando onde ficam os outros mapas)
- JSON de `arcane_ruins`
- JSON de `runic_forest`

## O que NÃO mexer
- `terrain-engine.ts` (não alterar lógica)
- Mapas existentes (castle, plains)
- Frontend, backend

## Dependências obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de aceite
- 3 JSONs criados no diretório correto
- Estrutura compatível com terrain-engine.ts (sem erros ao parsear)
- 8 spawn points em cada mapa (4 por time, distribuídos para evitar spawn killing)
- Pelo menos 1 área `terrain_type: "excavatable"` por mapa com volume significativo
- Dimensões mínimas: 2000×800px
- Registrados no seletor de partida/lobby (se houver um registro de mapas disponíveis)

## Layouts dos Mapas

### deep_mines (Minas Profundas)
- Vertical: base topo vs base fundo
- Pilares centrais de rocha como cover
- Túneis laterais
- 50%+ do terreno é argila/rocha mole (excavatable)
- 4 spawns topo, 4 spawns fundo

### arcane_ruins (Ruínas Arcanas)
- Horizontal clássico com plataformas escalonadas
- Templo em ruínas — colunas e arcos como cover
- 30% de blocos de pedra mágica nas bordas (excavatable)
- 8 spawns distribuídos nas plataformas

### runic_forest (Floresta Rúnica)
- Layout aberto com obstáculos orgânicos irregulares
- Árvores e raízes como barreira natural
- Raízes e terra escaváveis (moderado/alto)
- 8 spawns espalhados evitando line-of-sight direto

## Memory — Agent 014

### Objetivo
Criar 3 JSONs de mapas battle compatíveis com terrain-engine.ts.

### Contexto permitido
- `terrain-engine.ts` e `terrain-types.ts`
- Mapas existentes (castle, plains) para referência de formato

### Arquivos autorizados
- 3 JSONs novos no diretório de mapas

### Dependências
- Nenhuma

### Restrições
- Não alterar terrain-engine.ts nem mapas existentes

### Critérios de aceite
- 3 JSONs com estrutura correta, 8 spawns cada, áreas excavatable
