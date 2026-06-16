import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import { TerrainMaterial } from '../../app/shared/game-core/terrain-types';
import {
  CHARACTER_BODY_HALF_WIDTH,
  CHARACTER_BODY_HEIGHT,
} from './character-placement';

const STEP_HEIGHT_RATIO = 0.4;
const MAX_STEP_HEIGHT = CHARACTER_BODY_HEIGHT * STEP_HEIGHT_RATIO;
const SUPPORT_INSET = 4;
const VERTICAL_FOLLOW_RATIO = 1.5;

export interface MoveResult {
  canMove: boolean;
  newX: number;
  newY: number;
}

export function tryHorizontalMove(
  currentX: number,
  currentY: number,
  deltaX: number,
  engine: TerrainEngine
): MoveResult {
  const targetX = currentX + deltaX;
  const direction = Math.sign(deltaX) || 1;
  const currentFeetY = currentY + CHARACTER_BODY_HEIGHT / 2;
  const leadingFootX =
    targetX + direction * (CHARACTER_BODY_HALF_WIDTH - SUPPORT_INSET);
  const nextFloorY = engine.getFloorBelow(
    leadingFootX,
    currentFeetY - MAX_STEP_HEIGHT,
  );

  if (nextFloorY !== null) {
    const heightDelta = nextFloorY - currentFeetY;
    if (heightDelta >= 0) {
      const targetY = nextFloorY - CHARACTER_BODY_HEIGHT / 2;
      if (isUpperBodyClear(engine, targetX, targetY)) {
        return { canMove: true, newX: targetX, newY: targetY };
      }

      if (isUpperBodyClear(engine, targetX, currentY)) {
        return { canMove: true, newX: targetX, newY: currentY };
      }
    } else if (-heightDelta <= MAX_STEP_HEIGHT) {
      const targetY = nextFloorY - CHARACTER_BODY_HEIGHT / 2;
      const maxVerticalMove = Math.max(1, Math.abs(deltaX) * VERTICAL_FOLLOW_RATIO);
      const nextY = clamp(
        targetY,
        currentY - maxVerticalMove,
        currentY + maxVerticalMove,
      );
      if (isUpperBodyClear(engine, targetX, nextY)) {
        return { canMove: true, newX: targetX, newY: nextY };
      }
    }
  } else if (isUpperBodyClear(engine, targetX, currentY)) {
    // No ground near the next step: allow horizontal move; gravity handles the fall.
    return { canMove: true, newX: targetX, newY: currentY };
  }

  return { canMove: false, newX: currentX, newY: currentY };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function isUpperBodyClear(
  engine: TerrainEngine,
  centerX: number,
  centerY: number,
): boolean {
  const left = Math.ceil(centerX - CHARACTER_BODY_HALF_WIDTH + 2);
  const right = Math.floor(centerX + CHARACTER_BODY_HALF_WIDTH - 2);
  const top = Math.ceil(centerY - CHARACTER_BODY_HEIGHT / 2 + 2);
  const bottom = Math.floor(centerY + CHARACTER_BODY_HEIGHT / 2 - MAX_STEP_HEIGHT);

  if (
    left < 0 ||
    right >= engine.worldWidth ||
    top < 0 ||
    bottom >= engine.worldHeight
  ) {
    return false;
  }

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      if (engine.getMaterialAt(x, y) !== TerrainMaterial.EMPTY) return false;
    }
  }

  return true;
}
