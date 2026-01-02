import { WeaponBase, WeaponType, WeaponConfig } from './WeaponBase';

/**
 * Masala Flamer - Continuous damage cone/beam
 * Damages all enemies in cone while held
 */
export class MasalaFlamer extends WeaponBase {
  private flameCone: Phaser.GameObjects.Triangle | null = null;
  private isFiring: boolean = false;

  constructor(scene: Phaser.Scene) {
    const config: WeaponConfig = {
      type: WeaponType.MASALA_FLAMER,
      name: 'Masala Flamer',
      fireRate: 2,   // Continuous fire, 2 frames between damage ticks
      damage: 1,     // Low damage per tick
      saturationPerHit: 0.5,
      range: 80,     // Flame cone range
    };
    super(scene, config);
  }

  protected onFire(direction: { x: number; y: number }): void {
    if (!this.owner) return;

    this.isFiring = true;

    // Create flame cone visual
    if (!this.flameCone) {
      const coneSize = this.config.range!;
      this.flameCone = this.scene.add.triangle(
        this.owner.x, this.owner.y,
        0, 0,
        coneSize, -20,
        coneSize, 20,
        0xff6600,
        0.6
      );
    }

    // Update cone position and rotation
    this.flameCone.setPosition(this.owner.x, this.owner.y);
    const angle = Math.atan2(direction.y, direction.x);
    this.flameCone.setRotation(angle);

    console.log(`Masala Flamer firing continuously`);

    // TODO: Apply damage to all enemies in cone
    // TODO: Particle effects
    // TODO: Flame sound (looping)
  }

  /**
   * Stop firing (called when input released)
   */
  public stopFiring(): void {
    this.isFiring = false;
    if (this.flameCone) {
      this.flameCone.destroy();
      this.flameCone = null;
    }
  }

  public update(): void {
    super.update();

    if (!this.isFiring && this.flameCone) {
      this.flameCone.destroy();
      this.flameCone = null;
    }
  }

  /**
   * Get flame cone for collision detection
   */
  public getFlameCone(): Phaser.GameObjects.Triangle | null {
    return this.flameCone;
  }

  public destroy(): void {
    if (this.flameCone) {
      this.flameCone.destroy();
      this.flameCone = null;
    }
  }
}
