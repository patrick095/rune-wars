import { TerrainEngine } from '../../app/shared/game-core/terrain-engine';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../../app/shared/game-core/terrain-types';
import {
  CHARACTER_BODY_HALF_WIDTH,
  CHARACTER_BODY_HEIGHT,
  findSafeGroundedPosition,
} from './character-placement';

export interface SpawnPoint {
  x?: number;
  y?: number;
  col?: number;
  row?: number;
}

export interface SpawnNormalizationContext {
  cols?: number;
  rows?: number;
  sourceWidth?: number;
  sourceHeight?: number;
}

export interface WorldSpawnPoint {
  x: number;
  y: number;
}

const SPAWN_SEARCH_UP = 260;
const SPAWN_SEARCH_DOWN = 460;
const SPAWN_SEARCH_RADIUS_X = 120;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeSpawn(
  spawn: SpawnPoint,
  context?: SpawnNormalizationContext,
): WorldSpawnPoint | null {
  if (isFiniteNumber(spawn.x) && isFiniteNumber(spawn.y)) {
    const sourceWidth = context?.sourceWidth;
    const sourceHeight = context?.sourceHeight;
    const shouldScaleFromSource =
      isFiniteNumber(sourceWidth) &&
      isFiniteNumber(sourceHeight) &&
      sourceWidth > 0 &&
      sourceHeight > 0 &&
      (sourceWidth !== WORLD_WIDTH || sourceHeight !== WORLD_HEIGHT);

    if (shouldScaleFromSource) {
      return {
        x: spawn.x * (WORLD_WIDTH / sourceWidth),
        y: spawn.y * (WORLD_HEIGHT / sourceHeight),
      };
    }

    return { x: spawn.x, y: spawn.y };
  }

  if (
    isFiniteNumber(spawn.col) &&
    isFiniteNumber(spawn.row) &&
    isFiniteNumber(context?.cols) &&
    isFiniteNumber(context?.rows) &&
    context.cols > 0 &&
    context.rows > 0
  ) {
    return {
      x: (spawn.col + 0.5) * (WORLD_WIDTH / context.cols),
      y: (spawn.row + 0.5) * (WORLD_HEIGHT / context.rows),
    };
  }

  return null;
}

export function normalizeSpawns(
  spawnPoints: SpawnPoint[],
  context?: SpawnNormalizationContext,
): WorldSpawnPoint[] {
  return spawnPoints
    .map((spawn) => normalizeSpawn(spawn, context))
    .filter((spawn): spawn is WorldSpawnPoint => spawn !== null);
}

/**
 * Filters spawn candidates to those where:
 * 1. Coordinates are normalized to the world pixel space.
 * 2. The full character body fits without overlapping terrain.
 * 3. There is reachable ground near the spawn.
 *
 * Returns up to `count` valid candidates in a random order.
 */
export function selectSpawns(
  spawnPoints: SpawnPoint[],
  count: number,
  engine?: TerrainEngine,
  context?: SpawnNormalizationContext,
): WorldSpawnPoint[] {
  let candidates = normalizeSpawns(spawnPoints, context);

  if (engine) {
    candidates = spawnPoints.reduce<WorldSpawnPoint[]>((valid, spawn) => {
      const normalized = normalizeSpawn(spawn, context);
      if (!normalized) {
        console.warn('[Spawn] ponto descartado: coordenadas invalidas', spawn);
        return valid;
      }

      const safe = findSafeGroundedPosition(
        engine,
        normalized.x,
        normalized.y,
        {
          halfWidth: CHARACTER_BODY_HALF_WIDTH,
          height: CHARACTER_BODY_HEIGHT,
          minX: 72,
          maxX: WORLD_WIDTH - 72,
          searchUp: SPAWN_SEARCH_UP,
          searchDown: SPAWN_SEARCH_DOWN,
          searchRadiusX: SPAWN_SEARCH_RADIUS_X,
        },
      );
      if (!safe) {
        console.warn(
          `[Spawn] (${Math.round(normalized.x)}, ${Math.round(normalized.y)}) descartado: sem area segura`,
        );
        return valid;
      }

      valid.push(normalized);
      return valid;
    }, []);
  }

  if (candidates.length === 0) return [];

  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Converts a spawn candidate to a world position with the character centre
 * snapped to the terrain surface directly below it.
 *
 * This guarantees the character spawns ON the ground, never inside it.
 */
export function spawnToWorld(
  spawn: WorldSpawnPoint,
  _cellSize: number,
  charHeight: number,
  engine?: TerrainEngine,
): { x: number; y: number } {
  if (engine) {
    const safe = findSafeGroundedPosition(engine, spawn.x, spawn.y, {
      halfWidth: CHARACTER_BODY_HALF_WIDTH,
      height: charHeight,
      minX: 72,
      maxX: WORLD_WIDTH - 72,
      searchUp: SPAWN_SEARCH_UP,
      searchDown: SPAWN_SEARCH_DOWN,
      searchRadiusX: SPAWN_SEARCH_RADIUS_X,
    });
    if (safe) return safe;
  }
  // Fallback: use the raw y with a half-height offset (original behaviour)
  return { x: spawn.x, y: spawn.y - charHeight / 2 };
}

export function moveSpeed(agility: number): number {
  return 40 + (420 - 40) * (agility / 500);
}

export function moveBudget(agility: number): number {
  return 120 + (2100 - 120) * (agility / 500);
}
