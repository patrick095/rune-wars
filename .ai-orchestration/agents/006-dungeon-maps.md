# Agent 006 — Dungeon Maps JSON

## Objetivo
Reescrever os 3 arquivos JSON de mapas de dungeon com o novo formato e dimensões (200×60 células). Spawn points voltados para jogadores (lado esquerdo); inimigos ficam no lado direito.

## Contexto
Projeto: Rune Wars — Angular 17 + Phaser 3.
Grid dungeon: 200 colunas × 60 linhas. Mundo = 4000×1200px. Menor que PvP por ser PvE.

Materiais: 0=EMPTY, 1=DESTRUCTIBLE, 2=INDESTRUCTIBLE

Dungeon boss: 200 colunas × 70 linhas = 4000×1400px (arena maior para o boss).

## Arquivos autorizados para alterar
- `src/app/shared/game-core/maps/dungeon-cave-entrance.json`
- `src/app/shared/game-core/maps/dungeon-cave-hall.json`
- `src/app/shared/game-core/maps/dungeon-cave-boss.json`

## O que NÃO alterar
- Nenhum arquivo PvP
- Nenhum arquivo TypeScript

## Dependências
- Agent 001 concluído

## Estratégia de geração
Mesma abordagem do Agent 005: script Node.js temporário em `/tmp/generate-dungeon-maps.js`.

COLS_DUNGEON = 200, ROWS_DUNGEON = 60 (entrance/hall), ROWS_BOSS = 70

### dungeon-cave-entrance (200×60)
- Teto indestrutível: rows 0-3 INDESTRUCTIBLE (exceto alguns buracos cols 80-100)
- Chão base: rows 52-59 INDESTRUCTIBLE
- Plataformas de pedra: 
  - col 10-50, rows 42-45 DESTRUCTIBLE (zona de spawn jogadores)
  - col 30-70, rows 35-38 DESTRUCTIBLE (plataforma elevada)
  - col 80-120, rows 42-45 DESTRUCTIBLE (zona central)
  - col 130-170, rows 38-41 DESTRUCTIBLE
  - col 150-190, rows 42-45 DESTRUCTIBLE (zona inimigos)
- Pilares de rocha: col 70-74 rows 4-52, col 124-128 rows 4-52
- 2 fossos letais: col 55-65 rows 48-59, col 125-135 rows 48-59
- 6 spawn points jogador (lado esquerdo, cols 5-90):
  {col:15,row:51}, {col:25,row:41}, {col:35,row:34}, {col:45,row:51}, {col:60,row:44}, {col:75,row:51}
- meta.name = "Dungeon Cave Entrance", cols=200, rows=60

### dungeon-cave-hall (200×60)
- Teto parcial: rows 0-4 INDESTRUCTIBLE (buracos maiores cols 40-70, 130-160)
- Chão base: rows 53-59 INDESTRUCTIBLE
- Grande salão aberto: col 10-190 rows 5-52 principalmente EMPTY
- Stalactites (pendurados do teto): 
  - col 30-34 rows 4-18 INDESTRUCTIBLE
  - col 60-64 rows 4-14 INDESTRUCTIBLE
  - col 100-104 rows 4-20 INDESTRUCTIBLE
  - col 140-144 rows 4-16 INDESTRUCTIBLE
  - col 170-174 rows 4-12 INDESTRUCTIBLE
- Stalagmites (emergindo do chão):
  - col 45-48 rows 42-53 DESTRUCTIBLE
  - col 90-93 rows 38-53 DESTRUCTIBLE
  - col 120-123 rows 40-53 DESTRUCTIBLE
  - col 155-158 rows 44-53 DESTRUCTIBLE
- Plataformas flutuantes centrais:
  - col 50-90, rows 33-36 DESTRUCTIBLE
  - col 110-150, rows 33-36 DESTRUCTIBLE
- 3 fossos: col 70-80 rows 50-59, col 108-115, col 160-170
- 6 spawn points jogador (cols 5-70):
  {col:10,row:52}, {col:20,row:52}, {col:35,row:52}, {col:40,row:32}, {col:55,row:32}, {col:65,row:52}

### dungeon-cave-boss (200×70) — ROWS = 70
- Arena fechada com piso plano
- Teto: rows 0-2 INDESTRUCTIBLE (sem buracos — fechado)
- Paredes laterais reforçadas: cols 0-4 e 195-199 INDESTRUCTIBLE em todas as linhas
- Chão base: rows 60-69 INDESTRUCTIBLE
- Plataformas laterais para jogadores:
  - col 8-50, rows 45-48 DESTRUCTIBLE
  - col 8-35, rows 35-38 DESTRUCTIBLE
- Plataformas laterais inimigo:
  - col 150-192, rows 45-48 DESTRUCTIBLE
  - col 165-192, rows 35-38 DESTRUCTIBLE
- Pedestal central do boss: col 85-115, rows 55-59 INDESTRUCTIBLE (plataforma sólida)
- 2 colunas de arena: col 65-70 rows 20-59 INDESTRUCTIBLE, col 130-135 rows 20-59 INDESTRUCTIBLE
- 4 spawn points jogador (lado esquerdo, cols 5-55):
  {col:12,row:59}, {col:20,row:59}, {col:12,row:44}, {col:25,row:34}
- meta.name = "Dungeon Cave Boss", cols=200, rows=70

## Formato JSON final
```json
{
  "meta": {
    "name": "Dungeon Cave Entrance",
    "cols": 200,
    "rows": 60,
    "spawnPoints": [
      {"col": 15, "row": 51},
      ...
    ]
  },
  "grid": [[...]]
}
```

## Critérios de aceite
- [ ] 3 arquivos JSON salvos com formato correto
- [ ] cave-entrance e cave-hall: 60 linhas × 200 colunas
- [ ] cave-boss: 70 linhas × 200 colunas
- [ ] cave-entrance e cave-hall têm 6 spawn points
- [ ] cave-boss tem 4 spawn points
- [ ] Todos os spawn points têm terreno sólido logo abaixo (row+1 ≠ 0)
- [ ] JSON válido sem erros de sintaxe
- [ ] ATENÇÃO: `terrain-engine.ts` usa GRID_COLS=300 e GRID_ROWS=80 mas `buildGrid` é tolerante a grids menores — confirmar que funciona com 200×60

## Nota importante sobre compatibilidade
O Agent 001 atualizou GRID_COLS=300/GRID_ROWS=80, mas `buildGrid` preenche com 0 para colunas/linhas ausentes. Os mapas dungeon menores (200×60) vão funcionar — as células extras serão EMPTY. Verificar isso no código de terrain-engine.ts.

## Resumo final obrigatório
Criar `.ai-orchestration/agents/006-dungeon-maps-DONE.md`
