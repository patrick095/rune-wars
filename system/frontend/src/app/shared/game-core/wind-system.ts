export interface WindState {
  direction: number; // -1 a 1
  intensity: number; // 0-100
}

export class WindSystem {
  private current: WindState;

  constructor() {
    this.current = this.generate();
  }

  generate(): WindState {
    const direction = Math.random() * 2 - 1; // -1 a 1
    const intensity = Math.random() * 100;   // 0-100
    this.current = { direction, intensity };
    return { ...this.current };
  }

  getCurrent(): WindState {
    return { ...this.current };
  }

  apply(
    velocityX: number,
    windState: WindState,
    windInfluence: number,
    dt: number
  ): number {
    const windForce = windState.direction * windState.intensity * windInfluence;
    return velocityX + windForce * dt;
  }
}
