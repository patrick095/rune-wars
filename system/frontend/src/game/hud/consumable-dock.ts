import Phaser from "phaser";

const HOTKEYS = ["Q", "W", "E", "R", "T"] as const;
const SLOT_COUNT = 5;
const DEPTH = 35;

export interface ConsumableItem {
    iconKey: string;
    quantity?: number;
}

interface SlotObjects {
    root: Phaser.GameObjects.Container;
    frame: Phaser.GameObjects.Graphics;
    icon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
    hotkey: Phaser.GameObjects.Text;
    quantity: Phaser.GameObjects.Text;
}

export class ConsumableDock {
    private scene!: Phaser.Scene;
    private root!: Phaser.GameObjects.Container;
    private panel!: Phaser.GameObjects.Graphics;
    private slots: SlotObjects[] = [];
    private slotCenters: { x: number; y: number }[] = [];
    private slotSize = 80;

    create(scene: Phaser.Scene): void {
        this.scene = scene;
        this.root = scene.add
            .container(30, 0)
            .setDepth(DEPTH)
            .setScrollFactor(0);
        this.panel = scene.add.graphics();
        this.root.add(this.panel);
        this.buildSlots();
        this.layout();
        this.registerInput();
        scene.scale.on("resize", this.handleResize, this);
    }

    setSlot(index: number, item: ConsumableItem | null): void {
        if (index < 0 || index >= SLOT_COUNT) return;
        const slot = this.slots[index];
        if (!slot) return;
        const sz = this.slotSize;

        slot.icon.destroy();
        if (item && this.scene.textures.exists(item.iconKey)) {
            slot.icon = this.scene.add
                .image(0, -4, item.iconKey)
                .setDisplaySize(Math.round(sz * 0.72), Math.round(sz * 0.72))
                .setOrigin(0.5);
        } else {
            slot.icon = this.scene.add
                .text(0, -4, item ? "?" : "-", {
                    fontSize: `${Math.round(sz * 0.42)}px`,
                    color: item ? "#b0904a" : "#504030",
                    fontFamily: "monospace",
                    fontStyle: "bold",
                })
                .setOrigin(0.5);
        }
        slot.root.addAt(slot.icon, 1);

        if (item?.quantity) {
            slot.quantity.setText(`x${item.quantity}`).setVisible(true);
        } else {
            slot.quantity.setVisible(false);
        }
    }

    activateSlot(index: number): void {
        const slot = this.slots[index];
        if (!slot) return;
        this.drawSlot(slot.frame, true);
        this.scene.tweens.add({
            targets: slot.root,
            scaleX: { from: 1.14, to: 1 },
            scaleY: { from: 1.14, to: 1 },
            duration: 180,
            ease: "Back.easeOut",
            onComplete: () => this.drawSlot(slot.frame, false),
        });
    }

    clearSlot(index: number): void {
        this.setSlot(index, null);
    }

    destroy(): void {
        this.scene?.scale.off("resize", this.handleResize, this);
        this.scene?.input.off("pointerdown", this.onPointerDown, this);
        this.root?.destroy(true);
    }

    private buildSlots(): void {
        for (let i = 0; i < SLOT_COUNT; i++) {
            const slotRoot = this.scene.add.container(0, 0);
            const frame = this.scene.add.graphics();
            const icon = this.scene.add
                .text(0, -4, "-", {
                    fontSize: "36px",
                    color: "#504030",
                    fontFamily: "monospace",
                    fontStyle: "bold",
                })
                .setOrigin(0.5);
            const hotkey = this.scene.add
                .text(0, 0, HOTKEYS[i], {
                    fontSize: "16px",
                    color: "#f5d283",
                    fontFamily: "monospace",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 2,
                })
                .setOrigin(0, 1);
            const quantity = this.scene.add
                .text(0, 0, "", {
                    fontSize: "16px",
                    color: "#ffffff",
                    fontFamily: "monospace",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 3,
                })
                .setOrigin(1, 1)
                .setVisible(false);

            this.drawSlot(frame, false);
            slotRoot.add([frame, icon, hotkey, quantity]);
            this.root.add(slotRoot);
            this.slots.push({ root: slotRoot, frame, icon, hotkey, quantity });
        }
    }

    private layout(): void {
        const W = this.scene.scale.width;
        const H = this.scene.scale.height;

        this.slotSize = Math.round(Math.min(W * 0.045, H * 0.105));
        const gap = Math.round(W * 0.007);
        const bottomPanelH = Math.round(H * 0.135);
        const angleR = Math.round(Math.min(H * 0.085, W * 0.052));
        const xStart = angleR * 2 + 10;
        const cy = H - Math.round(bottomPanelH * 0.52);
        const sz = this.slotSize;

        const totalW = SLOT_COUNT * sz + (SLOT_COUNT - 1) * gap;
        const panelPad = Math.round(sz * 0.16);

        this.panel.clear();

        // Shadow
        this.panel.fillStyle(0x000000, 0.55);
        this.panel.fillRoundedRect(
            xStart - panelPad + 3,
            cy - sz / 2 - panelPad + 3,
            totalW + panelPad * 2,
            sz + panelPad * 2,
            8,
        );

        // Main bg
        this.panel.fillStyle(0x0e0b07, 0.88);
        this.panel.fillRoundedRect(
            xStart - panelPad,
            cy - sz / 2 - panelPad,
            totalW + panelPad * 2,
            sz + panelPad * 2,
            8,
        );

        // Subtle top highlight
        this.panel.fillStyle(0xfff0a0, 0.05);
        this.panel.fillRoundedRect(
            xStart - panelPad + 4,
            cy - sz / 2 - panelPad + 4,
            totalW + panelPad * 2 - 8,
            (sz + panelPad * 2) * 0.38,
            6,
        );

        // Outer border
        this.panel.lineStyle(2.5, 0x8a6030, 0.9);
        this.panel.strokeRoundedRect(
            xStart - panelPad + 1.5,
            cy - sz / 2 - panelPad + 1.5,
            totalW + panelPad * 2 - 3,
            sz + panelPad * 2 - 3,
            8,
        );

        // Inner thin border
        this.panel.lineStyle(1, 0xd8a040, 0.35);
        this.panel.strokeRoundedRect(
            xStart - panelPad + 7,
            cy - sz / 2 - panelPad + 7,
            totalW + panelPad * 2 - 14,
            sz + panelPad * 2 - 14,
            5,
        );

        this.slotCenters = [];
        this.slots.forEach((slot, index) => {
            const cx = xStart + index * (sz + gap) + sz / 2;
            slot.root.setPosition(cx, cy);
            slot.hotkey.setPosition(-sz / 2 + 5, sz / 2 - 5);
            slot.quantity.setPosition(sz / 2 - 4, sz / 2 - 7);
            this.drawSlot(slot.frame, false);
            this.slotCenters[index] = { x: cx, y: cy };
        });
    }

    private drawSlot(g: Phaser.GameObjects.Graphics, active: boolean): void {
        const sz = this.slotSize;
        g.clear();

        // Slot shadow
        g.fillStyle(0x000000, 0.5);
        g.fillRoundedRect(-sz / 2 + 2, -sz / 2 + 2, sz, sz, 6);

        // Background
        g.fillStyle(active ? 0x33220c : 0x14100a, 0.97);
        g.fillRoundedRect(-sz / 2, -sz / 2, sz, sz, 5);

        // Outer border
        g.lineStyle(2.5, active ? 0xffcc55 : 0x7a5730, 1);
        g.strokeRoundedRect(-sz / 2 + 1.5, -sz / 2 + 1.5, sz - 3, sz - 3, 5);

        // Inner thin border
        g.lineStyle(1, active ? 0xffe9a0 : 0xd09840, active ? 0.6 : 0.25);
        g.strokeRoundedRect(-sz / 2 + 6, -sz / 2 + 6, sz - 12, sz - 12, 3);

        if (active) {
            g.fillStyle(0xffe8a0, 0.12);
            g.fillRoundedRect(-sz / 2 + 3, -sz / 2 + 3, sz - 6, sz * 0.4, 4);
        }
    }

    private registerInput(): void {
        if (this.scene.input.keyboard) {
            HOTKEYS.forEach((key, index) => {
                this.scene.input.keyboard?.on(`keydown-${key}`, () => {
                    this.scene.events.emit("consumable:use", index);
                });
            });
        }
        this.scene.input.on("pointerdown", this.onPointerDown, this);
    }

    private onPointerDown = (pointer: Phaser.Input.Pointer): void => {
        const px = pointer.x;
        const py = pointer.y;
        const half = this.slotSize / 2;
        for (let i = 0; i < this.slotCenters.length; i++) {
            const { x, y } = this.slotCenters[i];
            if (Math.abs(px - x) <= half && Math.abs(py - y) <= half) {
                this.scene.events.emit("consumable:use", i);
                this.activateSlot(i);
                return;
            }
        }
    };

    private handleResize(): void {
        this.layout();
    }
}
