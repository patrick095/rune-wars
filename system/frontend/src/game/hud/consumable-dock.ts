import Phaser from 'phaser';

const HOTKEYS = ['Q', 'W', 'E', 'R', 'T'] as const;
const SLOT_COUNT = 5;
const SLOT_GAP = 8;
const PANEL_PADDING_X = 12;
const PANEL_PADDING_Y = 10;
const BASE_DEPTH = 30;

export interface ConsumableItem {
  iconKey: string;
  quantity?: number;
}

interface SlotObjects {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  icon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
  hotkeyLabel: Phaser.GameObjects.Text;
  quantityLabel: Phaser.GameObjects.Text;
  item: ConsumableItem | null;
}

/**
 * ConsumableDock — Phaser-native HUD dock for consumable items.
 * Renders 5 slots with hotkeys Q/W/E/R/T at the bottom-left of the canvas.
 * Each slot uses a Container with Graphics (bg), Image/Text (icon),
 * Text (hotkey label), and Text (quantity).
 */
export class ConsumableDock {
  private scene!: Phaser.Scene;
  private parentContainer!: Phaser.GameObjects.Container;
  private slots: SlotObjects[] = [];

  // ────────────────────────────────────────────────────────────
  // Public API
  // ────────────────────────────────────────────────────────────

  create(scene: Phaser.Scene): void {
    this.scene = scene;
    this.slots = [];

    const { width: W, height: H } = scene.scale;
    const iconSize = Math.min(W * 0.045, 60);
    const slotSize = iconSize + 12;
    const labelHeight = 16;
    const totalSlotH = slotSize + labelHeight + 4;

    const totalW =
      PANEL_PADDING_X * 2 + SLOT_COUNT * slotSize + (SLOT_COUNT - 1) * SLOT_GAP;
    const totalH = PANEL_PADDING_Y * 2 + totalSlotH;

    // Position: bottom-left, with margin
    const dockX = 8 + totalW / 2;
    const dockY = H - 8 - totalH / 2;

    this.parentContainer = scene.add
      .container(dockX, dockY)
      .setDepth(BASE_DEPTH)
      .setScrollFactor(0);

    // Panel background
    const panelBg = scene.add.graphics();
    panelBg.fillStyle(0x0a0e1a, 0.82);
    panelBg.fillRoundedRect(-totalW / 2, -totalH / 2, totalW, totalH, 10);
    panelBg.lineStyle(1, 0x2a3a55, 0.9);
    panelBg.strokeRoundedRect(-totalW / 2, -totalH / 2, totalW, totalH, 10);
    this.parentContainer.add(panelBg);

    // Build each slot
    const firstSlotX =
      -totalW / 2 + PANEL_PADDING_X + slotSize / 2;

    for (let i = 0; i < SLOT_COUNT; i++) {
      const slotX = firstSlotX + i * (slotSize + SLOT_GAP);
      const slotY = -labelHeight / 2; // centered vertically with label below

      const slotContainer = scene.add
        .container(slotX, slotY)
        .setDepth(BASE_DEPTH + 1);

      // Slot background (Graphics with rounded rect)
      const bg = scene.add.graphics();
      this.drawSlotBg(bg, slotSize, false);

      // Icon placeholder (gray "—" text)
      const iconPlaceholder = scene.add
        .text(0, 0, '—', {
          fontSize: `${Math.round(iconSize * 0.45)}px`,
          color: '#556677',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      // Hotkey label below slot
      const hotkeyLabel = scene.add
        .text(0, slotSize / 2 + 3, HOTKEYS[i], {
          fontSize: '11px',
          color: '#ffcc00',
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0.5, 0);

      // Quantity badge (top-right corner, hidden by default)
      const quantityLabel = scene.add
        .text(slotSize / 2 - 2, -slotSize / 2 + 1, '', {
          fontSize: '10px',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          backgroundColor: '#cc4400',
          padding: { x: 2, y: 1 },
        })
        .setOrigin(1, 0)
        .setVisible(false);

      slotContainer.add([bg, iconPlaceholder, hotkeyLabel, quantityLabel]);
      this.parentContainer.add(slotContainer);

      this.slots.push({
        container: slotContainer,
        bg,
        icon: iconPlaceholder,
        hotkeyLabel,
        quantityLabel,
        item: null,
      });
    }

    // Listen for consumable:use events
    scene.events.on(
      'consumable:use',
      (index: number) => {
        this.activateSlot(index);
      },
      this
    );

    // Keyboard hotkeys Q/W/E/R/T
    const keyCodes = [
      Phaser.Input.Keyboard.KeyCodes.Q,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.E,
      Phaser.Input.Keyboard.KeyCodes.R,
      Phaser.Input.Keyboard.KeyCodes.T,
    ];

    if (scene.input.keyboard) {
      keyCodes.forEach((code, idx) => {
        scene.input.keyboard!.on(`keydown-${HOTKEYS[idx]}`, () => {
          scene.events.emit('consumable:use', idx);
        });
      });
    }
  }

  setSlot(
    index: number,
    item: ConsumableItem | null
  ): void {
    if (index < 0 || index >= SLOT_COUNT) return;
    const slot = this.slots[index];
    if (!slot) return;

    slot.item = item;

    const { width: W } = this.scene.scale;
    const iconSize = Math.min(W * 0.045, 60);

    // Remove old icon
    slot.icon.destroy();

    if (item) {
      // Show icon image
      const img = this.scene.add
        .image(0, 0, item.iconKey)
        .setDisplaySize(iconSize, iconSize)
        .setOrigin(0.5);
      slot.container.addAt(img, 1);
      slot.icon = img;

      // Quantity
      if (item.quantity !== undefined && item.quantity > 0) {
        slot.quantityLabel.setText(String(item.quantity)).setVisible(true);
      } else {
        slot.quantityLabel.setVisible(false);
      }
    } else {
      // Show placeholder
      const placeholder = this.scene.add
        .text(0, 0, '—', {
          fontSize: `${Math.round(iconSize * 0.45)}px`,
          color: '#556677',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);
      slot.container.addAt(placeholder, 1);
      slot.icon = placeholder;
      slot.quantityLabel.setVisible(false);
    }
  }

  activateSlot(index: number): void {
    if (index < 0 || index >= SLOT_COUNT) return;
    const slot = this.slots[index];
    if (!slot) return;

    const { container } = slot;

    // Flash alpha tween
    this.scene.tweens.add({
      targets: container,
      alpha: { from: 0.3, to: 1 },
      duration: 180,
      ease: 'Linear',
    });

    // Scale pulse tween
    this.scene.tweens.add({
      targets: container,
      scaleX: { from: 1.18, to: 1 },
      scaleY: { from: 1.18, to: 1 },
      duration: 220,
      ease: 'Back.easeOut',
    });

    // Highlight slot background briefly
    const { bg } = slot;
    const slotSize = this.getSlotSize();
    this.drawSlotBg(bg, slotSize, true);
    this.scene.time.delayedCall(260, () => {
      this.drawSlotBg(bg, slotSize, false);
    });
  }

  clearSlot(index: number): void {
    this.setSlot(index, null);
  }

  destroy(): void {
    this.scene?.events.off('consumable:use', undefined, this);
    this.parentContainer?.destroy();
  }

  // ────────────────────────────────────────────────────────────
  // Private helpers
  // ────────────────────────────────────────────────────────────

  private getSlotSize(): number {
    const { width: W } = this.scene.scale;
    const iconSize = Math.min(W * 0.045, 60);
    return iconSize + 12;
  }

  private drawSlotBg(
    g: Phaser.GameObjects.Graphics,
    slotSize: number,
    active: boolean
  ): void {
    g.clear();
    if (active) {
      g.fillStyle(0x3a5077, 0.95);
    } else {
      g.fillStyle(0x1a2a3a, 0.88);
    }
    g.fillRoundedRect(
      -slotSize / 2,
      -slotSize / 2,
      slotSize,
      slotSize,
      6
    );
    g.lineStyle(1, active ? 0xffcc00 : 0x2a3a55, active ? 1 : 0.7);
    g.strokeRoundedRect(
      -slotSize / 2,
      -slotSize / 2,
      slotSize,
      slotSize,
      6
    );
  }
}
