import Phaser from 'phaser';

export class ResultOverlay {
  private container: Phaser.GameObjects.Container | null = null;

  show(scene: Phaser.Scene, victory: boolean): void {
    this.hide();

    const { width, height } = scene.scale;

    const bg = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    bg.setDepth(0).setScrollFactor(0);

    const titleText = victory ? 'VOCE VENCEU!' : 'VOCE PERDEU!';
    const titleColor = victory ? '#44ff88' : '#ff4444';

    const title = scene.add.text(0, -60, titleText, {
      fontSize: '40px',
      color: titleColor,
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setScrollFactor(0);

    const btnBg = scene.add.rectangle(0, 40, 200, 50, 0x336633).setInteractive().setScrollFactor(0);
    const btnText = scene.add.text(0, 40, 'Jogar Novamente', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x44aa44));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x336633));
    btnBg.on('pointerdown', () => {
      this.hide();
      scene.scene.restart();
    });

    this.container = scene.add.container(width / 2, height / 2, [bg, title, btnBg, btnText]);
    this.container.setDepth(32).setScrollFactor(0);

    // Reposition bg since container offsets it
    bg.setPosition(-width / 2, -height / 2);
  }

  hide(): void {
    if (this.container) {
      this.container.destroy(true);
      this.container = null;
    }
  }
}
