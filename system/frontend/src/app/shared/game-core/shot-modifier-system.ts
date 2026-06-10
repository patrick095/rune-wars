export type ShotModifierType = 'shot_plus1' | 'shot_x3' | 'shot_damage_2x' | 'shot_dig_2x';

// Fraction of total stamina budget consumed per modifier selection
export const MODIFIER_STAMINA_COST: Record<ShotModifierType, number> = {
  shot_plus1:     0.60,
  shot_x3:        0.60,
  shot_damage_2x: 0.40,
  shot_dig_2x:    0.40,
};

export interface ShotConfig {
  angle: number;
  force: number;
  baseDamage?: number;
  excavationRadius?: number;
  delayMs?: number;
}

export class ShotModifierSystem {
  private stack: ShotModifierType[] = [];

  add(type: ShotModifierType): void {
    this.stack.push(type);
  }

  getStack(): ShotModifierType[] {
    return [...this.stack];
  }

  countOf(type: ShotModifierType): number {
    return this.stack.filter(m => m === type).length;
  }

  consumeAll(): void {
    this.stack = [];
  }

  resolve(
    angle: number,
    force: number,
    weapon: { baseDamage: number; excavationRadius: number }
  ): { shots: ShotConfig[]; delayedShots: ShotConfig[] } {
    const shotPlus1Count = this.countOf('shot_plus1');
    const shotX3Count    = this.countOf('shot_x3');
    const damageCount    = this.countOf('shot_damage_2x');
    const excavCount     = this.countOf('shot_dig_2x');

    // Total projectile count
    // Each shot_plus1 adds 1 delayed copy; each shot_x3 adds 2 fan copies
    const totalShots = 1 + shotPlus1Count + 2 * shotX3Count;

    // Damage per shot: 150% / n when shot-count modifiers are active, else 100%
    const shotDamageMult = totalShots > 1 ? 1.5 / totalShots : 1.0;
    // Each +dano stacks +50%
    const damageMult = shotDamageMult * (1 + 0.5 * damageCount);

    // Each +escavação adds +100% of base radius (additive)
    const excavMult = 1 + excavCount;

    const baseDamage       = Math.round(weapon.baseDamage * damageMult);
    const excavationRadius = Math.round(weapon.excavationRadius * excavMult);

    // Immediate shots: base at angle 0 + a ±spread pair per shot_x3
    const immediateAngles: number[] = [angle];
    for (let i = 0; i < shotX3Count; i++) {
      const spread = 5 * (i + 1);
      immediateAngles.push(angle - spread, angle + spread);
    }

    const shots: ShotConfig[] = immediateAngles.map(a => ({
      angle: a,
      force,
      baseDamage,
      excavationRadius,
    }));

    // Delayed shots: one per shot_plus1, staggered 700 ms each
    const delayedShots: ShotConfig[] = [];
    for (let i = 0; i < shotPlus1Count; i++) {
      delayedShots.push({
        angle,
        force,
        baseDamage,
        excavationRadius,
        delayMs: 700 * (i + 1),
      });
    }

    return { shots, delayedShots };
  }
}
