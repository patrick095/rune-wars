import Phaser from 'phaser';
import { HUB_POIS, HubPointOfInterest } from '../hub/hub-poi';
import { HUB_CAMERA_CONFIG } from '../hub/hub-camera';

const DEPTH = {
  sky: 0,
  far: 1,
  ground: 2,
  paths: 3,
  poi: 5,
  player: 8,
  label: 12,
  fx: 14,
  foreground: 20,
};

export class HubScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private playerVisual!: Phaser.GameObjects.Container;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private playerSpeed = 170;
  private poiObjects = new Map<string, Phaser.GameObjects.Rectangle>();
  private poiVisuals = new Map<string, Phaser.GameObjects.Container>();

  constructor() {
    super({ key: 'HubScene' });
  }

  preload(): void {
    const iconAssets = [
      { key: 'icon_pvp',        path: '/assets/hub/icons/icon_pvp.svg' },
      { key: 'icon_dungeon',    path: '/assets/hub/icons/icon_dungeon.svg' },
      { key: 'icon_village',    path: '/assets/hub/icons/icon_village.svg' },
      { key: 'icon_market',     path: '/assets/hub/icons/icon_market.svg' },
      { key: 'icon_blacksmith', path: '/assets/hub/icons/icon_blacksmith.svg' },
      { key: 'icon_guild',      path: '/assets/hub/icons/icon_guild.svg' },
      { key: 'icon_academy',    path: '/assets/hub/icons/icon_academy.svg' },
      { key: 'icon_character',  path: '/assets/hub/icons/icon_character.svg' },
    ];
    iconAssets.forEach(({ key, path }) => this.load.image(key, path));
  }

  create(): void {
    const { worldWidth, worldHeight } = HUB_CAMERA_CONFIG;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.createPaintedBackdrop(worldWidth, worldHeight);
    this.createStoneRoads();
    this.createEnvironmentDetails();
    HUB_POIS.forEach(poi => this.createPoi(poi));
    this.createCentralCrystal();
    this.createPlayer();
    this.createForegroundFrame(worldWidth, worldHeight);
    this.createAmbientParticles(worldWidth, worldHeight);
    this.setupCamera(worldWidth, worldHeight);
    this.setupInput();
    this.cameras.main.fadeIn(450, 6, 10, 28);
  }

  override update(_time: number, delta: number): void {
    const speed = this.playerSpeed * (delta / 1000);
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) this.player.x = Math.max(210, this.player.x - speed);
    if (right) this.player.x = Math.min(HUB_CAMERA_CONFIG.worldWidth - 210, this.player.x + speed);
    if (up) this.player.y = Math.max(315, this.player.y - speed);
    if (down) this.player.y = Math.min(HUB_CAMERA_CONFIG.worldHeight - 105, this.player.y + speed);

    this.playerVisual.setPosition(this.player.x, this.player.y);
    this.playerShadow.setPosition(this.player.x, this.player.y + 36);
  }

  private createPaintedBackdrop(worldWidth: number, worldHeight: number): void {
    const bg = this.add.graphics().setDepth(DEPTH.sky);

    bg.fillGradientStyle(0x7fc9ff, 0x7fc9ff, 0x2f7bb7, 0x234f86, 1);
    bg.fillRect(0, 0, worldWidth, worldHeight);

    this.drawCloud(bg, 240, 135, 1.1);
    this.drawCloud(bg, 1840, 115, 0.9);
    this.drawCloud(bg, 1350, 165, 0.75);

    bg.fillStyle(0x7bb16a, 0.9);
    bg.fillTriangle(410, 365, 720, 80, 1040, 365);
    bg.fillTriangle(1180, 365, 1460, 60, 1760, 365);
    bg.fillStyle(0x456f5e, 0.95);
    bg.fillTriangle(870, 395, 1120, 15, 1390, 395);
    bg.fillStyle(0xd7eef7, 0.75);
    bg.fillTriangle(1100, 120, 1160, 15, 1230, 125);

    this.add.rectangle(325, 355, 48, 250, 0xdff7ff, 0.55).setDepth(DEPTH.far);
    this.add.rectangle(365, 370, 28, 210, 0xb8e9ff, 0.45).setDepth(DEPTH.far);
    this.add.ellipse(345, 500, 190, 70, 0x76c6d7, 0.22).setDepth(DEPTH.far);

    bg.fillStyle(0x173b2a, 0.95);
    for (let x = 0; x <= worldWidth + 120; x += 105) {
      bg.fillCircle(x, 335 + Math.sin(x * 0.01) * 20, 90);
    }

    bg.fillGradientStyle(0x365f25, 0x456f2b, 0x1f491e, 0x193d18, 1);
    bg.fillRect(0, 330, worldWidth, worldHeight - 330);

    bg.fillStyle(0x244d1d, 0.55);
    bg.fillEllipse(1100, 845, 1900, 310);
  }

  private createStoneRoads(): void {
    const g = this.add.graphics().setDepth(DEPTH.paths);
    g.lineStyle(58, 0xb7ad8a, 1);
    g.beginPath();
    g.moveTo(1050, 700);
    g.lineTo(760, 530);
    g.moveTo(1050, 700);
    g.lineTo(1110, 330);
    g.moveTo(1050, 700);
    g.lineTo(1390, 570);
    g.moveTo(1390, 570);
    g.lineTo(1810, 390);
    g.moveTo(1390, 570);
    g.lineTo(1875, 700);
    g.moveTo(760, 530);
    g.lineTo(255, 530);
    g.strokePath();

    g.lineStyle(36, 0xd5c89f, 1);
    g.beginPath();
    g.moveTo(1050, 700);
    g.lineTo(760, 530);
    g.moveTo(1050, 700);
    g.lineTo(1110, 330);
    g.moveTo(1050, 700);
    g.lineTo(1390, 570);
    g.moveTo(1390, 570);
    g.lineTo(1810, 390);
    g.moveTo(1390, 570);
    g.lineTo(1875, 700);
    g.moveTo(760, 530);
    g.lineTo(255, 530);
    g.strokePath();

    for (let i = 0; i < 160; i++) {
      const x = Phaser.Math.Between(180, 2020);
      const y = Phaser.Math.Between(380, 795);
      if (Math.abs(y - 700) > 170 && Math.random() > 0.35) continue;
      g.fillStyle(Phaser.Math.RND.pick([0x978e72, 0xc8bb94, 0x7f785f]), 0.95);
      g.fillEllipse(x, y, Phaser.Math.Between(10, 26), Phaser.Math.Between(5, 12));
    }
  }

  private createEnvironmentDetails(): void {
    const g = this.add.graphics().setDepth(DEPTH.ground);
    for (let i = 0; i < 70; i++) {
      const x = Phaser.Math.Between(70, HUB_CAMERA_CONFIG.worldWidth - 70);
      const y = Phaser.Math.Between(380, HUB_CAMERA_CONFIG.worldHeight - 60);
      g.fillStyle(Phaser.Math.RND.pick([0x5aa33d, 0x6fb64f, 0x2f6f2f, 0xf0c44b]), 0.8);
      g.fillCircle(x, y, Phaser.Math.Between(2, 6));
    }

    this.createBanner(590, 425, 0x7b2fbe);
    this.createBanner(1210, 470, 0x214fbd);
    this.createBanner(1690, 390, 0xc93337);
    this.createBanner(1920, 410, 0x285fc0);
  }

  private createPoi(poi: HubPointOfInterest): void {
    const visual = this.add.container(poi.x, poi.y).setDepth(DEPTH.poi);
    const shadow = this.add.ellipse(0, poi.height * 0.35, poi.width * 0.72, 32, 0x000000, 0.28);
    visual.add(shadow);

    switch (poi.id) {
      case 'academy': this.drawAcademy(visual); break;
      case 'blacksmith': this.drawBlacksmith(visual); break;
      case 'dungeon': this.drawDungeon(visual); break;
      case 'pvp': this.drawArena(visual); break;
      case 'guild': this.drawGuild(visual); break;
      case 'market': this.drawMarket(visual); break;
      case 'village': this.drawVillagePlaza(visual); break;
    }

    const hitArea = this.add.rectangle(poi.x, poi.y, poi.width, poi.height, poi.accentColor, 0)
      .setDepth(DEPTH.fx)
      .setInteractive({ useHandCursor: true });

    const label = poi.id === 'village' ? null : this.createPoiPlaque(poi);
    this.poiObjects.set(poi.id, hitArea);
    this.poiVisuals.set(poi.id, visual);

    hitArea.on('pointerover', () => {
      this.tweens.add({ targets: visual, scaleX: 1.035, scaleY: 1.035, duration: 150, ease: 'Sine.Out' });
      label?.setScale(1.04);
      this.createHoverRing(poi);
      this.game.events.emit('poiHover', poi);
    });

    hitArea.on('pointerout', () => {
      this.tweens.add({ targets: visual, scaleX: 1, scaleY: 1, duration: 130, ease: 'Sine.Out' });
      label?.setScale(1);
      this.game.events.emit('poiHoverEnd');
    });

    hitArea.on('pointerdown', () => {
      this.tweens.add({ targets: visual, scaleX: 0.98, scaleY: 0.98, duration: 80, yoyo: true, ease: 'Sine.InOut' });
      this.cameras.main.fadeOut(HUB_CAMERA_CONFIG.transitionFadeDuration, 7, 4, 22, () => {
        this.game.events.emit('navigateTo', poi.route);
      });
    });
  }

  private drawAcademy(container: Phaser.GameObjects.Container): void {
    const g = this.add.graphics();
    g.fillStyle(0x6a5133, 1).fillRoundedRect(-128, -35, 256, 118, 12);
    g.fillStyle(0xd2bc83, 1).fillRoundedRect(-112, -24, 224, 90, 10);
    for (const x of [-70, 35]) {
      g.lineStyle(8, 0x7b4b2c, 1).strokeCircle(x, 5, 38);
      g.lineStyle(4, 0xf5eee0, 1).strokeCircle(x, 5, 22);
      g.lineStyle(3, 0xc53b31, 1).strokeCircle(x, 5, 9);
    }
    g.fillStyle(0x6e43b4, 1).fillTriangle(96, -80, 126, -60, 96, -40);
    g.lineStyle(5, 0x3d2a1f, 1).lineBetween(94, -80, 94, 55);
    container.add(g);
  }

  private drawBlacksmith(container: Phaser.GameObjects.Container): void {
    const g = this.add.graphics();
    g.fillStyle(0x57412c, 1).fillRoundedRect(-130, -38, 260, 145, 10);
    g.fillStyle(0x1d5d84, 1).fillTriangle(-155, -38, 0, -140, 155, -38);
    g.fillStyle(0x2f86af, 1).fillTriangle(-130, -42, 0, -118, 130, -42);
    g.fillStyle(0x201915, 1).fillRect(-92, -126, 38, 88);
    g.fillStyle(0xff8d2a, 1).fillCircle(0, 52, 34);
    g.fillStyle(0xffc767, 0.9).fillCircle(0, 52, 18);
    g.fillStyle(0xf7cf6b, 1).fillRect(-85, 5, 34, 28).fillRect(54, -4, 38, 36);
    container.add(g);
  }

  private drawDungeon(container: Phaser.GameObjects.Container): void {
    const g = this.add.graphics();
    g.fillStyle(0x4b4a46, 1).fillRoundedRect(-160, -65, 320, 210, 20);
    g.fillStyle(0x67645d, 1).fillRoundedRect(-126, -118, 252, 245, 24);
    g.fillStyle(0x2a1f37, 1).fillRoundedRect(-72, -45, 144, 172, 70);
    g.fillStyle(0x7b2fbe, 0.95).fillRoundedRect(-48, -24, 96, 130, 46);
    g.fillStyle(0xb868ff, 0.65).fillCircle(0, 45, 58);
    g.fillStyle(0x927d66, 1).fillRect(-105, 120, 210, 18).fillRect(-80, 142, 160, 16);
    g.fillStyle(0x8d59d4, 1).fillTriangle(-128, 4, -103, -52, -82, 4).fillTriangle(126, 4, 103, -52, 82, 4);
    container.add(g);
  }

  private drawArena(container: Phaser.GameObjects.Container): void {
    const g = this.add.graphics();
    g.fillStyle(0x6d5b45, 1).fillEllipse(0, 28, 315, 150);
    g.fillStyle(0x9b8360, 1).fillEllipse(0, 10, 270, 125);
    g.fillStyle(0x4f3c2c, 1).fillEllipse(0, 4, 185, 75);
    g.fillStyle(0xff9f2e, 0.9).fillCircle(0, 0, 38);
    for (const x of [-128, -78, 78, 128]) {
      g.fillStyle(x < 0 ? 0xc3343b : 0x255fc7, 1).fillTriangle(x, -115, x + 38, -95, x, -75);
      g.lineStyle(5, 0x3a2a1c, 1).lineBetween(x - 2, -118, x - 2, 42);
    }
    container.add(g);
  }

  private drawGuild(container: Phaser.GameObjects.Container): void {
    const g = this.add.graphics();
    g.fillStyle(0x564139, 1).fillRoundedRect(-140, -45, 280, 165, 12);
    g.fillStyle(0x67398f, 1).fillTriangle(-165, -45, 0, -142, 165, -45);
    g.fillStyle(0x8a4fc0, 1).fillTriangle(-130, -50, 0, -118, 130, -50);
    g.fillStyle(0xf0bd3c, 1).fillRoundedRect(-42, -8, 84, 92, 10);
    g.fillStyle(0x4a2c6f, 1).fillRoundedRect(-30, 6, 60, 64, 8);
    g.fillStyle(0xf7d46a, 1).fillTriangle(0, 10, 25, 48, -25, 48);
    container.add(g);
  }

  private drawMarket(container: Phaser.GameObjects.Container): void {
    const g = this.add.graphics();
    g.fillStyle(0x5b3f2d, 1).fillRoundedRect(-140, -6, 280, 98, 10);
    for (let i = 0; i < 7; i++) {
      g.fillStyle(i % 2 === 0 ? 0x7046a6 : 0xd8c48b, 1);
      g.fillRect(-140 + i * 40, -76, 40, 72);
    }
    g.fillStyle(0x8e5ec5, 1).fillTriangle(-155, -76, 0, -132, 155, -76);
    for (const x of [-90, -35, 35, 90]) {
      g.fillStyle(Phaser.Math.RND.pick([0xd94037, 0xf0b43a, 0x5caf4f]), 1).fillCircle(x, 42, 14);
    }
    container.add(g);
  }

  private drawVillagePlaza(container: Phaser.GameObjects.Container): void {
    const g = this.add.graphics();
    g.fillStyle(0x8d856c, 1).fillEllipse(0, 36, 230, 112);
    g.fillStyle(0xbab08d, 1).fillEllipse(0, 24, 175, 82);
    g.fillStyle(0x2d5670, 1).fillRect(-14, -78, 28, 120);
    g.fillStyle(0x55c7ff, 0.95).fillTriangle(0, -160, -44, -78, 44, -78);
    g.fillStyle(0x8df0ff, 0.7).fillTriangle(0, -128, -24, -80, 24, -80);
    container.add(g);
  }

  private createPoiPlaque(poi: HubPointOfInterest): Phaser.GameObjects.Container {
    const y = poi.y - poi.height / 2 - 20;
    const plaque = this.add.container(poi.x, y).setDepth(DEPTH.label);
    const width = Math.max(170, poi.label.length * 15 + 64);
    const g = this.add.graphics();
    g.fillStyle(0x151515, 0.94).fillRoundedRect(-width / 2, -34, width, 52, 8);
    g.lineStyle(3, 0x9d7a3f, 1).strokeRoundedRect(-width / 2, -34, width, 52, 8);
    g.fillStyle(0x2c2218, 1).fillTriangle(-16, 18, 16, 18, 0, 36);
    g.lineStyle(2, 0x9d7a3f, 1).strokeTriangle(-16, 18, 16, 18, 0, 36);
    const text = this.add.text(0, -8, poi.label, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    const dot = this.add.circle(width / 2 - 6, -33, 10, 0xe83939, 1).setStrokeStyle(2, 0xffc2a0);
    plaque.add([g, text, dot]);
    return plaque;
  }

  private createCentralCrystal(): void {
    const crystal = this.poiVisuals.get('village');
    if (!crystal) return;
    this.tweens.add({
      targets: crystal,
      y: crystal.y - 5,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  private createPlayer(): void {
    this.player = this.add.rectangle(1030, 755, 42, 62, 0x4488ff, 0).setDepth(DEPTH.player);
    this.playerShadow = this.add.ellipse(1030, 792, 58, 16, 0x000000, 0.35).setDepth(DEPTH.player - 1);
    this.playerVisual = this.add.container(1030, 755).setDepth(DEPTH.player);
    const g = this.add.graphics();
    g.fillStyle(0x4a2b18, 1).fillCircle(0, -30, 20);
    g.fillStyle(0xf0c08c, 1).fillCircle(0, -22, 16);
    g.fillStyle(0x243a76, 1).fillRoundedRect(-15, -8, 30, 42, 8);
    g.fillStyle(0x7b2fbe, 1).fillTriangle(-20, -5, -38, 35, -8, 22);
    g.fillStyle(0xf4a226, 1).fillRect(16, -8, 6, 42);
    this.playerVisual.add(g);
    this.add.text(1030, 694, 'Ragnar', {
      fontSize: '20px',
      color: '#20c8ff',
      fontStyle: 'bold',
      stroke: '#001126',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(DEPTH.label);
    this.add.text(1030, 718, '<Rune Wars>', {
      fontSize: '14px',
      color: '#8cff5a',
      fontStyle: 'bold',
      stroke: '#001a00',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(DEPTH.label);
    this.tweens.add({ targets: this.playerVisual, y: 750, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  private setupCamera(worldWidth: number, worldHeight: number): void {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, worldWidth, worldHeight);
    cam.setZoom(window.innerWidth <= 768 ? HUB_CAMERA_CONFIG.mobileZoom : HUB_CAMERA_CONFIG.maxZoomDesktop);
    cam.centerOn(1100, 580);
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.input.keyboard!.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
    ]);
    this.cameras.main.startFollow(this.player, true, HUB_CAMERA_CONFIG.followLerp, HUB_CAMERA_CONFIG.followLerp);
  }

  private createHoverRing(poi: HubPointOfInterest): void {
    const ring = this.add.ellipse(poi.x, poi.y + poi.height * 0.33, poi.width * 0.75, 34, poi.accentColor, 0.18)
      .setDepth(DEPTH.fx);
    this.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 1.18,
      scaleY: 1.55,
      duration: 420,
      onComplete: () => ring.destroy(),
    });
  }

  private createForegroundFrame(worldWidth: number, worldHeight: number): void {
    const g = this.add.graphics().setDepth(DEPTH.foreground).setScrollFactor(0.2);
    g.fillStyle(0x0d2418, 0.86);
    g.fillEllipse(-80, worldHeight - 40, 520, 360);
    g.fillEllipse(worldWidth + 80, worldHeight - 40, 560, 390);
    g.fillEllipse(60, 140, 360, 250);
    for (let i = 0; i < 40; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x1e5b28, 0x2f7c36, 0x153d23]), 0.85);
      g.fillCircle(Phaser.Math.Between(-20, 260), Phaser.Math.Between(-30, 260), Phaser.Math.Between(16, 44));
      g.fillCircle(Phaser.Math.Between(worldWidth - 250, worldWidth + 30), Phaser.Math.Between(500, worldHeight + 40), Phaser.Math.Between(18, 50));
    }
  }

  private createAmbientParticles(worldWidth: number, worldHeight: number): void {
    for (let i = 0; i < 36; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(120, worldWidth - 120),
        Phaser.Math.Between(120, worldHeight - 100),
        Phaser.Math.Between(2, 4),
        Phaser.Math.RND.pick([0x59dfff, 0x9d6cff, 0xf4c15c, 0x80e35f]),
        0,
      ).setDepth(DEPTH.fx);
      this.tweens.add({
        targets: particle,
        alpha: { from: 0, to: 0.72 },
        y: particle.y - Phaser.Math.Between(18, 42),
        duration: Phaser.Math.Between(2200, 4800),
        delay: Phaser.Math.Between(0, 2600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }
  }

  private createBanner(x: number, y: number, color: number): void {
    const g = this.add.graphics().setDepth(DEPTH.poi - 1);
    g.lineStyle(5, 0x2b2017, 1).lineBetween(x, y - 70, x, y + 65);
    g.fillStyle(color, 1).fillTriangle(x + 2, y - 70, x + 58, y - 48, x + 2, y - 20);
    g.lineStyle(2, 0xf0d17a, 0.8).strokeTriangle(x + 2, y - 70, x + 58, y - 48, x + 2, y - 20);
  }

  private drawCloud(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number): void {
    g.fillStyle(0xffffff, 0.42);
    g.fillCircle(x, y, 32 * scale);
    g.fillCircle(x + 38 * scale, y - 8 * scale, 44 * scale);
    g.fillCircle(x + 84 * scale, y + 4 * scale, 34 * scale);
    g.fillRoundedRect(x - 12 * scale, y, 120 * scale, 28 * scale, 14 * scale);
  }
}
