/**
 * Create placeholder pixel art assets
 * Generates simple 16x16 PNG files for player and tileset
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🎨 Creating placeholder pixel art assets...');

// Simple 16x16 green square for player (base64 PNG)
const playerIdlePNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAP0lEQVR42mNgGAX/gf' +
  'g/EP+H4v9QDD6AqgFdDboYXA26GnQ1MNWgq0FXA1MNuhp0NTDVoKtBV0M0A0bBKAAAy' +
  'uYMAjsJ3lsAAAAASUVORK5CYII=',
  'base64'
);

const playerRun1PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQUlEQVR42mNgGAX/gf' +
  'g/EP+H4v9QDD6AqgFdDboYXA26GnQ1MNWgq0FXA1MNuhp0NTDVoKtBVwPTgFEwCgYOA' +
  'AAtkDMJVeDPLQAAAABJRU5ErkJggg==',
  'base64'
);

const groundTilePNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAP0lEQVR42mNgGAXDGP' +
  'yH4v9Q/B+KwQdQNaCrQReDq0FXg64Gphp0NehqYKpBV4OuBqYadDXoaojmwCgYBQAAy' +
  'eIMwE3JwmgAAAAASUVORK5CYII=',
  'base64'
);

// Create directories
const playerDir = join(projectRoot, 'assets/raw/graphics/player');
const tilesetDir = join(projectRoot, 'assets/raw/graphics/tileset');

[playerDir, tilesetDir].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Write player sprites
console.log('   ✓ Creating player sprites...');
writeFileSync(join(playerDir, 'idle.png'), playerIdlePNG);
writeFileSync(join(playerDir, 'run_1.png'), playerRun1PNG);
writeFileSync(join(playerDir, 'run_2.png'), playerIdlePNG);
writeFileSync(join(playerDir, 'run_3.png'), playerRun1PNG);
writeFileSync(join(playerDir, 'run_4.png'), playerIdlePNG);
writeFileSync(join(playerDir, 'jump.png'), playerRun1PNG);
writeFileSync(join(playerDir, 'fall.png'), playerIdlePNG);

// Write tileset tiles
console.log('   ✓ Creating tileset tiles...');
writeFileSync(join(tilesetDir, 'ground_left.png'), groundTilePNG);
writeFileSync(join(tilesetDir, 'ground_mid.png'), groundTilePNG);
writeFileSync(join(tilesetDir, 'ground_right.png'), groundTilePNG);
writeFileSync(join(tilesetDir, 'block.png'), groundTilePNG);
writeFileSync(join(tilesetDir, 'sky.png'), playerIdlePNG);

console.log('\n✨ Placeholder assets created!');
console.log('   - Player frames: 7');
console.log('   - Tileset tiles: 5');
console.log('\n💡 Run "npm run process:assets" to generate atlases');
