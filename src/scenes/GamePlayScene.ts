import Phaser from 'phaser';
import { BASE_WIDTH, BASE_HEIGHT, TILE_SIZE } from '../game/constants';
import { InputMapper } from '../systems/InputMapper';
import { AudioManager } from '../systems/AudioManager';
import { AdManager } from '../systems/AdManager';
import { Player } from '../entities/Player';

/**
 * GamePlayScene - Main gameplay scene
 */
export class GamePlayScene extends Phaser.Scene {
  private inputMapper!: InputMapper;
  private audioManager!: AudioManager;
  private adManager!: AdManager;
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: 'GamePlayScene' });
  }

  create(): void {
    console.log('GamePlayScene: Starting level...');

    // Get systems from registry
    this.inputMapper = this.registry.get('inputMapper') as InputMapper;
    this.audioManager = this.registry.get('audioManager') as AudioManager;
    this.adManager = this.registry.get('adManager') as AdManager;

    // IMPORTANT: Set the scene so InputMapper listens to THIS scene's keyboard
    this.inputMapper.setScene(this);

    // Notify ad platform that gameplay started
    this.adManager.gameplayStart();

    // Create background
    this.cameras.main.setBackgroundColor('#87CEEB'); // Sky blue

    // Create platforms (temporary until Tiled map is loaded)
    this.createPlatforms();

    // Create player
    this.createPlayer();

    // Set up camera to follow player
    this.cameras.main.setBounds(0, 0, BASE_WIDTH, BASE_HEIGHT);
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);

    // Add instructions
    const instructionsText = this.add.text(10, 10, 'Arrow Keys/WASD/Space to Move & Jump', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 4, y: 4 },
    });
    instructionsText.setScrollFactor(0);

    console.log('GamePlayScene: Level ready');
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();

    // Create ground platform
    const groundY = BASE_HEIGHT - TILE_SIZE;
    for (let x = 0; x < BASE_WIDTH; x += TILE_SIZE) {
      const platform = this.add.rectangle(x + TILE_SIZE / 2, groundY + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE, 0x654321);
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    }

    // Create some floating platforms
    this.createPlatform(BASE_WIDTH / 4, BASE_HEIGHT - 100, 4);
    this.createPlatform(BASE_WIDTH / 2, BASE_HEIGHT - 150, 5);
    this.createPlatform(BASE_WIDTH * 3 / 4, BASE_HEIGHT - 100, 4);
  }

  private createPlatform(x: number, y: number, width: number): void {
    for (let i = 0; i < width; i++) {
      const px = x + i * TILE_SIZE;
      const platform = this.add.rectangle(px + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE, 0x654321);
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    }
  }

  private createPlayer(): void {
    // Spawn player at the center top of the screen
    const spawnX = BASE_WIDTH / 2;
    const spawnY = BASE_HEIGHT / 2;

    this.player = new Player(this, spawnX, spawnY, this.inputMapper);

    // Set up collision with platforms
    this.physics.add.collider(this.player, this.platforms);
  }

  update(time: number, delta: number): void {
    // Update input mapper
    this.inputMapper.update();

    // Update player
    this.player.update(time, delta);
  }
}
