export const RUNE_WARS_CHARACTER_FRAME_SIZE = { width: 192, height: 192 } as const;
export const RUNE_WARS_ITEM_FRAME_SIZE = { width: 144, height: 144 } as const;
export const RUNE_WARS_CHARACTER_ORIGIN = { x: 96, y: 154 } as const;

export const RUNE_WARS_REQUIRED_RACES = [
    "human",
    "elf",
    "celestial",
    "demonoid",
    "beast",
] as const;

export const RUNE_WARS_LEGACY_RACES = ["dwarf"] as const;

export const RUNE_WARS_RENDER_ORDER_V2 = [
    "back",
    "body",
    "armor",
    "face",
    "hair",
    "helmet",
    "weapon",
    "cape",
    "wing",
    "effects",
] as const;

export const RUNE_WARS_REQUIRED_LAYERS_V2 = [
    "body",
    "hair",
    "helmet",
    "weapon",
    "effects",
] as const;

export const RUNE_WARS_ANIMATION_DEFINITIONS = {
    idle: {
        fps: 6,
        loop: true,
        frames: ["idle_01", "idle_02", "idle_03", "idle_04"],
    },
    walk: {
        fps: 10,
        loop: true,
        frames: [
            "walk_01",
            "walk_02",
            "walk_03",
            "walk_04",
            "walk_05",
            "walk_06",
        ],
    },
    aim: { fps: 1, loop: false, frames: ["aim"] },
    throw_light: {
        fps: 14,
        loop: false,
        frames: ["throw_light_01", "throw_light_02", "throw_light_03"],
    },
    throw_heavy: {
        fps: 12,
        loop: false,
        frames: [
            "throw_heavy_01",
            "throw_heavy_02",
            "throw_heavy_03",
            "throw_heavy_04",
        ],
    },
    shoot: {
        fps: 14,
        loop: false,
        frames: ["shoot_01", "shoot_02", "shoot_03"],
    },
    cast: { fps: 1, loop: false, frames: ["cast"] },
    hit: { fps: 10, loop: false, frames: ["hit_01", "hit_02"] },
    death: {
        fps: 8,
        loop: false,
        frames: [
            "death_01",
            "death_02",
            "death_03",
            "death_04",
            "death_05",
        ],
    },
    win: {
        fps: 8,
        loop: true,
        frames: ["win_01", "win_02", "win_03", "win_04"],
    },
} as const;

export const RUNE_WARS_ANIMATION_NAMES = Object.keys(
    RUNE_WARS_ANIMATION_DEFINITIONS,
) as CharacterAnimation[];

export const RUNE_WARS_REQUIRED_FRAME_IDS = Object.values(
    RUNE_WARS_ANIMATION_DEFINITIONS,
).flatMap((animation) => animation.frames) as CharacterFrameId[];

export const RUNE_WARS_REQUIRED_ANCHOR_POINTS = [
    "weapon",
    "projectile",
    "hair",
    "helmet",
    "effects",
] as const;

export type RuneWarsRequiredRace = (typeof RUNE_WARS_REQUIRED_RACES)[number];
export type RuneWarsLegacyRace = (typeof RUNE_WARS_LEGACY_RACES)[number];
export type RuneWarsRaceId = RuneWarsRequiredRace | RuneWarsLegacyRace;
export type CharacterAnimation = keyof typeof RUNE_WARS_ANIMATION_DEFINITIONS;
export type CharacterFrameId =
    (typeof RUNE_WARS_ANIMATION_DEFINITIONS)[CharacterAnimation]["frames"][number];
export type CharacterLayer = (typeof RUNE_WARS_RENDER_ORDER_V2)[number];
export type RequiredCharacterLayer = (typeof RUNE_WARS_REQUIRED_LAYERS_V2)[number];
export type RequiredAnchorPoint = (typeof RUNE_WARS_REQUIRED_ANCHOR_POINTS)[number];
export type FacingDirection = "left" | "right";
export type WeaponVisualState =
    | "weapon_idle"
    | "weapon_ready"
    | "weapon_aim"
    | "weapon_fire";

export interface FrameSize {
    width: number;
    height: number;
}

export interface Point2D {
    x: number;
    y: number;
}

export interface AnchorTransform {
    x: number;
    y: number;
    r: number;
    sx: number;
    sy: number;
}

export type FrameAnchors = Partial<Record<CharacterLayer | "projectile", AnchorTransform>>;

export interface CharacterAnchorsManifestV2 {
    schemaVersion: 2;
    raceId: RuneWarsRaceId;
    anchors: Record<CharacterFrameId, FrameAnchors>;
}

export interface CharacterAnimationManifest {
    fps: number;
    loop: boolean;
    frames: CharacterFrameId[];
}

export interface CharacterManifestV2 {
    schemaVersion: 2;
    raceId: RuneWarsRaceId;
    name: string;
    frameSize: FrameSize;
    origin: Point2D;
    layers: CharacterLayer[];
    anchors: string;
    animations: Record<CharacterAnimation, CharacterAnimationManifest>;
    placeholder?: boolean;
    legacyFallback?: boolean;
    notes?: string[];
}

export interface WeaponVisualProfile {
    animation: Extract<
        CharacterAnimation,
        "throw_light" | "throw_heavy" | "shoot" | "cast"
    >;
    weaponState: WeaponVisualState;
    projectile: string;
    effects: string[];
    releaseFrame?: CharacterFrameId;
    recoil?: {
        x: number;
        y: number;
        durationMs: number;
    };
    chargeEffect?: string;
    muzzleOffset?: Partial<AnchorTransform>;
    castAura?: string;
    soundKey?: string;
}

export interface WeaponManifestV2 {
    schemaVersion: 2;
    itemId: string;
    name: string;
    slot: "weapon";
    states: Record<WeaponVisualState, string>;
    fallbacks?: Partial<Record<WeaponVisualState, WeaponVisualState>>;
    visualProfile: WeaponVisualProfile;
    placeholder?: boolean;
    notes?: string[];
}

export interface CatalogWeaponEntryV2 {
    id: string;
    name?: string;
    manifest: string;
}

export interface CatalogProjectileEntryV2 {
    id: string;
    asset: string;
}

export interface CatalogEffectEntryV2 {
    id: string;
    asset?: string;
}

export interface AssetCatalogV2 {
    schemaVersion: 2;
    root: string;
    characterFrameSize: FrameSize;
    itemFrameSize: FrameSize;
    origin: Point2D;
    renderOrder: CharacterLayer[];
    requiredLayers: RequiredCharacterLayer[];
    races: RuneWarsRequiredRace[];
    legacyRaces?: RuneWarsLegacyRace[];
    animationSet: "rune_wars_base_v1";
    weapons: CatalogWeaponEntryV2[];
    projectiles: CatalogProjectileEntryV2[];
    effects: CatalogEffectEntryV2[];
}
