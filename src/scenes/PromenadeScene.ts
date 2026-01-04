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
 * PromenadeScene - Sea Point Promenade, Cape Town inspired oceanfront level
 * Features the famous Cape Town coastal walkway with ocean views
 */
export class PromenadeScene extends Phaser.Scene {
  private inputMapper!: InputMapper;
  private adManager!: AdManager;
  private weaponManager!: WeaponManager;
  private statusEffectManager!: StatusEffectManager;
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private tilemapManager!: TilemapManager;

  // Level configuration
  private readonly LEVEL_WIDTH = BASE_WIDTH * 3; // 3 screens wide

  constructor() {
    super({ key: 'PromenadeScene' });
  }

  create(): void {
    console.log('PromenadeScene: Starting Sea Point Promenade level...');

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

    // Create parallax background layers (ocean theme)
    this.createParallaxLayers();

    // Create promenade platforms
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

    console.log('PromenadeScene: Level ready - Welcome to Sea Point!');
  }

  private createParallaxLayers(): void {
    // Create Cape Town parallax layers with tiling

    // Layer 0: Golden hour Cape Town sky (tiled, slowest scroll)
    const skyTile = this.add.tileSprite(0, 0, this.LEVEL_WIDTH, BASE_HEIGHT, 'parallax-sky');
    skyTile.setOrigin(0, 0);
    skyTile.setScrollFactor(0);
    skyTile.setDepth(-4);

    // Layer 1: Lion's Head mountain silhouette
    const mountainTile = this.add.tileSprite(0, BASE_HEIGHT - 250, this.LEVEL_WIDTH, 250, 'parallax-mountains');
    mountainTile.setOrigin(0, 0);
    mountainTile.setScrollFactor(0.2);
    mountainTile.setDepth(-3);
    mountainTile.setAlpha(1.0); // Ensure full opacity

    // Layer 2: Beach Road buildings
    const buildingsTile = this.add.tileSprite(0, BASE_HEIGHT - 150, this.LEVEL_WIDTH, 150, 'parallax-mid');
    buildingsTile.setOrigin(0, 0);
    buildingsTile.setScrollFactor(0.4);
    buildingsTile.setDepth(-2);

    // Layer 3: Promenade railing (foreground)
    const railingTile = this.add.tileSprite(0, BASE_HEIGHT - 100, this.LEVEL_WIDTH, 100, 'parallax-foreground');
    railingTile.setOrigin(0, 0);
    railingTile.setScrollFactor(0.6);
    railingTile.setDepth(-1);
  }

  private createPlatforms(): void {
    // Load tileset metadata
    const metadata = this.cache.json.get('promenade-metadata');

    // Calculate grid dimensions
    const gridWidth = Math.ceil(this.LEVEL_WIDTH / TILE_SIZE);
    const gridHeight = Math.ceil(BASE_HEIGHT / TILE_SIZE);

    // Create tilemap manager
    this.tilemapManager = new TilemapManager(
      this,
      'promenade-tileset',
      metadata,
      gridWidth,
      gridHeight
    );

    // Convert pixel coordinates to grid coordinates for promenade ground
    const promenadeGridY = Math.floor((BASE_HEIGHT - TILE_SIZE) / TILE_SIZE);

    // Create promenade walkway along the entire level (like the actual Sea Point Promenade)
    for (let gridX = 0; gridX < gridWidth; gridX++) {
      this.tilemapManager.setTile(gridX, promenadeGridY, 1);
    }

    // Add some elevated viewing platforms along the promenade
    // Section 1: Starting viewpoint
    this.createTilemapPlatform(200, BASE_HEIGHT - 80, 8);

    // Section 2: Mid promenade seating area
    this.createTilemapPlatform(500, BASE_HEIGHT - 64, 12);
    this.createTilemapPlatform(520, BASE_HEIGHT - 96, 8);

    // Section 3: Ocean viewing deck
    this.createTilemapPlatform(900, BASE_HEIGHT - 80, 10);
    this.createTilemapPlatform(920, BASE_HEIGHT - 112, 6);

    // Section 4: Exercise area platforms
    this.createTilemapPlatform(1300, BASE_HEIGHT - 64, 6);
    this.createTilemapPlatform(1400, BASE_HEIGHT - 96, 4);

    // Section 5: Another viewpoint
    this.createTilemapPlatform(1700, BASE_HEIGHT - 80, 10);

    // Section 6: Long stretch with occasional raised sections
    this.createTilemapPlatform(2100, BASE_HEIGHT - 64, 8);
    this.createTilemapPlatform(2400, BASE_HEIGHT - 80, 12);
    this.createTilemapPlatform(2700, BASE_HEIGHT - 64, 6);

    // Section 7: End of promenade with multiple levels
    this.createTilemapPlatform(3000, BASE_HEIGHT - 64, 8);
    this.createTilemapPlatform(3020, BASE_HEIGHT - 96, 6);
    this.createTilemapPlatform(3040, BASE_HEIGHT - 128, 4);

    // Render the tilemap
    this.tilemapManager.render();

    // Create physics bodies for collision
    this.platforms = this.tilemapManager.createPhysicsBodies(this.physics);

    // Add promenade furniture and decorations
    this.addPromenadeObjects();
  }

  private createTilemapPlatform(x: number, y: number, width: number): void {
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);
    this.tilemapManager.createPlatform(gridX, gridY, width);
  }

  private addPromenadeObjects(): void {
    // Add street lamps along the promenade
    this.addPlatformObject('street-lamp', 300, BASE_HEIGHT - TILE_SIZE);
    this.addPlatformObject('street-lamp', 700, BASE_HEIGHT - TILE_SIZE);
    this.addPlatformObject('street-lamp', 1100, BASE_HEIGHT - TILE_SIZE);
    this.addPlatformObject('street-lamp', 1500, BASE_HEIGHT - TILE_SIZE);

    // Add exercise equipment (Sea Point outdoor gym culture)
    this.addPlatformObject('gym-equipment', 450, BASE_HEIGHT - TILE_SIZE);
    this.addPlatformObject('gym-equipment', 1250, BASE_HEIGHT - TILE_SIZE);

    // Add trash bins (corporate sterilised look)
    this.addPlatformObject('trash-bin', 550, BASE_HEIGHT - TILE_SIZE);
    this.addPlatformObject('trash-bin', 950, BASE_HEIGHT - TILE_SIZE);
    this.addPlatformObject('trash-bin', 1350, BASE_HEIGHT - TILE_SIZE);
    this.addPlatformObject('trash-bin', 1700, BASE_HEIGHT - TILE_SIZE);
  }

  private addPlatformObject(texture: string, x: number, y: number): void {
    const sprite = this.physics.add.staticImage(x, y, texture);
    sprite.setOrigin(0, 1); // Bottom-left origin for easier placement
    sprite.setScale(1); // Use original size
    this.platforms.add(sprite);
  }

  private createPlayer(): void {
    // Spawn player at the start of the promenade
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
  }
}
