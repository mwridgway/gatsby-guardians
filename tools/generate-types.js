/**
 * Generate TypeScript type definitions from asset manifest
 * Creates type-safe asset keys for autocomplete in IDE
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const manifestPath = join(projectRoot, 'assets/dist/manifest.json');
const typesPath = join(projectRoot, 'src/types/assets.d.ts');

console.log('📝 Generating asset type definitions...');

function main() {
  // Check if manifest exists
  if (!existsSync(manifestPath)) {
    console.log('   ⚠️  No manifest found, skipping type generation');
    console.log('   💡 Run process-assets first to generate manifest');

    // Create placeholder types file
    const placeholderTypes = `/**
 * Asset type definitions (auto-generated)
 * Run 'npm run process:assets' to generate this file
 */

export type AtlasKey = string;
export type AudioKey = string;
export type MapKey = string;
export type BundleKey = string;
`;

    writeFileSync(typesPath, placeholderTypes);
    console.log('   ✓ Created placeholder types file');
    return;
  }

  // Read manifest
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  // Extract keys
  const atlasKeys = Object.keys(manifest.atlases || {});
  const audioKeys = Object.keys(manifest.audio || {});
  const mapKeys = Object.keys(manifest.maps || {});
  const bundleKeys = Object.keys(manifest.bundles || {});

  // Generate type definitions
  const types = `/**
 * Asset type definitions (auto-generated)
 * DO NOT EDIT MANUALLY - run 'npm run process:assets' to regenerate
 */

// Atlas keys
export type AtlasKey = ${atlasKeys.length > 0 ? atlasKeys.map(k => `'${k}'`).join(' | ') : 'string'};

// Audio keys
export type AudioKey = ${audioKeys.length > 0 ? audioKeys.map(k => `'${k}'`).join(' | ') : 'string'};

// Map keys
export type MapKey = ${mapKeys.length > 0 ? mapKeys.map(k => `'${k}'`).join(' | ') : 'string'};

// Bundle keys
export type BundleKey = ${bundleKeys.length > 0 ? bundleKeys.map(k => `'${k}'`).join(' | ') : 'string'};

// Manifest interface
export interface AssetManifest {
  bundles: {
    [key in BundleKey]: string[];
  };
  atlases: {
    [key in AtlasKey]: {
      json: string;
      png: string;
    };
  };
  audio: {
    [key in AudioKey]: {
      webm?: string;
      mp3?: string;
    };
  };
  maps: {
    [key in MapKey]: string;
  };
}
`;

  writeFileSync(typesPath, types);

  console.log(`\\n✨ Type definitions generated at: ${typesPath}`);
  console.log(`   - Atlas types: ${atlasKeys.length}`);
  console.log(`   - Audio types: ${audioKeys.length}`);
  console.log(`   - Map types: ${mapKeys.length}`);
  console.log(`   - Bundle types: ${bundleKeys.length}`);
}

main();
