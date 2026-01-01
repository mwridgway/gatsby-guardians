/**
 * Watch asset files for changes and trigger processing
 * Monitors assets/raw directory and runs process-assets when files change
 */

import chokidar from 'chokidar';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const watchDir = join(projectRoot, 'assets/raw');

console.log('👀 Watching assets for changes...');
console.log(`   Watching: ${watchDir}`);

let processing = false;
let pendingProcess = false;

/**
 * Process assets
 */
function processAssets() {
  if (processing) {
    pendingProcess = true;
    return;
  }

  processing = true;
  console.log('\n🔄 Change detected, processing assets...');

  try {
    execSync('node tools/process-assets.js', {
      stdio: 'inherit',
      cwd: projectRoot
    });

    console.log('✅ Processing complete\n');
  } catch (error) {
    console.error('❌ Processing failed:', error.message);
  } finally {
    processing = false;

    // If another change happened during processing, process again
    if (pendingProcess) {
      pendingProcess = false;
      setTimeout(() => processAssets(), 1000);
    }
  }
}

// Watch for file changes
const watcher = chokidar.watch(watchDir, {
  ignored: /(^|[\\/\\\\])\\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('add', path => {
    console.log(`File added: ${path}`);
    processAssets();
  })
  .on('change', path => {
    console.log(`File changed: ${path}`);
    processAssets();
  })
  .on('unlink', path => {
    console.log(`File removed: ${path}`);
    processAssets();
  });

console.log('✨ Watcher ready! Edit files in assets/raw to trigger processing.\n');

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Stopping watcher...');
  watcher.close();
  process.exit(0);
});
