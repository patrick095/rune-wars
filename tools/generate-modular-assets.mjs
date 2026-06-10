import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';

const ROOT = process.cwd();
const SOURCE_ROOT = join(ROOT, 'system/frontend/src/assets');
const OUT_ROOT = join(SOURCE_ROOT, 'rune-wars');
const SCALE = 3;

const RENDER_ORDER = ['back', 'base', 'armor', 'face', 'hair', 'helmet', 'weapon', 'effect'];
const CHARACTER_STATES = ['idle', 'battle'];
const CHARACTER_LAYER_SIZE = 64 * SCALE;
const ITEM_SIZE = 48 * SCALE;
const MATERIAL_SIZE = 32 * SCALE;

const characters = [
  { id: 'human', name: 'Humano', race: 'human' },
  { id: 'dwarf', name: 'Anao', race: 'dwarf' },
  { id: 'elf', name: 'Elfo', race: 'elf' },
];

const battleWeapons = [
  { id: 'cannon', name: 'Canhao Runico', color: [224, 120, 32] },
  { id: 'longbow', name: 'Arco Longo Elfico', color: [74, 144, 217] },
  { id: 'tnt', name: 'TNT Alquimico', color: [224, 80, 32] },
  { id: 'boomerang', name: 'Bumerangue Arcano', color: [155, 48, 255] },
  { id: 'ice-book', name: 'Grimorio de Gelo', color: [120, 220, 255] },
  { id: 'potion', name: 'Pocao Explosiva', color: [204, 34, 34] },
];

const equipment = [
  { id: 'sword_iron', name: 'Espada de Ferro', slot: 'weapon', visualLayer: 'weapon' },
  { id: 'sword_steel', name: 'Espada de Aco', slot: 'weapon', visualLayer: 'weapon' },
  { id: 'bow_wood', name: 'Arco de Madeira', slot: 'weapon', visualLayer: 'weapon' },
  { id: 'staff_runic', name: 'Cajado Runico', slot: 'weapon', visualLayer: 'weapon' },
  { id: 'armor_leather', name: 'Armadura de Couro', slot: 'armor', visualLayer: 'armor' },
  { id: 'helmet_iron', name: 'Elmo de Ferro', slot: 'helmet', visualLayer: 'helmet' },
  { id: 'boots_swift', name: 'Botas Velozes', slot: 'boots' },
  { id: 'ring_luck', name: 'Anel da Sorte', slot: 'ring' },
  { id: 'necklace_vitality', name: 'Colar da Vitalidade', slot: 'necklace' },
  { id: 'bracelet_strength', name: 'Bracelete da Forca', slot: 'gloves', legacySlot: 'bracelet' },
];

const secondaryItems = [
  { id: 'shield', name: 'Escudo', visualLayer: 'back' },
  { id: 'healing-book', name: 'Livro de Cura' },
  { id: 'camouflage-orb', name: 'Orbe de Camuflagem' },
  { id: 'protection-totem', name: 'Totem de Protecao' },
  { id: 'runic-builder', name: 'Construtor Runico' },
];

const consumables = [
  { id: 'teleport', name: 'Teleporte' },
  { id: 'heal', name: 'Cura Rapida' },
  { id: 'ice-throw', name: 'Lancamento de Gelo' },
  { id: 'invisibility', name: 'Invisibilidade' },
  { id: 'calibration-shot', name: 'Tiro de Calibracao' },
];

const materials = [
  { id: 'iron_ore', name: 'Minerio de Ferro' },
  { id: 'steel_bar', name: 'Barra de Aco' },
  { id: 'hardwood', name: 'Madeira Nobre' },
  { id: 'fiber', name: 'Fibra' },
  { id: 'rune_crystal', name: 'Cristal Runico' },
  { id: 'leather', name: 'Couro' },
  { id: 'agility_crystal', name: 'Cristal de Agilidade' },
  { id: 'gold_nugget', name: 'Pepita de Ouro' },
  { id: 'luck_gem', name: 'Gema da Sorte' },
  { id: 'life_crystal', name: 'Cristal de Vida' },
  { id: 'strength_gem', name: 'Gema de Forca' },
];

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function writeJson(path, value) {
  ensureDir(dirname(path));
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function upscalePng(source, target, size) {
  if (!existsSync(source)) {
    throw new Error(`Missing source asset: ${source}`);
  }
  ensureDir(dirname(target));
  execFileSync('sips', ['-z', String(size), String(size), source, '--out', target], { stdio: 'ignore' });
}

function copyPng(source, target) {
  if (!existsSync(source)) {
    throw new Error(`Missing source asset: ${source}`);
  }
  ensureDir(dirname(target));
  copyFileSync(source, target);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writeRgbaPng(path, width, height, draw) {
  ensureDir(dirname(path));
  const rgba = Buffer.alloc(width * height * 4);
  draw({
    width,
    height,
    blend(x, y, r, g, b, a) {
      if (x < 0 || x >= width || y < 0 || y >= height || a <= 0) return;
      const i = (Math.floor(y) * width + Math.floor(x)) * 4;
      const srcA = Math.min(255, Math.max(0, a)) / 255;
      const dstA = rgba[i + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA <= 0) return;
      rgba[i] = Math.round((r * srcA + rgba[i] * dstA * (1 - srcA)) / outA);
      rgba[i + 1] = Math.round((g * srcA + rgba[i + 1] * dstA * (1 - srcA)) / outA);
      rgba[i + 2] = Math.round((b * srcA + rgba[i + 2] * dstA * (1 - srcA)) / outA);
      rgba[i + 3] = Math.round(outA * 255);
    },
  });

  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    scanlines[rowStart] = 0;
    rgba.copy(scanlines, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  writeFileSync(path, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(scanlines)),
    chunk('IEND', Buffer.alloc(0)),
  ]));
}

function writeTransparent(path, size) {
  writeRgbaPng(path, size, size, () => {});
}

function drawCircle(api, cx, cy, radius, color, alpha) {
  const [r, g, b] = color;
  const minX = Math.floor(cx - radius);
  const maxX = Math.ceil(cx + radius);
  const minY = Math.floor(cy - radius);
  const maxY = Math.ceil(cy + radius);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= radius) {
        api.blend(x, y, r, g, b, alpha * (1 - d / radius));
      }
    }
  }
}

function writeTrail(path, color) {
  writeRgbaPng(path, ITEM_SIZE, ITEM_SIZE, (api) => {
    for (let i = 0; i < 90; i += 1) {
      const t = i / 89;
      const x = 22 + t * 100;
      const y = 98 - Math.sin(t * Math.PI) * 44;
      drawCircle(api, x, y, 18 * (1 - t) + 4, color, 150 * (1 - t) + 30);
      drawCircle(api, x, y, 7 * (1 - t) + 2, [255, 255, 255], 120 * (1 - t));
    }
  });
}

function writeImpact(path, color) {
  writeRgbaPng(path, ITEM_SIZE, ITEM_SIZE, (api) => {
    const cx = ITEM_SIZE / 2;
    const cy = ITEM_SIZE / 2;
    drawCircle(api, cx, cy, 52, color, 110);
    drawCircle(api, cx, cy, 27, [255, 255, 255], 170);
    for (let ray = 0; ray < 14; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 14;
      for (let step = 0; step < 42; step += 1) {
        const x = cx + Math.cos(angle) * step * 1.45;
        const y = cy + Math.sin(angle) * step * 1.45;
        drawCircle(api, x, y, Math.max(1, 7 - step / 7), color, Math.max(0, 170 - step * 4));
      }
    }
  });
}

function relative(path) {
  return path.replace(`${SOURCE_ROOT}/`, 'assets/');
}

function generateCharacters() {
  return characters.map((character) => {
    const characterDir = join(OUT_ROOT, 'characters', character.id);
    for (const layer of RENDER_ORDER) ensureDir(join(characterDir, layer));

    for (const state of CHARACTER_STATES) {
      const source = join(SOURCE_ROOT, 'characters', `${character.id}_${state}.png`);
      const baseTarget = join(characterDir, 'base', `${state}_0.png`);
      upscalePng(source, baseTarget, CHARACTER_LAYER_SIZE);

      for (const layer of RENDER_ORDER.filter((value) => value !== 'base')) {
        writeTransparent(join(characterDir, layer, `${state}_0.png`), CHARACTER_LAYER_SIZE);
      }
    }

    const manifest = {
      schemaVersion: 1,
      characterId: character.id,
      name: character.name,
      race: character.race,
      sourceMode: 'composite-base-with-empty-layer-fallbacks',
      scale: SCALE,
      frameSize: { width: CHARACTER_LAYER_SIZE, height: CHARACTER_LAYER_SIZE },
      availableStates: CHARACTER_STATES,
      states: Object.fromEntries(CHARACTER_STATES.map((state) => [state, { fps: 1, frames: 1 }])),
      layers: RENDER_ORDER,
      renderOrder: RENDER_ORDER,
      frames: Object.fromEntries(CHARACTER_STATES.map((state) => [
        state,
        Object.fromEntries(RENDER_ORDER.map((layer) => [
          layer,
          [`${layer}/${state}_0.png`],
        ])),
      ])),
      notes: [
        'Base layer is a 3x upscale of the current composed sprite.',
        'Non-base layers are transparent placeholders so future equipment art can replace them without changing paths.',
      ],
    };

    writeJson(join(characterDir, 'manifest.json'), manifest);
    return {
      id: character.id,
      name: character.name,
      manifest: relative(join(characterDir, 'manifest.json')),
      frameSize: manifest.frameSize,
      layers: RENDER_ORDER,
      availableStates: CHARACTER_STATES,
    };
  });
}

function generateItem({ id, name, slot, sourceCategory, visualLayer, legacySlot, size = ITEM_SIZE, sourceId = id }) {
  const itemDir = join(OUT_ROOT, 'items', slot, id);
  const source = join(SOURCE_ROOT, 'items', sourceCategory, `${sourceId}.png`);
  const icon = join(itemDir, 'icon.png');
  upscalePng(source, icon, size);

  const layerFrames = {};
  if (visualLayer) {
    const idleFrame = join(itemDir, 'idle_0.png');
    upscalePng(source, idleFrame, ITEM_SIZE);
    layerFrames.idle = ['idle_0.png'];
  }

  const manifest = {
    schemaVersion: 1,
    itemId: id,
    name,
    slot,
    legacySlot,
    visualLayer,
    icon: 'icon.png',
    iconSize: { width: size, height: size },
    animationStates: layerFrames,
    sourceMode: visualLayer ? 'icon-as-initial-layer-placeholder' : 'icon-only',
    notes: visualLayer
      ? ['Layer frame is a 3x upscale of the current icon and should be replaced by aligned character equipment art.']
      : ['This item is currently icon-only and does not render as a character layer.'],
  };

  writeJson(join(itemDir, 'manifest.json'), manifest);
  return {
    id,
    name,
    slot,
    legacySlot,
    manifest: relative(join(itemDir, 'manifest.json')),
    icon: relative(icon),
    visualLayer,
  };
}

function generateItems() {
  const itemEntries = [];

  for (const weapon of battleWeapons) {
    itemEntries.push(generateItem({
      id: weapon.id,
      name: weapon.name,
      slot: 'weapon',
      sourceCategory: 'weapons',
      visualLayer: 'weapon',
    }));

    const weaponDir = join(OUT_ROOT, 'items', 'weapon', weapon.id);
    upscalePng(
      join(SOURCE_ROOT, 'items/weapons', `${weapon.id}_sprite.png`),
      join(weaponDir, 'aim_0.png'),
      ITEM_SIZE,
    );

    const manifestPath = join(weaponDir, 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.animationStates.aim = ['aim_0.png'];
    manifest.animationStates.shoot = ['aim_0.png'];
    manifest.sourceMode = 'battle-weapon-icon-and-sprite-upscale';
    manifest.notes = [
      'Icon is a 3x upscale of the current weapon icon.',
      'Aim/shoot layer starts from the current weapon sprite and should be replaced by hand-aligned equipment frames.',
    ];
    writeJson(manifestPath, manifest);
  }

  for (const item of equipment) {
    itemEntries.push(generateItem({
      ...item,
      sourceCategory: 'equipment',
    }));
  }

  for (const item of secondaryItems) {
    itemEntries.push(generateItem({
      ...item,
      slot: 'secondary',
      sourceCategory: 'secondary',
    }));
  }

  for (const item of consumables) {
    itemEntries.push(generateItem({
      ...item,
      slot: 'consumable',
      sourceCategory: 'consumables',
    }));
  }

  for (const item of materials) {
    itemEntries.push(generateItem({
      ...item,
      slot: 'material',
      sourceCategory: 'materials',
      size: MATERIAL_SIZE,
    }));
  }

  return itemEntries;
}

function generateProjectiles() {
  return battleWeapons.map((weapon) => {
    const projectileDir = join(OUT_ROOT, 'projectiles', weapon.id);
    const projectile = join(projectileDir, 'projectile.png');
    const trail = join(projectileDir, 'trail.png');
    const impact = join(projectileDir, 'impact.png');

    upscalePng(join(SOURCE_ROOT, 'items/weapons', `${weapon.id}_sprite.png`), projectile, ITEM_SIZE);
    writeTrail(trail, weapon.color);
    writeImpact(impact, weapon.color);

    const manifest = {
      schemaVersion: 1,
      weaponId: weapon.id,
      projectileAsset: 'projectile.png',
      trailAsset: 'trail.png',
      impactAsset: 'impact.png',
      frameSize: { width: ITEM_SIZE, height: ITEM_SIZE },
      sourceMode: 'projectile-upscale-with-generated-effects',
    };

    writeJson(join(projectileDir, 'manifest.json'), manifest);
    return {
      weaponId: weapon.id,
      manifest: relative(join(projectileDir, 'manifest.json')),
      projectileAsset: relative(projectile),
      trailAsset: relative(trail),
      impactAsset: relative(impact),
    };
  });
}

function writeReadme() {
  const readme = `# Rune Wars Modular Assets

This folder is the modular 3x asset contract for characters, items, weapons, and projectile effects.

- Character frames are 192x192px.
- Weapon, equipment, secondary, and consumable icons/layers are 144x144px.
- Material icons are 96x96px.
- Character render order is: ${RENDER_ORDER.join(', ')}.
- Existing composed sprites are kept only as the initial base layer. Replace transparent layer placeholders with dedicated layer art as new assets are produced.

Regenerate with:

\`\`\`bash
node tools/generate-modular-assets.mjs
\`\`\`
`;
  writeFileSync(join(OUT_ROOT, 'README.md'), readme);
}

ensureDir(OUT_ROOT);

const catalog = {
  schemaVersion: 1,
  scale: SCALE,
  source: 'system/frontend/src/assets',
  root: 'assets/rune-wars',
  characterFrameSize: { width: CHARACTER_LAYER_SIZE, height: CHARACTER_LAYER_SIZE },
  itemFrameSize: { width: ITEM_SIZE, height: ITEM_SIZE },
  materialFrameSize: { width: MATERIAL_SIZE, height: MATERIAL_SIZE },
  renderOrder: RENDER_ORDER,
  characters: generateCharacters(),
  items: generateItems(),
  projectiles: generateProjectiles(),
};

writeJson(join(OUT_ROOT, 'asset-catalog.json'), catalog);
writeReadme();

console.log(`Generated modular Rune Wars assets in ${OUT_ROOT}`);
