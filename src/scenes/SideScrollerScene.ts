import Phaser from 'phaser';
import { BASE_WIDTH, BASE_HEIGHT, TILE_SIZE, ENABLE_SCENE_SWITCHER } from '../game/constants';
import { InputMapper } from '../systems/InputMapper';
import { AdManager } from '../systems/AdManager';
import { Player } from '../entities/Player';
import { SceneSwitcher } from '../systems/SceneSwitcher';
import { WeaponManager } from '../systems/WeaponManager';
import { StatusEffectManager } from '../systems/StatusEffectManager';
import { TilemapManager } from '../systems/TilemapManager';

/**
 * SideScrollerScene - Side-scrolling level with parallax backgrounds
 */
export class SideScrollerScene extends Phaser.Scene {
  private inputMapper!: InputMapper;
  private adManager!: AdManager;
  private weaponManager!: WeaponManager;
  private statusEffectManager!: StatusEffectManager;
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private tilemapManager!: TilemapManager;

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

    // Initialize scene-specific systems
    this.weaponManager = new WeaponManager(this);
    this.statusEffectManager = new StatusEffectManager(this);
    this.registry.set('weaponManager', this.weaponManager);
    this.registry.set('statusEffectManager', this.statusEffectManager);

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

    // Add scene switcher for development
    new SceneSwitcher(this, ENABLE_SCENE_SWITCHER);

    console.log('SideScrollerScene: Level ready');
  }

  private createParallaxLayers(): void {
    // Create multiple parallax layers with different scroll speeds
    // Layer 0: Far background (slowest)
    const layer0 = this.add.tileSprite(0, 0, this.LEVEL_WIDTH, BASE_HEIGHT, 'parallax-sky');
    layer0.setOrigin(0, 0);
    layer0.setScrollFactor(0.1);
    this.parallaxLayers.push(layer0);

    // Layer 1: Mountains/Hills
    const layer1 = this.add.tileSprite(0, BASE_HEIGHT - 150, this.LEVEL_WIDTH, 150, 'parallax-mountains');
    layer1.setOrigin(0, 0);
    layer1.setScrollFactor(0.3);
    this.parallaxLayers.push(layer1);

    // Layer 2: Mid background
    const layer2 = this.add.tileSprite(0, BASE_HEIGHT - 120, this.LEVEL_WIDTH, 120, 'parallax-mid');
    layer2.setOrigin(0, 0);
    layer2.setScrollFactor(0.5);
    this.parallaxLayers.push(layer2);

    // Layer 3: Foreground elements
    const layer3 = this.add.tileSprite(0, BASE_HEIGHT - 80, this.LEVEL_WIDTH, 80, 'parallax-foreground');
    layer3.setOrigin(0, 0);
    layer3.setScrollFactor(0.7);
    this.parallaxLayers.push(layer3);
  }

  private createPlatforms(): void {
    // Load tileset metadata
    const metadata = this.cache.json.get('granite-concrete-metadata');

    // Calculate grid dimensions
    const gridWidth = Math.ceil(this.LEVEL_WIDTH / TILE_SIZE);
    const gridHeight = Math.ceil(BASE_HEIGHT / TILE_SIZE);

    // Create tilemap manager
    this.tilemapManager = new TilemapManager(
      this,
      'granite-concrete-tileset',
      metadata,
      gridWidth,
      gridHeight
    );

    // Convert pixel coordinates to grid coordinates for ground
    const groundGridY = Math.floor((BASE_HEIGHT - TILE_SIZE) / TILE_SIZE);

    // Create ground platform along the entire level
    for (let gridX = 0; gridX < gridWidth; gridX++) {
      this.tilemapManager.setTile(gridX, groundGridY, 1);
    }

    // Create varied floating platforms throughout the level
    // Section 1: Rising platforms
    this.createTilemapPlatform(100, BASE_HEIGHT - 80, 6);
    this.createTilemapPlatform(200, BASE_HEIGHT - 120, 4);
    this.createTilemapPlatform(300, BASE_HEIGHT - 160, 3);

    // Section 2: Gap with platforms to jump
    this.createTilemapPlatform(450, BASE_HEIGHT - 100, 3);
    this.createTilemapPlatform(550, BASE_HEIGHT - 120, 3);

    // Section 3: Descending platforms
    this.createTilemapPlatform(700, BASE_HEIGHT - 160, 4);
    this.createTilemapPlatform(850, BASE_HEIGHT - 120, 5);
    this.createTilemapPlatform(1000, BASE_HEIGHT - 80, 6);

    // Section 4: Varied heights
    this.createTilemapPlatform(1200, BASE_HEIGHT - 140, 3);
    this.createTilemapPlatform(1350, BASE_HEIGHT - 100, 4);
    this.createTilemapPlatform(1500, BASE_HEIGHT - 180, 3);

    // Section 5: Wide platforms
    this.createTilemapPlatform(1700, BASE_HEIGHT - 120, 8);
    this.createTilemapPlatform(1900, BASE_HEIGHT - 80, 10);

    // Section 6: Challenge section with small platforms
    this.createTilemapPlatform(2150, BASE_HEIGHT - 100, 2);
    this.createTilemapPlatform(2250, BASE_HEIGHT - 140, 2);
    this.createTilemapPlatform(2350, BASE_HEIGHT - 100, 2);
    this.createTilemapPlatform(2450, BASE_HEIGHT - 160, 3);

    // Render the tilemap
    this.tilemapManager.render();

    // Create physics bodies for collision
    this.platforms = this.tilemapManager.createPhysicsBodies(this.physics);

    // Add concrete walls and park benches as decorative platforms (after platforms group is created)
    this.addPlatformObjects();
  }

  private createTilemapPlatform(x: number, y: number, width: number): void {
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);
    this.tilemapManager.createPlatform(gridX, gridY, width);
  }

  private addPlatformObjects(): void {
    // Add concrete walls as low barriers
    this.addPlatformObject('concrete-wall', 600, BASE_HEIGHT - 100);
    this.addPlatformObject('concrete-wall', 1100, BASE_HEIGHT - 140);
    this.addPlatformObject('concrete-wall', 1600, BASE_HEIGHT - 80);

    // Add park benches as decorative platforms
    this.addPlatformObject('park-bench', 400, BASE_HEIGHT - TILE_SIZE - 32);
    this.addPlatformObject('park-bench', 1400, BASE_HEIGHT - 120 - 32);
    this.addPlatformObject('park-bench', 2000, BASE_HEIGHT - TILE_SIZE - 32);
  }

  private addPlatformObject(texture: string, x: number, y: number): void {
    const sprite = this.physics.add.staticImage(x, y, texture);
    sprite.setOrigin(0, 1); // Bottom-left origin for easier placement
    this.platforms.add(sprite);
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
