
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const TILE_SIZE = 16;
const MARGIN = 1;
const SPACING = 2;
const COLS = 4;
const ROWS = 4;

const OUTPUT_PATH = join(projectRoot, 'public/assets/promenade-tileset.png');
const JSON_OUTPUT_PATH = join(projectRoot, 'public/assets/promenade-tileset.json');

// Colors
const COLOR_CONCRETE_LIGHT = { r: 220, g: 220, b: 230 };
const COLOR_CONCRETE_DARK = { r: 180, g: 180, b: 190 };
const COLOR_HIGHLIGHT = { r: 240, g: 240, b: 250 };
const COLOR_SHADOW = { r: 140, g: 140, b: 150 };

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

function setPixel(png, x, y, r, g, b, a) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = a;
}

// Draw a single tile based on bitmask
// Mask: North=1, West=2, East=4, South=8
function drawTile(png, tileX, tileY, mask) {
  const startX = MARGIN + tileX * (TILE_SIZE + SPACING);
  const startY = MARGIN + tileY * (TILE_SIZE + SPACING);

  // Check neighbors based on mask
  const hasN = (mask & 1) !== 0;
  const hasW = (mask & 2) !== 0;
  const hasE = (mask & 4) !== 0;
  const hasS = (mask & 8) !== 0;

  for (let py = 0; py < TILE_SIZE; py++) {
    for (let px = 0; px < TILE_SIZE; px++) {
      // Base color with noise
      const noise = (Math.random() - 0.5) * 10;
      let r = COLOR_CONCRETE_LIGHT.r + noise;
      let g = COLOR_CONCRETE_LIGHT.g + noise;
      let b = COLOR_CONCRETE_LIGHT.b + noise;

      // Distance from edges
      const distN = py;
      const distS = TILE_SIZE - 1 - py;
      const distW = px;
      const distE = TILE_SIZE - 1 - px;

      let darken = 0;
      let highlight = 0;

      // Borders (if no neighbor)
      if (!hasN && distN < 2) highlight += (2 - distN) * 40;
      if (!hasS && distS < 2) darken += (2 - distS) * 60;
      if (!hasW && distW < 2) highlight += (2 - distW) * 20; // Side highlight
      if (!hasE && distE < 2) darken += (2 - distE) * 40;   // Side shadow

      // Corners (visual polish)
      if (!hasN && !hasW && px < 2 && py < 2) highlight += 30;
      if (!hasS && !hasE && px > 13 && py > 13) darken += 30;

      // Apply lighting
      r = Math.min(255, Math.max(0, r + highlight - darken));
      g = Math.min(255, Math.max(0, g + highlight - darken));
      b = Math.min(255, Math.max(0, b + highlight - darken));

      // Draw main pixel
      setPixel(png, startX + px, startY + py, r, g, b, 255);
    }
  }

  // Extrusion (Bleed edges into margin/spacing)
  // Top edge
  for (let px = 0; px < TILE_SIZE; px++) copyPixel(png, startX + px, startY, startX + px, startY - 1);
  // Bottom edge
  for (let px = 0; px < TILE_SIZE; px++) copyPixel(png, startX + px, startY + TILE_SIZE - 1, startX + px, startY + TILE_SIZE);
  // Left edge
  for (let py = 0; py < TILE_SIZE; py++) copyPixel(png, startX, startY + py, startX - 1, startY + py);
  // Right edge
  for (let py = 0; py < TILE_SIZE; py++) copyPixel(png, startX + TILE_SIZE - 1, startY + py, startX + TILE_SIZE, startY + py);
  
  // Corners extrusion
  copyPixel(png, startX, startY, startX - 1, startY - 1);
  copyPixel(png, startX + TILE_SIZE - 1, startY, startX + TILE_SIZE, startY - 1);
  copyPixel(png, startX, startY + TILE_SIZE - 1, startX - 1, startY + TILE_SIZE);
  copyPixel(png, startX + TILE_SIZE - 1, startY + TILE_SIZE - 1, startX + TILE_SIZE, startY + TILE_SIZE);
}

function copyPixel(png, srcX, srcY, destX, destY) {
  if (srcX < 0 || srcX >= png.width || srcY < 0 || srcY >= png.height) return;
  if (destX < 0 || destX >= png.width || destY < 0 || destY >= png.height) return;
  const srcIdx = (png.width * srcY + srcX) << 2;
  const destIdx = (png.width * destY + destX) << 2;
  png.data[destIdx] = png.data[srcIdx];
  png.data[destIdx + 1] = png.data[srcIdx + 1];
  png.data[destIdx + 2] = png.data[srcIdx + 2];
  png.data[destIdx + 3] = png.data[srcIdx + 3];
}

console.log('🏗️ Generating extruded tileset...');

const imgWidth = MARGIN + COLS * (TILE_SIZE + SPACING) - SPACING + MARGIN;
const imgHeight = MARGIN + ROWS * (TILE_SIZE + SPACING) - SPACING + MARGIN;
const png = new PNG({ width: imgWidth, height: imgHeight });

// Clear to transparent
for (let i = 0; i < png.data.length; i++) png.data[i] = 0;

// Standard 16-tile bitmask layout (0-15)
// Row 0: 0, 1, 2, 3
// Row 1: 4, 5, 6, 7
// ...
const metadata = {
  tileset_data: {
    tile_size: { width: TILE_SIZE, height: TILE_SIZE },
    tiles: []
  }
};

for (let i = 0; i < 16; i++) {
  const col = i % 4;
  const row = Math.floor(i / 4);
  
  drawTile(png, col, row, i);

  // Add metadata for the manager (simplified)
  metadata.tileset_data.tiles.push({
    id: i,
    mask: i, // We'll use this direct mapping
    bounding_box: {
      x: MARGIN + col * (TILE_SIZE + SPACING),
      y: MARGIN + row * (TILE_SIZE + SPACING),
      width: TILE_SIZE,
      height: TILE_SIZE
    }
  });
}

png.pack().pipe(createWriteStream(OUTPUT_PATH));
createWriteStream(JSON_OUTPUT_PATH).write(JSON.stringify(metadata, null, 2));

console.log(`✅ Tileset generated at ${OUTPUT_PATH}`);
console.log(`✅ Metadata generated at ${JSON_OUTPUT_PATH}`);
