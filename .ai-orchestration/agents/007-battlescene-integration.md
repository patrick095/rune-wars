# Agent 007 — BattleScene Integration

## Objetivo
Integrar todos os novos sistemas em `battle.scene.ts`: orçamento de movimento, colisão horizontal + step climbing, facing + sprite flip, ângulo espelhado, câmera com bounds, spawn aleatório, morte por queda, MovementBudgetHUD. Este é o agente mais complexo — ler o arquivo atual ANTES de qualquer modificação.

## Contexto
Projeto: Rune Wars — Angular 17 + Phaser 3.
Arquivo: `system/frontend/src/game/scenes/battle.scene.ts` (1088 linhas na versão original)
Raiz: `/Users/patrickchaves/projetos/pessoal/rune-wars/system/frontend/src`

**TODOS estes agentes já concluídos antes deste:**
- Agent 001: terrain-engine tem worldWidth/worldHeight, MapMeta; CharacterFall retorna 'alive'|'dead'
- Agent 002: terrain-collision.ts (tryHorizontalMove, MoveResult), spawn-selector.ts (selectSpawns, spawnToWorld, moveSpeed, moveBudget), movement-budget-hud.ts (MovementBudgetHUD)
- Agent 003: terrain-renderer.ts reescrito com RenderTexture; aceita setMapName()
- Agent 004: terrain-textures.ts com initTerrainTextures, getTileKey, getBackgroundColor
- Agent 005: mapas PvP com meta.spawnPoints
- Agent 006: mapas dungeon com meta.spawnPoints

## Arquivos autorizados para alterar
- `src/game/scenes/battle.scene.ts` APENAS

## Arquivos para consultar (somente leitura — ler TODOS antes de começar)
- `src/app/shared/game-core/terrain-engine.ts` (interface atual pós-001)
- `src/game/terrain/character-fall.ts` (interface pós-001)
- `src/game/terrain/terrain-collision.ts` (criado pelo 002)
- `src/game/terrain/spawn-selector.ts` (criado pelo 002)
- `src/game/hud/movement-budget-hud.ts` (criado pelo 002)
- `src/game/terrain/terrain-renderer.ts` (reescrito pelo 003)
- `src/app/shared/game-core/maps/map-plains.json` (ver estrutura meta.spawnPoints)

## O que NÃO alterar
- Nenhum outro arquivo
- Não remover mecânicas existentes (armas, efeitos rúnicos, consumíveis, ghost trace, etc.)
- Não alterar a lógica de projéteis
- Não alterar o sistema de HUD de combate existente

## Dependências
- Agentes 001–006 todos CONCLUÍDOS

## PASSO 1 — Ler o arquivo atual
Ler `battle.scene.ts` completo antes de qualquer modificação. Entender a estrutura atual.

## PASSO 2 — Importações a adicionar

```typescript
import { tryHorizontalMove } from '../terrain/terrain-collision';
import { selectSpawns, spawnToWorld, moveSpeed, moveBudget } from '../terrain/spawn-selector';
import { MovementBudgetHUD } from '../hud/movement-budget-hud';
import { MapMeta } from '../../app/shared/game-core/terrain-engine';
import { CELL_SIZE } from '../../app/shared/game-core/terrain-types';
import mapDeepMines from '../../app/shared/game-core/maps/map-deep-mines.json';
import mapArcaneRuins from '../../app/shared/game-core/maps/map-arcane-ruins.json';
import mapRunicForest from '../../app/shared/game-core/maps/map-runic-forest.json';
```
(mapDeepMines e os outros já podem existir — verificar)

## PASSO 3 — Atualizar BattleCharacterState

```typescript
interface BattleCharacterState {
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  isPlayer: boolean;
  facing: 'left' | 'right';  // NOVO
}
```

## PASSO 4 — Adicionar campos de estado à classe

```typescript
// Movimento por turno
private playerAgility = 50; // default playground; na partida real virá do loadout
private moveBudgetTotal = 0;
private moveBudgetUsed = 0;
private movementBudgetHUD!: MovementBudgetHUD;

// Sprite como Image (substituir Rectangle)
// playerSprite e aiSprite precisam ser Phaser.GameObjects.Image
private playerSprite!: Phaser.GameObjects.Image;  // muda de Rectangle para Image
private aiSprite!: Phaser.GameObjects.Image;       // muda de Rectangle para Image
```

## PASSO 5 — Atualizar init() para receber agilidade

```typescript
init(data?: { isPlayground?: boolean; agility?: number }): void {
  this.isPlayground = data?.isPlayground ?? false;
  this.playerAgility = data?.agility ?? 50;
}
```

## PASSO 6 — Atualizar create()

### 6a. Após criar o TerrainEngine, configurar câmera:
```typescript
const worldW = this.terrainEngine.worldWidth;
const worldH = this.terrainEngine.worldHeight;

this.cameras.main.setBounds(0, 0, worldW, worldH);
this.cameras.main.setZoom(0.7); // ver mais do mapa
```

### 6b. Substituir spawn fixo por spawn aleatório:
```typescript
// Ler meta do JSON importado (mapPlains tem campo meta com spawnPoints)
const mapMeta = (mapPlains as { meta?: MapMeta; grid: number[][] }).meta;
const spawnPoints = mapMeta?.spawnPoints ?? [];
const spawns = selectSpawns(spawnPoints, 2);

const charHeight = 60;
const charWidth = 40;

// Player spawn
const playerSpawnPx = spawns[0]
  ? spawnToWorld(spawns[0], CELL_SIZE, charHeight)
  : { x: 120, y: 400 };
this.playerStats.x = playerSpawnPx.x;
this.playerStats.y = playerSpawnPx.y;
this.playerStats.facing = 'right';

// AI spawn
const aiSpawnPx = spawns[1]
  ? spawnToWorld(spawns[1], CELL_SIZE, charHeight)
  : { x: worldW - 120, y: 400 };
this.aiStats.x = aiSpawnPx.x;
this.aiStats.y = aiSpawnPx.y;
this.aiStats.facing = 'left';
```

### 6c. Substituir Rectangle por Image para sprites:
```typescript
// Remover: this.playerSprite = this.add.rectangle(...)
// Adicionar:
this.playerSprite = this.add.image(this.playerStats.x, this.playerStats.y, 'human_battle')
  .setDisplaySize(charWidth, charHeight)
  .setDepth(2);

this.aiSprite = this.add.image(this.aiStats.x, this.aiStats.y, 'human_battle')
  .setDisplaySize(charWidth, charHeight)
  .setFlipX(true) // IA começa olhando para esquerda
  .setDepth(2);
```

Manter os textos "Jogador" e "Inimigo" abaixo dos sprites.

### 6d. Câmera segue jogador (após criar sprites):
```typescript
this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);
```

### 6e. Adicionar MovementBudgetHUD:
```typescript
// Posicionar na barra inferior — usar coordenadas fixas de câmera (setScrollFactor(0))
// Phaser: elementos de HUD devem usar setScrollFactor(0) para ficarem fixos na tela
this.movementBudgetHUD = new MovementBudgetHUD(this, this.scale.width / 2, this.scale.height - 80);
```
**NOTA:** `MovementBudgetHUD` internamente usa `scene.add.graphics()` e `scene.add.text()`. 
Para que fiquem fixos na câmera (não scrollem com o mundo), após criar o HUD, aplicar `setScrollFactor(0)` nos objetos internos. Adaptar o construtor de `MovementBudgetHUD` se necessário, ou sobrescrever aqui.

### 6f. Inicializar orçamento de movimento:
```typescript
// No início do turno do jogador (chamado por startPlayerTurn ou no create):
private startPlayerTurn(): void {
  this.moveBudgetTotal = moveBudget(this.playerAgility);
  this.moveBudgetUsed = 0;
  this.movementBudgetHUD.update(0, this.moveBudgetTotal);
  this.movementBudgetHUD.setVisible(true);
  this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);
}
```

## PASSO 7 — Atualizar update()

```typescript
override update(_time: number, delta: number): void {
  if (!this.isAnimating) {
    this.handleKeyboardInput(delta);

    // Queda com detecção de morte
    const playerState = this.playerFall.update(this.playerSprite, this.terrainEngine, delta);
    const aiState = this.aiFall.update(this.aiSprite, this.terrainEngine, delta);

    if (playerState === 'dead' && this.playerStats.hp > 0) {
      this.playerStats.hp = 0;
      this.resultOverlay.show(this, false);
      return;
    }
    if (aiState === 'dead' && this.aiStats.hp > 0) {
      this.aiStats.hp = 0;
      this.resultOverlay.show(this, true);
      return;
    }

    // Sync
    this.playerStats.x = this.playerSprite.x;
    this.playerStats.y = this.playerSprite.y;
    this.aiStats.x = this.aiSprite.x;
    this.aiStats.y = this.aiSprite.y;
  }

  // ... resto do update existente
}
```

## PASSO 8 — Atualizar movePlayer()

```typescript
private movePlayer(deltaX: number): void {
  if (this.statusEffects.hasEffect('player', 'FREEZE')) return;

  // Calcular quanto pode mover (orçamento restante)
  const remaining = this.moveBudgetTotal - this.moveBudgetUsed;
  if (remaining <= 0) return;

  const cappedDelta = Math.sign(deltaX) * Math.min(Math.abs(deltaX), remaining);

  const result = tryHorizontalMove(
    this.playerSprite.x,
    this.playerSprite.y,
    cappedDelta,
    this.terrainEngine
  );

  if (!result.canMove) return;

  // Atualizar facing
  const newFacing: 'left' | 'right' = deltaX > 0 ? 'right' : 'left';
  if (newFacing !== this.playerStats.facing) {
    this.playerStats.facing = newFacing;
    this.playerSprite.setFlipX(newFacing === 'left');
    this.updateTrajectoryPreview();
  }

  this.playerSprite.setPosition(result.newX, result.newY);
  this.moveBudgetUsed += Math.abs(cappedDelta);
  this.movementBudgetHUD.update(this.moveBudgetUsed, this.moveBudgetTotal);

  this.playerStats.x = result.newX;
  this.playerStats.y = result.newY;
}
```

## PASSO 9 — handleKeyboardInput: velocidade de movimento

```typescript
private handleKeyboardInput(delta: number): void {
  if (!this.cursors || !this.turnManager.isPlayerTurn || this.isAnimating) return;
  const dt = delta / 1000;
  const speed = moveSpeed(this.playerAgility); // px/s baseado em agilidade
  let moved = false;

  if (this.cursors.left?.isDown) {
    this.movePlayer(-speed * dt);
    moved = true;
  }
  if (this.cursors.right?.isDown) {
    this.movePlayer(speed * dt);
    moved = true;
  }
  if (this.cursors.up?.isDown) {
    this.adjustAngle(ANGLE_CHANGE_SPEED * dt);
    moved = true;
  }
  if (this.cursors.down?.isDown) {
    this.adjustAngle(-ANGLE_CHANGE_SPEED * dt);
    moved = true;
  }

  if (moved) this.updateTrajectoryPreview();
}
```

## PASSO 10 — Ângulo relativo ao facing

Adicionar helper privado:

```typescript
private getWorldAngle(angle: number): number {
  // angle: 5-175 relativo ao facing do jogador
  // Facing right: ângulo direto (45° = dispara para cima-direita)
  // Facing left: espelhar (45° → 135°)
  return this.playerStats.facing === 'right' ? angle : 180 - angle;
}
```

Atualizar `firePlayerShot`:
```typescript
private firePlayerShot(angle: number, force: number): void {
  this.trajectory.clear();
  const worldAngle = this.getWorldAngle(angle);
  const profile = this.playerWeapon.physicsProfile;
  const config: ProjectileConfig = {
    angle: worldAngle,  // usar ângulo convertido
    force,
    gravityScale: profile.gravityScale,
    windInfluence: profile.windInfluence,
    baseDamage: this.playerWeapon.baseDamage,
  };
  // ... resto igual
}
```

Atualizar `updateTrajectoryPreview` da mesma forma — usar `getWorldAngle(this.currentAngle)`.

## PASSO 11 — HUD de ângulo mostra direção

```typescript
// No angleText (após criar o texto):
private updateAngleDisplay(): void {
  const prefix = this.playerStats.facing === 'left' ? '← ' : '';
  const suffix = this.playerStats.facing === 'right' ? ' →' : '';
  this.angleText.setText(`${prefix}${this.currentAngle}°${suffix}`);
}
```

Chamar `updateAngleDisplay()` nos lugares onde `angleText.setText()` é chamado.

## PASSO 12 — switchMap() com spawn e câmera

```typescript
switchMap(mapName: MapName): void {
  this.currentMap = mapName;
  const gridData = this.getGridData(mapName);
  this.terrainEngine.loadMap(gridData);

  // Notificar renderer do novo mapa
  (this.terrainRenderer as TerrainRenderer & { setMapName(n: string): void }).setMapName?.(mapName);
  this.terrainRenderer.renderFull();

  // Re-spawn aleatório
  const mapJson = this.getMapJson(mapName);
  const mapMeta = (mapJson as { meta?: MapMeta }).meta;
  const spawnPoints = mapMeta?.spawnPoints ?? [];
  const spawns = selectSpawns(spawnPoints, 2);
  const charHeight = 60;

  if (spawns[0]) {
    const p = spawnToWorld(spawns[0], CELL_SIZE, charHeight);
    this.playerSprite.setPosition(p.x, p.y);
  }
  if (spawns[1]) {
    const a = spawnToWorld(spawns[1], CELL_SIZE, charHeight);
    this.aiSprite.setPosition(a.x, a.y);
  }

  // Atualizar bounds da câmera
  this.cameras.main.setBounds(0, 0, this.terrainEngine.worldWidth, this.terrainEngine.worldHeight);
}

private getMapJson(mapName: MapName): { meta?: MapMeta; grid: number[][] } {
  switch (mapName) {
    case 'castle': return mapCastle as { meta?: MapMeta; grid: number[][] };
    case 'deep_mines': return mapDeepMines as { meta?: MapMeta; grid: number[][] };
    case 'arcane_ruins': return mapArcaneRuins as { meta?: MapMeta; grid: number[][] };
    case 'runic_forest': return mapRunicForest as { meta?: MapMeta; grid: number[][] };
    default: return mapPlains as { meta?: MapMeta; grid: number[][] };
  }
}
```

## PASSO 13 — endTurn(): câmera segue IA quando é turno dela

```typescript
private endTurn(wasPlayerShot: boolean): void {
  this.turnManager.nextTurn();
  // ... efeitos etc existentes ...

  if (!this.turnManager.isPlayerTurn) {
    this.cameras.main.startFollow(this.aiSprite, true, 0.08, 0.08);
    this.movementBudgetHUD.setVisible(false);
    this.time.delayedCall(1000, () => { this.fireAiShot(); });
  } else {
    this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);
    // Reset orçamento de movimento
    this.moveBudgetTotal = moveBudget(this.playerAgility);
    this.moveBudgetUsed = 0;
    this.movementBudgetHUD.update(0, this.moveBudgetTotal);
    this.movementBudgetHUD.setVisible(true);
    this.ghostTrace?.clear();
    this.updateTrajectoryPreview();
  }
}
```

## PASSO 14 — Debug API: setPlayerAgility e setPlayerWeapon não muda

Adicionar:
```typescript
setPlayerAgility(agility: number): void {
  this.playerAgility = Math.max(0, Math.min(500, agility));
  // Reset budget para novo turno
  this.moveBudgetTotal = moveBudget(this.playerAgility);
  this.moveBudgetUsed = 0;
  this.movementBudgetHUD.update(0, this.moveBudgetTotal);
}
```

## PASSO 15 — MapName type expandido

Verificar se MapName inclui todos os novos mapas (já deve estar completo no código original).

## ATENÇÃO — Possíveis problemas

1. **`playerSprite` e `aiSprite` mudaram de `Rectangle` para `Image`**: Verificar TODOS os lugares onde essas variáveis são usadas com métodos exclusivos de Rectangle (ex: `setFillStyle`). Remover/substituir.

2. **`CharacterFall.update()` tipo de sprite**: O Agent 001 deve ter atualizado o tipo para aceitar `Image`. Verificar se há erros de tipo.

3. **ScrollFactor do HUD**: `movementBudgetHUD` e outros HUDs devem ter `setScrollFactor(0)` para não scrollar. Verificar o `PowerMeterHUD`, `CombatHud` e outros — podem precisar do mesmo fix se ainda não tiverem.

4. **JSON import type**: TypeScript pode reclamar do cast `mapPlains as { meta?: MapMeta; grid: number[][] }`. Usar `as unknown as` se necessário.

5. **MAP_WORLD_WIDTH**: Atualmente definido como `GRID_COLS * CELL_SIZE`. Como GRID_COLS agora é 300, isso já vai retornar 6000. Verificar se há hardcodes de 2000 no arquivo.

## Critérios de aceite
- [ ] TypeScript compila sem erros
- [ ] Sprites são `Image` com `setFlipX` funcionando
- [ ] `movePlayer` usa `tryHorizontalMove` e respeita orçamento
- [ ] Orçamento reseta no início de cada turno do jogador
- [ ] `MovementBudgetHUD` visível e atualizada em tempo real
- [ ] Queda fatal: `CharacterFall.update() === 'dead'` → chama `resultOverlay.show()`
- [ ] Facing atualiza sprite flip e texto de ângulo
- [ ] `firePlayerShot` usa `getWorldAngle()` (ângulo espelhado por facing)
- [ ] Câmera segue jogador ativo (player/IA)
- [ ] Spawn aleatório usando `selectSpawns` + `spawnToWorld`
- [ ] `switchMap` usa novo sistema de spawn e atualiza câmera bounds
- [ ] Debug API `setPlayerAgility()` funciona

## Resumo final obrigatório
Criar `.ai-orchestration/agents/007-battlescene-integration-DONE.md`
