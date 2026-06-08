import Phaser from 'phaser';

export class PlaygroundScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlaygroundScene' });
  }

  create() {
    this.scene.start('BattleScene', { isPlayground: true, mode: 'pvp' });
  }
}
