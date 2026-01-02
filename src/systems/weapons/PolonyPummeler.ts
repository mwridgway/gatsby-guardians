import { WeaponBase, WeaponType, WeaponConfig } from './WeaponBase';

/**
 * Polony Pummeler - Melee weapon with kinetic knockback
 * Creates a short-range hitbox in front of player
 */
export class PolonyPummeler extends WeaponBase {
  private hitbox: Phaser.GameObjects.Zone | null = null;

  constructor(scene: Phaser.Scene) {
    const config: WeaponConfig = {
      type: WeaponType.POLONY_PUMMELER,
      name: 'Polony Pummeler',
      fireRate: 15,  // 250ms between swings at 60fps
      damage: 10,
      saturationPerHit: 5,
      range: 24,     // Melee range in pixels
    };
    super(scene, config);
  }

  protected onFire(direction: { x: number; y: number }): void {
    if (!this.owner) return;

    // Create hitbox in front of player
    const hitboxX = this.owner.x + (direction.x * this.config.range!);
    const hitboxY = this.owner.y;

    this.hitbox = this.scene.add.zone(hitboxX, hitboxY, 20, 24);
    this.scene.physics.add.existing(this.hitbox);

    // Hitbox active for 3 frames (50ms)
    this.scene.time.delayedCall(50, () => {
      if (this.hitbox) {
        this.hitbox.destroy();
        this.hitbox = null;
      }
    });

    console.log(`Polony Pummeler swing at (${hitboxX}, ${hitboxY})`);

    // TODO: Play swing animation
    // TODO: Play swing sound
  }

  /**
   * Get current hitbox for collision detection
   */
  public getHitbox(): Phaser.GameObjects.Zone | null {
    return this.hitbox;
  }

  public destroy(): void {
    if (this.hitbox) {
      this.hitbox.destroy();
      this.hitbox = null;
    }
  }
}
