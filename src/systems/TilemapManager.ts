import Phaser from 'phaser';

interface TileData {
  id: string;
  name: string;
  corners: {
    NE: string;
    NW: string;
    SE: string;
    SW: string;
  };
  pattern_4x4: {
    row_0: number[];
    row_1: number[];
    row_2: number[];
    row_3: number[];
  };
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

  // Pattern cache for fast tile lookup
  private patternCache: Map<string, TileData> = new Map();

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

    // Build pattern cache
    this.buildPatternCache();
  }

  /**
   * Build a cache mapping patterns to tiles for fast lookup
   */
  private buildPatternCache(): void {
    this.metadata.tileset_data.tiles.forEach(tile => {
      const key = this.patternToKey(tile.pattern_4x4);
      this.patternCache.set(key, tile);
    });
    console.log(`TilemapManager: Built pattern cache with ${this.patternCache.size} tiles`);
  }

  /**
   * Convert a 4x4 pattern to a cache key
   */
  private patternToKey(pattern: { row_0: number[], row_1: number[], row_2: number[], row_3: number[] }): string {
    return `${pattern.row_0.join(',')}_${pattern.row_1.join(',')}_${pattern.row_2.join(',')}_${pattern.row_3.join(',')}`;
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
   * Sample 4x4 terrain around a position and create pattern
   */
  private sample4x4Pattern(gridX: number, gridY: number): { row_0: number[], row_1: number[], row_2: number[], row_3: number[] } {
    const pattern = {
      row_0: [255, 255, 255, 255],
      row_1: [255, 0, 0, 255],
      row_2: [255, 0, 0, 255],
      row_3: [255, 255, 255, 255]
    };

    // Sample the 2x2 center (the actual tile corners)
    // NW corner (row_1[1])
    pattern.row_1[1] = this.getTile(gridX, gridY);
    // NE corner (row_1[2])
    pattern.row_1[2] = this.getTile(gridX + 1, gridY);
    // SW corner (row_2[1])
    pattern.row_2[1] = this.getTile(gridX, gridY + 1);
    // SE corner (row_2[2])
    pattern.row_2[2] = this.getTile(gridX + 1, gridY + 1);

    return pattern;
  }

  /**
   * Match a sampled pattern against tile patterns with wildcard support
   */
  private matchPattern(sampled: { row_0: number[], row_1: number[], row_2: number[], row_3: number[] }): TileData | null {
    for (const tile of this.metadata.tileset_data.tiles) {
      const tilePattern = tile.pattern_4x4;
      let matches = true;

      // Check each position
      for (let row = 0; row < 4; row++) {
        const rowKey = `row_${row}` as 'row_0' | 'row_1' | 'row_2' | 'row_3';
        for (let col = 0; col < 4; col++) {
          const tileValue = tilePattern[rowKey][col];
          const sampledValue = sampled[rowKey][col];

          // Wildcard (255) matches anything
          if (tileValue !== 255 && tileValue !== sampledValue) {
            matches = false;
            break;
          }
        }
        if (!matches) break;
      }

      if (matches) {
        return tile;
      }
    }
    return null;
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
          const tile = this.selectTileForPosition(gridX, gridY);
          if (tile) {
            this.renderTile(gridX, gridY, tile);
          }
        }
      }
    }

    console.log(`TilemapManager: Rendered ${this.tileSprites.length} tiles`);
  }

  /**
   * Select the appropriate tile for a grid position based on neighbors
   */
  private selectTileForPosition(gridX: number, gridY: number): TileData | null {
    const pattern = this.sample4x4Pattern(gridX, gridY);
    return this.matchPattern(pattern);
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
