import Phaser from "phaser";
import {
    AnchorTransform,
    CharacterAnchorsManifestV2,
    CharacterFrameId,
    CharacterLayer,
    FacingDirection,
} from "./asset-manifest.types";

export interface ResolvedAnchor {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
}

const ZERO_ANCHOR: AnchorTransform = { x: 0, y: 0, r: 0, sx: 1, sy: 1 };

export class AnchorResolver {
    constructor(
        private readonly manifest: CharacterAnchorsManifestV2,
        private readonly pixelScale: number,
    ) {}

    resolve(
        frame: CharacterFrameId,
        point: CharacterLayer | "projectile",
        facing: FacingDirection,
        aimAngle = 0,
    ): ResolvedAnchor {
        const anchor = this.manifest.anchors[frame]?.[point] ?? ZERO_ANCHOR;
        const direction = facing === "left" ? -1 : 1;
        const shouldAim = point === "weapon" || point === "projectile";
        const rotationDegrees = (anchor.r + (shouldAim ? aimAngle : 0)) * direction;

        return {
            x: anchor.x * this.pixelScale * direction,
            y: anchor.y * this.pixelScale,
            rotation: Phaser.Math.DegToRad(rotationDegrees),
            scaleX: anchor.sx * direction,
            scaleY: anchor.sy,
        };
    }
}
