import { ProjectileConfig } from './projectile-config';
import { WindState } from './wind-system';
import { ProjectilePhysicsProfile } from './weapon-definition';

const GRAVITY = 500; // pixels/s²
const MAX_POINTS = 500;
const DT = 1 / 60;
const BOOMERANG_REVERSAL_TIME = 800; // ms

export class ProjectilePhysics {
  simulate(
    startX: number,
    startY: number,
    config: ProjectileConfig,
    wind: WindState,
    physicsProfile?: ProjectilePhysicsProfile
  ): Array<{ x: number; y: number; time: number }> {
    const angleRad = (config.angle * Math.PI) / 180;
    const speed = config.force * 10; // escalar força para pixels/s

    const gravityScale = physicsProfile ? physicsProfile.gravityScale : config.gravityScale;
    const windInfluence = physicsProfile ? physicsProfile.windInfluence : config.windInfluence;
    const isBoomerang = physicsProfile?.boomerang === true;

    let vx = Math.cos(angleRad) * speed;
    let vy = -Math.sin(angleRad) * speed; // negativo pois y cresce para baixo

    let x = startX;
    let y = startY;
    let boomerangReversed = false;

    const path: Array<{ x: number; y: number; time: number }> = [];

    for (let i = 0; i < MAX_POINTS; i++) {
      const timeMs = i * DT * 1000;

      path.push({ x, y, time: timeMs });

      // Boomerang: inverter velocityX após BOOMERANG_REVERSAL_TIME ms
      if (isBoomerang && !boomerangReversed && timeMs >= BOOMERANG_REVERSAL_TIME) {
        vx = -vx;
        boomerangReversed = true;
      }

      // Aplicar vento em X
      const windForce = wind.direction * wind.intensity * windInfluence;
      vx += windForce * DT;

      // Aplicar gravidade em Y
      vy += GRAVITY * gravityScale * DT;

      x += vx * DT;
      y += vy * DT;

      if (y > 1000 || x < -500 || x > 5000) {
        break;
      }
    }

    return path;
  }
}
