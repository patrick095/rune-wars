import Phaser from "phaser";

export interface DockItem {
    id: string;
    label: string;
    iconKey?: string;
    count?: number;
    active?: boolean;
}

const SLOT_SIZE = 28;
const SLOT_GAP = 5;
const PANEL_PADDING = 6;
const TOGGLE_BTN_W = 28;
const TOGGLE_BTN_H = 28;
const LABEL_HEIGHT = 14;
const COUNT_BADGE_SIZE = 14;
const BASE_DEPTH = 25;

/**
 * ItemDock — Phaser-native fixed HUD dock component.
 * Renders a toggle button and a horizontal panel of item slots.
 * All objects use setScrollFactor(0) to stay fixed in screen space.
 */
export class ItemDock {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private onSelect: (id: string) => void;

    // Toggle button objects
    private toggleBtn!: Phaser.GameObjects.Rectangle;
    private toggleBtnText!: Phaser.GameObjects.Text;

    // Panel container objects
    private panelBg!: Phaser.GameObjects.Rectangle;
    private panelVisible = true;
    private dockVisible = true;

    // Per-slot objects — rebuilt on each refresh
    private slotObjects: Phaser.GameObjects.GameObject[] = [];

    // Current items
    private items: DockItem[] = [];

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        items: DockItem[],
        onSelect: (id: string) => void,
    ) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.onSelect = onSelect;
        this.items = [...items];

        this.createToggleButton();
        this.buildPanel();
    }

    // ────────────────────────────────────────────────────────────
    // Public API
    // ────────────────────────────────────────────────────────────

    setVisible(v: boolean): void {
        this.dockVisible = v;
        this.toggleBtn.setVisible(v);
        this.toggleBtnText.setVisible(v);
        this.applyPanelVisibility();
    }

    refresh(items: DockItem[]): void {
        this.items = [...items];
        this.buildPanel();
    }

    // ────────────────────────────────────────────────────────────
    // Private helpers
    // ────────────────────────────────────────────────────────────

    private createToggleButton(): void {
        this.toggleBtn = this.scene.add
            .rectangle(this.x, this.y, TOGGLE_BTN_W, TOGGLE_BTN_H, 0x334455)
            .setInteractive()
            .setDepth(BASE_DEPTH)
            .setScrollFactor(0);

        this.toggleBtnText = this.scene.add
            .text(this.x, this.y, "▶", {
                fontSize: "12px",
                color: "#aaccff",
                fontFamily: "monospace",
            })
            .setOrigin(0.5)
            .setDepth(BASE_DEPTH + 1)
            .setScrollFactor(0);

        this.toggleBtn.on("pointerover", () =>
            this.toggleBtn.setFillStyle(0x4466aa),
        );
        this.toggleBtn.on("pointerout", () =>
            this.toggleBtn.setFillStyle(0x334455),
        );
        this.toggleBtn.on("pointerdown", () => this.toggle());
    }

    private toggle(): void {
        this.setPanelVisible(!this.panelVisible);
    }

    private setPanelVisible(v: boolean): void {
        this.panelVisible = v;
        this.toggleBtnText.setText(v ? "▼" : "▶");
        this.applyPanelVisibility();
    }

    private applyPanelVisibility(): void {
        const visible = this.dockVisible && this.panelVisible;
        this.panelBg?.setVisible(visible);
        for (const obj of this.slotObjects) {
            (
                obj as Phaser.GameObjects.GameObject & {
                    setVisible(v: boolean): void;
                }
            ).setVisible(visible);
        }
    }

    private buildPanel(): void {
        // Destroy previous slot objects
        for (const obj of this.slotObjects) {
            (
                obj as Phaser.GameObjects.GameObject & { destroy(): void }
            ).destroy();
        }
        this.slotObjects = [];
        this.panelBg?.destroy();

        const count = this.items.length;
        const panelW =
            count > 0
                ? PANEL_PADDING * 2 + count * SLOT_SIZE + (count - 1) * SLOT_GAP
                : PANEL_PADDING * 2 + SLOT_SIZE;
        const panelH = PANEL_PADDING * 2 + SLOT_SIZE + LABEL_HEIGHT + 4;

        // Panel starts to the right of the toggle button
        const panelX = this.x + TOGGLE_BTN_W / 2 + panelW / 2 + 4;
        const panelY = this.y;

        this.panelBg = this.scene.add
            .rectangle(panelX, panelY, panelW, panelH, 0x1a2233, 0.85)
            .setDepth(BASE_DEPTH)
            .setScrollFactor(0)
            .setVisible(this.dockVisible && this.panelVisible);

        if (count === 0) return;

        // First slot left edge
        const firstSlotX = panelX - panelW / 2 + PANEL_PADDING + SLOT_SIZE / 2;

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const slotX = firstSlotX + i * (SLOT_SIZE + SLOT_GAP);
            const slotY = panelY - LABEL_HEIGHT / 2;

            // Slot background
            const slotBg = this.scene.add
                .rectangle(slotX, slotY, SLOT_SIZE, SLOT_SIZE, 0x2a3a55)
                .setDepth(BASE_DEPTH + 1)
                .setScrollFactor(0)
                .setVisible(this.dockVisible && this.panelVisible);
            this.slotObjects.push(slotBg);

            // Active golden border via Graphics
            if (item.active) {
                const border = this.scene.add
                    .graphics()
                    .setDepth(BASE_DEPTH + 2)
                    .setScrollFactor(0);
                border.lineStyle(2, 0xffcc00, 1);
                border.strokeRect(
                    slotX - SLOT_SIZE / 2,
                    slotY - SLOT_SIZE / 2,
                    SLOT_SIZE,
                    SLOT_SIZE,
                );
                border.setVisible(this.dockVisible && this.panelVisible);
                this.slotObjects.push(border);
            }

            // Icon (image if key provided, otherwise colored circle fallback)
            if (item.iconKey) {
                const img = this.scene.add
                    .image(slotX, slotY, item.iconKey)
                    .setDisplaySize(SLOT_SIZE - 4, SLOT_SIZE - 4)
                    .setDepth(BASE_DEPTH + 3)
                    .setScrollFactor(0)
                    .setVisible(this.dockVisible && this.panelVisible);
                this.slotObjects.push(img);
            } else {
                const circle = this.scene.add
                    .arc(
                        slotX,
                        slotY,
                        SLOT_SIZE / 2 - 4,
                        0,
                        360,
                        false,
                        0x6688bb,
                    )
                    .setDepth(BASE_DEPTH + 3)
                    .setScrollFactor(0)
                    .setVisible(this.dockVisible && this.panelVisible);
                this.slotObjects.push(circle);
            }

            // Label below slot
            const labelY = slotY + SLOT_SIZE / 2 + 2;
            const label = this.scene.add
                .text(
                    slotX,
                    labelY,
                    item.label.length > 8
                        ? item.label.slice(0, 7) + "…"
                        : item.label,
                    {
                        fontSize: "9px",
                        color: item.active ? "#ffcc00" : "#aabbcc",
                        fontFamily: "monospace",
                    },
                )
                .setOrigin(0.5, 0)
                .setDepth(BASE_DEPTH + 3)
                .setScrollFactor(0)
                .setVisible(this.dockVisible && this.panelVisible);
            this.slotObjects.push(label);

            // Count badge (top-right corner)
            if (item.count !== undefined) {
                const badgeX = slotX + SLOT_SIZE / 2 - COUNT_BADGE_SIZE / 2;
                const badgeY = slotY - SLOT_SIZE / 2 + COUNT_BADGE_SIZE / 2;
                const badge = this.scene.add
                    .rectangle(
                        badgeX,
                        badgeY,
                        COUNT_BADGE_SIZE,
                        COUNT_BADGE_SIZE,
                        0xcc4400,
                    )
                    .setDepth(BASE_DEPTH + 4)
                    .setScrollFactor(0)
                    .setVisible(this.dockVisible && this.panelVisible);
                this.slotObjects.push(badge);

                const badgeText = this.scene.add
                    .text(badgeX, badgeY, String(item.count), {
                        fontSize: "9px",
                        color: "#ffffff",
                        fontFamily: "monospace",
                    })
                    .setOrigin(0.5)
                    .setDepth(BASE_DEPTH + 5)
                    .setScrollFactor(0)
                    .setVisible(this.dockVisible && this.panelVisible);
                this.slotObjects.push(badgeText);
            }

            // Invisible hit area for click detection
            const hitArea = this.scene.add
                .rectangle(slotX, slotY, SLOT_SIZE, SLOT_SIZE, 0x000000, 0)
                .setInteractive()
                .setDepth(BASE_DEPTH + 6)
                .setScrollFactor(0)
                .setVisible(this.dockVisible && this.panelVisible);
            hitArea.on("pointerover", () => slotBg.setFillStyle(0x3a5077));
            hitArea.on("pointerout", () => slotBg.setFillStyle(0x2a3a55));
            hitArea.on("pointerdown", () => {
                this.onSelect(item.id);
            });
            this.slotObjects.push(hitArea);
        }
    }
}
