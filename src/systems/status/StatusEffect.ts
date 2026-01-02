import { Player } from '../../entities/Player';

export enum StatusEffectType {
  SOGGY = 'soggy',
  // Future effects: STUNNED, FROZEN, BURNING, etc.
}

export interface StatusEffectConfig {
  type: StatusEffectType;
  duration: number; // Frames (-1 for permanent)
}

/**
 * Base class for status effects
 */
export abstract class StatusEffect {
  protected config: StatusEffectConfig;
  protected remainingFrames: number;
  protected target: Player | null = null;

  constructor(config: StatusEffectConfig) {
    this.config = config;
    this.remainingFrames = config.duration;
  }

  /**
   * Apply effect to target
   */
  public apply(target: Player): void {
    this.target = target;
    this.onApply();
  }

  /**
   * Update effect (called each frame)
   */
  public update(): void {
    if (this.remainingFrames > 0) {
      this.remainingFrames--;
    }

    this.onUpdate();
  }

  /**
   * Remove effect from target
   */
  public remove(): void {
    this.onRemove();
    this.target = null;
  }

  /**
   * Check if effect has expired
   */
  public hasExpired(): boolean {
    return this.config.duration !== -1 && this.remainingFrames <= 0;
  }

  /**
   * Get effect type
   */
  public getType(): StatusEffectType {
    return this.config.type;
  }

  /**
   * Effect-specific application logic
   */
  protected abstract onApply(): void;

  /**
   * Effect-specific update logic
   */
  protected abstract onUpdate(): void;

  /**
   * Effect-specific removal logic
   */
  protected abstract onRemove(): void;
}
