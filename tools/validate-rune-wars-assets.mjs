#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const assetRoot = path.join(repoRoot, "system/frontend/src/assets/rune-wars");
const catalogPath = path.join(assetRoot, "asset-catalog.json");

const renderOrder = [
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
];
const requiredLayers = ["body", "hair", "helmet", "weapon", "effects"];
const requiredRaces = ["human", "elf", "celestial", "demonoid", "beast"];
const canonicalAnimations = {
    idle: ["idle_01", "idle_02", "idle_03", "idle_04"],
    walk: ["walk_01", "walk_02", "walk_03", "walk_04", "walk_05", "walk_06"],
    aim: ["aim"],
    throw_light: ["throw_light_01", "throw_light_02", "throw_light_03"],
    throw_heavy: [
        "throw_heavy_01",
        "throw_heavy_02",
        "throw_heavy_03",
        "throw_heavy_04",
    ],
    shoot: ["shoot_01", "shoot_02", "shoot_03"],
    cast: ["cast"],
    hit: ["hit_01", "hit_02"],
    death: ["death_01", "death_02", "death_03", "death_04", "death_05"],
    win: ["win_01", "win_02", "win_03", "win_04"],
};
const requiredFrames = Object.values(canonicalAnimations).flat();
const requiredAnchors = ["weapon", "projectile", "hair", "helmet", "effects"];
const visualAnimations = ["throw_light", "throw_heavy", "shoot", "cast"];
const weaponStates = ["weapon_idle", "weapon_ready", "weapon_aim", "weapon_fire"];

const errors = [];
const warnings = [];

function readJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        fail(`${filePath}: JSON invalido ou ausente (${error.message})`);
        return null;
    }
}

function fail(message) {
    errors.push(message);
}

function warn(message) {
    warnings.push(message);
}

function exists(filePath) {
    return fs.existsSync(filePath);
}

function relative(filePath) {
    return path.relative(repoRoot, filePath);
}

function pngSize(filePath) {
    const buffer = fs.readFileSync(filePath);
    if (
        buffer.length < 24 ||
        buffer.toString("ascii", 1, 4) !== "PNG" ||
        buffer.toString("ascii", 12, 16) !== "IHDR"
    ) {
        throw new Error("nao e PNG valido");
    }
    return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
    };
}

function validatePngSize(filePath, expected, label) {
    if (!exists(filePath)) {
        fail(`${label}: arquivo ausente ${relative(filePath)}`);
        return;
    }
    try {
        const size = pngSize(filePath);
        if (size.width !== expected.width || size.height !== expected.height) {
            fail(
                `${label}: dimensao ${size.width}x${size.height}, esperado ${expected.width}x${expected.height}`,
            );
        }
    } catch (error) {
        fail(`${label}: PNG invalido ${relative(filePath)} (${error.message})`);
    }
}

const catalog = readJson(catalogPath);
if (!catalog) process.exit(1);

if (catalog.schemaVersion !== 2) {
    fail("asset-catalog.json deve usar schemaVersion 2");
}
if (JSON.stringify(catalog.renderOrder) !== JSON.stringify(renderOrder)) {
    fail("asset-catalog.json possui renderOrder diferente do contrato v2");
}
for (const race of requiredRaces) {
    if (!catalog.races?.includes(race)) {
        fail(`catalogo nao declara raca obrigatoria ${race}`);
    }
}
for (const layer of requiredLayers) {
    if (!catalog.requiredLayers?.includes(layer)) {
        fail(`catalogo nao declara camada obrigatoria ${layer}`);
    }
}

const characterFrameSize = catalog.characterFrameSize ?? { width: 192, height: 192 };
for (const race of requiredRaces) {
    const raceDir = path.join(assetRoot, "characters", race);
    const manifestPath = path.join(raceDir, "manifest.json");
    const anchorsPath = path.join(raceDir, "anchors.json");
    const manifest = readJson(manifestPath);
    const anchors = readJson(anchorsPath);
    if (!manifest || !anchors) continue;

    if (manifest.schemaVersion !== 2) fail(`${race}: manifest deve usar schemaVersion 2`);
    if (manifest.raceId !== race) fail(`${race}: raceId inconsistente`);
    if (manifest.anchors !== "anchors.json") fail(`${race}: anchors deve apontar para anchors.json`);
    if (JSON.stringify(manifest.layers) !== JSON.stringify(renderOrder)) {
        fail(`${race}: layers deve seguir renderOrder v2`);
    }

    const animationNames = Object.keys(manifest.animations ?? {});
    const expectedAnimationNames = Object.keys(canonicalAnimations);
    if (JSON.stringify(animationNames) !== JSON.stringify(expectedAnimationNames)) {
        fail(`${race}: animacoes devem ser exatamente ${expectedAnimationNames.join(", ")}`);
    }
    for (const [animation, frames] of Object.entries(canonicalAnimations)) {
        const actualFrames = manifest.animations?.[animation]?.frames ?? [];
        if (JSON.stringify(actualFrames) !== JSON.stringify(frames)) {
            fail(`${race}: frames invalidos em ${animation}`);
        }
    }

    const bodyDir = path.join(raceDir, "body");
    const bodyPngs = exists(bodyDir)
        ? fs.readdirSync(bodyDir).filter((file) => file.endsWith(".png"))
        : [];
    if (bodyPngs.length !== 33) {
        fail(`${race}: body deve possuir exatamente 33 PNGs, possui ${bodyPngs.length}`);
    }
    for (const frame of requiredFrames) {
        for (const layer of renderOrder) {
            validatePngSize(
                path.join(raceDir, layer, `${frame}.png`),
                characterFrameSize,
                `${race}/${layer}/${frame}`,
            );
        }

        const frameAnchors = anchors.anchors?.[frame];
        if (!frameAnchors) {
            fail(`${race}: anchors ausentes para ${frame}`);
            continue;
        }
        for (const point of requiredAnchors) {
            const anchor = frameAnchors[point];
            if (!anchor) {
                fail(`${race}: anchor ${point} ausente em ${frame}`);
                continue;
            }
            for (const key of ["x", "y", "r", "sx", "sy"]) {
                if (typeof anchor[key] !== "number") {
                    fail(`${race}: anchor ${point}.${key} invalido em ${frame}`);
                }
            }
        }
    }
    if (manifest.placeholder) {
        warn(`${race}: usando placeholders tecnicos v1.9.0`);
    }
}

const projectileIds = new Set((catalog.projectiles ?? []).map((entry) => entry.id));
const effectIds = new Set((catalog.effects ?? []).map((entry) => entry.id));
for (const projectile of catalog.projectiles ?? []) {
    if (!projectile.id) fail("catalogo possui projetil sem id");
    if (projectile.asset) {
        const absolute = path.join(repoRoot, "system/frontend/src", projectile.asset);
        validatePngSize(absolute, { width: 144, height: 144 }, `projectile/${projectile.id}`);
    }
}

for (const weapon of catalog.weapons ?? []) {
    const weaponDir = path.join(assetRoot, "items", "weapon", weapon.id);
    const manifest = readJson(path.join(weaponDir, "manifest.json"));
    if (!manifest) continue;
    if (manifest.schemaVersion !== 2) fail(`${weapon.id}: manifest deve usar schemaVersion 2`);
    if (manifest.itemId !== weapon.id) fail(`${weapon.id}: itemId inconsistente`);

    for (const state of weaponStates) {
        const statePath = manifest.states?.[state];
        if (statePath) {
            validatePngSize(
                path.join(weaponDir, statePath),
                catalog.itemFrameSize ?? { width: 144, height: 144 },
                `${weapon.id}/${state}`,
            );
            continue;
        }
        const fallback = manifest.fallbacks?.[state];
        if (!fallback || !manifest.states?.[fallback]) {
            fail(`${weapon.id}: ${state} ausente e sem fallback valido`);
        }
    }

    const profile = manifest.visualProfile;
    if (!profile) {
        fail(`${weapon.id}: visualProfile ausente`);
        continue;
    }
    if (!visualAnimations.includes(profile.animation)) {
        fail(`${weapon.id}: visualProfile.animation invalida`);
    }
    if (!weaponStates.includes(profile.weaponState)) {
        fail(`${weapon.id}: visualProfile.weaponState invalido`);
    }
    if (!projectileIds.has(profile.projectile)) {
        fail(`${weapon.id}: projectile referenciado nao existe no catalogo: ${profile.projectile}`);
    }
    for (const effect of profile.effects ?? []) {
        if (!effectIds.has(effect)) {
            fail(`${weapon.id}: effect referenciado nao existe no catalogo: ${effect}`);
        }
    }
    if (manifest.placeholder) {
        warn(`${weapon.id}: usando placeholders tecnicos de arma`);
    }
}

if (warnings.length) {
    console.warn("Avisos:");
    for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
    console.error("Erros:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
}

console.log("Rune Wars asset validation passed.");
