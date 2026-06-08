import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Sem assets externos — sprites gerados via graphics
  }

  create() {
    this.scene.start('PlaygroundScene');
  }
}
