import Phaser from 'phaser';
import { BASE_WIDTH, BASE_HEIGHT, TILE_SIZE, ENABLE_SCENE_SWITCHER } from '../game/constants';
import { InputMapper } from '../systems/InputMapper';
import { AdManager } from '../systems/AdManager';
import { Player } from '../entities/Player';
import { SceneSwitcher } from '../systems/SceneSwitcher';

/**
 * SideScrollerScene - Side-scrolling level with parallax backgrounds
 */
export class SideScrollerScene extends Phaser.Scene {
  private inputMapper!: InputMapper;
  private adManager!: AdManager;
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  
  // Parallax layers
  private parallaxLayers: Phaser.GameObjects.TileSprite[] = [];
  private readonly LEVEL_WIDTH = BASE_WIDTH * 4; // 4 screens wide

  constructor() {
    super({ key: 'SideScrollerScene' });
  }

  create(): void {
    console.log('SideScrollerScene: Starting side-scrolling level...');

    // Get systems from registry
    this.inputMapper = this.registry.get('inputMapper') as InputMapper;
    this.adManager = this.registry.get('adManager') as AdManager;

    // Set the scene for InputMapper
    this.inputMapper.setScene(this);

    // Notify ad platform that gameplay started
    this.adManager.gameplayStart();

    // Create parallax background layers
    this.createParallaxLayers();

    // Create platforms for side-scrolling
    this.createPlatforms();

    // Create player
    this.createPlayer();

    // Set up camera to follow player with bounds
    this.cameras.main.setBounds(0, 0, this.LEVEL_WIDTH, BASE_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    
    // Set world bounds for physics
    this.physics.world.setBounds(0, 0, this.LEVEL_WIDTH, BASE_HEIGHT);

    // Add instructions
    const instructionsText = this.add.text(10, 10, 'Side-Scroller Level - Explore!', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 4 },
    });
    instructionsText.setScrollFactor(0);

    // Add scene switcher for development
    new SceneSwitcher(this, ENABLE_SCENE_SWITCHER);

    console.log('SideScrollerScene: Level ready');
  }

  private createParallaxLayers(): void {
    // Create multiple parallax layers with different scroll speeds
    // Layer 0: Far background (slowest)
    const layer0 = this.add.tileSprite(0, 0, this.LEVEL_WIDTH, BASE_HEIGHT, '');
    layer0.setOrigin(0, 0);
    layer0.setTint(0x1a1a2e); // Dark blue
    layer0.setScrollFactor(0.1);
    this.parallaxLayers.push(layer0);

    // Layer 1: Mountains/Hills
    const layer1 = this.add.tileSprite(0, BASE_HEIGHT - 150, this.LEVEL_WIDTH, 150, '');
    layer1.setOrigin(0, 0);
    layer1.setTint(0x16213e); // Slightly lighter blue
    layer1.setScrollFactor(0.3);
    this.parallaxLayers.push(layer1);

    // Layer 2: Mid background
    const layer2 = this.add.tileSprite(0, BASE_HEIGHT - 120, this.LEVEL_WIDTH, 120, '');
    layer2.setOrigin(0, 0);
    layer2.setTint(0x0f3460); // Medium blue
    layer2.setScrollFactor(0.5);
    this.parallaxLayers.push(layer2);

    // Layer 3: Foreground elements
    const layer3 = this.add.tileSprite(0, BASE_HEIGHT - 80, this.LEVEL_WIDTH, 80, '');
    layer3.setOrigin(0, 0);
    layer3.setTint(0x533483); // Purple-ish
    layer3.setScrollFactor(0.7);
    this.parallaxLayers.push(layer3);

    // Add visual elements to layers (simple patterns)
    this.drawLayerPatterns();
  }

  private drawLayerPatterns(): void {
    // Create simple patterns for each layer using graphics
    // This is a placeholder - you'd normally use actual sprite assets
    
    // Add some "stars" to the far background
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, this.LEVEL_WIDTH),
        Phaser.Math.Between(0, BASE_HEIGHT - 200),
        1,
        0xffffff,
        0.8
      );
      star.setScrollFactor(0.1);
    }

    // Add some "clouds" to middle layers
    for (let i = 0; i < 20; i++) {
      const cloud = this.add.ellipse(
        Phaser.Math.Between(0, this.LEVEL_WIDTH),
        Phaser.Math.Between(50, 150),
        Phaser.Math.Between(40, 80),
        Phaser.Math.Between(20, 40),
        0xcccccc,
        0.3
      );
      cloud.setScrollFactor(Phaser.Math.FloatBetween(0.3, 0.6));
    }
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();

    // Create ground platform along the entire level
    const groundY = BASE_HEIGHT - TILE_SIZE;
    for (let x = 0; x < this.LEVEL_WIDTH; x += TILE_SIZE) {
      const platform = this.add.rectangle(
        x + TILE_SIZE / 2,
        groundY + TILE_SIZE / 2,
        TILE_SIZE,
        TILE_SIZE,
        0x4a7c59
      );
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    }

    // Create varied floating platforms throughout the level
    // Section 1: Rising platforms
    this.createPlatform(100, BASE_HEIGHT - 80, 6);
    this.createPlatform(200, BASE_HEIGHT - 120, 4);
    this.createPlatform(300, BASE_HEIGHT - 160, 3);
    
    // Section 2: Gap with platforms to jump
    this.createPlatform(450, BASE_HEIGHT - 100, 3);
    this.createPlatform(550, BASE_HEIGHT - 120, 3);
    
    // Section 3: Descending platforms
    this.createPlatform(700, BASE_HEIGHT - 160, 4);
    this.createPlatform(850, BASE_HEIGHT - 120, 5);
    this.createPlatform(1000, BASE_HEIGHT - 80, 6);
    
    // Section 4: Varied heights
    this.createPlatform(1200, BASE_HEIGHT - 140, 3);
    this.createPlatform(1350, BASE_HEIGHT - 100, 4);
    this.createPlatform(1500, BASE_HEIGHT - 180, 3);
    
    // Section 5: Wide platforms
    this.createPlatform(1700, BASE_HEIGHT - 120, 8);
    this.createPlatform(1900, BASE_HEIGHT - 80, 10);
    
    // Section 6: Challenge section with small platforms
    this.createPlatform(2150, BASE_HEIGHT - 100, 2);
    this.createPlatform(2250, BASE_HEIGHT - 140, 2);
    this.createPlatform(2350, BASE_HEIGHT - 100, 2);
    this.createPlatform(2450, BASE_HEIGHT - 160, 3);
  }

  private createPlatform(x: number, y: number, width: number): void {
    for (let i = 0; i < width; i++) {
      const px = x + i * TILE_SIZE;
      const platform = this.add.rectangle(
        px + TILE_SIZE / 2,
        y + TILE_SIZE / 2,
        TILE_SIZE,
        TILE_SIZE,
        0x6b8e23
      );
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    }
  }

  private createPlayer(): void {
    // Spawn player at the start of the level
    const spawnX = BASE_WIDTH / 4;
    const spawnY = BASE_HEIGHT / 2;

    this.player = new Player(this, spawnX, spawnY, this.inputMapper);

    // Set up collision with platforms
    this.physics.add.collider(this.player, this.platforms);
    
    // Keep player within world bounds
    this.player.setCollideWorldBounds(true);
  }

  update(time: number, delta: number): void {
    // Update input mapper
    this.inputMapper.update();

    // Update player
    this.player.update(time, delta);

    // Update parallax effect based on camera position
    this.updateParallax();
  }

  private updateParallax(): void {
    const camera = this.cameras.main;
    
    // Update each parallax layer based on camera scroll
    this.parallaxLayers.forEach((layer) => {
      const scrollSpeed = layer.scrollFactorX;
      layer.tilePositionX = camera.scrollX * scrollSpeed;
    });
  }
}
