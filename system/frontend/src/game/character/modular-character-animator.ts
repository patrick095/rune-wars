import {
    CharacterAnimation,
    CharacterFrameId,
    RUNE_WARS_ANIMATION_DEFINITIONS,
} from "./asset-manifest.types";

export interface ModularAnimatorFrame {
    animation: CharacterAnimation;
    frame: CharacterFrameId;
    frameIndex: number;
    completed: boolean;
}

const ONE_SHOT_ANIMATIONS = new Set<CharacterAnimation>([
    "throw_light",
    "throw_heavy",
    "shoot",
    "cast",
    "hit",
    "death",
]);

export class ModularCharacterAnimator {
    private currentAnimation: CharacterAnimation = "idle";
    private currentFrameIndex = 0;
    private elapsedMs = 0;
    private dead = false;

    get animation(): CharacterAnimation {
        return this.currentAnimation;
    }

    get frame(): CharacterFrameId {
        return this.frames[this.currentFrameIndex] ?? this.frames[0];
    }

    play(animation: CharacterAnimation, restart = false): ModularAnimatorFrame {
        if (this.dead && animation !== "death") {
            return this.snapshot(false);
        }
        if (!restart && animation === this.currentAnimation) {
            return this.snapshot(false);
        }

        this.currentAnimation = animation;
        this.currentFrameIndex = 0;
        this.elapsedMs = 0;
        return this.snapshot(false);
    }

    update(deltaMs: number): ModularAnimatorFrame | null {
        const definition = RUNE_WARS_ANIMATION_DEFINITIONS[this.currentAnimation];
        const frameDuration = 1000 / Math.max(1, definition.fps);
        this.elapsedMs += deltaMs;

        let changed = false;
        let completed = false;
        while (this.elapsedMs >= frameDuration) {
            this.elapsedMs -= frameDuration;
            const nextIndex = this.currentFrameIndex + 1;
            if (nextIndex < definition.frames.length) {
                this.currentFrameIndex = nextIndex;
                changed = true;
                continue;
            }

            completed = true;
            if (this.currentAnimation === "death") {
                this.currentFrameIndex = definition.frames.length - 1;
                this.dead = true;
                break;
            }
            if (definition.loop) {
                this.currentFrameIndex = 0;
                changed = true;
                continue;
            }
            if (ONE_SHOT_ANIMATIONS.has(this.currentAnimation)) {
                this.currentAnimation = "idle";
                this.currentFrameIndex = 0;
                this.elapsedMs = 0;
                changed = true;
            }
            break;
        }

        return changed || completed ? this.snapshot(completed) : null;
    }

    private get frames(): readonly CharacterFrameId[] {
        return RUNE_WARS_ANIMATION_DEFINITIONS[this.currentAnimation].frames;
    }

    private snapshot(completed: boolean): ModularAnimatorFrame {
        return {
            animation: this.currentAnimation,
            frame: this.frame,
            frameIndex: this.currentFrameIndex,
            completed,
        };
    }
}
