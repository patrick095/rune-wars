# Agent 005 — PvP Maps JSON

## Objetivo
Reescrever os 5 arquivos JSON de mapas PvP com o novo formato (300×80 células, meta.spawnPoints com 12 pontos cada). Cada mapa deve ter terreno estratégico com plataformas, abismos letais, bordas indestrutíveis e spawn points seguros.

## Contexto
Projeto: Rune Wars — Angular 17 + Phaser 3.
Grid: 300 colunas × 80 linhas. Cada célula = 20px. Mundo = 6000×1600px.

Materiais:
- `0` = EMPTY (vazio / ar)
- `1` = DESTRUCTIBLE (destrutível, terra/madeira/pedra)
- `2` = INDESTRUCTIBLE (indestrutível, rocha sólida)

Spawn points: `{col, row}` onde col é a coluna (0-299) e row é a linha (0-79).
O personagem ficará com os pés na parte superior da célula `row`, então o ponto de spawn deve estar logo ACIMA do terreno sólido.
Ex: se a célula sólida está em row=65, o spawn point deve ser `{col: X, row: 64}` (última linha vazia antes do terreno).

Bordas indestrutíveis: colunas 0, 1, 2 e 297, 298, 299 devem ser `2` em TODAS as linhas.

## Arquivos autorizados para alterar
- `src/app/shared/game-core/maps/map-plains.json`
- `src/app/shared/game-core/maps/map-castle.json`
- `src/app/shared/game-core/maps/map-deep-mines.json`
- `src/app/shared/game-core/maps/map-arcane-ruins.json`
- `src/app/shared/game-core/maps/map-runic-forest.json`

## O que NÃO alterar
- Nenhum arquivo TypeScript
- Nenhum arquivo de dungeon

## Dependências
- Agent 001 concluído (confirmar GRID_COLS=300, GRID_ROWS=80)

## Estratégia de geração

**IMPORTANTE:** Grids de 300×80 têm 24.000 células cada. Escrever JSON completo diretamente seria inviável. Use a seguinte abordagem:

1. Criar um arquivo de script auxiliar TEMPORÁRIO em Node.js:
   `/tmp/generate-maps.js`
   
2. O script gera os JSONs programaticamente com funções helper

3. Executar via `node /tmp/generate-maps.js` e salvar os resultados nos arquivos corretos

4. Deletar o script temporário após uso

### Estrutura do script:

```javascript
const fs = require('fs');

const COLS = 300;
const ROWS = 80;
const EMPTY = 0, DEST = 1, INDES = 2;

// Funções helper
function emptyGrid() {
  return Array.from({length: ROWS}, () => new Array(COLS).fill(EMPTY));
}

function fillRect(grid, col, row, w, h, mat) {
  for (let r = row; r < Math.min(row + h, ROWS); r++)
    for (let c = col; c < Math.min(col + w, COLS); c++)
      grid[r][c] = mat;
}

function addBorders(grid) {
  for (let r = 0; r < ROWS; r++) {
    grid[r][0] = grid[r][1] = grid[r][2] = INDES;
    grid[r][COLS-1] = grid[r][COLS-2] = grid[r][COLS-3] = INDES;
  }
}

function buildMap(name, grid, spawnPoints) {
  return JSON.stringify({
    meta: { name, cols: COLS, rows: ROWS, spawnPoints },
    grid
  });
}
```

### Especificação de cada mapa

#### map-plains (Planícies)
- Chão base: rows 68-79 completamente DESTRUCTIBLE (mat=1)
- Chão base inferior (rows 72-79): INDESTRUCTIBLE (mat=2) — núcleo rochoso
- 4 plataformas elevadas elevadas de DESTRUCTIBLE:
  - Plataforma 1: col 40-70, rows 55-60 (largura 30, altura 5)
  - Plataforma 2: col 110-145, rows 50-55
  - Plataforma 3: col 165-200, rows 53-58
  - Plataforma 4: col 230-265, rows 55-60
- 4 fossos letais (abismos) no chão base:
  - Fosso 1: col 90-100, rows 65-79 → EMPTY (apagar chão)
  - Fosso 2: col 150-162, rows 65-79 → EMPTY
  - Fosso 3: col 200-212, rows 65-79 → EMPTY
  - Fosso 4: col 258-270, rows 65-79 → EMPTY
- Colinas suaves: rampas de 1 célula de desnível a cada 3-4 colunas nas bordas
- 12 spawn points: 3 em cada quadrante (esq-baixo, esq-cima, dir-baixo, dir-cima)
  Exemplos: {col:15,row:67}, {col:25,row:54}, {col:50,row:54}, {col:80,row:67},
            {col:120,row:49}, {col:130,row:67}, {col:170,row:67}, {col:185,row:52},
            {col:215,row:67}, {col:250,row:54}, {col:270,row:67}, {col:285,row:67}

#### map-castle (Castelo)
- Chão base: rows 70-79 INDESTRUCTIBLE
- 2 torres: 
  - Torre esq: col 10-30, rows 30-70 INDESTRUCTIBLE
  - Torre dir: col 270-290, rows 30-70 INDESTRUCTIBLE
- Muralha esquerda interior: col 50-65, rows 50-70 DESTRUCTIBLE
- Muralha direita interior: col 235-250, rows 50-70 DESTRUCTIBLE
- Portão (gap): col 145-155 — sem terreno no chão base (fosso no centro)
- Plataformas escalonadas:
  - col 70-110, rows 58-62 DESTRUCTIBLE
  - col 190-230, rows 58-62 DESTRUCTIBLE
  - col 120-140, rows 48-52 DESTRUCTIBLE (plataforma central alta)
  - col 160-180, rows 48-52 DESTRUCTIBLE
- Fosso central: col 140-160, rows 60-79 EMPTY (portão letal)
- 12 spawn points espalhados nos andares e plataformas

#### map-deep-mines (Minas Profundas)
- Teto: rows 0-4 INDESTRUCTIBLE (com buracos cols 80-100, 180-200, 250-270)
- Chão base: rows 72-79 INDESTRUCTIBLE  
- Piso médio: rows 45-48 DESTRUCTIBLE (cols 20-80), (cols 120-180), (cols 220-280)
- 5 pilares verticais INDESTRUCTIBLE: 
  cols 60-65 rows 5-70, cols 100-105, cols 150-155, cols 200-205, cols 240-245
- 6 poços profundos (EMPTY cortando até o fundo):
  cols 85-95 rows 50-79, cols 130-140, cols 170-180, cols 205-215, cols 245-255, cols 270-280
- 12 spawn points nos pisos elevados e laterais dos pilares

#### map-arcane-ruins (Ruínas Arcanas)
- Sem chão base contínuo — o vazio é o chão (queda letal)
- 5 plataformas flutuantes DESTRUCTIBLE:
  - col 10-60, rows 60-65 (plataforma esq baixa)
  - col 70-130, rows 45-50 (plataforma esq alta)
  - col 130-170, rows 55-60 (plataforma central)
  - col 170-230, rows 45-50 (plataforma dir alta)
  - col 240-290, rows 60-65 (plataforma dir baixa)
- Pilares indestrutíveis nas bordas das plataformas (espessura 3, altura 10)
- 4 "arcos" de pedra (INDESTRUCTIBLE): col 100-105 rows 35-55, col 195-200 rows 35-55, etc.
- Chão rochoso parcial: rows 75-79 cols 5-50 e 250-295 (ilhas de rocha)
- 12 spawn points nas plataformas (cuidar que haja terreno sólido abaixo de cada spawn)

#### map-runic-forest (Floresta Rúnica)
- Solo base: rows 65-72 DESTRUCTIBLE, rows 73-79 INDESTRUCTIBLE
- 4 "árvores": pilares de DESTRUCTIBLE (col 60-68 rows 25-64), (col 120-128), (col 172-180), (col 232-240)
- Copas das árvores: retângulos DESTRUCTIBLE mais largos no topo dos pilares:
  - (col 50-80, rows 22-28), (col 110-140), (col 162-192), (col 222-252)
- Raízes: plataformas horizontais DESTRUCTIBLE na base dos pilares
- 3 fossos entre as árvores (EMPTY no solo base):
  - col 90-105 rows 65-79, col 148-158, col 208-218
- Rampas de terra suave nos flancos
- 12 spawn points no solo e nas copas das árvores

## Formato JSON final esperado
```json
{
  "meta": {
    "name": "Plains",
    "cols": 300,
    "rows": 80,
    "spawnPoints": [
      {"col": 15, "row": 67},
      ...
    ]
  },
  "grid": [
    [0, 0, 2, 0, ...],
    ...
  ]
}
```

## ATENÇÃO sobre spawn points
Antes de finalizar cada JSON, verificar manualmente que cada spawn point tem:
- `grid[row][col] === 0` (EMPTY — o personagem fica no ar, não dentro do chão)
- `grid[row+1][col] !== 0` (existe terreno sólido logo abaixo)

Se não atender, ajustar o row do spawn point.

## Critérios de aceite
- [ ] 5 arquivos JSON salvos com formato correto (meta + grid)
- [ ] grid tem exatamente 80 linhas × 300 colunas cada
- [ ] Bordas (cols 0-2 e 297-299) são INDESTRUCTIBLE em todas as linhas
- [ ] Cada mapa tem 12 spawn points
- [ ] Todos os spawn points estão sobre terreno sólido (row+1 tem material ≠ 0)
- [ ] Cada mapa tem pelo menos 2 fossos/abismos letais
- [ ] TypeScript consegue importar os JSONs (formato JSON válido)

## Resumo final obrigatório
Criar `.ai-orchestration/agents/005-pvp-maps-DONE.md`
