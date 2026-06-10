import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import { TerrainMaterial } from '../../app/shared/game-core/terrain-types';

const CHAR_HALF_WIDTH = 20;
const CHAR_HEIGHT = 60;
const MAX_STEP_HEIGHT = 60; // can step up to own character height
const MAX_STEP_DOWN = 40;

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
  const currentFeetY = currentY + CHAR_HEIGHT / 2;

  // Scan from MAX_STEP_HEIGHT above current feet so we can detect upward steps.
  const nextFloorY = engine.getFloorBelow(checkX, currentFeetY - MAX_STEP_HEIGHT);

  if (nextFloorY === null || nextFloorY - currentFeetY > MAX_STEP_DOWN) {
    // Open air or big drop — allow horizontal move; gravity handles the fall.
    return { canMove: true, newX: targetX, newY: currentY };
  }

  const stepUp = currentFeetY - nextFloorY; // positive = stepping up
  if (stepUp > MAX_STEP_HEIGHT) {
    // Surface is above max step height — wall.
    return { canMove: false, newX: currentX, newY: currentY };
  }

  // Verify the character body fits at the new position (no ceiling/overhang).
  const newCenterY = nextFloorY - CHAR_HEIGHT / 2;
  if (
    engine.getMaterialAt(checkX, newCenterY - CHAR_HEIGHT / 2 + 4) !== TerrainMaterial.EMPTY ||
    engine.getMaterialAt(checkX, newCenterY) !== TerrainMaterial.EMPTY
  ) {
    return { canMove: false, newX: currentX, newY: currentY };
  }

  return { canMove: true, newX: targetX, newY: newCenterY };
}
