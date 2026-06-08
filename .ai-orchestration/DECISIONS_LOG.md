# Decisões da Implementação

| Data | Decisão | Motivo | Impacto |
|------|---------|--------|---------|
| 2026-06-08 | GRID_COLS=300, GRID_ROWS=80 | Espaço para 4v4 com estratégia | Todos os mapas e cálculos de mundo |
| 2026-06-08 | CELL_SIZE mantido em 20px | Evitar reescrever toda a renderização | Zero impacto em código existente |
| 2026-06-08 | Tiles via Phaser Graphics.generateTexture (sem PNGs externos) | v1.2.0 é placeholder; arte final na v1.3.0 | terrain-textures.ts cria texturas em memória |
| 2026-06-08 | CharacterFall retorna 'alive'/'dead' | Morte por queda é feature central | battle.scene.ts precisa checar retorno |
| 2026-06-08 | Step max = 12px (20% de 60px char height) | Worms-style: rampas suaves, paredes bloqueiam | terrain-collision.ts implementa a lógica |
| 2026-06-08 | Sprites Rectangle → Image com *_battle.png | Assets já existem; setFlipX requer Image | battle.scene.ts preload já carrega esses assets |
| 2026-06-08 | Ângulo relativo ao facing, espelhado na física | UX: 45° sempre é "para frente" | getWorldAngle() converte antes de simulate() |
| 2026-06-08 | Spawn: Fisher-Yates shuffle a cada partida | Imprevisibilidade; posições seguras são fixas no design | spawn-selector.ts implementa |
| 2026-06-08 | Agilidade padrão no playground = 50 | Representa personagem sem gear | Debug overlay expõe slider 0-500 |
| 2026-06-08 | Mapas dungeon: 200×60 células (4000×1200px) | PvE, menor que PvP, suficiente para 1-4 jogadores | dungeon-*.json com grid menor |
