import Phaser from 'phaser';

export class ProjectileRenderer {
  constructor(private scene: Phaser.Scene) {}

  createProjectile(color: number): Phaser.GameObjects.Arc {
    return this.scene.add
      .arc(0, 0, 6, 0, 360, false, color)
      .setVisible(false)
      .setDepth(8);
  }

  animateAlongPath(
    projectile: Phaser.GameObjects.Arc,
    path: Array<{ x: number; y: number }>,
    onComplete: () => void
  ): void {
    if (path.length === 0) {
      onComplete();
      return;
    }

    projectile.setVisible(true);
    let index = 0;

    const event = this.scene.time.addEvent({
      delay: 16,
      repeat: path.length - 1,
      callback: () => {
        const point = path[index];
        projectile.setPosition(point.x, point.y);
        index++;

        if (index >= path.length) {
          event.remove();
          onComplete();
        }
      },
    });
  }

  destroyProjectile(projectile: Phaser.GameObjects.Arc): void {
    projectile.destroy();
  }
}
