import {
    CharacterFrameId,
    WeaponVisualProfile,
    WeaponVisualState,
} from "./asset-manifest.types";

export const DEFAULT_RELEASE_FRAMES: Record<
    WeaponVisualProfile["animation"],
    CharacterFrameId
> = {
    throw_light: "throw_light_02",
    throw_heavy: "throw_heavy_03",
    shoot: "shoot_02",
    cast: "cast",
};

export const DEFAULT_WEAPON_VISUAL_PROFILES: Record<string, WeaponVisualProfile> = {
    cannon: {
        animation: "shoot",
        weaponState: "weapon_fire",
        projectile: "cannonball",
        effects: ["muzzle_flash", "smoke_puff"],
        recoil: { x: -4, y: 0, durationMs: 90 },
    },
    longbow: {
        animation: "shoot",
        weaponState: "weapon_fire",
        projectile: "arrow",
        effects: ["bow_release", "trail_wind"],
        recoil: { x: -1, y: 0, durationMs: 70 },
    },
    bow_wood: {
        animation: "shoot",
        weaponState: "weapon_fire",
        projectile: "arrow",
        effects: ["bow_release", "trail_wind"],
        recoil: { x: -1, y: 0, durationMs: 70 },
    },
    "magic-grenade": {
        animation: "throw_light",
        weaponState: "weapon_fire",
        projectile: "magic_grenade",
        effects: ["spark_arcane"],
    },
    potion: {
        animation: "throw_light",
        weaponState: "weapon_fire",
        projectile: "potion",
        effects: ["glass_glint"],
    },
    tnt: {
        animation: "throw_heavy",
        weaponState: "weapon_fire",
        projectile: "tnt_bundle",
        effects: ["fuse_glow"],
        recoil: { x: -2, y: 1, durationMs: 90 },
    },
    boomerang: {
        animation: "throw_light",
        weaponState: "weapon_fire",
        projectile: "boomerang",
        effects: ["arcane_trail"],
    },
    "ice-book": {
        animation: "cast",
        weaponState: "weapon_aim",
        projectile: "ice_shard",
        effects: ["rune_circle", "frost_glow"],
        castAura: "frost_glow",
    },
    staff_runic: {
        animation: "cast",
        weaponState: "weapon_aim",
        projectile: "runic_bolt",
        effects: ["rune_circle", "staff_glow"],
        castAura: "staff_glow",
    },
};

export function getWeaponVisualProfile(weaponId: string): WeaponVisualProfile {
    const profile =
        DEFAULT_WEAPON_VISUAL_PROFILES[weaponId] ??
        DEFAULT_WEAPON_VISUAL_PROFILES["cannon"];
    return normalizeWeaponVisualProfile(profile);
}

export function normalizeWeaponVisualProfile(
    profile: WeaponVisualProfile,
): WeaponVisualProfile {
    return {
        ...profile,
        releaseFrame: profile.releaseFrame ?? DEFAULT_RELEASE_FRAMES[profile.animation],
    };
}

export function resolveWeaponStatePath(
    states: Partial<Record<WeaponVisualState, string>>,
    state: WeaponVisualState,
    fallbacks?: Partial<Record<WeaponVisualState, WeaponVisualState>>,
): string | undefined {
    const direct = states[state];
    if (direct) return direct;
    const fallbackState = fallbacks?.[state];
    return fallbackState ? states[fallbackState] : undefined;
}
