import Phaser from 'phaser';

export type ProjectileObject = Phaser.GameObjects.Arc | Phaser.GameObjects.Image;

export class ProjectileRenderer {
  constructor(private scene: Phaser.Scene) {}

  createProjectile(color: number, textureKey?: string): ProjectileObject {
    if (textureKey && this.scene.textures.exists(textureKey)) {
      return this.scene.add
        .image(0, 0, textureKey)
        .setDisplaySize(28, 28)
        .setVisible(false)
        .setDepth(8);
    }

    return this.scene.add
      .arc(0, 0, 6, 0, 360, false, color)
      .setVisible(false)
      .setDepth(8);
  }

  animateAlongPath(
    projectile: ProjectileObject,
    path: Array<{ x: number; y: number }>,
    onComplete: (impactPoint: { x: number; y: number } | null) => void,
    checkImpact?: (x: number, y: number) => boolean
  ): void {
    if (path.length === 0) {
      onComplete(null);
      return;
    }

    projectile.setVisible(true);
    let index = 0;

    const event = this.scene.time.addEvent({
      delay: 8,
      repeat: path.length - 1,
      callback: () => {
        const point = path[index];
        projectile.setPosition(point.x, point.y);
        if (projectile instanceof Phaser.GameObjects.Image && index > 0) {
          const previous = path[index - 1];
          projectile.setRotation(Phaser.Math.Angle.Between(previous.x, previous.y, point.x, point.y));
        }
        index++;

        if (checkImpact && checkImpact(point.x, point.y)) {
          event.remove();
          onComplete(point);
          return;
        }

        if (index >= path.length) {
          event.remove();
          onComplete(point);
        }
      },
    });
  }

  destroyProjectile(projectile: ProjectileObject): void {
    projectile.destroy();
  }
}
