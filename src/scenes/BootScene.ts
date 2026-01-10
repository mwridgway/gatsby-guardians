import Phaser from 'phaser';
import * as pako from 'pako';
import { InputMapper } from '../systems/InputMapper';
import { AudioManager } from '../systems/AudioManager';
import { AdManager } from '../systems/AdManager';
import { FullscreenManager } from '../systems/FullscreenManager';

// Expose pako globally for Phaser to use for zlib decompression of Tiled maps
(window as unknown as { pako: typeof pako }).pako = pako;

/**
 * BootScene - Initialize core systems
 * No asset loading happens here
 */
export class BootScene extends Phaser.Scene {
  private inputMapper!: InputMapper;
  private audioManager!: AudioManager;
  private adManager!: AdManager;
  private fullscreenManager!: FullscreenManager;

  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    console.log('BootScene: Initializing systems...');

    // Initialize core systems
    this.inputMapper = new InputMapper(this);
    this.audioManager = new AudioManager();
    this.adManager = new AdManager();
    this.fullscreenManager = new FullscreenManager(this);

    // Store systems globally for access from other scenes
    this.registry.set('inputMapper', this.inputMapper);
    this.registry.set('audioManager', this.audioManager);
    this.registry.set('adManager', this.adManager);
    this.registry.set('fullscreenManager', this.fullscreenManager);

    // Initialize ad platform
    this.adManager.init().then(() => {
      this.adManager.gameLoadingStart();
    });

    console.log('BootScene: Systems initialized');

    // Transition to PreloadScene
    this.scene.start('PreloadScene');
  }
}
