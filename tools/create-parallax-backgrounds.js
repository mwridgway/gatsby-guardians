/**
 * Create parallax background images
 * Generates simple gradient PNG files for parallax layers
 */

import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🎨 Creating parallax background images...');

// Create a gradient PNG using pngjs with noise
function createGradientPNG(width, height, color1, color2, noiseAmount = 20) {
  const png = new PNG({ width, height });
  
  for (let y = 0; y < height; y++) {
    const ratio = y / height;
    const r = Math.floor(color1.r + (color2.r - color1.r) * ratio);
    const g = Math.floor(color1.g + (color2.g - color1.g) * ratio);
    const b = Math.floor(color1.b + (color2.b - color1.b) * ratio);
    
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      
      // Add random noise to make parallax effect more visible
      const noise = (Math.random() - 0.5) * noiseAmount;
      
      png.data[idx] = Math.max(0, Math.min(255, r + noise));
      png.data[idx + 1] = Math.max(0, Math.min(255, g + noise));
      png.data[idx + 2] = Math.max(0, Math.min(255, b + noise));
      png.data[idx + 3] = 255; // Alpha
    }
  }
  
  return png;
}

// Ensure output directory exists
const assetsDir = join(projectRoot, 'public/assets');
if (!existsSync(assetsDir)) {
  mkdirSync(assetsDir, { recursive: true });
}

// Create parallax backgrounds
console.log('   ✓ Creating parallax-sky.png (blue gradient with noise)...');
const skyPNG = createGradientPNG(
  800, 600,
  { r: 135, g: 206, b: 250 }, // Light sky blue
  { r: 70, g: 130, b: 180 },  // Steel blue
  15 // Light noise for sky
);
skyPNG.pack().pipe(createWriteStream(join(assetsDir, 'parallax-sky.png')));

console.log('   ✓ Creating parallax-mountains.png (purple gradient with noise)...');
const mountainsPNG = createGradientPNG(
  800, 150,
  { r: 100, g: 100, b: 140 }, // Dark purple-gray
  { r: 80, g: 80, b: 120 },   // Darker purple-gray
  25 // More noise for mountains
);
mountainsPNG.pack().pipe(createWriteStream(join(assetsDir, 'parallax-mountains.png')));

console.log('   ✓ Creating parallax-mid.png (green gradient with noise)...');
const midPNG = createGradientPNG(
  800, 120,
  { r: 60, g: 120, b: 60 },  // Dark green
  { r: 40, g: 100, b: 40 },  // Darker green
  30 // More noise for mid layer
);
midPNG.pack().pipe(createWriteStream(join(assetsDir, 'parallax-mid.png')));

console.log('   ✓ Creating parallax-foreground.png (darker green with noise)...');
const foregroundPNG = createGradientPNG(
  800, 80,
  { r: 40, g: 80, b: 40 },   // Very dark green
  { r: 30, g: 60, b: 30 },   // Even darker green
  35 // Most noise for foreground
);
foregroundPNG.pack().pipe(createWriteStream(join(assetsDir, 'parallax-foreground.png')));

console.log('\n✨ Parallax background images created!');
console.log('   - Sky: 800x600 (blue gradient with noise)');
console.log('   - Mountains: 800x150 (purple gradient with noise)');
console.log('   - Mid: 800x120 (green gradient with noise)');
console.log('   - Foreground: 800x80 (dark green with noise)');
console.log('\n💡 These are simple gradient placeholders. Replace with proper artwork later.');
