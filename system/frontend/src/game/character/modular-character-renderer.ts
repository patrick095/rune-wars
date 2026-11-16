import Phaser from "phaser";
import beastAnchors from "../../assets/rune-wars/characters/beast/anchors.json";
import celestialAnchors from "../../assets/rune-wars/characters/celestial/anchors.json";
import demonoidAnchors from "../../assets/rune-wars/characters/demonoid/anchors.json";
import dwarfAnchors from "../../assets/rune-wars/characters/dwarf/anchors.json";
import elfAnchors from "../../assets/rune-wars/characters/elf/anchors.json";
import humanAnchors from "../../assets/rune-wars/characters/human/anchors.json";
import {
    CharacterAnimation,
    CharacterAnchorsManifestV2,
    CharacterFrameId,
    CharacterLayer,
    FacingDirection,
    RUNE_WARS_CHARACTER_FRAME_SIZE,
    RUNE_WARS_CHARACTER_ORIGIN,
    RUNE_WARS_RENDER_ORDER_V2,
    RuneWarsRaceId,
    WeaponVisualState,
} from "./asset-manifest.types";
import { AnchorResolver } from "./anchor-resolver";
import { ModularCharacterAnimator } from "./modular-character-animator";
import {
    runeWarsCharacterFrameKey,
    runeWarsWeaponStateKey,
} from "../assets/rune-wars-assets";
import { getWeaponVisualProfile } from "./weapon-visual-profile";

export interface ModularCharacterRendererConfig {
    race: RuneWarsRaceId;
    x: number;
    y: number;
    facing?: FacingDirection;
    weaponId?: string;
    characterDisplaySize?: number;
    weaponDisplaySize?: number;
}

const ANCHORS_BY_RACE: Record<RuneWarsRaceId, CharacterAnchorsManifestV2> = {
    human: humanAnchors as CharacterAnchorsManifestV2,
    elf: elfAnchors as CharacterAnchorsManifestV2,
    celestial: celestialAnchors as CharacterAnchorsManifestV2,
    demonoid: demonoidAnchors as CharacterAnchorsManifestV2,
    beast: beastAnchors as CharacterAnchorsManifestV2,
    dwarf: dwarfAnchors as CharacterAnchorsManifestV2,
};

const FULL_FRAME_LAYERS = new Set<CharacterLayer>([
    "back",
    "body",
    "armor",
    "face",
    "hair",
    "helmet",
    "cape",
    "wing",
]);

const LAYER_ALPHA: Partial<Record<CharacterLayer, number>> = {
    body: 1,
    weapon: 1,
    effects: 1,
};

export class ModularCharacterRenderer {
    readonly container: Phaser.GameObjects.Container;

    private readonly scene: Phaser.Scene;
    private readonly race: RuneWarsRaceId;
    private readonly layers = new Map<CharacterLayer, Phaser.GameObjects.Sprite>();
    private readonly animator = new ModularCharacterAnimator();
    private readonly resolver: AnchorResolver;
    private readonly characterDisplaySize: number;
    private readonly weaponDisplaySize: number;
    private facing: FacingDirection;
    private aimAngle = 0;
    private weaponId: string;
    private currentFrame: CharacterFrameId = "idle_01";

    constructor(scene: Phaser.Scene, config: ModularCharacterRendererConfig) {
        this.scene = scene;
        this.race = config.race;
        this.facing = config.facing ?? "right";
        this.weaponId = config.weaponId ?? "cannon";
        this.characterDisplaySize = config.characterDisplaySize ?? 72;
        this.weaponDisplaySize = config.weaponDisplaySize ?? 34;
        this.resolver = new AnchorResolver(
            ANCHORS_BY_RACE[this.race],
            this.characterDisplaySize / RUNE_WARS_CHARACTER_FRAME_SIZE.height,
        );
        this.container = scene.add.container(config.x, config.y);
        this.createLayers();
        this.renderFrame("idle_01");
    }

    play(animation: CharacterAnimation, restart = false): void {
        const frame = this.animator.play(animation, restart);
        this.renderFrame(frame.frame);
    }

    update(deltaMs: number): void {
        const frame = this.animator.update(deltaMs);
        if (frame) this.renderFrame(frame.frame);
    }

    setPosition(x: number, y: number): void {
        this.container.setPosition(x, y);
    }

    setAlpha(alpha: number): void {
        this.container.setAlpha(alpha);
    }

    setDepth(depth: number): void {
        this.container.setDepth(depth);
    }

    setFacing(facing: FacingDirection): void {
        if (this.facing === facing) return;
        this.facing = facing;
        this.applyAnchors();
    }

    setFlipX(flipX: boolean): void {
        this.setFacing(flipX ? "left" : "right");
    }

    setAimAngle(angle: number): void {
        this.aimAngle = angle;
        this.applyAnchors();
    }

    setWeapon(weaponId: string): void {
        this.weaponId = weaponId;
        this.applyWeaponTexture();
        this.applyAnchors();
    }

    equip(layer: CharacterLayer, textureKey: string): void {
        const sprite = this.layers.get(layer);
        if (!sprite || !this.scene.textures.exists(textureKey)) return;
        sprite.setTexture(textureKey).setVisible(true);
        if (FULL_FRAME_LAYERS.has(layer)) {
            sprite
                .setOrigin(
                    RUNE_WARS_CHARACTER_ORIGIN.x / RUNE_WARS_CHARACTER_FRAME_SIZE.width,
                    RUNE_WARS_CHARACTER_ORIGIN.y / RUNE_WARS_CHARACTER_FRAME_SIZE.height,
                )
                .setDisplaySize(this.characterDisplaySize, this.characterDisplaySize);
        }
    }

    unequip(layer: CharacterLayer): void {
        if (layer === "weapon") {
            this.applyWeaponTexture();
            return;
        }
        const sprite = this.layers.get(layer);
        const textureKey = runeWarsCharacterFrameKey(this.race, layer, this.currentFrame);
        if (!sprite || !this.scene.textures.exists(textureKey)) {
            sprite?.setVisible(false);
            return;
        }
        sprite.setTexture(textureKey).setVisible(true);
    }

    getProjectileOriginWorld(): Phaser.Math.Vector2 {
        const anchor = this.resolver.resolve(
            this.currentFrame,
            "projectile",
            this.facing,
            this.aimAngle,
        );
        const matrix = this.container.getWorldTransformMatrix();
        const point = matrix.transformPoint(anchor.x, anchor.y);
        return new Phaser.Math.Vector2(point.x, point.y);
    }

    destroy(): void {
        this.container.destroy(true);
        this.layers.clear();
    }

    private createLayers(): void {
        RUNE_WARS_RENDER_ORDER_V2.forEach((layer, index) => {
            const sprite = this.scene.add.sprite(0, 0, "__MISSING");
            sprite
                .setDepth(index)
                .setAlpha(LAYER_ALPHA[layer] ?? 1)
                .setVisible(false);
            this.layers.set(layer, sprite);
            this.container.add(sprite);
        });
    }

    private renderFrame(frame: CharacterFrameId): void {
        this.currentFrame = frame;
        for (const layer of RUNE_WARS_RENDER_ORDER_V2) {
            if (layer === "weapon") continue;
            const sprite = this.layers.get(layer);
            if (!sprite) continue;
            const textureKey = runeWarsCharacterFrameKey(this.race, layer, frame);
            if (!this.scene.textures.exists(textureKey)) {
                sprite.setVisible(false);
                continue;
            }
            sprite
                .setTexture(textureKey)
                .setOrigin(
                    RUNE_WARS_CHARACTER_ORIGIN.x / RUNE_WARS_CHARACTER_FRAME_SIZE.width,
                    RUNE_WARS_CHARACTER_ORIGIN.y / RUNE_WARS_CHARACTER_FRAME_SIZE.height,
                )
                .setDisplaySize(this.characterDisplaySize, this.characterDisplaySize)
                .setVisible(true);
        }
        this.applyWeaponTexture();
        this.applyAnchors();
    }

    private applyAnchors(): void {
        for (const [layer, sprite] of this.layers) {
            if (FULL_FRAME_LAYERS.has(layer)) {
                sprite
                    .setPosition(0, 0)
                    .setRotation(0)
                    .setFlipX(this.facing === "left");
                continue;
            }

            const anchor = this.resolver.resolve(
                this.currentFrame,
                layer,
                this.facing,
                this.aimAngle,
            );
            sprite
                .setPosition(anchor.x, anchor.y)
                .setRotation(anchor.rotation)
                .setScale(anchor.scaleX, anchor.scaleY);
        }
    }

    private applyWeaponTexture(): void {
        const sprite = this.layers.get("weapon");
        if (!sprite) return;
        const state = this.resolveWeaponState();
        const textureKey = this.resolveWeaponTextureKey(state);
        if (!textureKey) {
            sprite.setVisible(false);
            return;
        }
        sprite
            .setTexture(textureKey)
            .setOrigin(0.5)
            .setDisplaySize(this.weaponDisplaySize, this.weaponDisplaySize)
            .setVisible(true);
    }

    private resolveWeaponState(): WeaponVisualState {
        const animation = this.animator.animation;
        if (animation === "aim") return "weapon_aim";
        if (animation === "idle" || animation === "walk") return "weapon_idle";
        return getWeaponVisualProfile(this.weaponId).weaponState;
    }

    private resolveWeaponTextureKey(state: WeaponVisualState): string | null {
        const direct = runeWarsWeaponStateKey(this.weaponId, state);
        if (this.scene.textures.exists(direct)) return direct;
        if (state === "weapon_fire") {
            const fallback = runeWarsWeaponStateKey(this.weaponId, "weapon_aim");
            if (this.scene.textures.exists(fallback)) return fallback;
        }
        const idle = runeWarsWeaponStateKey(this.weaponId, "weapon_idle");
        return this.scene.textures.exists(idle) ? idle : null;
    }
}
