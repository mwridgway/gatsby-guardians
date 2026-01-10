import Phaser from 'phaser';

interface TileData {
  id: number;
  mask: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface TilesetMetadata {
  tileset_data: {
    tiles: TileData[];
    tile_size: {
      width: number;
      height: number;
    };
  };
}

/**
 * TilemapManager - Manages sidescroller tilesets with automatic tile selection
 */
export class TilemapManager {
  private scene: Phaser.Scene;
  private tilesetTexture: string;
  private metadata: TilesetMetadata;
  private tileSize: number;

  // Terrain grid (0 = air, 1 = platform)
  private terrainGrid: number[][] = [];
  private gridWidth: number = 0;
  private gridHeight: number = 0;

  // Rendered tiles
  private tileSprites: Phaser.GameObjects.Image[] = [];

  // Map mask to tile data
  private maskToTile: Map<number, TileData> = new Map();

  constructor(
    scene: Phaser.Scene,
    tilesetTexture: string,
    metadata: TilesetMetadata,
    gridWidth: number,
    gridHeight: number
  ) {
    this.scene = scene;
    this.tilesetTexture = tilesetTexture;
    this.metadata = metadata;
    this.tileSize = metadata.tileset_data.tile_size.width;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    // Initialize empty terrain grid
    this.terrainGrid = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(0));

    // Build mask cache
    this.buildMaskCache();
  }

  /**
   * Build a cache mapping bitmasks to tiles for fast lookup
   */
  private buildMaskCache(): void {
    this.metadata.tileset_data.tiles.forEach(tile => {
      this.maskToTile.set(tile.mask, tile);
    });
    console.log(`TilemapManager: Built mask cache with ${this.maskToTile.size} tiles`);
  }

  /**
   * Set a tile in the terrain grid
   */
  setTile(gridX: number, gridY: number, value: number): void {
    if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
      this.terrainGrid[gridY][gridX] = value;
    }
  }

  /**
   * Get terrain value at grid position
   */
  getTile(gridX: number, gridY: number): number {
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return 0; // Air outside bounds
    }
    return this.terrainGrid[gridY][gridX];
  }

  /**
   * Calculate 4-neighbor bitmask for autotiling
   * North=1, West=2, East=4, South=8
   */
  private calculateBitmask(gridX: number, gridY: number): number {
    let mask = 0;

    // North
    if (this.getTile(gridX, gridY - 1) === 1) mask |= 1;
    // West
    if (this.getTile(gridX - 1, gridY) === 1) mask |= 2;
    // East
    if (this.getTile(gridX + 1, gridY) === 1) mask |= 4;
    // South
    if (this.getTile(gridX, gridY + 1) === 1) mask |= 8;

    return mask;
  }

  /**
   * Create a platform at grid position with given width
   */
  createPlatform(gridX: number, gridY: number, width: number): void {
    for (let i = 0; i < width; i++) {
      this.setTile(gridX + i, gridY, 1);
    }
  }

  /**
   * Render the tilemap
   */
  render(): void {
    // Clear existing sprites
    this.tileSprites.forEach(sprite => sprite.destroy());
    this.tileSprites = [];

    // Render each tile in the grid
    for (let gridY = 0; gridY < this.gridHeight; gridY++) {
      for (let gridX = 0; gridX < this.gridWidth; gridX++) {
        const terrain = this.getTile(gridX, gridY);

        // Only render if there's terrain here
        if (terrain === 1) {
          const mask = this.calculateBitmask(gridX, gridY);
          const tile = this.maskToTile.get(mask);
          
          if (tile) {
            this.renderTile(gridX, gridY, tile);
          } else {
            // Fallback to center block (all neighbors) if mask not found
            const fallback = this.maskToTile.get(15);
            if (fallback) this.renderTile(gridX, gridY, fallback);
          }
        }
      }
    }

    console.log(`TilemapManager: Rendered ${this.tileSprites.length} tiles`);
  }

  /**
   * Render a single tile at grid position
   */
  private renderTile(gridX: number, gridY: number, tile: TileData): void {
    const worldX = gridX * this.tileSize;
    const worldY = gridY * this.tileSize;

    // Create a sprite from the tileset texture
    const sprite = this.scene.add.image(worldX, worldY, this.tilesetTexture);
    sprite.setOrigin(0, 0);

    // Crop to show only this tile using the bounding box
    sprite.setCrop(
      tile.bounding_box.x,
      tile.bounding_box.y,
      tile.bounding_box.width,
      tile.bounding_box.height
    );

    this.tileSprites.push(sprite);
  }

  /**
   * Get physics bodies for platforms
   */
  createPhysicsBodies(physics: Phaser.Physics.Arcade.ArcadePhysics): Phaser.Physics.Arcade.StaticGroup {
    const group = physics.add.staticGroup();

    for (let gridY = 0; gridY < this.gridHeight; gridY++) {
      for (let gridX = 0; gridX < this.gridWidth; gridX++) {
        if (this.getTile(gridX, gridY) === 1) {
          const worldX = gridX * this.tileSize;
          const worldY = gridY * this.tileSize;

          // Create an invisible physics body
          const body = this.scene.add.rectangle(
            worldX + this.tileSize / 2,
            worldY + this.tileSize / 2,
            this.tileSize,
            this.tileSize,
            0x000000,
            0 // Fully transparent
          );
          physics.add.existing(body, true);
          group.add(body);
        }
      }
    }

    return group;
  }

  /**
   * Destroy all rendered tiles
   */
  destroy(): void {
    this.tileSprites.forEach(sprite => sprite.destroy());
    this.tileSprites = [];
  }
}
