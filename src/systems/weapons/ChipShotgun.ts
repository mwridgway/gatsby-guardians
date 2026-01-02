import { WeaponBase, WeaponType, WeaponConfig } from './WeaponBase';
import { Projectile, ProjectileConfig } from './Projectile';
import { ObjectPool } from '../../utils/ObjectPool';

/**
 * Chip Shotgun - Spread projectile weapon
 * Fires 3 projectiles in a cone pattern
 */
export class ChipShotgun extends WeaponBase {
  private projectilePool: ObjectPool<Projectile>;
  private projectiles: Set<Projectile> = new Set();

  constructor(scene: Phaser.Scene) {
    const config: WeaponConfig = {
      type: WeaponType.CHIP_SHOTGUN,
      name: 'Chip Shotgun',
      fireRate: 30,  // 500ms between shots at 60fps
      damage: 5,
      saturationPerHit: 3,
      projectileSpeed: 200,
    };
    super(scene, config);

    this.projectilePool = new ObjectPool<Projectile>(scene, Projectile, 30);
  }

  protected onFire(direction: { x: number; y: number }): void {
    if (!this.owner) return;

    const spreadAngles = [-15, 0, 15]; // Degrees
    const baseAngle = Math.atan2(direction.y, direction.x);

    spreadAngles.forEach(offset => {
      const angleRad = baseAngle + (offset * Math.PI / 180);
      const velocity = {
        x: Math.cos(angleRad) * this.config.projectileSpeed!,
        y: Math.sin(angleRad) * this.config.projectileSpeed!,
      };

      const projectile = this.projectilePool.get();
      if (projectile) {
        const projectileConfig: ProjectileConfig = {
          sprite: 'chip-projectile',
          speed: this.config.projectileSpeed!,
          damage: this.config.damage,
          saturation: this.config.saturationPerHit,
          lifetime: 120, // 2 seconds at 60fps
        };

        projectile.launch(this.owner!.x, this.owner!.y, velocity, projectileConfig);
        this.projectiles.add(projectile);
      }
    });

    console.log(`Chip Shotgun fired 3 projectiles in spread pattern`);

    // TODO: Play shotgun sound
    // TODO: Muzzle flash effect
  }

  public update(): void {
    super.update();

    // Update all active projectiles
    this.projectiles.forEach(projectile => {
      if (!projectile.active) {
        this.projectiles.delete(projectile);
        this.projectilePool.release(projectile);
      } else {
        projectile.update();
      }
    });
  }

  /**
   * Get projectile group for collision detection
   */
  public getProjectileGroup(): Phaser.GameObjects.Group {
    return this.projectilePool.getGroup();
  }

  public destroy(): void {
    this.projectiles.forEach(p => this.projectilePool.release(p));
    this.projectiles.clear();
    this.projectilePool.clear();
  }
}
