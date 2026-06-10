import { ProjectileConfig } from './projectile-config';
import { WindState } from './wind-system';
import { ProjectilePhysicsProfile } from './weapon-definition';
import { WORLD_WIDTH, WORLD_HEIGHT } from './terrain-types';

const GRAVITY = 500; // pixels/s²
const MAX_POINTS = 1200;
const DT = 1 / 60;
const BOOMERANG_REVERSAL_TIME = 800; // ms

export interface ProjectileSimulateOptions {
  /** When provided, projectile bounces off terrain instead of stopping */
  terrainAt?: (x: number, y: number) => boolean;
  /** Override maximum path points (default 1200) */
  maxPoints?: number;
}

export class ProjectilePhysics {
  simulate(
    startX: number,
    startY: number,
    config: ProjectileConfig,
    wind: WindState,
    physicsProfile?: ProjectilePhysicsProfile,
    options?: ProjectileSimulateOptions
  ): Array<{ x: number; y: number; time: number }> {
    const angleRad = (config.angle * Math.PI) / 180;
    const speed = config.force * 10;

    const gravityScale = physicsProfile ? physicsProfile.gravityScale : config.gravityScale;
    const windInfluence = physicsProfile ? physicsProfile.windInfluence : config.windInfluence;
    const isBoomerang = physicsProfile?.boomerang === true;
    const terrainAt = options?.terrainAt;
    const limit = options?.maxPoints ?? MAX_POINTS;

    let vx = Math.cos(angleRad) * speed;
    let vy = -Math.sin(angleRad) * speed;

    let x = startX;
    let y = startY;
    let boomerangReversed = false;

    const path: Array<{ x: number; y: number; time: number }> = [];

    for (let i = 0; i < limit; i++) {
      const timeMs = i * DT * 1000;

      path.push({ x, y, time: timeMs });

      if (isBoomerang && !boomerangReversed && timeMs >= BOOMERANG_REVERSAL_TIME) {
        vx = -vx;
        boomerangReversed = true;
      }

      const windForce = wind.direction * wind.intensity * windInfluence;
      vx += windForce * DT;
      vy += GRAVITY * gravityScale * DT;

      const nextX = x + vx * DT;
      const nextY = y + vy * DT;

      if (terrainAt && terrainAt(nextX, nextY)) {
        const hitsFloor = terrainAt(x, nextY);
        const hitsWall = terrainAt(nextX, y);
        if (hitsFloor) {
          vy = -vy * 0.5;
        }
        if (hitsWall) {
          vx = -vx * 0.7;
        }
        if (!hitsFloor && !hitsWall) {
          // corner hit — reflect both axes
          vy = -vy * 0.45;
          vx = -vx * 0.55;
        }
        // friction on bounce
        vx *= 0.88;
        vy *= 0.88;
        // stay at current position this frame
      } else {
        x = nextX;
        y = nextY;
      }

      if (y > WORLD_HEIGHT + 200 || x < -500 || x > WORLD_WIDTH + 500) {
        break;
      }
    }

    return path;
  }
}
