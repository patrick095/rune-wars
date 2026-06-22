import Phaser from 'phaser';
import { EnemyState } from '../../app/shared/game-core/dungeon-types';

export class EnemyRenderer {
  constructor(private readonly scene: Phaser.Scene) {}

  create(enemy: EnemyState): Phaser.GameObjects.Container {
    const frameKey = this.frameKey(enemy.type, 0);
    const color = enemy.type === 'BAT_SWARM'
      ? 0x7f5cff
      : enemy.type === 'GOLEM_MINOR'
        ? 0x9a8f7a
        : 0xd46a3a;
    const width = this.widthFor(enemy);
    const height = this.heightFor(enemy);
    const body = this.scene.textures.exists(frameKey)
      ? this.scene.add.image(0, 0, frameKey).setDisplaySize(width, height)
      : this.scene.add.rectangle(0, 0, width, height, color).setStrokeStyle(2, 0x161616);
    const label = this.scene.add.text(0, height / 2 + 12, this.labelFor(enemy), {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    const hp = this.scene.add.text(0, -height / 2 - 12, `${enemy.hp}/${enemy.maxHp}`, {
      fontSize: '10px',
      color: '#f7d774',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setName('hp');

    const container = this.scene.add.container(enemy.x ?? 0, enemy.y ?? 0, [body, label, hp]).setDepth(5);
    this.playAnimation(enemy, body);
    return container;
  }

  update(container: Phaser.GameObjects.Container, enemy: EnemyState): void {
    container.setVisible(enemy.alive);
    const hp = container.getByName('hp') as Phaser.GameObjects.Text | null;
    hp?.setText(`${enemy.hp}/${enemy.maxHp}`);
  }

  private labelFor(enemy: EnemyState): string {
    if (enemy.type === 'ACID_BAT') return 'Morcego Acido';
    if (enemy.type === 'GIANT_BAT_BOSS') return 'Morcego Gigante';
    if (enemy.type === 'BAT_SWARM') return 'Morcego';
    if (enemy.type === 'GOLEM_MINOR') return 'Golem';
    return 'Criatura';
  }

  private frameKey(type: string, frame: number): string {
    return `dungeon_enemy_${type}_${frame}`;
  }

  private widthFor(enemy: EnemyState): number {
    if (enemy.type === 'GIANT_BAT_BOSS') return 132;
    if (enemy.type === 'GOLEM_MINOR') return 58;
    return 54;
  }

  private heightFor(enemy: EnemyState): number {
    if (enemy.type === 'GIANT_BAT_BOSS') return 132;
    if (enemy.type === 'GOLEM_MINOR') return 72;
    return 54;
  }

  private playAnimation(enemy: EnemyState, body: Phaser.GameObjects.GameObject): void {
    if (!(body instanceof Phaser.GameObjects.Image)) return;
    const frames = [0, 1, 2, 3]
      .map(frame => this.frameKey(enemy.type, frame))
      .filter(key => this.scene.textures.exists(key));
    if (frames.length < 2) return;

    let index = 0;
    const timer = this.scene.time.addEvent({
      delay: enemy.ai === 'BOSS' ? 180 : 120,
      loop: true,
      callback: () => {
        index = (index + 1) % frames.length;
        body.setTexture(frames[index]);
      },
    });
    body.once('destroy', () => timer.remove(false));
  }
}
