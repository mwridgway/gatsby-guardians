import Phaser from 'phaser';
import { BASE_WIDTH, BASE_HEIGHT } from '../game/constants';
import { AdManager } from '../systems/AdManager';

/**
 * PreloadScene - Load assets and show progress
 */
export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingScreen();

    // Set up event listeners
    this.load.on('progress', this.onProgress, this);
    this.load.on('complete', this.onComplete, this);

    // Try to load manifest (will fail if assets haven't been processed yet)
    // For now, we'll skip manifest loading and just proceed
    // this.load.json('manifest', 'assets/dist/manifest.json');

    // Load UI input prompts spritesheet
    // Tile size: 16x16, spacing: 1px between tiles
    this.load.spritesheet('input-prompts', 'assets/input-prompts.png', {
      frameWidth: 16,
      frameHeight: 16,
      spacing: 1,
      margin: 0,
    });

    // Load parallax background layers for side-scrolling scene
    this.load.image('parallax-sky', 'assets/parallax-sky.png');
    this.load.image('parallax-mountains', 'assets/parallax-mountains.png');
    this.load.image('parallax-mid', 'assets/parallax-mid.png');
    this.load.image('parallax-foreground', 'assets/parallax-foreground.png');

    // Load sidescroller tileset
    this.load.image('granite-concrete-tileset', 'assets/granite-concrete-tileset.png');
    this.load.json('granite-concrete-metadata', 'assets/granite-concrete-tileset.json');

    // Load platform objects
    this.load.image('concrete-wall', 'assets/concrete-wall.png');
    this.load.image('park-bench', 'assets/park-bench.png');

    // Load placeholder assets (will be added after asset pipeline is set up)
    // For now, just create some simple graphics
  }

  private createLoadingScreen(): void {
    const width = BASE_WIDTH;
    const height = BASE_HEIGHT;

    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    });
    this.loadingText.setOrigin(0.5);

    // Percent text
    this.percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    });
    this.percentText.setOrigin(0.5);

    // Progress bar background
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 2 - 160, height / 2 + 20, 320, 30);

    // Progress bar
    this.progressBar = this.add.graphics();
  }

  private onProgress(value: number): void {
    // Update percent text
    this.percentText.setText(Math.floor(value * 100) + '%');

    // Update progress bar
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRect(BASE_WIDTH / 2 - 155, BASE_HEIGHT / 2 + 25, 310 * value, 20);
  }

  private onComplete(): void {
    // Clean up loading screen
    this.progressBar.destroy();
    this.progressBox.destroy();
    this.loadingText.destroy();
    this.percentText.destroy();

    // Notify ad platform that loading is finished
    const adManager = this.registry.get('adManager') as AdManager;
    if (adManager) {
      adManager.gameLoadingFinished();
    }

    console.log('PreloadScene: Assets loaded');

    // Transition to MainMenu after a brief delay
    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
