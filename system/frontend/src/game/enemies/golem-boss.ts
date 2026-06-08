import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';

export type GolemPhase = 'STONE_VOLLEY' | 'SHATTER_COVER';

export class GolemBoss {
  getPhase(hp: number, maxHp: number): GolemPhase {
    return hp / maxHp <= 0.5 ? 'SHATTER_COVER' : 'STONE_VOLLEY';
  }

  applyPhaseAction(terrainEngine: TerrainEngine, playerX: number, playerY: number, hp: number, maxHp: number): string {
    const phase = this.getPhase(hp, maxHp);
    if (phase === 'STONE_VOLLEY') {
      terrainEngine.explode(playerX, Math.max(24, playerY - 120), 28);
      return 'Pedras caem sobre a arena.';
    }

    terrainEngine.explode(playerX, playerY + 22, 44);
    return 'O Golem destrói a cobertura perto do jogador.';
  }
}
