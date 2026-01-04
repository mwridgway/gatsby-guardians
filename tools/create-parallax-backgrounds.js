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

// Create mountain silhouette with transparent sky
function createMountainsPNG(width, height) {
  const png = new PNG({ width, height });

  // Mountain colors
  const mountainColor = { r: 100, g: 100, b: 140 }; // Purple-gray
  const mountainDark = { r: 80, g: 80, b: 120 };     // Darker purple-gray

  // Generate multiple mountain peaks using sine waves
  const peaks = [
    { offset: 0, amplitude: 0.6, frequency: 1.5 },
    { offset: width * 0.3, amplitude: 0.8, frequency: 2 },
    { offset: width * 0.6, amplitude: 0.7, frequency: 1.8 }
  ];

  for (let x = 0; x < width; x++) {
    // Calculate mountain height at this x position
    let maxHeight = 0;
    peaks.forEach(peak => {
      const relX = (x - peak.offset) / width;
      const h = Math.sin(relX * Math.PI * peak.frequency) * peak.amplitude;
      maxHeight = Math.max(maxHeight, h);
    });

    // Convert to pixel height (0 to height)
    const mountainHeight = Math.floor(maxHeight * height);

    for (let y = 0; y < height; y++) {
      const idx = (width * y + x) << 2;

      // If we're above the mountain line, make it transparent
      if (y < height - mountainHeight) {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0; // Fully transparent
      } else {
        // Below mountain line - draw mountain with gradient and noise
        const ratio = (y - (height - mountainHeight)) / mountainHeight;
        const r = Math.floor(mountainColor.r + (mountainDark.r - mountainColor.r) * ratio);
        const g = Math.floor(mountainColor.g + (mountainDark.g - mountainColor.g) * ratio);
        const b = Math.floor(mountainColor.b + (mountainDark.b - mountainColor.b) * ratio);

        // Add noise
        const noise = (Math.random() - 0.5) * 25;

        png.data[idx] = Math.max(0, Math.min(255, r + noise));
        png.data[idx + 1] = Math.max(0, Math.min(255, g + noise));
        png.data[idx + 2] = Math.max(0, Math.min(255, b + noise));
        png.data[idx + 3] = 255; // Fully opaque
      }
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

console.log('   ✓ Creating parallax-mountains.png (mountain silhouette with transparent sky)...');
const mountainsPNG = createMountainsPNG(800, 250);
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
console.log('   - Mountains: 800x250 (mountain silhouette with transparent sky)');
console.log('   - Mid: 800x120 (green gradient with noise)');
console.log('   - Foreground: 800x80 (dark green with noise)');
console.log('\n💡 These are simple gradient placeholders. Replace with proper artwork later.');
