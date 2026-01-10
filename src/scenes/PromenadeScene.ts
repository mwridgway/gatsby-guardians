import Phaser from 'phaser';
import { BASE_HEIGHT, ENABLE_SCENE_SWITCHER } from '../game/constants';
import { InputMapper } from '../systems/InputMapper';
import { Player } from '../entities/Player';
import { SceneSwitcher } from '../systems/SceneSwitcher';
import { WeaponManager } from '../systems/WeaponManager';
import { StatusEffectManager } from '../systems/StatusEffectManager';
import { FullscreenManager } from '../systems/FullscreenManager';

/**
 * PromenadeScene - Sea Point Promenade, Cape Town inspired oceanfront level
 * Features the famous Cape Town coastal walkway with ocean views
 * Now loaded from Tiled map: public/assets/maps/promenade.json
 */
export class PromenadeScene extends Phaser.Scene {
  private inputMapper!: InputMapper;
  private weaponManager!: WeaponManager;
  private statusEffectManager!: StatusEffectManager;
  private fullscreenManager!: FullscreenManager;
  private player!: Player;
  private platformsLayer!: Phaser.Tilemaps.TilemapLayer;

  // Tiled map
  private map!: Phaser.Tilemaps.Tilemap;
  private tileset!: Phaser.Tilemaps.Tileset;

  // Spawn point from map (loaded from JSON)
  private spawnPoint: { x: number; y: number } | null = null;

  // Level dimensions (derived from map)
  private levelWidth: number = 0;
  private levelHeight: number = 0;

  constructor() {
    super({ key: 'PromenadeScene' });
  }

  create(): void {
    console.log('PromenadeScene: Starting Sea Point Promenade level...');

    // Get systems from registry
    this.inputMapper = this.registry.get('inputMapper') as InputMapper;
    this.fullscreenManager = this.registry.get('fullscreenManager') as FullscreenManager;

    // Initialize scene-specific systems
    this.weaponManager = new WeaponManager(this);
    this.statusEffectManager = new StatusEffectManager(this);
    this.registry.set('weaponManager', this.weaponManager);
    this.registry.set('statusEffectManager', this.statusEffectManager);

    // Set the scene for InputMapper
    this.inputMapper.setScene(this);

    // Add fullscreen button
    if (this.fullscreenManager) {
      this.fullscreenManager.createFullscreenButton(this);
    }

    // Load the Tiled map
    this.loadTiledMap();

    // Create player at spawn point
    this.createPlayer();

    // Set up camera to follow player with bounds
    this.cameras.main.setBounds(0, 0, this.levelWidth, this.levelHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Set world bounds for physics
    this.physics.world.setBounds(0, 0, this.levelWidth, this.levelHeight);

    // Add scene switcher for development
    new SceneSwitcher(this, ENABLE_SCENE_SWITCHER);

    console.log(`PromenadeScene: Level ready - ${this.levelWidth}x${this.levelHeight}px`);
  }

  private loadTiledMap(): void {
    // Create the tilemap from the loaded JSON
    this.map = this.make.tilemap({ key: 'promenade-map' });

    // Store level dimensions
    this.levelWidth = this.map.widthInPixels;
    this.levelHeight = this.map.heightInPixels;

    // Add the tileset image (name must match tileset name in Tiled JSON)
    // Explicitly pass tile dimensions, margin, and spacing to match the JSON/generated tileset
    const tileset = this.map.addTilesetImage('EmbeddedPromenade', 'promenade-tileset', 16, 16, 1, 2);
    if (!tileset) {
      console.error('PromenadeScene: Failed to load tileset');
      return;
    }
    this.tileset = tileset;

    // Create tile layers directly by name (from the Tiled JSON)
    // The tilemap has: middleground, word (collision), foreground, and experiment
    const tileLayerNames = ['world', 'middleground', 'foreground'];

    for (const layerName of tileLayerNames) {
      try {
        const layer = this.map.createLayer(layerName, this.tileset);
        if (layer) {
          console.log(`PromenadeScene: Created tile layer '${layerName}'`);

          // Apply custom properties from the layer
          const layerData = this.map.getLayer(layerName);
          if (layerData?.properties) {
            const props = layerData.properties as Array<{ name: string; value: number }>;
            const depthProp = props.find(p => p.name === 'depth');
            if (depthProp) layer.setDepth(depthProp.value);

            const scrollProp = props.find(p => p.name === 'scrollFactorX');
            if (scrollProp) layer.setScrollFactor(scrollProp.value, 0);
          }

          // Enable tile-based collision on the platforms/world layer
          // 'word' is a typo in the Tiled file for 'world'
          if (layerName === 'world' || layerName === 'platforms') {
            this.platformsLayer = layer;
            // Only tiles with 'collides: true' property will be collidable
            layer.setCollisionByProperty({ collides: true });
            console.log(`PromenadeScene: Enabled tile collision on '${layerName}' layer (collides property)`);
          }
        } else {
          console.log(`PromenadeScene: Layer '${layerName}' not found in map`);
        }
      } catch (error) {
        console.error(`PromenadeScene: Error creating layer '${layerName}':`, error);
      }
    }

    console.log(`PromenadeScene: Processed tile layers`);

    // Process image layers
    this.createImageLayers();

    // Process object layer for spawn points only (collision handled by tiles)
    this.processObjectLayer();
  }

  private createImageLayers(): void {
    // Get image layers from map data
    const tilemapCache = this.cache.tilemap.get('promenade-map');
    const mapData = tilemapCache?.data;
    if (!mapData?.layers) return;

    mapData.layers.forEach((layerData: {
      type: string;
      name: string;
      image: string;
      x: number;
      y: number;
      visible?: boolean;
      repeatx?: boolean;
      properties?: Array<{ name: string; value: number }>;
    }) => {
      if (layerData.type !== 'imagelayer') return;

      // Skip if layer is not visible
      if (layerData.visible === false) {
        console.log(`PromenadeScene: Skipping hidden image layer '${layerData.name}'`);
        return;
      }

      // Get properties
      let depth = 0;
      let scrollFactorX = 1;

      if (layerData.properties) {
        const depthProp = layerData.properties.find(p => p.name === 'depth');
        if (depthProp) depth = depthProp.value;

        const scrollProp = layerData.properties.find(p => p.name === 'scrollFactorX');
        if (scrollProp) scrollFactorX = scrollProp.value;
      }

      // Determine texture key from image path
      // e.g., "assets/mountains.png" -> "mountains"
      let textureKey = 'parallax-background'; // Default fallback
      if (layerData.image) {
        // Extract filename without path and extension
        const parts = layerData.image.split(/[/\\]/); // split by / or \
        const filename = parts[parts.length - 1];
        const nameParts = filename.split('.');
        if (nameParts.length > 0) {
          textureKey = nameParts[0];
        }
      }

      console.log(`PromenadeScene: Processing image layer '${layerData.name}' with texture '${textureKey}'`);

      // Create image or tileSprite based on repeat setting
      if (layerData.repeatx) {
        const tileSprite = this.add.tileSprite(
          0,
          layerData.y || 0,
          this.levelWidth,
          BASE_HEIGHT,
          textureKey
        );
        tileSprite.setOrigin(0, 0);
        tileSprite.setScrollFactor(scrollFactorX, 0);
        tileSprite.setDepth(depth);
        console.log(`PromenadeScene: Created repeating image layer '${layerData.name}' at depth ${depth}`);
      } else {
        const image = this.add.image(layerData.x || 0, layerData.y || 0, textureKey);
        image.setOrigin(0, 0);
        image.setScrollFactor(scrollFactorX, 0);
        image.setDepth(depth);
        console.log(`PromenadeScene: Created image layer '${layerData.name}' at depth ${depth}`);
      }
    });
  }

  private processObjectLayer(): void {
    const objectLayer = this.map.getObjectLayer('objects');
    if (!objectLayer) {
      console.warn('PromenadeScene: No objects layer found');
      return;
    }

    objectLayer.objects.forEach(obj => {
      // Get the type from custom properties
      const typeProp = obj.properties?.find(
        (p: { name: string; value: string }) => p.name === 'type'
      );
      const objType = typeProp?.value || '';

      switch (objType) {
        case 'player-spawn':
          this.spawnPoint = { x: obj.x || 0, y: obj.y || 0 };
          console.log(`PromenadeScene: Found spawn point at (${this.spawnPoint.x}, ${this.spawnPoint.y})`);
          break;

        case 'dustbin':
          // Decorative object - could add sprite here later
          console.log(`PromenadeScene: Found dustbin at (${obj.x}, ${obj.y})`);
          break;

        // ground/platform collision is now handled by tile-based collision
        default:
          if (objType && objType !== 'ground' && objType !== 'platform') {
            console.log(`PromenadeScene: Object '${obj.name}' type='${objType}' at (${obj.x}, ${obj.y})`);
          }
      }
    });
  }

  private createPlayer(): void {
    // Use spawn point from map or default fallback
    const spawn = this.spawnPoint || { x: 36, y: 208 };
    if (!this.spawnPoint) {
      console.warn('PromenadeScene: No spawn point found in map, using default (36, 208)');
    }
    
    // Spawn player at the spawn point from the map
    this.player = new Player(this, spawn.x, spawn.y, this.inputMapper);

    // Set up collision with platforms layer (tile-based collision)
    if (this.platformsLayer) {
      this.physics.add.collider(this.player, this.platformsLayer);
    }

    // Keep player within world bounds
    this.player.setCollideWorldBounds(true);

    console.log(`PromenadeScene: Player spawned at (${spawn.x}, ${spawn.y})`);
  }

  update(time: number, delta: number): void {
    // Update input mapper
    this.inputMapper.update();

    // Update player
    this.player.update(time, delta);
  }
}
