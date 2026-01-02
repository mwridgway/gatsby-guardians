import Phaser from 'phaser';
import { WeaponBase, WeaponType } from './weapons/WeaponBase';
import { PolonyPummeler } from './weapons/PolonyPummeler';
import { ChipShotgun } from './weapons/ChipShotgun';
import { CalamariWhip } from './weapons/CalamariWhip';
import { MasalaFlamer } from './weapons/MasalaFlamer';
import { Player } from '../entities/Player';

/**
 * WeaponManager - Manages weapon inventory and switching
 * Follows registry singleton pattern like InputMapper
 */
export class WeaponManager {
  private weapons: Map<WeaponType, WeaponBase>;
  private currentWeapon: WeaponBase;
  private weaponOrder: WeaponType[] = [
    WeaponType.POLONY_PUMMELER,
    WeaponType.CHIP_SHOTGUN,
    WeaponType.CALAMARI_WHIP,
    WeaponType.MASALA_FLAMER,
  ];
  private currentIndex: number = 0;

  constructor(scene: Phaser.Scene) {
    this.weapons = new Map();

    // Initialize all weapons
    this.weapons.set(WeaponType.POLONY_PUMMELER, new PolonyPummeler(scene));
    this.weapons.set(WeaponType.CHIP_SHOTGUN, new ChipShotgun(scene));
    this.weapons.set(WeaponType.CALAMARI_WHIP, new CalamariWhip(scene));
    this.weapons.set(WeaponType.MASALA_FLAMER, new MasalaFlamer(scene));

    this.currentWeapon = this.weapons.get(this.weaponOrder[0])!;
  }

  /**
   * Set the owner for all weapons
   */
  public setOwner(owner: Player): void {
    this.weapons.forEach(weapon => weapon.setOwner(owner));
  }

  /**
   * Update current weapon
   */
  public update(): void {
    // Update all weapons (some like ChipShotgun need to update projectiles)
    this.weapons.forEach(weapon => weapon.update());
  }

  /**
   * Switch to next weapon
   */
  public nextWeapon(): void {
    this.currentIndex = (this.currentIndex + 1) % this.weaponOrder.length;
    this.currentWeapon = this.weapons.get(this.weaponOrder[this.currentIndex])!;
    console.log(`Switched to: ${this.currentWeapon.getName()}`);
  }

  /**
   * Switch to previous weapon
   */
  public previousWeapon(): void {
    this.currentIndex = (this.currentIndex - 1 + this.weaponOrder.length) % this.weaponOrder.length;
    this.currentWeapon = this.weapons.get(this.weaponOrder[this.currentIndex])!;
    console.log(`Switched to: ${this.currentWeapon.getName()}`);
  }

  /**
   * Fire current weapon
   */
  public fire(direction: { x: number; y: number }): boolean {
    return this.currentWeapon.fire(direction);
  }

  /**
   * Get current weapon
   */
  public getCurrentWeapon(): WeaponBase {
    return this.currentWeapon;
  }

  /**
   * Get weapon by type
   */
  public getWeapon(type: WeaponType): WeaponBase | undefined {
    return this.weapons.get(type);
  }

  /**
   * Set scene (called when scene changes)
   */
  public setScene(_scene: Phaser.Scene): void {
    // Scene reference not currently needed but kept for future use
    // Note: Weapons would need scene update too if they persist across scenes
  }

  /**
   * Clean up
   */
  public destroy(): void {
    this.weapons.forEach(weapon => weapon.destroy());
    this.weapons.clear();
  }
}
