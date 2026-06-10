import Phaser from "phaser";

const MAX_POWER = 100;
const DEPTH = 32;

export class PowerBar {
    private scene!: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private panel!: Phaser.GameObjects.Graphics;
    private angleDial!: Phaser.GameObjects.Graphics;
    private angleText!: Phaser.GameObjects.Text;
    private angleLabel!: Phaser.GameObjects.Text;
    private barBg!: Phaser.GameObjects.Graphics;
    private barFill!: Phaser.GameObjects.Graphics;
    private ticks!: Phaser.GameObjects.Graphics;
    private ghost!: Phaser.GameObjects.Graphics;
    private powerLabel!: Phaser.GameObjects.Text;
    private powerValueText!: Phaser.GameObjects.Text;
    private fireButton!: Phaser.GameObjects.Graphics;
    private fireText!: Phaser.GameObjects.Text;
    private tickLabels: Phaser.GameObjects.Text[] = [];
    private dialLabels: Phaser.GameObjects.Text[] = [];
    private isHoveringFire = false;

    private currentPower = 0;
    private currentAngle = 45;
    private currentFacing: "left" | "right" = "right";
    private angleLimits = { minAngle: 0, maxAngle: 90 };
    private lastShotPower = 0;
    private isCharging = false;
    private fireDownCallback: (() => void) | null = null;
    private fireUpCallback: (() => void) | null = null;

    // Computed each layout() call — used for input hit-testing in screen space
    private barX = 0;
    private barY = 0;
    private barW = 0;
    private barH = 22;
    private angleX = 0;
    private angleY = 0;
    private fireX = 0;
    private fireY = 0;
    private fireR = 74;
    private dialR = 72;

    create(scene: Phaser.Scene): void {
        this.scene = scene;
        this.container = scene.add
            .container(0, 0)
            .setDepth(DEPTH)
            .setScrollFactor(0);

        this.panel = scene.add.graphics();
        this.angleDial = scene.add.graphics();
        this.barBg = scene.add.graphics();
        this.barFill = scene.add.graphics();
        this.ticks = scene.add.graphics();
        this.ghost = scene.add.graphics();
        this.fireButton = scene.add.graphics();

        this.angleLabel = scene.add
            .text(0, 0, "ANGULO", {
                fontSize: "16px",
                color: "#d9b870",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        this.angleText = scene.add
            .text(0, 0, "45°", {
                fontSize: "38px",
                color: "#ffd37a",
                fontFamily: "Georgia, serif",
                fontStyle: "bold",
                stroke: "#120b05",
                strokeThickness: 6,
            })
            .setOrigin(0.5);

        this.powerLabel = scene.add
            .text(0, 0, "FORCA", {
                fontSize: "16px",
                color: "#d9b870",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000",
                strokeThickness: 3,
            })
            .setOrigin(0, 1);

        this.powerValueText = scene.add
            .text(0, 0, "0%", {
                fontSize: "20px",
                color: "#ffe49b",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        this.fireText = scene.add
            .text(0, 0, "ATIRAR", {
                fontSize: "26px",
                color: "#ffd477",
                fontFamily: "Georgia, serif",
                fontStyle: "bold",
                stroke: "#2a0800",
                strokeThickness: 6,
            })
            .setOrigin(0.5);

        this.container.add([
            this.panel,
            this.angleDial,
            this.barBg,
            this.barFill,
            this.ghost,
            this.ticks,
            this.angleLabel,
            this.angleText,
            this.powerLabel,
            this.powerValueText,
            this.fireButton,
            this.fireText,
        ]);

        // Screen-space input (works regardless of camera scroll)
        scene.input.on("pointerdown", this.onPointerDown, this);
        scene.input.on("pointerup", this.onPointerUp, this);
        scene.input.on("pointermove", this.onPointerMove, this);

        this.layout();
        this.drawAll();
        scene.scale.on("resize", this.handleResize, this);
    }

    update(
        power: number,
        angle: number,
        facing: "left" | "right" = "right",
        angleLimits: { minAngle: number; maxAngle: number } = {
            minAngle: 0,
            maxAngle: 90,
        },
    ): void {
        this.currentPower = Phaser.Math.Clamp(power, 0, MAX_POWER);
        this.currentAngle = angle;
        this.currentFacing = facing;
        this.angleLimits = {
            minAngle: Phaser.Math.Clamp(angleLimits.minAngle, 0, 90),
            maxAngle: Phaser.Math.Clamp(angleLimits.maxAngle, 0, 90),
        };
        this.drawAll();
    }

    updatePowerOnly(power: number): void {
        this.currentPower = Phaser.Math.Clamp(power, 0, MAX_POWER);
        this.drawPower();
        this.updateTexts();
    }

    setCharging(isCharging: boolean): void {
        this.isCharging = isCharging;
        this.drawFireButton();
        this.updateTexts();
    }

    recordShot(power: number): void {
        this.lastShotPower = Phaser.Math.Clamp(power, 0, MAX_POWER);
        this.drawPower();
    }

    onFireDown(callback: () => void): void {
        this.fireDownCallback = callback;
    }
    onFireUp(callback: () => void): void {
        this.fireUpCallback = callback;
    }

    setVisible(visible: boolean): void {
        this.container.setVisible(visible);
        this.tickLabels.forEach((l) => l.setVisible(visible));
        this.dialLabels.forEach((l) => l.setVisible(visible));
    }

    destroy(): void {
        this.scene?.scale.off("resize", this.handleResize, this);
        this.scene?.input.off("pointerdown", this.onPointerDown, this);
        this.scene?.input.off("pointerup", this.onPointerUp, this);
        this.scene?.input.off("pointermove", this.onPointerMove, this);
        this.tickLabels.forEach((l) => l.destroy());
        this.tickLabels = [];
        this.dialLabels.forEach((l) => l.destroy());
        this.dialLabels = [];
        this.container?.destroy(true);
    }

    // ── Proportional layout ──────────────────────────────────────────────────
    private layout(): void {
        const W = this.scene.scale.width;
        const H = this.scene.scale.height;

        // Panel: 13% of screen height
        const panelH = Math.round(H * 0.135);
        const bottom = H - 1;

        // Anchor controls to the canvas edges. Keep only 2px so strokes are not clipped.
        this.dialR = Math.round(Math.min(H * 0.085, W * 0.052));
        this.angleX = this.dialR + 2;
        this.angleY = bottom - Math.round(panelH * 0.51);

        this.fireR = Math.round(Math.min(H * 0.088, W * 0.052));
        this.fireX = W - this.fireR - 2;
        this.fireY = this.angleY;

        this.barX = Math.round(W * 0.39);
        this.barY = bottom - Math.round(panelH * 0.23);
        this.barH = Math.round(H * 0.024);
        const availW = this.fireX - this.fireR - this.barX - 8;
        this.barW = Math.max(200, availW);

        this.panel.setPosition(0, 0);
        this.angleLabel.setPosition(this.angleX, this.angleY - this.dialR - 2);
        this.angleText.setPosition(
            this.angleX,
            this.angleY + Math.round(this.dialR * 0.32) - 10,
        );
        this.powerLabel.setPosition(this.barX, this.barY - this.barH / 2 - 6);
        this.powerValueText.setPosition(this.fireX - this.fireR - 8, this.barY);
        this.fireText.setPosition(
            this.fireX,
            this.fireY + this.fireR / 2 - Math.round(H * 0.022),
        );

        this.panel.clear();
        // Shadow
        this.panel.fillStyle(0x000000, 0.5);
        this.panel.fillRect(0, H - panelH + 2, W, panelH);
        // Main fill
        this.panel.fillStyle(0x0e0b07, 0.93);
        this.panel.fillRect(0, H - panelH, W, panelH);
        // Top border
        this.panel.lineStyle(3, 0x6b4e28, 0.9);
        this.panel.lineBetween(0, H - panelH, W, H - panelH);
        // Secondary highlight
        this.panel.lineStyle(1, 0xd8a850, 0.45);
        this.panel.lineBetween(0, H - panelH + 5, W, H - panelH + 5);
    }

    private drawAll(): void {
        this.drawAngleDial();
        this.drawPower();
        this.drawFireButton();
        this.updateTexts();
    }

    private drawAngleDial(): void {
        this.angleDial.clear();
        const r = this.dialR;

        // Shadow
        this.angleDial.fillStyle(0x000000, 0.55);
        this.angleDial.fillCircle(this.angleX + 3, this.angleY + 3, r);

        // Body
        this.angleDial.fillStyle(0x16120c, 0.98);
        this.angleDial.fillCircle(this.angleX, this.angleY, r);

        // Outer thick ring
        this.angleDial.lineStyle(Math.round(r * 0.12), 0x251e14, 1);
        this.angleDial.strokeCircle(this.angleX, this.angleY, r);

        // Gold ring
        this.angleDial.lineStyle(Math.round(r * 0.035), 0xc49040, 0.85);
        this.angleDial.strokeCircle(
            this.angleX,
            this.angleY,
            r - Math.round(r * 0.12),
        );

        // Inner accent ring
        this.angleDial.lineStyle(1, 0x806030, 0.5);
        this.angleDial.strokeCircle(
            this.angleX,
            this.angleY,
            r - Math.round(r * 0.22),
        );

        // Range arc
        this.angleDial.lineStyle(5, 0x0d2e3a, 0.9);
        this.drawArcForRange(
            r - Math.round(r * 0.28),
            this.angleLimits.minAngle,
            this.angleLimits.maxAngle,
        );

        // Tick marks
        for (let deg = 0; deg <= 90; deg += 5) {
            if (
                deg < this.angleLimits.minAngle ||
                deg > this.angleLimits.maxAngle
            )
                continue;
            const a = this.screenAngleFor(deg);
            const major = deg % 30 === 0;
            const inner =
                r - (major ? Math.round(r * 0.3) : Math.round(r * 0.21));
            const outer = r - Math.round(r * 0.13);
            const x1 = this.angleX + Math.cos(a) * inner;
            const y1 = this.angleY + Math.sin(a) * inner;
            const x2 = this.angleX + Math.cos(a) * outer;
            const y2 = this.angleY + Math.sin(a) * outer;
            this.angleDial.lineStyle(
                major ? 2.5 : 1,
                major ? 0xd8b870 : 0x907848,
                major ? 1 : 0.8,
            );
            this.angleDial.lineBetween(x1, y1, x2, y2);
        }

        // Dial labels
        this.ensureDialLabels();
        const labelDegs = [0, 15, 30, 45, 60, 75, 90];
        const labelR = r - Math.round(r * 0.42);
        labelDegs.forEach((deg, i) => {
            const label = this.dialLabels[i];
            if (!label) return;
            const inRange =
                deg >= this.angleLimits.minAngle &&
                deg <= this.angleLimits.maxAngle;
            label.setVisible(inRange);
            if (inRange) {
                const a = this.screenAngleFor(deg);
                label.setPosition(
                    this.angleX + Math.cos(a) * labelR,
                    this.angleY + Math.sin(a) * labelR,
                );
            }
        });

        // Needle shadow
        const clampedAngle = Phaser.Math.Clamp(
            this.currentAngle,
            this.angleLimits.minAngle,
            this.angleLimits.maxAngle,
        );
        const needleAngle = this.screenAngleFor(clampedAngle);
        const needleLen = r - Math.round(r * 0.22);
        this.angleDial.lineStyle(4, 0x000000, 0.4);
        this.angleDial.lineBetween(
            this.angleX + 1,
            this.angleY + 1,
            this.angleX + Math.cos(needleAngle) * needleLen + 1,
            this.angleY + Math.sin(needleAngle) * needleLen + 1,
        );

        // Needle
        this.angleDial.lineStyle(4, 0x41c8ff, 0.95);
        this.angleDial.lineBetween(
            this.angleX,
            this.angleY,
            this.angleX + Math.cos(needleAngle) * needleLen,
            this.angleY + Math.sin(needleAngle) * needleLen,
        );

        // Needle tip
        this.angleDial.fillStyle(0x7ee8ff, 1);
        this.angleDial.fillCircle(
            this.angleX + Math.cos(needleAngle) * needleLen,
            this.angleY + Math.sin(needleAngle) * needleLen,
            4,
        );

        // Center pivot
        this.angleDial.fillStyle(0x41c8ff, 1);
        this.angleDial.fillCircle(this.angleX, this.angleY, 7);
        this.angleDial.fillStyle(0xffffff, 0.7);
        this.angleDial.fillCircle(this.angleX - 1, this.angleY - 1, 2.5);
    }

    private drawPower(): void {
        this.barBg.clear();
        this.barFill.clear();
        this.ticks.clear();
        this.ghost.clear();

        // Shadow
        this.barBg.fillStyle(0x000000, 0.6);
        this.barBg.fillRoundedRect(
            this.barX + 2,
            this.barY - this.barH / 2 + 2,
            this.barW,
            this.barH,
            5,
        );

        // Background
        this.barBg.fillStyle(0x060a05, 1);
        this.barBg.fillRoundedRect(
            this.barX,
            this.barY - this.barH / 2,
            this.barW,
            this.barH,
            5,
        );

        // Outer border
        this.barBg.lineStyle(2.5, 0x6a4a20, 1);
        this.barBg.strokeRoundedRect(
            this.barX,
            this.barY - this.barH / 2,
            this.barW,
            this.barH,
            5,
        );

        // Gradient fill
        const fillW = (this.currentPower / MAX_POWER) * (this.barW - 6);
        const segments = 80;
        for (let i = 0; i < segments && fillW > 0; i++) {
            const t = i / (segments - 1);
            const x = this.barX + 3 + i * ((this.barW - 6) / segments);
            if (x > this.barX + 3 + fillW) break;
            const color =
                t < 0.45
                    ? 0x4adb13
                    : t < 0.72
                      ? 0xf0d31a
                      : t < 0.9
                        ? 0xf28312
                        : 0xd62216;
            this.barFill.fillStyle(color, 1);
            this.barFill.fillRect(
                x,
                this.barY - this.barH / 2 + 2,
                Math.ceil((this.barW - 6) / segments) + 1,
                this.barH - 4,
            );
        }

        // Shine
        if (this.currentPower > 0) {
            this.barFill.fillStyle(0xffffff, 0.15);
            this.barFill.fillRoundedRect(
                this.barX + 3,
                this.barY - this.barH / 2 + 2,
                fillW,
                Math.round((this.barH - 4) * 0.4),
                2,
            );
        }

        // Ticks
        for (let v = 0; v <= 100; v += 5) {
            const x = this.barX + (v / 100) * this.barW;
            const major = v % 10 === 0;
            this.ticks.lineStyle(
                major ? 2 : 1,
                major ? 0x3a2810 : 0x2a1c08,
                major ? 0.9 : 0.7,
            );
            this.ticks.lineBetween(
                x,
                this.barY - this.barH / 2,
                x,
                this.barY + this.barH / 2,
            );
        }

        // Ghost marker
        if (this.lastShotPower > 0) {
            const x = this.barX + (this.lastShotPower / 100) * this.barW;
            this.ghost.fillStyle(0xd8a14a, 1);
            this.ghost.fillTriangle(
                x,
                this.barY - this.barH - 8,
                x - 11,
                this.barY - this.barH / 2,
                x + 11,
                this.barY - this.barH / 2,
            );
            this.ghost.fillRect(
                x - 3,
                this.barY - this.barH / 2 - 2,
                6,
                this.barH + 14,
            );
            this.ghost.lineStyle(1.5, 0xffe1a3, 0.9);
            this.ghost.strokeTriangle(
                x,
                this.barY - this.barH - 8,
                x - 11,
                this.barY - this.barH / 2,
                x + 11,
                this.barY - this.barH / 2,
            );
        }

        this.ensureTickLabels();
        this.tickLabels.forEach((label, index) => {
            const v = index * 10;
            label.setPosition(
                this.barX + (v / 100) * this.barW,
                this.barY - this.barH / 2 - 6,
            );
        });
    }

    private drawFireButton(hover = false): void {
        this.fireButton.clear();
        const active = this.isCharging;
        const r = this.fireR;
        const cx = this.fireX;
        const cy = this.fireY;

        // Drop shadow
        this.fireButton.fillStyle(0x000000, 0.6);
        this.fireButton.fillCircle(cx + 4, cy + 4, r);

        // Main body
        this.fireButton.fillStyle(
            active ? 0xc84010 : hover ? 0xa02808 : 0x7a1508,
            1,
        );
        this.fireButton.fillCircle(cx, cy, r);

        // Outer thick dark ring
        this.fireButton.lineStyle(Math.round(r * 0.13), 0x201208, 1);
        this.fireButton.strokeCircle(cx, cy, r);

        // Gold accent ring
        this.fireButton.lineStyle(4, active ? 0xffd06b : 0xc46826, 1);
        this.fireButton.strokeCircle(cx, cy, r - Math.round(r * 0.14));

        // Inner thin highlight
        this.fireButton.lineStyle(1.5, 0xffefb0, active ? 0.6 : 0.35);
        this.fireButton.strokeCircle(cx, cy, r - Math.round(r * 0.29));

        // Bomb icon
        const bx = cx + Math.round(r * 0.03);
        const by = cy - Math.round(r * 0.14);
        const br = Math.round(r * 0.29);

        this.fireButton.fillStyle(0x000000, 0.5);
        this.fireButton.fillCircle(bx + 2, by + 2, br);

        this.fireButton.fillStyle(0x1a1208, 1);
        this.fireButton.fillCircle(bx, by, br);

        this.fireButton.lineStyle(2, 0x786040, 0.85);
        this.fireButton.strokeCircle(bx, by, br);

        this.fireButton.fillStyle(0x807060, 0.35);
        this.fireButton.fillCircle(
            bx - Math.round(br * 0.4),
            by - Math.round(br * 0.4),
            Math.round(br * 0.46),
        );

        // Fuse
        const fuseLen = Math.round(r * 0.25);
        this.fireButton.lineStyle(3, 0xa07828, 1);
        this.fireButton.lineBetween(
            bx + Math.round(br * 0.65),
            by - Math.round(br * 0.88),
            bx + Math.round(br * 0.65) + fuseLen * 0.4,
            by - Math.round(br * 0.88) - fuseLen,
        );
        this.fireButton.lineStyle(2, 0xc09030, 0.9);
        this.fireButton.lineBetween(
            bx + Math.round(br * 0.65) + fuseLen * 0.4,
            by - Math.round(br * 0.88) - fuseLen,
            bx + Math.round(br * 0.65) + fuseLen * 0.1,
            by - Math.round(br * 0.88) - fuseLen * 1.5,
        );

        const fuseColor = active ? 0xffff44 : 0xff9900;
        this.fireButton.fillStyle(fuseColor, 1);
        this.fireButton.fillCircle(
            bx + Math.round(br * 0.65) + fuseLen * 0.1,
            by - Math.round(br * 0.88) - fuseLen * 1.5,
            active ? 6 : 5,
        );
    }

    private updateTexts(): void {
        this.angleText.setText(`${Math.round(this.currentAngle)}°`);
        this.powerValueText.setText(`${Math.round(this.currentPower)}%`);
        this.fireText.setText(this.isCharging ? "SOLTAR" : "ATIRAR");
    }

    private screenAngleFor(deg: number): number {
        const rad = Phaser.Math.DegToRad(deg);
        return this.currentFacing === "right" ? -rad : Math.PI + rad;
    }

    private drawArcForRange(
        radius: number,
        minAngle: number,
        maxAngle: number,
    ): void {
        const start = this.screenAngleFor(minAngle);
        const end = this.screenAngleFor(maxAngle);
        this.angleDial.beginPath();
        if (this.currentFacing === "right") {
            this.angleDial.arc(
                this.angleX,
                this.angleY,
                radius,
                start,
                end,
                true,
            );
        } else {
            this.angleDial.arc(
                this.angleX,
                this.angleY,
                radius,
                start,
                end,
                false,
            );
        }
        this.angleDial.strokePath();
    }

    private ensureTickLabels(): void {
        if (this.tickLabels.length > 0) return;
        for (let v = 0; v <= 100; v += 10) {
            const label = this.scene.add
                .text(0, 0, String(v), {
                    fontSize: "14px",
                    color: "#f0d898",
                    fontFamily: "monospace",
                    stroke: "#000",
                    strokeThickness: 3,
                })
                .setOrigin(0.5, 1)
                .setDepth(DEPTH + 1)
                .setScrollFactor(0);
            this.tickLabels.push(label);
        }
    }

    private ensureDialLabels(): void {
        if (this.dialLabels.length > 0) return;
        const degs = [0, 15, 30, 45, 60, 75, 90];
        for (const deg of degs) {
            const label = this.scene.add
                .text(0, 0, `${deg}°`, {
                    fontSize: "11px",
                    color: "#b89848",
                    fontFamily: "monospace",
                    stroke: "#000",
                    strokeThickness: 2,
                })
                .setOrigin(0.5)
                .setDepth(DEPTH + 1)
                .setScrollFactor(0);
            this.dialLabels.push(label);
        }
    }

    private isInsideFire(px: number, py: number): boolean {
        return Math.hypot(px - this.fireX, py - this.fireY) <= this.fireR;
    }

    private onPointerDown = (pointer: Phaser.Input.Pointer): void => {
        if (this.isInsideFire(pointer.x, pointer.y)) {
            this.isCharging = true;
            this.drawFireButton(true);
            this.fireDownCallback?.();
        }
    };

    private onPointerUp = (_pointer: Phaser.Input.Pointer): void => {
        if (this.isCharging) {
            this.isCharging = false;
            this.drawFireButton(this.isHoveringFire);
            this.fireUpCallback?.();
        }
    };

    private onPointerMove = (pointer: Phaser.Input.Pointer): void => {
        const hover = this.isInsideFire(pointer.x, pointer.y);
        if (hover !== this.isHoveringFire) {
            this.isHoveringFire = hover;
            if (!this.isCharging) this.drawFireButton(hover);
        }
    };

    private handleResize(): void {
        this.layout();
        this.drawAll();
    }
}
