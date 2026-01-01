/**
 * Generate asset manifest from dist directory
 * Scans assets/dist and creates manifest.json with all asset paths
 */

import { readdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const distDir = join(projectRoot, 'assets/dist');

console.log('📝 Generating asset manifest...');

const manifest = {
  bundles: {
    mainMenu: [],
    level1: []
  },
  atlases: {},
  audio: {},
  maps: {}
};

/**
 * Scan graphics directory for atlases
 */
function scanGraphics() {
  const graphicsDir = join(distDir, 'graphics');
  if (!existsSync(graphicsDir)) {
    return;
  }

  const files = readdirSync(graphicsDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  jsonFiles.forEach(file => {
    const name = basename(file, '.json');
    const pngFile = files.find(f => f === `${name}.png`);

    if (pngFile) {
      manifest.atlases[name] = {
        json: `/assets/dist/graphics/${file}`,
        png: `/assets/dist/graphics/${pngFile}`
      };

      // Add to appropriate bundle
      if (name === 'ui') {
        manifest.bundles.mainMenu.push(`atlases.${name}`);
      } else {
        manifest.bundles.level1.push(`atlases.${name}`);
      }

      console.log(`   ✓ Found atlas: ${name}`);
    }
  });
}

/**
 * Scan audio directory
 */
function scanAudio() {
  const audioDir = join(distDir, 'audio');
  if (!existsSync(audioDir)) {
    return;
  }

  const files = readdirSync(audioDir);

  files.forEach(file => {
    const ext = extname(file);
    const name = basename(file, ext);

    if (ext === '.webm' || ext === '.mp3') {
      if (!manifest.audio[name]) {
        manifest.audio[name] = {};
      }
      manifest.audio[name][ext.slice(1)] = `/assets/dist/audio/${file}`;
      console.log(`   ✓ Found audio: ${file}`);
    }
  });
}

/**
 * Scan maps directory
 */
function scanMaps() {
  const mapsDir = join(distDir, 'maps');
  if (!existsSync(mapsDir)) {
    return;
  }

  const files = readdirSync(mapsDir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    const name = basename(file, '.json');
    manifest.maps[name] = `/assets/dist/maps/${file}`;
    manifest.bundles.level1.push(`maps.${name}`);
    console.log(`   ✓ Found map: ${name}`);
  });
}

/**
 * Main function
 */
function main() {
  // Ensure dist directory exists
  if (!existsSync(distDir)) {
    console.log('   ⚠️  No dist directory found, creating...');
    return;
  }

  scanGraphics();
  scanAudio();
  scanMaps();

  // Write manifest
  const manifestPath = join(distDir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\n✨ Manifest generated at: ${manifestPath}`);
  console.log(`   - Atlases: ${Object.keys(manifest.atlases).length}`);
  console.log(`   - Audio: ${Object.keys(manifest.audio).length}`);
  console.log(`   - Maps: ${Object.keys(manifest.maps).length}`);
}

main();
