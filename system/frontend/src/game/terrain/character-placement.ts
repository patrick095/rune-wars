import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import { TerrainMaterial } from '../../app/shared/game-core/terrain-types';

export interface CharacterBodyBounds {
  halfWidth: number;
  height: number;
}

export interface CharacterPlacementOptions extends Partial<CharacterBodyBounds> {
  minX?: number;
  maxX?: number;
  searchUp?: number;
  searchDown?: number;
  searchRadiusX?: number;
  stepX?: number;
}

export interface CharacterPlacement {
  x: number;
  y: number;
}

export const CHARACTER_BODY_HALF_WIDTH = 20;
export const CHARACTER_BODY_HEIGHT = 60;

const BODY_SIDE_INSET = 2;
const BODY_TOP_INSET = 2;
const BODY_BOTTOM_CLEARANCE = 2;
const SUPPORT_INSET = 4;
const SUPPORT_DEPTH = 4;

function isSolid(engine: TerrainEngine, x: number, y: number): boolean {
  return engine.getMaterialAt(x, y) !== TerrainMaterial.EMPTY;
}

function getBody(options?: Partial<CharacterBodyBounds>): CharacterBodyBounds {
  return {
    halfWidth: options?.halfWidth ?? CHARACTER_BODY_HALF_WIDTH,
    height: options?.height ?? CHARACTER_BODY_HEIGHT,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function getSupportXs(centerX: number, halfWidth: number): number[] {
  return [
    centerX - halfWidth + SUPPORT_INSET,
    centerX,
    centerX + halfWidth - SUPPORT_INSET,
  ];
}

function getSearchXs(
  desiredX: number,
  minX: number,
  maxX: number,
  radius: number,
  step: number,
): number[] {
  const result: number[] = [];
  const seen = new Set<number>();
  const stepSize = Math.max(1, step);

  for (let offset = 0; offset <= radius; offset += stepSize) {
    const offsets = offset === 0 ? [0] : [offset, -offset];
    for (const nextOffset of offsets) {
      const x = Math.round(clamp(desiredX + nextOffset, minX, maxX));
      if (seen.has(x)) continue;
      seen.add(x);
      result.push(x);
    }
  }

  return result;
}

export function characterBodyOverlapsTerrain(
  engine: TerrainEngine,
  centerX: number,
  centerY: number,
  options?: Partial<CharacterBodyBounds>,
): boolean {
  const body = getBody(options);
  const left = Math.ceil(centerX - body.halfWidth + BODY_SIDE_INSET);
  const right = Math.floor(centerX + body.halfWidth - BODY_SIDE_INSET);
  const top = Math.ceil(centerY - body.height / 2 + BODY_TOP_INSET);
  const bottom = Math.floor(centerY + body.height / 2 - BODY_BOTTOM_CLEARANCE);

  if (
    left < 0 ||
    right >= engine.worldWidth ||
    top < 0 ||
    bottom >= engine.worldHeight
  ) {
    return true;
  }

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      if (isSolid(engine, x, y)) return true;
    }
  }

  return false;
}

export function hasCharacterGroundSupport(
  engine: TerrainEngine,
  centerX: number,
  centerY: number,
  options?: Partial<CharacterBodyBounds>,
): boolean {
  const body = getBody(options);
  const feetY = Math.floor(centerY + body.height / 2);

  for (const x of getSupportXs(centerX, body.halfWidth)) {
    for (let y = feetY; y <= feetY + SUPPORT_DEPTH; y++) {
      if (isSolid(engine, x, y)) return true;
    }
  }

  return false;
}

function isTerrainSurface(engine: TerrainEngine, x: number, y: number): boolean {
  return isSolid(engine, x, y) && !isSolid(engine, x, y - 1);
}

function collectSurfaceCandidates(
  engine: TerrainEngine,
  centerX: number,
  startY: number,
  options: Required<CharacterPlacementOptions>,
): number[] {
  const body = getBody(options);
  const fromY = Math.max(1, Math.floor(startY - options.searchUp));
  const toY = Math.min(
    engine.worldHeight - 1,
    Math.floor(startY + options.searchDown),
  );
  const candidates: number[] = [];
  const seen = new Set<number>();

  for (const supportX of getSupportXs(centerX, body.halfWidth)) {
    for (let y = fromY; y <= toY; y++) {
      if (!isTerrainSurface(engine, supportX, y)) continue;
      if (seen.has(y)) continue;
      seen.add(y);
      candidates.push(y);
    }
  }

  return candidates.sort((a, b) => Math.abs(a - startY) - Math.abs(b - startY));
}

function findSafeYAtX(
  engine: TerrainEngine,
  x: number,
  startY: number,
  options: Required<CharacterPlacementOptions>,
): number | null {
  const body = getBody(options);
  const floors = collectSurfaceCandidates(engine, x, startY, options);

  for (const floorY of floors) {
    const centerY = floorY - body.height / 2;
    if (characterBodyOverlapsTerrain(engine, x, centerY, body)) continue;
    if (!hasCharacterGroundSupport(engine, x, centerY, body)) continue;
    return centerY;
  }

  return null;
}

function findNearestClearPosition(
  engine: TerrainEngine,
  centerX: number,
  centerY: number,
  options: Required<CharacterPlacementOptions>,
): CharacterPlacement | null {
  const body = getBody(options);
  const minY = body.height / 2;
  const maxY = engine.worldHeight - body.height / 2;
  const xValues = getSearchXs(
    centerX,
    options.minX,
    options.maxX,
    options.searchRadiusX,
    options.stepX,
  );
  const yOffsets: number[] = [];

  for (let offset = 0; offset <= options.searchUp; offset += 4) {
    yOffsets.push(-offset);
  }
  for (let offset = 4; offset <= options.searchDown; offset += 4) {
    yOffsets.push(offset);
  }

  for (const yOffset of yOffsets) {
    const y = clamp(centerY + yOffset, minY, maxY);
    for (const x of xValues) {
      if (!characterBodyOverlapsTerrain(engine, x, y, body)) {
        return { x, y };
      }
    }
  }

  return null;
}

export function findSafeGroundedPosition(
  engine: TerrainEngine,
  desiredX: number,
  startY: number,
  options?: CharacterPlacementOptions,
): CharacterPlacement | null {
  const body = getBody(options);
  const resolvedOptions: Required<CharacterPlacementOptions> = {
    halfWidth: body.halfWidth,
    height: body.height,
    minX: options?.minX ?? body.halfWidth,
    maxX: options?.maxX ?? engine.worldWidth - body.halfWidth,
    searchUp: options?.searchUp ?? body.height * 2,
    searchDown: options?.searchDown ?? body.height * 3,
    searchRadiusX: options?.searchRadiusX ?? body.halfWidth * 4,
    stepX: options?.stepX ?? 8,
  };
  const minX = Math.max(body.halfWidth, resolvedOptions.minX);
  const maxX = Math.min(engine.worldWidth - body.halfWidth, resolvedOptions.maxX);

  for (const x of getSearchXs(
    desiredX,
    minX,
    maxX,
    resolvedOptions.searchRadiusX,
    resolvedOptions.stepX,
  )) {
    const y = findSafeYAtX(engine, x, startY, resolvedOptions);
    if (y !== null) return { x, y };
  }

  return null;
}

export function resolveCharacterTerrainOverlap(
  engine: TerrainEngine,
  centerX: number,
  centerY: number,
  options?: CharacterPlacementOptions,
): CharacterPlacement | null {
  const body = getBody(options);
  if (!characterBodyOverlapsTerrain(engine, centerX, centerY, body)) {
    return { x: centerX, y: centerY };
  }

  const resolvedOptions: Required<CharacterPlacementOptions> = {
    halfWidth: body.halfWidth,
    height: body.height,
    minX: options?.minX ?? body.halfWidth,
    maxX: options?.maxX ?? engine.worldWidth - body.halfWidth,
    searchUp: options?.searchUp ?? body.height * 3,
    searchDown: options?.searchDown ?? body.height * 3,
    searchRadiusX: options?.searchRadiusX ?? body.halfWidth * 4,
    stepX: options?.stepX ?? 8,
  };

  const grounded = findSafeGroundedPosition(
    engine,
    centerX,
    centerY + body.height / 2,
    resolvedOptions,
  );
  if (grounded) return grounded;

  return findNearestClearPosition(engine, centerX, centerY, resolvedOptions);
}
