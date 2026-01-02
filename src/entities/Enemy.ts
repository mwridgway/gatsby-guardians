import Phaser from 'phaser';

export interface EnemyConfig {
  health: number;
  speed: number;
  damage: number;
  maxSaturation: number; // Max "Gatsby Sauce" saturation before Soggy
}

/**
 * Base enemy class for testing weapon saturation mechanic
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private health: number;
  private maxHealth: number;
  private saturation: number = 0; // Current saturation level
  private config: EnemyConfig;
  private isSoggy: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: EnemyConfig) {
    // Create a simple placeholder texture
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture('enemy-placeholder', 16, 16);
    graphics.destroy();

    super(scene, x, y, 'enemy-placeholder');

    this.config = config;
    this.health = config.health;
    this.maxHealth = config.health;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setCollideWorldBounds(true);
      body.setSize(14, 16);
      body.setOffset(1, 0);
    }

    // Set tint to red for enemies
    this.setTint(0xff0000);
  }

  /**
   * Apply damage and saturation
   */
  public takeDamage(damage: number, saturation: number): void {
    this.health -= damage;
    this.saturation += saturation;

    console.log(`Enemy: ${this.health}/${this.maxHealth} HP, ${this.saturation}/${this.config.maxSaturation} saturation`);

    // Flash white briefly
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.setTint(this.isSoggy ? 0x8888ff : 0xff0000);
    });

    // Check if saturated
    if (!this.isSoggy && this.saturation >= this.config.maxSaturation) {
      this.applySoggy();
    }

    // Check if dead
    if (this.health <= 0) {
      this.destroy();
    }
  }

  /**
   * Apply Soggy status to enemy (slower movement, different behavior)
   */
  private applySoggy(): void {
    this.isSoggy = true;
    this.setTint(0x8888ff); // Blue tint
    this.config.speed *= 0.5; // Move slower when soggy
    this.saturation = 0; // Reset saturation
    console.log('Enemy is now Soggy!');
  }

  /**
   * Simple AI: Move toward player
   */
  public update(playerX: number): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Move toward player
    if (playerX < this.x - 10) {
      body.setVelocityX(-this.config.speed);
      this.setFlipX(true);
    } else if (playerX > this.x + 10) {
      body.setVelocityX(this.config.speed);
      this.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }
  }

  /**
   * Get saturation level (0 to maxSaturation)
   */
  public getSaturation(): number {
    return this.saturation;
  }

  /**
   * Check if enemy is soggy
   */
  public getIsSoggy(): boolean {
    return this.isSoggy;
  }

  /**
   * Get damage this enemy deals to player
   */
  public getDamage(): number {
    return this.config.damage;
  }
}
