// tools/analyze-spawns.mjs
// Analisa terrain PNGs dos 5 mapas PVP e sugere 12 spawn points por mapa.
// Uso: node tools/analyze-spawns.mjs (a partir da raiz do projeto)
// Não requer dependências externas — usa apenas Node.js built-ins (fs, zlib).

import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const MAPS = [
  { id: 'plains',        folder: 'plains' },
  { id: 'mystic_castle', folder: 'mystic-castle' },
  { id: 'deep_mines',    folder: 'deep-mines' },
  { id: 'arcane_ruins',  folder: 'arcane-ruins' },
  { id: 'runic_forest',  folder: 'runic-forest' },
];

const ALPHA_THRESHOLD = 127;
const MIN_FLAT_RUN    = 40;   // px de largura mínima do segmento de superfície
const MIN_CLEARANCE   = 80;   // px de espaço livre acima do spawn
const FLAT_TOLERANCE  = 5;    // variação máxima de Y dentro de um segmento "plano"
const N_SPAWNS        = 12;

// ── Pure-JS PNG decoder ──────────────────────────────────────────────────────

function readUint32BE(buf, offset) {
  return ((buf[offset] << 24) | (buf[offset + 1] << 16) | (buf[offset + 2] << 8) | buf[offset + 3]) >>> 0;
}

function decodePNG(buf) {
  const sig = buf.slice(0, 8).toString('hex');
  if (sig !== '89504e470d0a1a0a') throw new Error('Not a valid PNG file');

  let pos = 8;
  let ihdr = null;
  const idatParts = [];

  while (pos < buf.length) {
    const length = readUint32BE(buf, pos);
    const type   = buf.slice(pos + 4, pos + 8).toString('ascii');
    const data   = buf.slice(pos + 8, pos + 8 + length);
    pos += 12 + length;

    if (type === 'IHDR') {
      ihdr = {
        width:     readUint32BE(data, 0),
        height:    readUint32BE(data, 4),
        bitDepth:  data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === 'IDAT') {
      idatParts.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (!ihdr) throw new Error('No IHDR chunk found');
  if (ihdr.interlace !== 0) throw new Error('Interlaced PNG not supported');
  if (ihdr.bitDepth !== 8)  throw new Error(`Bit depth ${ihdr.bitDepth} not supported (need 8)`);

  const compressed = Buffer.concat(idatParts);
  const raw        = inflateSync(compressed);

  const { width, height, colorType } = ihdr;
  let bytesPerPixel;
  if      (colorType === 6) bytesPerPixel = 4; // RGBA
  else if (colorType === 2) bytesPerPixel = 3; // RGB
  else if (colorType === 4) bytesPerPixel = 2; // grayscale+alpha
  else if (colorType === 0) bytesPerPixel = 1; // grayscale
  else throw new Error(`Color type ${colorType} not supported`);

  const stride = width * bytesPerPixel;
  const rgba   = new Uint8ClampedArray(width * height * 4);
  let rawPos   = 0;
  const prevRow = new Uint8Array(stride);
  const currRow = new Uint8Array(stride);

  for (let y = 0; y < height; y++) {
    const filter  = raw[rawPos++];
    const rowData = raw.slice(rawPos, rawPos + stride);
    rawPos += stride;

    for (let i = 0; i < stride; i++) {
      const a = i >= bytesPerPixel ? currRow[i - bytesPerPixel] : 0;
      const b = prevRow[i];
      const c = i >= bytesPerPixel ? prevRow[i - bytesPerPixel] : 0;
      let val;
      switch (filter) {
        case 0: val = rowData[i]; break;
        case 1: val = (rowData[i] + a) & 0xff; break;
        case 2: val = (rowData[i] + b) & 0xff; break;
        case 3: val = (rowData[i] + Math.floor((a + b) / 2)) & 0xff; break;
        case 4: {
          const pa = Math.abs(b - c);
          const pb = Math.abs(a - c);
          const pc = Math.abs(a + b - 2 * c);
          val = (rowData[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
          break;
        }
        default: throw new Error(`Unknown filter type ${filter}`);
      }
      currRow[i] = val;
    }
    prevRow.set(currRow);

    const baseOut = y * width * 4;
    for (let x = 0; x < width; x++) {
      const src = x * bytesPerPixel;
      const dst = baseOut + x * 4;
      rgba[dst]     = currRow[src];
      rgba[dst + 1] = colorType >= 2 ? currRow[src + 1] : currRow[src];
      rgba[dst + 2] = colorType >= 2 && colorType !== 4 ? currRow[src + 2] : currRow[src];
      rgba[dst + 3] = (colorType === 6) ? currRow[src + 3]
                    : (colorType === 4) ? currRow[src + 1]
                    : 255; // RGB or grayscale: fully opaque
    }
  }

  return { width, height, data: rgba };
}

// ── Spawn point analysis ─────────────────────────────────────────────────────

function analyzeMap(folder) {
  const pngPath = join(PROJECT_ROOT, 'system/frontend/src/assets/maps', folder, 'terrain.png');
  const buf = readFileSync(pngPath);
  const { width, height, data } = decodePNG(buf);

  const alpha = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
    return data[(y * width + x) * 4 + 3];
  };
  const isSolid = (x, y) => alpha(x, y) > ALPHA_THRESHOLD;

  // Step 1: For each column x, find the topmost solid pixel (= surface y for that column).
  //         Skip columns with no terrain.
  const surfaceY = new Int32Array(width).fill(-1);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (isSolid(x, y)) {
        surfaceY[x] = y;
        break;
      }
    }
  }

  // Step 2: Build segments of consecutive columns where:
  //   - surface exists (surfaceY[x] >= 0)
  //   - the surface Y varies no more than FLAT_TOLERANCE px within the segment
  //   - there is MIN_CLEARANCE px of clear space above the surface
  //
  // Strategy: scan left-to-right; whenever a column satisfies the clearance criterion,
  // try to extend a segment as long as Y stays "flat".

  const candidates = []; // { x, y } — midpoint of each valid segment

  let segStart = -1;
  let segBaseY = -1;

  const hasVerticalClearance = (x, sy) => {
    // Check MIN_CLEARANCE rows above the surface pixel
    for (let dy = 1; dy <= MIN_CLEARANCE; dy++) {
      if (isSolid(x, sy - dy)) return false;
    }
    return true;
  };

  for (let x = 20; x < width - 20; x++) {
    const sy = surfaceY[x];

    if (sy < MIN_CLEARANCE) {
      // No terrain or terrain too close to top — close any open segment
      if (segStart >= 0 && x - segStart >= MIN_FLAT_RUN) {
        const midX = Math.floor((segStart + x) / 2);
        const midY = surfaceY[midX] >= 0 ? surfaceY[midX] : segBaseY;
        candidates.push({ x: midX, y: midY });
      }
      segStart = -1;
      segBaseY = -1;
      continue;
    }

    // Check if Y is within tolerance of segment baseline
    if (segStart < 0) {
      // Start a new segment only if this column has clearance
      if (hasVerticalClearance(x, sy)) {
        segStart = x;
        segBaseY = sy;
      }
    } else {
      const yDiff = Math.abs(sy - segBaseY);
      if (yDiff > FLAT_TOLERANCE) {
        // End current segment
        if (x - segStart >= MIN_FLAT_RUN) {
          const midX = Math.floor((segStart + x) / 2);
          const midY = surfaceY[midX] >= 0 ? surfaceY[midX] : segBaseY;
          if (hasVerticalClearance(midX, midY)) {
            candidates.push({ x: midX, y: midY });
          }
        }
        // Start a new segment from this column if it has clearance
        if (hasVerticalClearance(x, sy)) {
          segStart = x;
          segBaseY = sy;
        } else {
          segStart = -1;
          segBaseY = -1;
        }
      }
      // else: segment continues
    }
  }
  // Close final segment
  if (segStart >= 0 && (width - 20) - segStart >= MIN_FLAT_RUN) {
    const midX = Math.floor((segStart + width - 20) / 2);
    const midY = surfaceY[midX] >= 0 ? surfaceY[midX] : segBaseY;
    if (hasVerticalClearance(midX, midY)) {
      candidates.push({ x: midX, y: midY });
    }
  }

  // Step 3: If we still have very few candidates, fall back to a simpler column-based approach:
  //   divide width into N_SPAWNS zones, pick the best surface point in each zone.
  if (candidates.length < N_SPAWNS) {
    const zoneWidth = Math.floor((width - 40) / N_SPAWNS);
    for (let i = 0; i < N_SPAWNS; i++) {
      const zoneStart = 20 + i * zoneWidth;
      const zoneEnd   = zoneStart + zoneWidth;
      // Find all valid surface columns in this zone
      let bestX = -1;
      let bestClearance = -1;
      for (let x = zoneStart; x < zoneEnd; x++) {
        const sy = surfaceY[x];
        if (sy < MIN_CLEARANCE) continue;
        // Measure actual clearance (pixels above that are empty)
        let clearance = 0;
        for (let dy = 1; sy - dy >= 0 && clearance < MIN_CLEARANCE * 2; dy++) {
          if (isSolid(x, sy - dy)) break;
          clearance = dy;
        }
        if (clearance >= MIN_CLEARANCE && clearance > bestClearance) {
          bestClearance = clearance;
          bestX = x;
        }
      }
      if (bestX >= 0) {
        const sy = surfaceY[bestX];
        // Avoid duplicating a candidate that's already very close
        if (!candidates.some(c => Math.abs(c.x - bestX) < 40)) {
          candidates.push({ x: bestX, y: sy });
        }
      }
    }
  }

  if (candidates.length === 0) {
    throw new Error(`No valid spawn candidates found for map: ${folder}`);
  }

  // Step 4: Distribute N_SPAWNS candidates well across the map width.
  candidates.sort((a, b) => a.x - b.x);

  const selected = [];
  const step = width / N_SPAWNS;

  for (let i = 0; i < N_SPAWNS; i++) {
    const targetX = step * i + step / 2;
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let j = 0; j < candidates.length; j++) {
      if (selected.some(s => Math.abs(s.x - candidates[j].x) < 60)) continue;
      const dist = Math.abs(candidates[j].x - targetX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = j;
      }
    }
    if (bestIdx >= 0) selected.push(candidates[bestIdx]);
  }

  // Relax the 60px constraint if we didn't get enough
  if (selected.length < N_SPAWNS) {
    for (let i = 0; i < N_SPAWNS && selected.length < N_SPAWNS; i++) {
      const targetX = step * i + step / 2;
      let bestIdx = -1;
      let bestDist = Infinity;
      for (let j = 0; j < candidates.length; j++) {
        if (selected.includes(candidates[j])) continue;
        const dist = Math.abs(candidates[j].x - targetX);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = j;
        }
      }
      if (bestIdx >= 0) selected.push(candidates[bestIdx]);
    }
  }

  // Sort final selection by x for clean output
  selected.sort((a, b) => a.x - b.x);

  return selected.slice(0, N_SPAWNS).map(s => ({ x: s.x, y: s.y }));
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('=== Rune Wars — Spawn Point Analyzer ===\n');

const results = {};

for (const map of MAPS) {
  process.stdout.write(`Analisando ${map.id} (${map.folder}/terrain.png)... `);
  try {
    const spawns = analyzeMap(map.folder);
    results[map.id] = spawns;
    console.log(`${spawns.length} pontos encontrados.`);
    console.log(`\n// ${map.id}`);
    console.log(JSON.stringify({ spawnPoints: spawns }, null, 2));
    console.log();
  } catch (err) {
    console.error(`ERRO: ${err.message}`);
    process.exit(1);
  }
}

console.log('=== Análise concluída ===');
console.log(`Total de spawn points: ${Object.values(results).reduce((s, v) => s + v.length, 0)} (${MAPS.length} mapas × ${N_SPAWNS} = ${MAPS.length * N_SPAWNS} esperados)`);
