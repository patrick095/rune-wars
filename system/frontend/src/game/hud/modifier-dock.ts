import Phaser from 'phaser';

const SLOT_COUNT = 5;
const SLOT_SIZE = 44;
const SLOT_GAP = 6;
const PANEL_PADDING = 8;
const BASE_DEPTH = 25;
const HIGHLIGHT_COLOR = 0x9b59b6;
const SLOT_BG_COLOR = 0x2a3a55;
const SLOT_BG_HOVER = 0x3a2a55;
const PANEL_BG_COLOR = 0x1a2233;

export interface ModifierSlotItem {
  iconKey: string;
}

interface SlotObjects {
  bg: Phaser.GameObjects.Rectangle;
  border: Phaser.GameObjects.Graphics;
  icon: Phaser.GameObjects.Image | Phaser.GameObjects.Arc | null;
  label: Phaser.GameObjects.Text;
}

/**
 * ModifierDock — Horizontal dock of 5 modifier-use slots anchored to
 * the bottom-right of the canvas. Hotkeys 1–5 fire `modifier:use` events.
 * Active slots are highlighted with an arcane purple border + alpha tween.
 */
export class ModifierDock {
  private scene!: Phaser.Scene;
  private panelBg!: Phaser.GameObjects.Rectangle;
  private slots: (ModifierSlotItem | null)[] = new Array(SLOT_COUNT).fill(null);
  private slotObjects: (SlotObjects | null)[] = new Array(SLOT_COUNT).fill(null);
  private activeSlots: boolean[] = new Array(SLOT_COUNT).fill(false);
  private keyboardListeners: (() => void)[] = [];

  // ────────────────────────────────────────────────────────────
  // Public API
  // ────────────────────────────────────────────────────────────

  create(scene: Phaser.Scene): void {
    this.scene = scene;
    this.buildPanel();
    this.registerHotkeys();

    scene.events.on('modifier:use', (index: number) => {
      this.activateSlot(index);
    });

    scene.scale.on('resize', this.handleResize, this);
  }

  setSlot(index: number, item: ModifierSlotItem | null): void {
    if (index < 0 || index >= SLOT_COUNT) return;
    this.slots[index] = item;
    this.rebuildSlot(index);
  }

  activateSlot(index: number): void {
    if (index < 0 || index >= SLOT_COUNT) return;
    this.activeSlots[index] = true;
    this.applyHighlight(index);
  }

  clearSlot(index: number): void {
    if (index < 0 || index >= SLOT_COUNT) return;
    this.activeSlots[index] = false;
    this.slots[index] = null;
    this.rebuildSlot(index);
  }

  destroy(): void {
    for (const cleanup of this.keyboardListeners) cleanup();
    this.keyboardListeners = [];

    this.scene?.scale.off('resize', this.handleResize, this);

    for (let i = 0; i < SLOT_COUNT; i++) {
      this.destroySlotObjects(i);
    }
    this.panelBg?.destroy();
  }

  // ────────────────────────────────────────────────────────────
  // Private — layout helpers
  // ────────────────────────────────────────────────────────────

  private panelWidth(): number {
    return PANEL_PADDING * 2 + SLOT_COUNT * SLOT_SIZE + (SLOT_COUNT - 1) * SLOT_GAP;
  }

  private panelHeight(): number {
    return PANEL_PADDING * 2 + SLOT_SIZE;
  }

  /** Bottom-right anchor: bottom of panel sits at canvas bottom, right edge at canvas right */
  private anchorX(): number {
    const w = this.scene.scale.width;
    return w - PANEL_PADDING - this.panelWidth() / 2;
  }

  private anchorY(): number {
    const h = this.scene.scale.height;
    return h - PANEL_PADDING - this.panelHeight() / 2;
  }

  private slotCenterX(index: number): number {
    const panelLeft = this.anchorX() - this.panelWidth() / 2 + PANEL_PADDING;
    return panelLeft + SLOT_SIZE / 2 + index * (SLOT_SIZE + SLOT_GAP);
  }

  private slotCenterY(): number {
    return this.anchorY();
  }

  // ────────────────────────────────────────────────────────────
  // Private — build / rebuild
  // ────────────────────────────────────────────────────────────

  private buildPanel(): void {
    this.panelBg = this.scene.add
      .rectangle(
        this.anchorX(),
        this.anchorY(),
        this.panelWidth(),
        this.panelHeight(),
        PANEL_BG_COLOR,
        0.85
      )
      .setDepth(BASE_DEPTH)
      .setScrollFactor(0);

    for (let i = 0; i < SLOT_COUNT; i++) {
      this.buildSlotObjects(i);
    }
  }

  private buildSlotObjects(index: number): void {
    const sx = this.slotCenterX(index);
    const sy = this.slotCenterY();
    const item = this.slots[index];
    const active = this.activeSlots[index];

    // Background
    const bg = this.scene.add
      .rectangle(sx, sy, SLOT_SIZE, SLOT_SIZE, SLOT_BG_COLOR)
      .setDepth(BASE_DEPTH + 1)
      .setScrollFactor(0)
      .setInteractive();

    bg.on('pointerover', () => bg.setFillStyle(SLOT_BG_HOVER));
    bg.on('pointerout', () => bg.setFillStyle(SLOT_BG_COLOR));
    bg.on('pointerdown', () => {
      this.scene.events.emit('modifier:use', index);
    });

    // Border (Graphics — reused for highlight toggling)
    const border = this.scene.add.graphics().setDepth(BASE_DEPTH + 2).setScrollFactor(0);
    this.drawBorder(border, sx, sy, active);

    // Icon
    let icon: Phaser.GameObjects.Image | Phaser.GameObjects.Arc | null = null;
    if (item) {
      icon = this.scene.add
        .image(sx, sy, item.iconKey)
        .setDisplaySize(SLOT_SIZE - 4, SLOT_SIZE - 4)
        .setDepth(BASE_DEPTH + 3)
        .setScrollFactor(0);
    }

    // Hotkey label — bottom-left corner of the slot
    const labelX = sx - SLOT_SIZE / 2 + 4;
    const labelY = sy + SLOT_SIZE / 2 - 4;
    const label = this.scene.add
      .text(labelX, labelY, String(index + 1), {
        fontSize: '10px',
        color: active ? '#c39bd3' : '#778899',
        fontFamily: 'monospace',
      })
      .setOrigin(0, 1)
      .setDepth(BASE_DEPTH + 4)
      .setScrollFactor(0);

    this.slotObjects[index] = { bg, border, icon, label };
  }

  private destroySlotObjects(index: number): void {
    const obj = this.slotObjects[index];
    if (!obj) return;
    obj.bg.destroy();
    obj.border.destroy();
    obj.icon?.destroy();
    obj.label.destroy();
    this.slotObjects[index] = null;
  }

  private rebuildSlot(index: number): void {
    this.destroySlotObjects(index);
    this.buildSlotObjects(index);
  }

  private drawBorder(
    border: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    active: boolean
  ): void {
    border.clear();
    if (active) {
      border.lineStyle(2, HIGHLIGHT_COLOR, 1);
    } else {
      border.lineStyle(1, 0x445566, 0.8);
    }
    border.strokeRect(cx - SLOT_SIZE / 2, cy - SLOT_SIZE / 2, SLOT_SIZE, SLOT_SIZE);
  }

  private applyHighlight(index: number): void {
    const obj = this.slotObjects[index];
    if (!obj) return;

    const sx = this.slotCenterX(index);
    const sy = this.slotCenterY();
    this.drawBorder(obj.border, sx, sy, true);

    obj.label.setColor('#c39bd3');

    // Alpha tween on the border for arcane pulse effect
    this.scene.tweens.add({
      targets: obj.border,
      alpha: { from: 1, to: 0.4 },
      duration: 200,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        obj.border.setAlpha(1);
      },
    });
  }

  // ────────────────────────────────────────────────────────────
  // Private — hotkeys & resize
  // ────────────────────────────────────────────────────────────

  private registerHotkeys(): void {
    const keys = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'] as const;

    keys.forEach((keyName, index) => {
      const key = this.scene.input.keyboard?.addKey(
        Phaser.Input.Keyboard.KeyCodes[keyName]
      );
      if (!key) return;

      const onDown = () => {
        this.scene.events.emit('modifier:use', index);
      };

      key.on('down', onDown);
      this.keyboardListeners.push(() => key.off('down', onDown));
    });
  }

  private handleResize(): void {
    // Reposition panel background
    this.panelBg.setPosition(this.anchorX(), this.anchorY());

    // Reposition all slot objects
    for (let i = 0; i < SLOT_COUNT; i++) {
      const obj = this.slotObjects[i];
      if (!obj) continue;

      const sx = this.slotCenterX(i);
      const sy = this.slotCenterY();

      obj.bg.setPosition(sx, sy);
      this.drawBorder(obj.border, sx, sy, this.activeSlots[i]);
      obj.icon?.setPosition(sx, sy);
      obj.label.setPosition(sx - SLOT_SIZE / 2 + 4, sy + SLOT_SIZE / 2 - 4);
    }
  }
}
