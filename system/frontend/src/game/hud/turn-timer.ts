import Phaser from "phaser";

const TURN_DURATION = 20;
const DEPTH = 38;

type TimerState = "idle" | "running" | "charging" | "done";

export class TurnTimer {
    private scene: Phaser.Scene | null = null;
    private graphics: Phaser.GameObjects.Graphics | null = null;
    private label: Phaser.GameObjects.Text | null = null;
    private caption: Phaser.GameObjects.Text | null = null;
    private timerEvent: Phaser.Time.TimerEvent | null = null;
    private pulseTween: Phaser.Tweens.Tween | null = null;
    private elapsed = 0;
    private state: TimerState = "idle";
    private cx = 0;
    private cy = 0;

    start(scene: Phaser.Scene): void {
        this.stop();
        this.scene = scene;
        this.elapsed = 0;
        this.state = "running";
        this.cx = scene.scale.width / 2;
        this.cy = 70;

        this.graphics = scene.add.graphics().setDepth(DEPTH).setScrollFactor(0);
        this.label = scene.add
            .text(this.cx, this.cy - 4, String(TURN_DURATION), {
                fontSize: "40px",
                color: "#ffd485",
                fontFamily: "Georgia, serif",
                fontStyle: "bold",
                stroke: "#160b03",
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setDepth(DEPTH + 1)
            .setScrollFactor(0);
        this.caption = scene.add
            .text(this.cx, this.cy + 26, "TURNO", {
                fontSize: "13px",
                color: "#ffe6ad",
                fontFamily: "monospace",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(DEPTH + 1)
            .setScrollFactor(0);

        this.timerEvent = scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: this.onTick,
            callbackScope: this,
        });
        scene.scale.on("resize", this.handleResize, this);
        this.redraw();
    }

    pauseForCharge(): void {
        if (!this.scene || this.state === "idle" || this.state === "done")
            return;
        this.state = "charging";
        this.redraw();
    }

    resumeFromCharge(): void {
        if (!this.scene || this.state !== "charging") return;
        this.state = "running";
        this.redraw();
    }

    reset(): void {
        if (!this.scene) return;
        this.elapsed = 0;
        this.state = "running";
        this.stopPulse();
        if (!this.timerEvent) {
            this.timerEvent = this.scene.time.addEvent({
                delay: 100,
                loop: true,
                callback: this.onTick,
                callbackScope: this,
            });
        }
        this.redraw();
    }

    onPowerMax(): void {
        this.scene?.events.emit("charge:autofire");
        this.stopTimer();
    }

    setVisible(visible: boolean): void {
        this.graphics?.setVisible(visible);
        this.label?.setVisible(visible);
        this.caption?.setVisible(visible);
    }

    stop(): void {
        this.stopTimer();
        this.stopPulse();
        this.scene?.scale.off("resize", this.handleResize, this);
        this.graphics?.destroy();
        this.label?.destroy();
        this.caption?.destroy();
        this.graphics = null;
        this.label = null;
        this.caption = null;
        this.scene = null;
        this.state = "idle";
        this.elapsed = 0;
    }

    private onTick(): void {
        if (this.state !== "running") return;
        this.elapsed += 0.1;
        if (this.elapsed >= TURN_DURATION) {
            this.elapsed = TURN_DURATION;
            this.state = "done";
            this.redraw();
            this.stopTimer();
            this.scene?.events.emit("turn:expired");
            return;
        }
        this.redraw();
    }

    private redraw(): void {
        if (!this.graphics || !this.label || !this.caption || !this.scene)
            return;
        const remaining = Math.max(0, TURN_DURATION - this.elapsed);
        const pct = remaining / TURN_DURATION;
        const urgent = remaining <= 5;
        const charging = this.state === "charging";

        const arcColor = urgent ? 0xff503c : charging ? 0x41c8ff : 0xc89a45;

        this.graphics.clear();

        // ── Outer decorative ring ─────────────────────────────────────────────
        // Shadow
        this.graphics.fillStyle(0x000000, 0.5);
        this.graphics.fillCircle(this.cx + 3, this.cy + 3, 52);

        // Outermost dark ring
        this.graphics.fillStyle(0x0c0a06, 1);
        this.graphics.fillCircle(this.cx, this.cy, 52);

        // Outer gold decorative ring stroke
        this.graphics.lineStyle(3, 0x8a6530, 0.85);
        this.graphics.strokeCircle(this.cx, this.cy, 52);

        // Thin gold inner ring on outermost
        this.graphics.lineStyle(1, 0xd8a850, 0.4);
        this.graphics.strokeCircle(this.cx, this.cy, 48);

        // ── Inner body ────────────────────────────────────────────────────────
        this.graphics.fillStyle(0x20170e, 1);
        this.graphics.fillCircle(this.cx, this.cy, 44);

        // Thick outer ring of inner body
        this.graphics.lineStyle(7, 0x2e2018, 1);
        this.graphics.strokeCircle(this.cx, this.cy, 44);

        // ── Progress arc ──────────────────────────────────────────────────────
        // Arc background (full circle, dark)
        this.graphics.lineStyle(5, 0x1a1208, 0.9);
        this.graphics.beginPath();
        this.graphics.arc(this.cx, this.cy, 39, 0, Math.PI * 2);
        this.graphics.strokePath();

        // Arc fill (progress)
        this.graphics.lineStyle(5, arcColor, 1);
        this.graphics.beginPath();
        this.graphics.arc(
            this.cx,
            this.cy,
            39,
            -Math.PI / 2,
            -Math.PI / 2 + pct * Math.PI * 2,
            false,
        );
        this.graphics.strokePath();

        // ── Inner face ────────────────────────────────────────────────────────
        this.graphics.fillStyle(0x18110a, 1);
        this.graphics.fillCircle(this.cx, this.cy, 33);

        // Face ring
        this.graphics.lineStyle(1.5, 0x6a4820, 0.7);
        this.graphics.strokeCircle(this.cx, this.cy, 33);

        // Center glow (charging = blue tint, urgent = red tint)
        if (charging || urgent) {
            const glowColor = charging ? 0x001840 : 0x300000;
            this.graphics.fillStyle(glowColor, 0.5);
            this.graphics.fillCircle(this.cx, this.cy, 30);
        }

        // ── Small tick marks ──────────────────────────────────────────────────
        for (let i = 0; i < 20; i++) {
            const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
            const major = i % 5 === 0;
            const r1 = major ? 43 : 41;
            const r2 = 45;
            this.graphics.lineStyle(
                major ? 2 : 1,
                major ? 0xb08040 : 0x806030,
                major ? 0.9 : 0.5,
            );
            this.graphics.lineBetween(
                this.cx + Math.cos(a) * r1,
                this.cy + Math.sin(a) * r1,
                this.cx + Math.cos(a) * r2,
                this.cy + Math.sin(a) * r2,
            );
        }

        // Text update
        this.label.setText(String(Math.ceil(remaining)));
        this.label.setColor(
            urgent ? "#ff5d42" : charging ? "#7bdcff" : "#ffd485",
        );
        this.caption.setText(charging ? "MIRA" : "TURNO");

        if (urgent && !this.pulseTween) {
            this.pulseTween = this.scene.tweens.add({
                targets: [this.label, this.caption],
                scaleX: 1.14,
                scaleY: 1.14,
                duration: 260,
                yoyo: true,
                repeat: -1,
            });
        } else if (!urgent) {
            this.stopPulse();
        }
    }

    private handleResize(): void {
        if (!this.scene) return;
        this.cx = this.scene.scale.width / 2;
        this.cy = 49;
        this.label?.setPosition(this.cx, this.cy - 4);
        this.caption?.setPosition(this.cx, this.cy + 26);
        this.redraw();
    }

    private stopTimer(): void {
        this.timerEvent?.remove(false);
        this.timerEvent = null;
    }

    private stopPulse(): void {
        this.pulseTween?.stop();
        this.pulseTween = null;
        this.label?.setScale(1);
        this.caption?.setScale(1);
    }
}
