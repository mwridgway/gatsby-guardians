/**
 * Standardized input state representing digitalized player intent
 * All analog inputs are converted to strict -1, 0, or 1 values for 16-bit console feel
 */
export interface InputState {
  // Movement (digitalized to -1, 0, 1)
  moveX: number;
  moveY: number;

  // Jump state
  jumpActive: boolean;      // Held down
  jumpJustPressed: boolean; // Just pressed this frame

  // Combat actions
  primaryFire: boolean;
  primaryFireJustPressed: boolean;
  secondaryFire: boolean;
  secondaryFireJustPressed: boolean;

  // Weapon switching
  weaponNext: boolean;
  weaponPrevious: boolean;

  // Utility
  pause: boolean;
  pauseJustPressed: boolean;
}

/**
 * Deadzone configuration for analog inputs
 */
export const INPUT_DEADZONE = 0.2;

/**
 * Digitalize analog input to strict -1, 0, or 1 for authentic 16-bit console feel
 * @param value Analog input value (-1 to 1)
 * @param deadzone Deadzone threshold (default 0.2)
 * @returns -1, 0, or 1
 */
export function digitalizeAxis(value: number, deadzone: number = INPUT_DEADZONE): number {
  if (Math.abs(value) < deadzone) return 0;
  return value < 0 ? -1 : 1;
}
