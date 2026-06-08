export class DamageCalculator {
  calculate(
    impactX: number,
    impactY: number,
    targetX: number,
    targetY: number,
    baseDamage: number
  ): number {
    const dx = impactX - targetX;
    const dy = impactY - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let multiplier: number;

    if (distance <= 10) {
      multiplier = 1.0;
    } else if (distance <= 30) {
      multiplier = 0.75;
    } else if (distance <= 60) {
      multiplier = 0.5;
    } else if (distance <= 100) {
      multiplier = 0.25;
    } else {
      multiplier = 0;
    }

    return Math.round(baseDamage * multiplier);
  }
}
