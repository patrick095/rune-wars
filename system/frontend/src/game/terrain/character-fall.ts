import Phaser from 'phaser';
import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';

const FALL_SPEED = 200; // pixels per second

export class CharacterFall {
  isFalling = false;

  update(sprite: Phaser.GameObjects.Rectangle, engine: TerrainEngine, dt: number): void {
    const feetY = sprite.y + sprite.height / 2;
    const floorY = engine.getFloorBelow(sprite.x, feetY);

    if (floorY === null) {
      // No terrain below — keep sprite at current position (bottom of map boundary)
      this.isFalling = false;
      return;
    }

    const targetY = floorY - sprite.height / 2;

    if (sprite.y < targetY - 0.5) {
      // Character is above the floor — fall down
      this.isFalling = true;
      const step = FALL_SPEED * (dt / 1000);
      const newY = Math.min(sprite.y + step, targetY);
      sprite.setY(newY);

      if (newY >= targetY - 0.5) {
        sprite.setY(targetY);
        this.isFalling = false;
      }
    } else if (sprite.y > targetY + 0.5) {
      // Terrain appeared above feet (shouldn't happen in normal play, but snap up)
      sprite.setY(targetY);
      this.isFalling = false;
    } else {
      this.isFalling = false;
    }
  }
}
