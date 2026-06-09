export class DamageCalculator {
  calculate(
    impactX: number,
    impactY: number,
    targetX: number,
    targetY: number,
    baseDamage: number,
    excavationRadius = 60
  ): number {
    const dx = impactX - targetX;
    const dy = impactY - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (excavationRadius <= 0 || distance > excavationRadius) return 0;

    // Linear: 100% at distance 0, 50% at edge of blast radius
    const multiplier = 1.0 - 0.5 * (distance / excavationRadius);
    return Math.round(baseDamage * multiplier);
  }
}
