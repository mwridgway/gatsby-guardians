import Phaser from 'phaser';

export interface ProjectileConfig {
  sprite: string;
  speed: number;
  damage: number;
  saturation: number;
  lifetime: number; // Frames
}

/**
 * Poolable projectile class
 * Used by Chip Shotgun and potentially other ranged weapons
 */
export class Projectile extends Phaser.Physics.Arcade.Sprite {
  private lifetimeFrames: number = 0;
  private _damage: number = 0;
  private _saturation: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Create a simple placeholder texture
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 8, 8);
    graphics.generateTexture('projectile-placeholder', 8, 8);
    graphics.destroy();

    super(scene, x, y, 'projectile-placeholder');
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  /**
   * Launch the projectile
   */
  public launch(x: number, y: number, velocity: { x: number; y: number }, config: ProjectileConfig): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(velocity.x, velocity.y);
    body.setAllowGravity(false); // Projectiles ignore gravity

    this._damage = config.damage;
    this._saturation = config.saturation;
    this.lifetimeFrames = config.lifetime;

    // TODO: Set texture based on config.sprite when assets loaded
  }

  /**
   * Update projectile (called each frame)
   */
  public update(): void {
    if (!this.active) return;

    this.lifetimeFrames--;
    if (this.lifetimeFrames <= 0) {
      this.deactivate();
    }

    // Rotate to face velocity direction
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      this.rotation = Math.atan2(body.velocity.y, body.velocity.x);
    }
  }

  /**
   * Deactivate projectile (return to pool)
   */
  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
    }
  }

  /**
   * Get damage value
   */
  public getDamage(): number {
    return this._damage;
  }

  /**
   * Get saturation value
   */
  public getSaturation(): number {
    return this._saturation;
  }
}
