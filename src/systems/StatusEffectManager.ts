import Phaser from 'phaser';
import { StatusEffect, StatusEffectType } from './status/StatusEffect';
import { Player } from '../entities/Player';

/**
 * StatusEffectManager - Manages active status effects on player
 * Follows registry singleton pattern
 */
export class StatusEffectManager {
  private activeEffects: Map<StatusEffectType, StatusEffect>;
  private target: Player | null = null;

  constructor(_scene: Phaser.Scene) {
    this.activeEffects = new Map();
  }

  /**
   * Set the target (Player)
   */
  public setTarget(target: Player): void {
    this.target = target;
  }

  /**
   * Apply a status effect
   */
  public applyEffect(effect: StatusEffect): void {
    if (!this.target) return;

    const type = effect.getType();

    // Remove existing effect of same type
    if (this.activeEffects.has(type)) {
      this.removeEffect(type);
    }

    // Apply new effect
    effect.apply(this.target);
    this.activeEffects.set(type, effect);
  }

  /**
   * Remove a status effect by type
   */
  public removeEffect(type: StatusEffectType): void {
    const effect = this.activeEffects.get(type);
    if (effect) {
      effect.remove();
      this.activeEffects.delete(type);
    }
  }

  /**
   * Update all active effects
   */
  public update(): void {
    const expiredEffects: StatusEffectType[] = [];

    this.activeEffects.forEach((effect, type) => {
      effect.update();

      if (effect.hasExpired()) {
        expiredEffects.push(type);
      }
    });

    // Remove expired effects
    expiredEffects.forEach(type => this.removeEffect(type));
  }

  /**
   * Check if a specific effect is active
   */
  public hasEffect(type: StatusEffectType): boolean {
    return this.activeEffects.has(type);
  }

  /**
   * Get a specific effect
   */
  public getEffect(type: StatusEffectType): StatusEffect | undefined {
    return this.activeEffects.get(type);
  }

  /**
   * Clear all effects
   */
  public clearAll(): void {
    this.activeEffects.forEach(effect => effect.remove());
    this.activeEffects.clear();
  }

  /**
   * Set scene (called when scene changes)
   */
  public setScene(_scene: Phaser.Scene): void {
    // Scene reference not currently needed but kept for future use
  }

  /**
   * Clean up
   */
  public destroy(): void {
    this.clearAll();
  }
}
