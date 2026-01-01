/**
 * Asset processing script
 * Processes raw assets into production-ready formats
 * - Runs TexturePacker CLI for sprite atlases
 * - Transcodes audio with FFmpeg (WAV -> WebM + MP3)
 * - Exports Tiled maps to JSON
 */

import { execSync } from 'child_process';
import { readdirSync, existsSync, mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🎨 Processing assets...');

// Ensure output directories exist
const distGraphics = join(projectRoot, 'assets/dist/graphics');
const distAudio = join(projectRoot, 'assets/dist/audio');
const distMaps = join(projectRoot, 'assets/dist/maps');

[distGraphics, distAudio, distMaps].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

/**
 * Check if a command exists
 */
function commandExists(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Process graphics with TexturePacker
 */
function processGraphics() {
  console.log('\n📦 Processing graphics...');

  const rawGraphicsDir = join(projectRoot, 'assets/raw/graphics');
  if (!existsSync(rawGraphicsDir)) {
    console.log('   ⚠️  No raw graphics directory found');
    return;
  }

  const folders = readdirSync(rawGraphicsDir).filter(name => {
    const path = join(rawGraphicsDir, name);
    return statSync(path).isDirectory();
  });

  if (folders.length === 0) {
    console.log('   ⚠️  No graphics folders found');
    return;
  }

  // Check if TexturePacker is available
  const hasTexturePacker = commandExists('TexturePacker');

  if (!hasTexturePacker) {
    console.log('   ⚠️  TexturePacker not found in PATH');
    console.log('   💡 Download from: https://www.codeandweb.com/texturepacker');
    console.log('   💡 Alternative: Manually create atlases or use spritesheet-js');
    return;
  }

  folders.forEach(folder => {
    const inputDir = join(rawGraphicsDir, folder);
    const outputName = folder;
    const outputData = join(distGraphics, `${outputName}.json`);
    const outputImage = join(distGraphics, `${outputName}.png`);

    try {
      console.log(`   ✓ Processing ${folder}...`);
      execSync(
        `TexturePacker "${inputDir}" ` +
        `--format phaser3 ` +
        `--data "${outputData}" ` +
        `--sheet "${outputImage}" ` +
        `--trim-sprite-names ` +
        `--algorithm MaxRects ` +
        `--padding 2 ` +
        `--extrude 1 ` +
        `--disable-rotation ` +
        `--max-size 4096`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      console.error(`   ✗ Failed to process ${folder}:`, error.message);
    }
  });
}

/**
 * Process audio with FFmpeg
 */
function processAudio() {
  console.log('\n🎵 Processing audio...');

  const rawAudioDir = join(projectRoot, 'assets/raw/audio');
  if (!existsSync(rawAudioDir)) {
    console.log('   ⚠️  No raw audio directory found');
    return;
  }

  // Check if FFmpeg is available
  const hasFFmpeg = commandExists('ffmpeg');

  if (!hasFFmpeg) {
    console.log('   ⚠️  FFmpeg not found in PATH');
    console.log('   💡 Download from: https://ffmpeg.org/download.html');
    console.log('   💡 Make sure to install version with libopus support');
    return;
  }

  // For now, just log that audio processing would happen here
  // In a real implementation, we'd scan for WAV files and transcode them
  console.log('   💡 Audio processing not yet implemented');
  console.log('   💡 Would transcode WAV files to WebM (Opus) + MP3');
}

/**
 * Process Tiled maps
 */
function processMaps() {
  console.log('\n🗺️  Processing maps...');

  const rawMapsDir = join(projectRoot, 'assets/raw/maps');
  if (!existsSync(rawMapsDir)) {
    console.log('   ⚠️  No raw maps directory found');
    return;
  }

  // Maps are already in JSON format (hand-coded)
  // Just copy them to dist (or validate them)
  console.log('   💡 Map processing not yet needed (using hand-coded JSON)');
}

/**
 * Main processing function
 */
function main() {
  const startTime = Date.now();

  processGraphics();
  processAudio();
  processMaps();

  // Generate manifest and types
  console.log('\n📝 Generating manifest and types...');
  try {
    execSync('node tools/generate-manifest.js', { stdio: 'inherit' });
    execSync('node tools/generate-types.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to generate manifest/types:', error.message);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨ Asset processing complete in ${elapsed}s\n`);
}

main();
