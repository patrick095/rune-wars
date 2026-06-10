# Decisões da Implementação

| Data/Hora  | Decisão | Motivo | Impacto |
|------------|---------|--------|---------|
| 2026-06-10 | Dimensões do mundo: 1672×941 para todos os 5 mapas PVP | Matching com terrain PNGs; elimina escalonamento | TerrainEngine, TerrainRenderer, battle.scene.ts |
| 2026-06-10 | `castle` renomeado para `mystic_castle` (código) / `mystic-castle` (pasta) | Consistência com assets existentes | battle.scene.ts, map-castle.json→map-mystic-castle.json |
| 2026-06-10 | `CELL_SIZE` mantido como alias = 1 (deprecado) | Evitar quebrar imports desconhecidos em battle.scene.ts (3138 linhas) | terrain-types.ts |
| 2026-06-10 | `ExplosionResult.cellsDestroyed` removido; retorna apenas `{center, radius}` | Novo motor não trabalha com células | terrain-types.ts, todos consumers |
| 2026-06-10 | `terrain-textures.ts` deletado completamente | Tiles gerados programaticamente não são mais usados | battle.scene.ts deve remover import |
| 2026-06-10 | Colisão via Uint8Array (bitmap flat, 1 byte/pixel) | Padrão indústria (Worms/Gunbound); fidelidade total; performance OK | terrain-engine.ts |
| 2026-06-10 | Visual via RenderTexture.erase() + Graphics circular | Padrão Phaser 3; GPU; sem rebuild de chunks | terrain-renderer.ts |
| 2026-06-10 | Spawn points em coordenadas de pixel {x, y} | Eliminação de grid; direto no espaço de mundo | spawn-selector.ts, map JSONs |
| 2026-06-10 | runic-forest background: setDisplaySize(1672, 941) | Background é 1536×1024; terrain já é 1672×941 | terrain-renderer.ts ou battle.scene.ts |
| 2026-06-10 | Terrain PVP: todos pixels alpha>127 = destrutível (sem indestructible) | Mapas PVP não possuem áreas indestructible por design | terrain-engine.ts |
