import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Sem assets externos — sprites gerados via graphics
  }

  create() {
    const playerRace = (window as unknown as Record<string, unknown>)['rwPlayerRace'] as string | undefined ?? 'human'; // eslint-disable-line
    this.scene.start('BattleScene', { isPlayground: true, playerRace });
  }
}
