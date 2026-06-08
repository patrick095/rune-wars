import Phaser from 'phaser';
import { DungeonEngine } from '../../app/shared/game-core/dungeon-engine';
import { DungeonPhase, DungeonState, EnemyState, PlayerState } from '../../app/shared/game-core/dungeon-types';
import { MonsterAiSystem } from '../../app/shared/game-core/monster-ai';
import { GRID_COLS, TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import { CELL_SIZE } from '../../app/shared/game-core/terrain-types';
import { TerrainRenderer } from '../terrain/terrain-renderer';
import { EnemyRenderer } from '../enemies/enemy-renderer';
import { GolemBoss } from '../enemies/golem-boss';
import mapEntrance from '../../app/shared/game-core/maps/dungeon-cave-entrance.json';
import mapHall from '../../app/shared/game-core/maps/dungeon-cave-hall.json';
import mapBoss from '../../app/shared/game-core/maps/dungeon-cave-boss.json';

interface DungeonSceneData {
  phaseIndex?: number;
  snapshot?: DungeonState;
  loadout?: Pick<PlayerState, 'weaponId' | 'secondaryItemId' | 'consumableIds'>;
}

const MAPS: Record<string, { grid: number[][] }> = {
  'dungeon-cave-entrance': mapEntrance,
  'dungeon-cave-hall': mapHall,
  'dungeon-cave-boss': mapBoss,
};
const MAP_WORLD_WIDTH = GRID_COLS * CELL_SIZE;

export class DungeonScene extends Phaser.Scene {
  private engine = new DungeonEngine();
  private ai = new MonsterAiSystem();
  private golem = new GolemBoss();
  private enemyRenderer!: EnemyRenderer;
  private terrainEngine!: TerrainEngine;
  private terrainRenderer!: TerrainRenderer;
  private phase!: DungeonPhase;
  private state!: DungeonState;
  private player!: Phaser.GameObjects.Rectangle;
  private crystal?: Phaser.GameObjects.Rectangle;
  private enemySprites = new Map<string, Phaser.GameObjects.Container>();
  private infoText!: Phaser.GameObjects.Text;
  private angleText!: Phaser.GameObjects.Text;
  private powerText!: Phaser.GameObjects.Text;
  private angle = 45;
  private power = 62;
  private busy = false;

  constructor() {
    super({ key: 'DungeonScene' });
  }

  init(data: DungeonSceneData): void {
    this.engine = new DungeonEngine(data.loadout ?? data.snapshot?.playerState);
    const targetIndex = data.phaseIndex ?? data.snapshot?.currentPhaseIndex ?? 0;
    while (this.engine.getState().currentPhaseIndex < targetIndex) {
      this.forcePhaseAdvance();
    }
    if (data.loadout) this.engine.updatePlayerLoadout(data.loadout);
    this.state = this.engine.getState();
    this.phase = this.engine.getCurrentPhase();
  }

  create(): void {
    (window as unknown as Record<string, unknown>)['dungeonScene'] = this;
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x141725);
    this.terrainEngine = new TerrainEngine(MAPS[this.phase.map].grid);
    this.terrainRenderer = new TerrainRenderer(this, this.terrainEngine);
    this.terrainRenderer.renderFull();
    this.enemyRenderer = new EnemyRenderer(this);

    this.placeActors();
    this.createHud();
    this.createControls();
  }

  private placeActors(): void {
    const playerX = 96;
    const playerY = (this.terrainEngine.getFloorBelow(playerX, 0) ?? 280) - 28;
    this.player = this.add.rectangle(playerX, playerY, 34, 54, 0x4488ff).setDepth(5);
    this.add.text(playerX, playerY + 38, 'Jogador', { fontSize: '11px', color: '#ffffff', fontFamily: 'monospace' })
      .setOrigin(0.5).setDepth(6);

    if (this.state.protectTarget) {
      const crystalX = this.clampInitialX(MAP_WORLD_WIDTH / 2);
      const crystalY = (this.terrainEngine.getFloorBelow(crystalX, 0) ?? 280) - 32;
      this.crystal = this.add.rectangle(crystalX, crystalY, 32, 54, 0x55e6ff).setDepth(4);
      this.state.protectTarget = { ...this.state.protectTarget, x: crystalX, y: crystalY };
    }

    const spacing = this.phase.id === 'floor1-boss' ? 0 : 52;
    const startX = this.clampInitialX(MAP_WORLD_WIDTH - 150 - spacing * Math.max(0, this.state.enemies.length - 1));
    this.state.enemies.forEach((enemy, index) => {
      const x = enemy.type === 'GOLEM_MINOR'
        ? this.clampInitialX(MAP_WORLD_WIDTH - 150)
        : this.clampInitialX(startX + index * spacing);
      const y = (this.terrainEngine.getFloorBelow(x, 0) ?? 280) - (enemy.type === 'GOLEM_MINOR' ? 42 : 22);
      enemy.x = x;
      enemy.y = y;
      this.enemySprites.set(enemy.id, this.enemyRenderer.create(enemy));
    });
  }

  private createHud(): void {
    this.infoText = this.add.text(14, 12, '', {
      fontSize: '13px',
      color: '#f2f2f2',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 6 },
    }).setDepth(20);
    this.refreshHud();
  }

  private createControls(): void {
    const y = this.scale.height - 42;
    this.button(56, y, 'Ang -', () => this.adjustAngle(-5));
    this.angleText = this.add.text(126, y, `${this.angle}°`, { fontSize: '14px', color: '#f7d774', fontFamily: 'monospace' }).setOrigin(0.5).setDepth(21);
    this.button(196, y, 'Ang +', () => this.adjustAngle(5));
    this.button(302, y, 'For -', () => this.adjustPower(-5));
    this.powerText = this.add.text(384, y, `${this.power}`, { fontSize: '14px', color: '#f7d774', fontFamily: 'monospace' }).setOrigin(0.5).setDepth(21);
    this.button(468, y, 'For +', () => this.adjustPower(5));
    this.button(this.scale.width - 76, y, 'Atirar', () => this.playerTurn(), 112, 38, 0x8a4f1d);
  }

  private button(x: number, y: number, label: string, action: () => void, width = 72, height = 34, color = 0x2f456f): void {
    const rect = this.add.rectangle(x, y, width, height, color).setInteractive().setDepth(20);
    this.add.text(x, y, label, { fontSize: '12px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5).setDepth(21);
    rect.on('pointerdown', action);
  }

  private adjustAngle(delta: number): void {
    if (this.busy) return;
    this.angle = Math.max(5, Math.min(175, this.angle + delta));
    this.angleText.setText(`${this.angle}°`);
  }

  private clampInitialX(mapX: number): number {
    const minX = 64;
    const maxMapX = MAP_WORLD_WIDTH - 64;
    const maxVisibleX = Math.max(minX, this.scale.width - 64);
    return Math.max(minX, Math.min(mapX, maxMapX, maxVisibleX));
  }

  private adjustPower(delta: number): void {
    if (this.busy) return;
    this.power = Math.max(15, Math.min(100, this.power + delta));
    this.powerText.setText(`${this.power}`);
  }

  private playerTurn(): void {
    if (this.busy) return;
    const target = this.state.enemies.find(enemy => enemy.alive);
    if (!target) return;
    this.busy = true;
    const projectile = this.add.circle(this.player.x, this.player.y - 20, 6, 0xffd166).setDepth(10);
    const targetSprite = this.enemySprites.get(target.id);
    this.tweens.add({
      targets: projectile,
      x: targetSprite?.x ?? target.x,
      y: (targetSprite?.y ?? target.y ?? 0) - 12,
      duration: 520,
      ease: 'Quad.easeOut',
      onComplete: () => {
        projectile.destroy();
        const hitChance = Math.max(0.35, Math.min(0.95, 1 - Math.abs(this.angle - 45) / 160 + this.power / 350));
        if (Math.random() <= hitChance) {
          this.engine.damageEnemy(target.id, this.phase.id === 'floor1-boss' ? 48 : 34);
        }
        this.afterPlayerTurn();
      },
    });
  }

  private afterPlayerTurn(): void {
    this.syncFromEngine();
    if (this.finishIfNeeded()) return;
    this.time.delayedCall(450, () => this.enemyTurn());
  }

  private enemyTurn(): void {
    for (const enemy of this.state.enemies.filter(candidate => candidate.alive)) {
      const action = this.ai.planAction(enemy, { ...this.state.playerState, x: this.player.x, y: this.player.y } as PlayerState, this.terrainEngine);
      if (action.moveToX) {
        const sprite = this.enemySprites.get(enemy.id);
        enemy.x = action.moveToX;
        sprite?.setX(action.moveToX);
      }
      if (enemy.type === 'GOLEM_MINOR') {
        const message = this.golem.applyPhaseAction(this.terrainEngine, this.player.x, this.player.y, enemy.hp, enemy.maxHp);
        this.infoText.setText(`${this.phase.name}\n${message}`);
        this.terrainRenderer.renderFull();
      }
      this.engine.applyEnemyTurn(enemy);
    }
    if (this.phase.objective.type === 'PROTECT') this.engine.recordProtectedTurn();
    this.syncFromEngine();
    this.finishIfNeeded();
    this.busy = false;
  }

  private syncFromEngine(): void {
    this.state = this.engine.getState();
    this.state.enemies.forEach(enemy => {
      const sprite = this.enemySprites.get(enemy.id);
      if (sprite) this.enemyRenderer.update(sprite, enemy);
    });
    if (this.crystal && this.state.protectTarget) {
      this.crystal.setFillStyle(this.state.protectTarget.hp <= 35 ? 0xff5f6d : 0x55e6ff);
    }
    this.refreshHud();
  }

  private refreshHud(): void {
    if (!this.infoText) return;
    const liveEnemies = this.state.enemies.filter(enemy => enemy.alive).length;
    const objective = this.phase.objective.type === 'PROTECT'
      ? `Cristal ${this.state.protectTarget?.hp ?? 0}/${this.state.protectTarget?.maxHp ?? 0} | Turnos ${this.state.protectedTurns}/${this.phase.objective.turns}`
      : `Inimigos vivos: ${liveEnemies}`;
    this.infoText.setText(`${this.phase.name}\n${objective}\nVidas: ${this.state.lives} | HP: ${this.state.playerState.hp}/${this.state.playerState.maxHp}`);
  }

  private finishIfNeeded(): boolean {
    if (this.state.status === 'PHASE_COMPLETE' || this.state.status === 'FAILED') {
      this.busy = true;
      this.time.delayedCall(700, () => {
        window.dispatchEvent(new CustomEvent('rune-wars:dungeon-phase-finished', {
          detail: { state: this.engine.getState(), phase: this.phase },
        }));
      });
      return true;
    }
    return false;
  }

  private forcePhaseAdvance(): void {
    const phase = this.engine.getCurrentPhase();
    if (phase.objective.type === 'PROTECT') {
      for (let i = 0; i < (phase.objective.turns ?? 0); i++) this.engine.recordProtectedTurn();
    } else {
      this.engine.getState().enemies.forEach(enemy => this.engine.damageEnemy(enemy.id, enemy.maxHp));
    }
    this.engine.advancePhase();
  }
}
