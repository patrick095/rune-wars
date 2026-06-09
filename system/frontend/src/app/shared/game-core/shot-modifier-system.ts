export type ShotModifierType = 'shot_plus1' | 'shot_x3' | 'shot_damage_2x' | 'shot_dig_2x';

export interface ShotConfig {
  angle: number;
  force: number;
  baseDamage?: number;
  excavationRadius?: number;
  delayMs?: number;
}

export class ShotModifierSystem {
  private active: ShotModifierType | null = null;

  activate(id: ShotModifierType): void {
    if (this.active === id) {
      // Same id — deselect
      this.active = null;
    } else {
      console.log(`[ShotMod] Aplicando ${id} ao tiro`);
      this.active = id;
    }
  }

  getActive(): ShotModifierType | null {
    return this.active;
  }

  isActive(id: ShotModifierType): boolean {
    return this.active === id;
  }

  consumeAll(): void {
    this.active = null;
  }

  resolve(
    angle: number,
    force: number,
    weapon: { baseDamage: number; excavationRadius: number }
  ): { shots: ShotConfig[]; delayedShots: ShotConfig[] } {
    switch (this.active) {
      case 'shot_x3':
        return {
          shots: [
            { angle: angle - 5, force },
            { angle, force },
            { angle: angle + 5, force },
          ],
          delayedShots: [],
        };

      case 'shot_plus1':
        return {
          shots: [{ angle, force }],
          delayedShots: [{ angle, force, delayMs: 700 }],
        };

      case 'shot_damage_2x':
        return {
          shots: [{ angle, force, baseDamage: weapon.baseDamage * 2 }],
          delayedShots: [],
        };

      case 'shot_dig_2x':
        return {
          shots: [{ angle, force, excavationRadius: weapon.excavationRadius * 2 }],
          delayedShots: [],
        };

      default:
        return {
          shots: [{ angle, force }],
          delayedShots: [],
        };
    }
  }
}
