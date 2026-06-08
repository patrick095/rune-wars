import { ProjectileConfig } from './projectile-config';
import { WindState } from './wind-system';

const GRAVITY = 500; // pixels/s²
const MAX_POINTS = 500;
const DT = 1 / 60;

export class ProjectilePhysics {
  simulate(
    startX: number,
    startY: number,
    config: ProjectileConfig,
    wind: WindState
  ): Array<{ x: number; y: number }> {
    const angleRad = (config.angle * Math.PI) / 180;
    const speed = config.force * 10; // escalar força para pixels/s

    let vx = Math.cos(angleRad) * speed;
    let vy = -Math.sin(angleRad) * speed; // negativo pois y cresce para baixo

    let x = startX;
    let y = startY;

    const path: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < MAX_POINTS; i++) {
      path.push({ x, y });

      // Aplicar vento em X
      const windForce = wind.direction * wind.intensity * config.windInfluence;
      vx += windForce * DT;

      // Aplicar gravidade em Y
      vy += GRAVITY * config.gravityScale * DT;

      x += vx * DT;
      y += vy * DT;

      if (y > 1000 || x < -500 || x > 5000) {
        break;
      }
    }

    return path;
  }
}
