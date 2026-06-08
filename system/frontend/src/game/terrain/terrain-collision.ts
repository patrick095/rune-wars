import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import { TerrainMaterial } from '../../app/shared/game-core/terrain-types';

const CHAR_HALF_WIDTH = 20;
const CHAR_HEIGHT = 60;
const MAX_STEP_HEIGHT = 12;

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
  const direction = Math.sign(deltaX);
  const targetX = currentX + deltaX;

  const checkX = targetX + direction * CHAR_HALF_WIDTH;
  const checkPoints = [
    currentY - CHAR_HEIGHT / 2 + 4,
    currentY,
    currentY + CHAR_HEIGHT / 2 - 4,
  ];

  const hitWall = checkPoints.some(cy => {
    const mat = engine.getMaterialAt(checkX, cy);
    return mat !== TerrainMaterial.EMPTY;
  });

  if (hitWall) {
    return { canMove: false, newX: currentX, newY: currentY };
  }

  const currentFeetY = currentY + CHAR_HEIGHT / 2;
  const nextFloorY = engine.getFloorBelow(targetX, currentFeetY);

  if (nextFloorY === null) {
    return { canMove: true, newX: targetX, newY: currentY };
  }

  const currentFloorY = engine.getFloorBelow(currentX, currentFeetY) ?? currentFeetY;
  const heightDiff = nextFloorY - currentFloorY;

  if (heightDiff < -MAX_STEP_HEIGHT) {
    return { canMove: false, newX: currentX, newY: currentY };
  }

  const newY = nextFloorY - CHAR_HEIGHT / 2;
  return { canMove: true, newX: targetX, newY };
}
