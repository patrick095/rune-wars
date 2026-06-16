import Phaser from 'phaser';
import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import {
  characterBodyOverlapsTerrain,
  findSafeGroundedPosition,
  hasCharacterGroundSupport,
  resolveCharacterTerrainOverlap,
} from './character-placement';

const FALL_SPEED = 300; // px/s
const FALL_DEATH_MS = 3000;
const STEP_HEIGHT_RATIO = 0.4;

type FallSprite = Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;

export class CharacterFall {
  isFalling = false;
  private fallDurationMs = 0;

  /** Snap sprite immediately to ground and clear falling state. */
  snapToGround(sprite: FallSprite, engine: TerrainEngine): void {
    const feetY = sprite.y + sprite.height / 2;
    const safe = findSafeGroundedPosition(engine, sprite.x, feetY, {
      halfWidth: sprite.width / 2,
      height: sprite.height,
      searchUp: sprite.height * 2,
      searchDown: engine.worldHeight,
      searchRadiusX: sprite.width,
    });
    if (safe) {
      sprite.setPosition(safe.x, safe.y);
    }
    this.keepBlockingTerrainOut(sprite, engine);
    this.isFalling = false;
    this.fallDurationMs = 0;
  }

  update(sprite: FallSprite, engine: TerrainEngine, dt: number): 'alive' | 'dead' {
    if (sprite.y > engine.worldHeight * 1.05) {
      console.warn(`[Fall] Player cruzou death line em y=${sprite.y}`);
      return 'dead';
    }

    this.keepBlockingTerrainOut(sprite, engine);

    if (
      !this.upperBodyOverlapsTerrain(sprite, engine) &&
      hasCharacterGroundSupport(engine, sprite.x, sprite.y, {
        halfWidth: sprite.width / 2,
        height: sprite.height,
      })
    ) {
      this.isFalling = false;
      this.fallDurationMs = 0;
      return 'alive';
    }

    this.isFalling = true;
    this.fallDurationMs += dt;
    const previousY = sprite.y;
    const step = FALL_SPEED * (dt / 1000);
    sprite.setY(sprite.y + step);

    const safe = findSafeGroundedPosition(
      engine,
      sprite.x,
      sprite.y + sprite.height / 2,
      {
        halfWidth: sprite.width / 2,
        height: sprite.height,
        searchUp: Math.max(step + 8, 12),
        searchDown: 8,
        searchRadiusX: 0,
        stepX: 1,
      },
    );

    if (safe && safe.y >= previousY - 0.5) {
      sprite.setPosition(safe.x, safe.y);
      this.isFalling = false;
      this.fallDurationMs = 0;
      return 'alive';
    }

    if (sprite.y > engine.worldHeight + 200 || this.fallDurationMs >= FALL_DEATH_MS) {
      return 'dead';
    }

    this.keepBlockingTerrainOut(sprite, engine);
    return 'alive';
  }

  private keepBlockingTerrainOut(sprite: FallSprite, engine: TerrainEngine): void {
    if (!this.upperBodyOverlapsTerrain(sprite, engine)) return;

    const safe = resolveCharacterTerrainOverlap(engine, sprite.x, sprite.y, {
      halfWidth: sprite.width / 2,
      height: sprite.height,
      searchUp: sprite.height * 3,
      searchDown: sprite.height * 3,
      searchRadiusX: 0,
      stepX: 1,
    });
    if (safe) sprite.setPosition(safe.x, safe.y);
  }

  private upperBodyOverlapsTerrain(sprite: FallSprite, engine: TerrainEngine): boolean {
    const upperHeight = sprite.height * (1 - STEP_HEIGHT_RATIO);
    const upperCenterY = sprite.y - (sprite.height - upperHeight) / 2;
    return characterBodyOverlapsTerrain(
      engine,
      sprite.x,
      upperCenterY,
      {
        halfWidth: sprite.width / 2,
        height: upperHeight,
      },
    );
  }
}
