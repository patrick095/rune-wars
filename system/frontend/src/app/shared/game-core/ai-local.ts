import { WindState } from './wind-system';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'heroic';

interface ShotParams {
  angle: number;
  force: number;
}

const ERROR_MARGIN: Record<Difficulty, { angle: number; force: number }> = {
  easy:   { angle: 20, force: 20 },
  medium: { angle: 10, force: 10 },
  hard:   { angle: 5,  force: 5  },
  heroic: { angle: 1,  force: 2  },
};

function randomError(max: number): number {
  return (Math.random() * 2 - 1) * max;
}

export class AiLocal {
  calculateShot(
    aiPos: { x: number; y: number },
    playerPos: { x: number; y: number },
    wind: WindState,
    difficulty: Difficulty
  ): ShotParams {
    const dx = playerPos.x - aiPos.x;
    const dy = aiPos.y - playerPos.y; // positivo quando player está acima (y menor)

    // Ângulo base em radianos, convertido para graus
    const baseAngleRad = Math.atan2(dy, dx);
    let baseAngleDeg = (baseAngleRad * 180) / Math.PI;

    // Compensação parcial de vento: reduz o ângulo horizontal conforme vento contrário
    const windCompensation = wind.direction * wind.intensity * 0.05;
    baseAngleDeg -= windCompensation;

    // Força base proporcional à distância, limitada a 0-100
    const distance = Math.sqrt(dx * dx + dy * dy);
    let baseForce = Math.min(100, Math.max(10, distance / 10));

    // Aplicar erro conforme dificuldade
    const margin = ERROR_MARGIN[difficulty];
    const finalAngle = baseAngleDeg + randomError(margin.angle);
    const finalForce = Math.min(100, Math.max(0, baseForce + randomError(margin.force)));

    return {
      angle: finalAngle,
      force: Math.round(finalForce),
    };
  }
}
