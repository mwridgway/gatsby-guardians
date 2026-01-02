import { WeaponBase, WeaponType, WeaponConfig } from './WeaponBase';

/**
 * Calamari Whip - Grapple/pull mechanic
 * Creates a line to target, pulls player or enemy
 */
export class CalamariWhip extends WeaponBase {
  private whipLine: Phaser.GameObjects.Line | null = null;

  constructor(scene: Phaser.Scene) {
    const config: WeaponConfig = {
      type: WeaponType.CALAMARI_WHIP,
      name: 'Calamari Whip',
      fireRate: 45,  // 750ms between uses at 60fps
      damage: 3,
      saturationPerHit: 2,
      range: 150,    // Grapple range in pixels
    };
    super(scene, config);
  }

  protected onFire(direction: { x: number; y: number }): void {
    if (!this.owner) return;

    // Cast ray in direction to find grapple point
    const endX = this.owner.x + (direction.x * this.config.range!);
    const endY = this.owner.y + (direction.y * this.config.range!);

    // Create visual whip line
    this.whipLine = this.scene.add.line(
      0, 0,
      this.owner.x, this.owner.y,
      endX, endY,
      0xffffff
    );
    this.whipLine.setOrigin(0, 0);
    this.whipLine.setLineWidth(2);

    console.log(`Calamari Whip extends to (${endX}, ${endY})`);

    // TODO: Raycast to find grapple target (enemy or terrain)
    // TODO: Apply pull force to player or enemy
    // TODO: Play whip crack sound

    // Remove line after 10 frames (visual feedback)
    this.scene.time.delayedCall(166, () => {
      if (this.whipLine) {
        this.whipLine.destroy();
        this.whipLine = null;
      }
    });
  }

  /**
   * Get current whip line for visualization
   */
  public getWhipLine(): Phaser.GameObjects.Line | null {
    return this.whipLine;
  }

  public destroy(): void {
    if (this.whipLine) {
      this.whipLine.destroy();
      this.whipLine = null;
    }
  }
}
