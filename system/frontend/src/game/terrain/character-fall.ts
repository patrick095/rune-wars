import Phaser from 'phaser';
import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';

const FALL_SPEED = 300; // px/s
const FALL_DEATH_MS = 3000;

type FallSprite = Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;

export class CharacterFall {
  isFalling = false;
  private fallDurationMs = 0;

  update(sprite: FallSprite, engine: TerrainEngine, dt: number): 'alive' | 'dead' {
    if (sprite.y > engine.worldHeight * 1.05) {
      console.warn(`[Fall] Player cruzou death line em y=${sprite.y}`);
      return 'dead';
    }

    const feetY = sprite.y + sprite.height / 2;
    const floorY = engine.getFloorBelow(sprite.x, feetY);

    if (floorY === null) {
      this.isFalling = true;
      this.fallDurationMs += dt;
      sprite.setY(sprite.y + FALL_SPEED * (dt / 1000));

      if (sprite.y > engine.worldHeight + 200 || this.fallDurationMs >= FALL_DEATH_MS) {
        return 'dead';
      }
      return 'alive';
    }

    this.fallDurationMs = 0;
    const targetY = floorY - sprite.height / 2;

    if (sprite.y < targetY - 0.5) {
      this.isFalling = true;
      const step = FALL_SPEED * (dt / 1000);
      sprite.setY(Math.min(sprite.y + step, targetY));
      if (sprite.y >= targetY - 0.5) {
        sprite.setY(targetY);
        this.isFalling = false;
      }
    } else if (sprite.y > targetY + 0.5) {
      sprite.setY(targetY);
      this.isFalling = false;
    } else {
      this.isFalling = false;
    }
    return 'alive';
  }
}
