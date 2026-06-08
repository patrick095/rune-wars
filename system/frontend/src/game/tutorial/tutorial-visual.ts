import Phaser from 'phaser';

const STORAGE_KEY = 'academy_tutorial_seen';

export class TutorialVisual {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(): void {
    this.hide();

    const { width, height } = this.scene.scale;
    const cx = width / 2;
    const cy = height / 2;

    const children: Phaser.GameObjects.GameObject[] = [];

    // Dark semi-transparent background
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    children.push(bg);

    // Panel
    const panelW = 440;
    const panelH = 320;
    const panel = this.scene.add.rectangle(0, 0, panelW, panelH, 0x1a1a2e);
    children.push(panel);

    const panelBorder = this.scene.add.rectangle(0, 0, panelW, panelH, 0x4488ff, 0)
      .setStrokeStyle(2, 0x4488ff);
    children.push(panelBorder);

    // Title
    const title = this.scene.add.text(0, -panelH / 2 + 24, 'Academia — Como jogar', {
      fontSize: '18px',
      color: '#4488ff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    children.push(title);

    // Tips list
    const tips = [
      { icon: '◄ ►', label: 'Ajuste o ângulo com os botões Ang- / Ang+' },
      { icon: '■',   label: 'Segure ATIRAR para acumular força' },
      { icon: '~',   label: 'Vento afeta a trajetória do projétil' },
      { icon: '●',   label: 'Pontos amarelos mostram a trajetória prevista' },
    ];

    const startY = -panelH / 2 + 72;
    tips.forEach((tip, i) => {
      const y = startY + i * 46;

      const iconText = this.scene.add.text(-panelW / 2 + 20, y, tip.icon, {
        fontSize: '20px',
        color: '#ffdd44',
        fontFamily: 'monospace',
      }).setOrigin(0, 0.5);
      children.push(iconText);

      const labelText = this.scene.add.text(-panelW / 2 + 60, y, tip.label, {
        fontSize: '13px',
        color: '#cccccc',
        fontFamily: 'monospace',
      }).setOrigin(0, 0.5);
      children.push(labelText);
    });

    // "Entendi!" button
    const btnY = panelH / 2 - 32;
    const btn = this.scene.add.rectangle(0, btnY, 140, 36, 0x4488ff).setInteractive();
    children.push(btn);

    const btnText = this.scene.add.text(0, btnY, 'Entendi!', {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    children.push(btnText);

    btn.on('pointerover', () => btn.setFillStyle(0x6699ff));
    btn.on('pointerout', () => btn.setFillStyle(0x4488ff));
    btn.on('pointerdown', () => {
      TutorialVisual.markAsSeen();
      this.hide();
    });

    // Group everything in a container so we can manage it easily
    this.container = this.scene.add.container(cx, cy, children).setDepth(50);
  }

  hide(): void {
    if (this.container) {
      this.container.destroy(true);
      this.container = null;
    }
  }

  static hasBeenSeen(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  static markAsSeen(): void {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  }
}
