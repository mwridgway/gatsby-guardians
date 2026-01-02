import Phaser from 'phaser';
import { Player } from '../../entities/Player';

export enum WeaponType {
  POLONY_PUMMELER = 'polonypummeler',
  CHIP_SHOTGUN = 'chipshotgun',
  CALAMARI_WHIP = 'calamariwhip',
  MASALA_FLAMER = 'masalaflamer',
}

export interface WeaponConfig {
  type: WeaponType;
  name: string;
  fireRate: number;        // Frames between shots
  damage: number;
  saturationPerHit: number; // "Gatsby Sauce" saturation amount
  range?: number;
  projectileSpeed?: number;
}

/**
 * Base class for all weapons
 * Follows registry singleton pattern like InputMapper
 */
export abstract class WeaponBase {
  protected scene: Phaser.Scene;
  protected config: WeaponConfig;
  protected cooldownFrames: number = 0;
  protected owner: Player | null = null;

  constructor(scene: Phaser.Scene, config: WeaponConfig) {
    this.scene = scene;
    this.config = config;
  }

  /**
   * Set the owner of this weapon (Player)
   */
  public setOwner(owner: Player): void {
    this.owner = owner;
  }

  /**
   * Update weapon state (cooldowns, etc.)
   */
  public update(): void {
    if (this.cooldownFrames > 0) {
      this.cooldownFrames--;
    }
  }

  /**
   * Attempt to fire the weapon
   * Returns true if fired, false if on cooldown
   */
  public fire(direction: { x: number; y: number }): boolean {
    if (this.cooldownFrames > 0 || !this.owner) return false;

    this.onFire(direction);
    this.cooldownFrames = this.config.fireRate;
    return true;
  }

  /**
   * Weapon-specific fire logic (implemented by subclasses)
   */
  protected abstract onFire(direction: { x: number; y: number }): void;

  /**
   * Check if weapon can fire
   */
  public canFire(): boolean {
    return this.cooldownFrames === 0 && this.owner !== null;
  }

  /**
   * Get weapon type
   */
  public getType(): WeaponType {
    return this.config.type;
  }

  /**
   * Get weapon name
   */
  public getName(): string {
    return this.config.name;
  }

  /**
   * Get weapon configuration
   */
  public getConfig(): WeaponConfig {
    return this.config;
  }

  /**
   * Clean up weapon resources
   */
  public abstract destroy(): void;
}
