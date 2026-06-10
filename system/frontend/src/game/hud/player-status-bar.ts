import Phaser from "phaser";

const DEPTH = 34;
const TOP = 0;

export interface HudPlayerCard {
    name: string;
    hp: number;
    maxHp: number;
    level?: number;
    active?: boolean;
}

function hpColor(pct: number): number {
    if (pct > 0.5) return 0x28cc18;
    if (pct > 0.25) return 0xffcc33;
    return 0xe6392e;
}

function hpGlow(pct: number): number {
    if (pct > 0.5) return 0x70ff50;
    if (pct > 0.25) return 0xffe88a;
    return 0xff8060;
}

interface CardObjects {
    root: Phaser.GameObjects.Container;
    frame: Phaser.GameObjects.Graphics;
    portrait: Phaser.GameObjects.Graphics;
    levelText: Phaser.GameObjects.Text;
    nameText: Phaser.GameObjects.Text;
    hpText: Phaser.GameObjects.Text;
    hpBar: Phaser.GameObjects.Graphics;
}

export class PlayerStatusBar {
    private scene!: Phaser.Scene;
    private side!: "left" | "right";
    private cards: CardObjects[] = [];
    private players: HudPlayerCard[] = [];
    private layoutSignature = "";

    create(scene: Phaser.Scene, side: "left" | "right"): void {
        this.scene = scene;
        this.side = side;
        this.rebuild();
        scene.scale.on("resize", this.handleResize, this);
    }

    setName(name: string): void {
        const first = this.players[0] ?? { hp: 100, maxHp: 100 };
        this.setPlayers([{ ...first, name }]);
    }

    update(
        hp: number,
        maxHp: number,
        _stamina: number,
        _maxStamina: number,
    ): void {
        const first = this.players[0] ?? {
            name: this.side === "left" ? "Jogador" : "Inimigo",
            hp,
            maxHp,
        };
        this.setPlayers([{ ...first, hp, maxHp }]);
    }

    setPlayers(players: HudPlayerCard[]): void {
        this.players = players.filter(
            (player) => player.name.trim().length > 0,
        );
        const nextSignature = this.players
            .map((player) => player.name)
            .join("|");
        if (
            nextSignature !== this.layoutSignature ||
            this.players.length !== this.cards.length
        ) {
            this.layoutSignature = nextSignature;
            this.rebuild();
            return;
        }

        this.players.forEach((player, index) => {
            const card = this.cards[index];
            if (!card) return;
            this.drawCard(card.frame, !!player.active);
            this.updateCard(card, player);
        });
    }

    setRaceIcon(_textureKey: string): void {
        // Reserved for future portrait sprites.
    }

    setVisible(visible: boolean): void {
        this.cards.forEach((card) => card.root.setVisible(visible));
    }

    destroy(): void {
        this.scene?.scale.off("resize", this.handleResize, this);
        this.cards.forEach((card) => card.root.destroy(true));
        this.cards = [];
        this.layoutSignature = this.players
            .map((player) => player.name)
            .join("|");
    }

    private cardDimensions(): {
        w: number;
        h: number;
        gap: number;
        sideMargin: number;
    } {
        const W = this.scene.scale.width;
        const w = Math.round(Math.min(W * 0.068, 120));
        const h = Math.round(w * 1.22);
        const gap = Math.round(W * 0.007);
        const sideMargin = 0;
        return { w, h, gap, sideMargin };
    }

    private rebuild(): void {
        this.cards.forEach((card) => card.root.destroy(true));
        this.cards = [];

        const count = this.players.length;
        if (count === 0) return;

        const {
            w: CARD_W,
            h: CARD_H,
            gap: GAP,
            sideMargin: SIDE_MARGIN,
        } = this.cardDimensions();
        const totalW = count * CARD_W + (count - 1) * GAP;
        const startX =
            this.side === "left"
                ? SIDE_MARGIN
                : this.scene.scale.width - SIDE_MARGIN - totalW;

        // Font sizes proportional to card width
        const levelFontSize = Math.round(CARD_W * 0.155);
        const nameFontSize = Math.round(CARD_W * 0.145);
        const hpFontSize = Math.round(CARD_W * 0.155);

        for (let i = 0; i < count; i++) {
            const player = this.players[i];
            const x = startX + i * (CARD_W + GAP);
            const root = this.scene.add
                .container(x, TOP)
                .setDepth(DEPTH)
                .setScrollFactor(0);
            const frame = this.scene.add.graphics();
            const portrait = this.scene.add.graphics();

            const portraitBottom = Math.round(CARD_H * 0.63);
            const hpBarY = Math.round(CARD_H * 0.8);
            const levelBadgeY = Math.round(portraitBottom - CARD_H * 0.15);

            const levelText = this.scene.add
                .text(
                    Math.round(CARD_W * 0.22),
                    levelBadgeY + Math.round(CARD_H * 0.07),
                    "50",
                    {
                        fontSize: `${levelFontSize}px`,
                        color: "#ffdf66",
                        fontFamily: "monospace",
                        fontStyle: "bold",
                        stroke: "#000000",
                        strokeThickness: 3,
                    },
                )
                .setOrigin(0.5);

            const nameText = this.scene.add
                .text(CARD_W / 2, portraitBottom + 4, "", {
                    fontSize: `${nameFontSize}px`,
                    color: "#f7ead0",
                    fontFamily: "monospace",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 3,
                })
                .setOrigin(0.5, 0);

            const hpText = this.scene.add
                .text(CARD_W / 2, hpBarY + Math.round(CARD_H * 0.062), "", {
                    fontSize: `${hpFontSize}px`,
                    color: "#ffffff",
                    fontFamily: "monospace",
                    fontStyle: "bold",
                    stroke: "#073300",
                    strokeThickness: 3,
                })
                .setOrigin(0.5, 0.5);

            const hpBar = this.scene.add.graphics();

            root.add([frame, portrait, levelText, nameText, hpBar, hpText]);
            this.drawCard(frame, !!player.active);
            this.drawPortrait(portrait, i);
            this.cards.push({
                root,
                frame,
                portrait,
                levelText,
                nameText,
                hpText,
                hpBar,
            });
            this.updateCard(this.cards[this.cards.length - 1], player);
        }
    }

    private handleResize(): void {
        this.rebuild();
    }

    private updateCard(card: CardObjects, player: HudPlayerCard): void {
        const pct =
            player.maxHp > 0
                ? Phaser.Math.Clamp(player.hp / player.maxHp, 0, 1)
                : 0;
        card.levelText.setText(String(player.level ?? 50));
        card.nameText.setText(player.name.toUpperCase().slice(0, 8));
        card.hpText.setText(String(Math.max(0, Math.round(player.hp))));
        card.root.setAlpha(player.hp <= 0 ? 0.45 : 1);
        this.drawHp(card.hpBar, pct);
    }

    private drawCard(g: Phaser.GameObjects.Graphics, active: boolean): void {
        const { w: CARD_W, h: CARD_H } = this.cardDimensions();
        g.clear();

        // Drop shadow
        g.fillStyle(0x000000, 0.55);
        g.fillRoundedRect(2, 3, CARD_W, CARD_H, 7);

        // Main background
        g.fillStyle(0x0e0b08, 0.96);
        g.fillRoundedRect(0, 0, CARD_W, CARD_H, 6);

        // Outer gold border
        g.lineStyle(3, active ? 0xeacc50 : 0x8a6533, 1);
        g.strokeRoundedRect(1.5, 1.5, CARD_W - 3, CARD_H - 3, 6);

        // Outer highlight
        g.lineStyle(1, 0xffe8a0, active ? 0.45 : 0.18);
        g.strokeRoundedRect(4, 4, CARD_W - 8, CARD_H - 8, 5);

        // Portrait area accent border (team color)
        const portraitH = Math.round(CARD_H * 0.62);
        const teamColor =
            this.side === "left"
                ? active
                    ? 0x50d8ff
                    : 0x19a9ff
                : active
                  ? 0xff8060
                  : 0xff3e2f;
        g.lineStyle(2, teamColor, active ? 0.95 : 0.7);
        g.strokeRoundedRect(6, 6, CARD_W - 12, portraitH, 4);

        if (active) {
            g.lineStyle(1.5, 0xffd080, 0.6);
            g.strokeRoundedRect(3, 3, CARD_W - 6, CARD_H - 6, 5);
        }
    }

    private drawPortrait(g: Phaser.GameObjects.Graphics, index: number): void {
        const { w: CARD_W, h: CARD_H } = this.cardDimensions();
        g.clear();

        const baseColors =
            this.side === "left"
                ? [0x1598ff, 0x0a62bd, 0x62d8ff, 0x13345f]
                : [0xff3a25, 0xa64cff, 0xffc433, 0xe3342f];
        const hlColors =
            this.side === "left"
                ? [0x7ae0ff, 0x4898e8, 0xd0f8ff, 0x6080c8]
                : [0xffb080, 0xd8a8ff, 0xffe8a0, 0xffb090];

        const baseColor = baseColors[index % 4];
        const hlColor = hlColors[index % 4];

        const portraitH = Math.round(CARD_H * 0.62);
        const circleCX = CARD_W / 2;
        const circleCY = Math.round(CARD_H * 0.34);
        const circleR = Math.round(CARD_W * 0.26);

        // Portrait background
        g.fillStyle(0x10101a, 1);
        g.fillRoundedRect(8, 8, CARD_W - 16, portraitH - 2, 4);

        // Main portrait circle
        g.fillStyle(baseColor, 1);
        g.fillCircle(circleCX, circleCY, circleR);

        // Highlight shimmer
        g.fillStyle(hlColor, 0.5);
        g.fillCircle(
            circleCX - Math.round(circleR * 0.36),
            circleCY - Math.round(circleR * 0.27),
            Math.round(circleR * 0.54),
        );

        // Small secondary highlight
        g.fillStyle(0xffffff, 0.2);
        g.fillCircle(
            circleCX - Math.round(circleR * 0.18),
            circleCY - Math.round(circleR * 0.45),
            Math.round(circleR * 0.23),
        );

        // Dark silhouette
        const sY = portraitH + 8;
        g.fillStyle(0x060610, 0.88);
        g.fillTriangle(
            circleCX - circleR - 2,
            sY,
            circleCX,
            circleCY - Math.round(circleR * 0.14),
            circleCX + circleR + 2,
            sY,
        );

        // Gold ring
        g.lineStyle(2.5, 0xf0c860, 0.9);
        g.strokeCircle(circleCX, circleCY, circleR);

        // Top-arc shine
        g.lineStyle(1.5, 0xffffff, 0.4);
        g.beginPath();
        g.arc(
            circleCX,
            circleCY,
            Math.round(circleR * 0.78),
            -Math.PI * 0.85,
            -Math.PI * 0.15,
        );
        g.strokePath();

        // Level badge background
        const badgeX = 5;
        const badgeY = Math.round(CARD_H * 0.49);
        const badgeW = Math.round(CARD_W * 0.34);
        const badgeH = Math.round(CARD_H * 0.16);
        g.fillStyle(0x0a0800, 0.95);
        g.fillRoundedRect(badgeX, badgeY, badgeW, badgeH, 3);
        g.lineStyle(1.5, 0xd4a828, 0.85);
        g.strokeRoundedRect(badgeX, badgeY, badgeW, badgeH, 3);
    }

    private drawHp(g: Phaser.GameObjects.Graphics, pct: number): void {
        const { w: CARD_W, h: CARD_H } = this.cardDimensions();
        const x = 6;
        const y = Math.round(CARD_H * 0.795);
        const w = CARD_W - 12;
        const h = Math.round(CARD_H * 0.128);

        g.clear();

        // Shadow
        g.fillStyle(0x000000, 0.6);
        g.fillRoundedRect(x, y + 1, w, h, 4);

        // Background
        g.fillStyle(0x04080a, 1);
        g.fillRoundedRect(x, y, w, h, 4);

        // Fill
        if (pct > 0) {
            const fillW = Math.max(4, (w - 4) * pct);
            g.fillStyle(hpColor(pct), 1);
            g.fillRoundedRect(x + 2, y + 2, fillW, h - 4, 3);

            // Shine strip
            g.fillStyle(0xffffff, 0.22);
            g.fillRoundedRect(
                x + 2,
                y + 2,
                fillW,
                Math.ceil((h - 4) * 0.44),
                2,
            );

            // End glow
            if (fillW > 8) {
                g.fillStyle(hpGlow(pct), 0.7);
                g.fillCircle(x + 2 + fillW, y + h / 2, 3);
            }
        }

        // Border
        g.lineStyle(1.5, 0x0d2a1a, 1);
        g.strokeRoundedRect(x, y, w, h, 4);
    }
}
