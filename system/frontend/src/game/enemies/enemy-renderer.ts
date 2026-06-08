import Phaser from 'phaser';
import { EnemyState } from '../../app/shared/game-core/dungeon-types';

export class EnemyRenderer {
  constructor(private readonly scene: Phaser.Scene) {}

  create(enemy: EnemyState): Phaser.GameObjects.Container {
    const color = enemy.type === 'BAT_SWARM'
      ? 0x7f5cff
      : enemy.type === 'GOLEM_MINOR'
        ? 0x9a8f7a
        : 0xd46a3a;
    const width = enemy.type === 'GOLEM_MINOR' ? 58 : 34;
    const height = enemy.type === 'GOLEM_MINOR' ? 72 : 32;
    const body = this.scene.add.rectangle(0, 0, width, height, color).setStrokeStyle(2, 0x161616);
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

    return this.scene.add.container(enemy.x ?? 0, enemy.y ?? 0, [body, label, hp]).setDepth(5);
  }

  update(container: Phaser.GameObjects.Container, enemy: EnemyState): void {
    container.setVisible(enemy.alive);
    const hp = container.getByName('hp') as Phaser.GameObjects.Text | null;
    hp?.setText(`${enemy.hp}/${enemy.maxHp}`);
  }

  private labelFor(enemy: EnemyState): string {
    if (enemy.type === 'BAT_SWARM') return 'Morcego';
    if (enemy.type === 'GOLEM_MINOR') return 'Golem';
    return 'Criatura';
  }
}
