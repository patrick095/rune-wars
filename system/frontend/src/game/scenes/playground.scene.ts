import Phaser from 'phaser';

export class PlaygroundScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlaygroundScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Jogador (azul)
    this.add.rectangle(width * 0.35, height * 0.6, 40, 60, 0x4488ff);
    this.add.text(width * 0.35, height * 0.6 + 40, 'Jogador', {
      fontSize: '12px', color: '#ffffff'
    }).setOrigin(0.5);

    // Inimigo (vermelho)
    this.add.rectangle(width * 0.65, height * 0.6, 40, 60, 0xff4444);
    this.add.text(width * 0.65, height * 0.6 + 40, 'Inimigo', {
      fontSize: '12px', color: '#ffffff'
    }).setOrigin(0.5);

    // Solo
    this.add.rectangle(width / 2, height * 0.75, width, 20, 0x336633);

    // Botão Reiniciar
    const btnX = width - 80;
    const btnY = height - 40;
    const btn = this.add.rectangle(btnX, btnY, 120, 36, 0x555555).setInteractive();
    this.add.text(btnX, btnY, 'Reiniciar', {
      fontSize: '14px', color: '#ffffff'
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x777777));
    btn.on('pointerout', () => btn.setFillStyle(0x555555));
    btn.on('pointerdown', () => this.scene.restart());
  }
}
