import Phaser from "phaser";

const SLOT_COUNT = 4;
const SLOT_W = 94;
const SLOT_H = 86;
const SLOT_GAP = 10;
const DOCK_X = 58;
const DOCK_Y = 200;
const DEPTH = 35;

export interface ModifierSlotItem {
    iconKey?: string;
    label?: string;
    active?: boolean;
}

interface SlotObjects {
    root: Phaser.GameObjects.Container;
    frame: Phaser.GameObjects.Graphics;
    icon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
    label: Phaser.GameObjects.Text;
    count: Phaser.GameObjects.Text;
}

function iconStyleForLabel(label: string): {
    char: string;
    color: string;
    bgColor: number;
} {
    const lower = label.toLowerCase();
    if (lower.includes("tiro"))
        return { char: "+", color: "#38c8ff", bgColor: 0x0a1a28 };
    if (lower.includes("dano"))
        return { char: "✚", color: "#4eff68", bgColor: 0x081a08 };
    if (lower.includes("escav"))
        return { char: "➤", color: "#ffa040", bgColor: 0x200e00 };
    return { char: "✦", color: "#d4a0ff", bgColor: 0x120820 };
}

export class ModifierDock {
    private scene!: Phaser.Scene;
    private root!: Phaser.GameObjects.Container;
    private panel!: Phaser.GameObjects.Graphics;
    private title!: Phaser.GameObjects.Text;
    private slots: (ModifierSlotItem | null)[] = new Array(SLOT_COUNT).fill(
        null,
    );
    private slotObjects: SlotObjects[] = [];
    private keyboardListeners: (() => void)[] = [];
    // World-space positions for screen-space hit testing
    private slotCenters: { x: number; y: number }[] = [];

    create(scene: Phaser.Scene): void {
        this.scene = scene;
        this.root = scene.add
            .container(0, 0)
            .setDepth(DEPTH)
            .setScrollFactor(0);
        this.panel = scene.add.graphics();
        this.title = scene.add
            .text(0, 0, "MODIFICADORES", {
                fontSize: "12px",
                color: "#f7df9d",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);
        this.root.add([this.panel, this.title]);

        for (let i = 0; i < SLOT_COUNT; i++) {
            this.buildSlot(i);
        }

        this.layout();
        this.registerInput();
        scene.scale.on("resize", this.handleResize, this);
    }

    setSlot(index: number, item: ModifierSlotItem | null): void {
        if (index < 0 || index >= SLOT_COUNT) return;
        const becameActive = !this.slots[index]?.active && !!item?.active;
        this.slots[index] = item;
        this.refreshSlot(index);
        if (becameActive) this.pulse(index);
    }

    clearSlot(index: number): void {
        this.setSlot(index, null);
    }

    setVisible(visible: boolean): void {
        this.root?.setVisible(visible);
    }

    destroy(): void {
        for (const cleanup of this.keyboardListeners) cleanup();
        this.keyboardListeners = [];
        this.scene?.scale.off("resize", this.handleResize, this);
        this.scene?.input.off("pointerdown", this.onPointerDown, this);
        this.root?.destroy(true);
    }

    private buildSlot(index: number): void {
        const root = this.scene.add.container(0, 0);
        const frame = this.scene.add.graphics();
        const icon = this.scene.add
            .text(0, -8, "-", {
                fontSize: "28px",
                color: "#9b7a44",
                fontFamily: "monospace",
                fontStyle: "bold",
            })
            .setOrigin(0.5);
        const label = this.scene.add
            .text(0, 22, "", {
                fontSize: "14px",
                color: "#f4ead2",
                fontFamily: "monospace",
                fontStyle: "bold",
                align: "center",
                wordWrap: { width: SLOT_W - 10 },
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5, 0);
        const count = this.scene.add
            .text(SLOT_W / 2 - 6, -SLOT_H / 2 + 6, String(index + 1), {
                fontSize: "14px",
                color: "#ffffff",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
                backgroundColor: "#1c6010",
                padding: { x: 4, y: 2 },
            })
            .setOrigin(1, 0);

        root.add([frame, icon, label, count]);
        this.root.add(root);
        this.slotObjects[index] = { root, frame, icon, label, count };
        this.refreshSlot(index);
    }

    private refreshSlot(index: number): void {
        const slot = this.slotObjects[index];
        if (!slot) return;
        const item = this.slots[index];
        const active = !!item?.active;
        const style = iconStyleForLabel(item?.label ?? "");

        this.drawSlot(slot.frame, active, style.bgColor);
        slot.icon.destroy();

        if (item?.iconKey && this.scene.textures.exists(item.iconKey)) {
            slot.icon = this.scene.add
                .image(0, -12, item.iconKey)
                .setDisplaySize(44, 44)
                .setOrigin(0.5);
        } else {
            const text = item?.label ? style.char : "-";
            const color = item?.label
                ? active
                    ? "#ffd15a"
                    : style.color
                : "#605040";
            slot.icon = this.scene.add
                .text(0, -12, text, {
                    fontSize: "30px",
                    color,
                    fontFamily: "monospace",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 4,
                })
                .setOrigin(0.5);
        }
        slot.root.addAt(slot.icon, 1);
        slot.label.setText((item?.label ?? "").toUpperCase());
        slot.count.setText(String(index + 1));
    }

    private layout(): void {
        const panelH =
            36 + SLOT_COUNT * SLOT_H + (SLOT_COUNT - 1) * SLOT_GAP + 16;
        const panelW = SLOT_W + 20;

        this.root.setPosition(DOCK_X, DOCK_Y);

        this.panel.clear();

        // Shadow
        this.panel.fillStyle(0x000000, 0.5);
        this.panel.fillRoundedRect(-panelW / 2 + 3, -30 + 3, panelW, panelH, 7);

        // Main background
        this.panel.fillStyle(0x0d0b08, 0.92);
        this.panel.fillRoundedRect(-panelW / 2, -30, panelW, panelH, 7);

        // Subtle top highlight
        this.panel.fillStyle(0xfff0a0, 0.05);
        this.panel.fillRoundedRect(
            -panelW / 2 + 4,
            -28,
            panelW - 8,
            panelH * 0.3,
            6,
        );

        // Outer gold border
        this.panel.lineStyle(2.5, 0x7a5530, 1);
        this.panel.strokeRoundedRect(
            -panelW / 2 + 1.5,
            -28.5,
            panelW - 3,
            panelH - 3,
            7,
        );

        // Inner thin accent border
        this.panel.lineStyle(1, 0xd8a850, 0.4);
        this.panel.strokeRoundedRect(
            -panelW / 2 + 7,
            -24,
            panelW - 14,
            panelH - 14,
            5,
        );

        // Title separator line
        this.panel.lineStyle(1, 0x8a6030, 0.7);
        this.panel.lineBetween(-panelW / 2 + 10, -4, panelW / 2 - 10, -4);

        this.title.setPosition(0, -17);

        this.slotCenters = [];
        this.slotObjects.forEach((slot, index) => {
            const localY = 34 + index * (SLOT_H + SLOT_GAP);
            slot.root.setPosition(0, localY);
            // Absolute screen-space center (dock root is at DOCK_X, DOCK_Y)
            this.slotCenters.push({ x: DOCK_X, y: DOCK_Y + localY });
        });
    }

    private drawSlot(
        g: Phaser.GameObjects.Graphics,
        active: boolean,
        bgColor: number,
    ): void {
        g.clear();

        // Slot shadow
        g.fillStyle(0x000000, 0.5);
        g.fillRoundedRect(-SLOT_W / 2 + 2, -SLOT_H / 2 + 2, SLOT_W, SLOT_H, 6);

        // Slot background
        g.fillStyle(active ? bgColor : 0x12100a, 0.97);
        g.fillRoundedRect(-SLOT_W / 2, -SLOT_H / 2, SLOT_W, SLOT_H, 5);

        // Outer border
        g.lineStyle(3, active ? 0xffc24d : 0x6e4d28, 1);
        g.strokeRoundedRect(
            -SLOT_W / 2 + 1.5,
            -SLOT_H / 2 + 1.5,
            SLOT_W - 3,
            SLOT_H - 3,
            5,
        );

        // Inner thin border
        g.lineStyle(1, active ? 0xffefad : 0xb08040, active ? 0.7 : 0.3);
        g.strokeRoundedRect(
            -SLOT_W / 2 + 7,
            -SLOT_H / 2 + 7,
            SLOT_W - 14,
            SLOT_H - 14,
            4,
        );

        if (active) {
            g.fillStyle(0xffe8a0, 0.12);
            g.fillRoundedRect(
                -SLOT_W / 2 + 4,
                -SLOT_H / 2 + 4,
                SLOT_W - 8,
                SLOT_H * 0.35,
                4,
            );
        }
    }

    private pulse(index: number): void {
        const slot = this.slotObjects[index];
        if (!slot) return;
        this.scene.tweens.add({
            targets: slot.root,
            scaleX: { from: 1.14, to: 1 },
            scaleY: { from: 1.14, to: 1 },
            duration: 200,
            ease: "Back.easeOut",
        });
    }

    private registerInput(): void {
        // Keyboard hotkeys (1-4)
        const keys = ["ONE", "TWO", "THREE", "FOUR"] as const;
        keys.forEach((keyName, index) => {
            const key = this.scene.input.keyboard?.addKey(
                Phaser.Input.Keyboard.KeyCodes[keyName],
            );
            if (!key) return;
            const onDown = () => this.scene.events.emit("modifier:use", index);
            key.on("down", onDown);
            this.keyboardListeners.push(() => key.off("down", onDown));
        });

        // Mouse / touch (screen-space hit test — works even when camera scrolls)
        this.scene.input.on("pointerdown", this.onPointerDown, this);
    }

    private onPointerDown = (pointer: Phaser.Input.Pointer): void => {
        const px = pointer.x;
        const py = pointer.y;
        for (let i = 0; i < this.slotCenters.length; i++) {
            const { x, y } = this.slotCenters[i];
            if (
                Math.abs(px - x) <= SLOT_W / 2 &&
                Math.abs(py - y) <= SLOT_H / 2
            ) {
                this.scene.events.emit("modifier:use", i);
                this.pulse(i);
                return;
            }
        }
    };

    private handleResize(): void {
        this.layout();
    }
}
