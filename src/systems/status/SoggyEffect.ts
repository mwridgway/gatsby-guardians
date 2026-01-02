import { StatusEffect, StatusEffectType, StatusEffectConfig } from './StatusEffect';
import { PLAYER_SPEED } from '../../game/constants';

/**
 * Soggy status effect - Oil saturation
 * - Increases movement speed (slippery)
 * - Player takes 2x damage
 */
export class SoggyEffect extends StatusEffect {
  private readonly SPEED_MULTIPLIER = 1.5;  // 50% faster
  private readonly DAMAGE_MULTIPLIER = 2.0; // 2x damage
  private originalSpeed: number = PLAYER_SPEED;

  constructor(duration: number = 300) { // Default 5 seconds at 60fps
    const config: StatusEffectConfig = {
      type: StatusEffectType.SOGGY,
      duration: duration,
    };
    super(config);
  }

  protected onApply(): void {
    if (!this.target) return;

    // Store original speed
    this.originalSpeed = this.target.getSpeed();

    // Apply speed boost
    this.target.setSpeed(this.originalSpeed * this.SPEED_MULTIPLIER);

    // Apply visual tint (oily sheen)
    this.target.setTint(0x8888ff); // Blue-ish tint

    console.log('Soggy effect applied! Speed increased, damage vulnerability doubled.');
  }

  protected onUpdate(): void {
    // Could add dripping particles here
  }

  protected onRemove(): void {
    if (!this.target) return;

    // Restore original speed
    this.target.setSpeed(this.originalSpeed);

    // Remove tint
    this.target.clearTint();

    console.log('Soggy effect removed.');
  }

  /**
   * Get damage multiplier
   */
  public getDamageMultiplier(): number {
    return this.DAMAGE_MULTIPLIER;
  }
}
