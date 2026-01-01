/**
 * Create placeholder PWA icons
 * Generates simple 192x192 and 512x512 PNG icons
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const iconsDir = join(projectRoot, 'public/icons');

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Creating placeholder PWA icons...');

// Simple 192x192 green square icon (base64 PNG)
const icon192 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAAElBMVEUAAAAAAP8A/wD/AAAAAP' +
  '//////R4SyxAAAAXRSTlMAQObYZgAAACJJREFUeNrtwYEAAAAAw6D5Ux/hAlUBAAAAAAAAAAAA' +
  'AAAAAHwajhAAAcDhZkIAAAAASUVORK5CYII=',
  'base64'
);

// Simple 512x512 green square icon (base64 PNG)
const icon512 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAElBMVEUAAAAAAP8A/wD/AAAA' +
  'AP//////R4SyxAAAAXRSTlMAQObYZgAAACRJREFUeNrtwYEAAAAAw6D5U1/gCFUBAAAAAAAAAAAA' +
  'AAAAAADgZTJAAAF79LWaAAAAAElFTkSuQmCC',
  'base64'
);

// Write icons
writeFileSync(join(iconsDir, 'icon-192.png'), icon192);
writeFileSync(join(iconsDir, 'icon-512.png'), icon512);

// Create favicon
writeFileSync(join(projectRoot, 'public/favicon.ico'), icon192);

console.log('✨ PWA icons created!');
console.log('   - icon-192.png');
console.log('   - icon-512.png');
console.log('   - favicon.ico');
