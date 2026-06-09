import Phaser from 'phaser';

const MARGIN = 12;
const AVATAR_SIZE = 32;
const BAR_HEIGHT = 12;
const BAR_INNER_PADDING = 3;
const CORNER_RADIUS = 8;
const DEPTH = 15;

function hpColor(pct: number): number {
  if (pct > 0.5) return 0x44dd44;
  if (pct > 0.25) return 0xffdd44;
  return 0xff4444;
}

export class PlayerStatusBar {
  private scene!: Phaser.Scene;
  private side!: 'left' | 'right';

  private container!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Graphics;
  private avatar!: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  private nameText!: Phaser.GameObjects.Text;
  private hpBar!: Phaser.GameObjects.Graphics;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private hpValueText!: Phaser.GameObjects.Text;
  private staminaValueText!: Phaser.GameObjects.Text;

  private panelW = 0;
  private panelH = 0;
  private barW = 0;

  create(scene: Phaser.Scene, side: 'left' | 'right'): void {
    this.scene = scene;
    this.side = side;

    const { width, height } = scene.scale;

    this.panelW = Math.floor(width * 0.25);
    this.panelH = Math.floor(height * 0.07);
    this.barW = this.panelW - AVATAR_SIZE - MARGIN * 3;

    const x = side === 'left' ? MARGIN : width - MARGIN - this.panelW;
    const y = MARGIN;

    this.container = scene.add.container(x, y).setDepth(DEPTH).setScrollFactor(0);

    // Background
    this.bg = scene.add.graphics();
    this._drawBg();
    this.container.add(this.bg);

    // Avatar placeholder (Graphics circle)
    const avatarGfx = scene.add.graphics();
    avatarGfx.fillStyle(side === 'left' ? 0x4488ff : 0xff4444, 0.9);
    avatarGfx.fillRoundedRect(
      MARGIN,
      (this.panelH - AVATAR_SIZE) / 2,
      AVATAR_SIZE,
      AVATAR_SIZE,
      6
    );
    avatarGfx.lineStyle(2, 0xffffff, 0.6);
    avatarGfx.strokeRoundedRect(
      MARGIN,
      (this.panelH - AVATAR_SIZE) / 2,
      AVATAR_SIZE,
      AVATAR_SIZE,
      6
    );
    this.avatar = avatarGfx;
    this.container.add(this.avatar);

    const textX = MARGIN + AVATAR_SIZE + MARGIN;
    const nameY = 6;

    // Name
    this.nameText = scene.add.text(textX, nameY, '', {
      fontSize: '14px',
      fontStyle: 'bold',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setDepth(DEPTH).setScrollFactor(0);
    this.container.add(this.nameText);

    // HP bar graphics
    this.hpBar = scene.add.graphics();
    this.container.add(this.hpBar);

    // HP value text
    this.hpValueText = scene.add.text(0, 0, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setDepth(DEPTH).setScrollFactor(0);
    this.container.add(this.hpValueText);

    // Stamina bar graphics
    this.staminaBar = scene.add.graphics();
    this.container.add(this.staminaBar);

    // Stamina value text
    this.staminaValueText = scene.add.text(0, 0, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#aaddff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setDepth(DEPTH).setScrollFactor(0);
    this.container.add(this.staminaValueText);

    this.update(100, 100, 100, 100);
  }

  update(hp: number, maxHp: number, stamina: number, maxStamina: number): void {
    const hpPct = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
    const staminaPct = maxStamina > 0 ? Math.max(0, Math.min(1, stamina / maxStamina)) : 0;

    const textX = MARGIN + AVATAR_SIZE + MARGIN;
    const hpBarY = 24;
    const staminaBarY = hpBarY + BAR_HEIGHT + 6;

    // Draw HP bar
    this.hpBar.clear();

    // Background track
    this.hpBar.fillStyle(0x111122, 0.85);
    this.hpBar.fillRoundedRect(textX, hpBarY, this.barW, BAR_HEIGHT, 4);

    // Filled portion
    const hpFillW = Math.floor((this.barW - BAR_INNER_PADDING * 2) * hpPct);
    if (hpFillW > 0) {
      this.hpBar.fillStyle(hpColor(hpPct), 1);
      this.hpBar.fillRoundedRect(
        textX + BAR_INNER_PADDING,
        hpBarY + BAR_INNER_PADDING,
        hpFillW,
        BAR_HEIGHT - BAR_INNER_PADDING * 2,
        2
      );
    }

    // Border
    this.hpBar.lineStyle(1, 0x445544, 0.8);
    this.hpBar.strokeRoundedRect(textX, hpBarY, this.barW, BAR_HEIGHT, 4);

    // HP value text
    this.hpValueText.setText(`${hp}/${maxHp}`);
    this.hpValueText.setPosition(textX + this.barW + 4, hpBarY - 1);

    // Draw Stamina bar
    this.staminaBar.clear();

    this.staminaBar.fillStyle(0x111122, 0.85);
    this.staminaBar.fillRoundedRect(textX, staminaBarY, this.barW, BAR_HEIGHT, 4);

    const staminaFillW = Math.floor((this.barW - BAR_INNER_PADDING * 2) * staminaPct);
    if (staminaFillW > 0) {
      this.staminaBar.fillStyle(0x44aaff, 1);
      this.staminaBar.fillRoundedRect(
        textX + BAR_INNER_PADDING,
        staminaBarY + BAR_INNER_PADDING,
        staminaFillW,
        BAR_HEIGHT - BAR_INNER_PADDING * 2,
        2
      );
    }

    this.staminaBar.lineStyle(1, 0x224466, 0.8);
    this.staminaBar.strokeRoundedRect(textX, staminaBarY, this.barW, BAR_HEIGHT, 4);

    // Stamina value text
    this.staminaValueText.setText(`${stamina}/${maxStamina}`);
    this.staminaValueText.setPosition(textX + this.barW + 4, staminaBarY - 1);
  }

  setName(name: string): void {
    if (this.nameText) {
      this.nameText.setText(name);
    }
  }

  setRaceIcon(textureKey: string): void {
    if (!this.scene || !this.container) return;

    // Remove current avatar
    if (this.avatar) {
      this.container.remove(this.avatar, true);
    }

    const avatarY = (this.panelH - AVATAR_SIZE) / 2;

    if (this.scene.textures.exists(textureKey)) {
      const img = this.scene.add.image(
        MARGIN + AVATAR_SIZE / 2,
        avatarY + AVATAR_SIZE / 2,
        textureKey
      ).setDisplaySize(AVATAR_SIZE, AVATAR_SIZE).setDepth(DEPTH).setScrollFactor(0);
      this.avatar = img;
    } else {
      // Fallback placeholder
      const gfx = this.scene.add.graphics();
      const borderColor = this.side === 'left' ? 0x4488ff : 0xff4444;
      gfx.fillStyle(borderColor, 0.9);
      gfx.fillRoundedRect(MARGIN, avatarY, AVATAR_SIZE, AVATAR_SIZE, 6);
      gfx.lineStyle(2, 0xffffff, 0.6);
      gfx.strokeRoundedRect(MARGIN, avatarY, AVATAR_SIZE, AVATAR_SIZE, 6);
      this.avatar = gfx;
    }

    this.container.addAt(this.avatar, 1);
  }

  setVisible(visible: boolean): void {
    if (this.container) {
      this.container.setVisible(visible);
    }
  }

  destroy(): void {
    if (this.container) {
      this.container.destroy(true);
    }
  }

  private _drawBg(): void {
    this.bg.clear();
    this.bg.fillStyle(0x000000, 0.55);
    this.bg.fillRoundedRect(0, 0, this.panelW, this.panelH, CORNER_RADIUS);
    this.bg.lineStyle(1, 0xffffff, 0.15);
    this.bg.strokeRoundedRect(0, 0, this.panelW, this.panelH, CORNER_RADIUS);
  }
}
