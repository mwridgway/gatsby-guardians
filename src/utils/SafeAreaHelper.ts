/**
 * Helper to query CSS safe area insets
 * Used to position UI outside device notches/home indicators (iOS, Android)
 */
export class SafeAreaHelper {
  /**
   * Get safe area insets in pixels
   * Returns 0 for each inset on desktop browsers
   */
  public static getInsets(): { top: number; right: number; bottom: number; left: number } {
    // Query CSS environment variables
    const top = SafeAreaHelper.getCSSVariable('safe-area-inset-top');
    const right = SafeAreaHelper.getCSSVariable('safe-area-inset-right');
    const bottom = SafeAreaHelper.getCSSVariable('safe-area-inset-bottom');
    const left = SafeAreaHelper.getCSSVariable('safe-area-inset-left');

    return {
      top: SafeAreaHelper.parsePixels(top),
      right: SafeAreaHelper.parsePixels(right),
      bottom: SafeAreaHelper.parsePixels(bottom),
      left: SafeAreaHelper.parsePixels(left),
    };
  }

  private static getCSSVariable(name: string): string {
    // Get computed style of document root
    return getComputedStyle(document.documentElement).getPropertyValue(`env(${name})`) || '0px';
  }

  private static parsePixels(value: string): number {
    // Parse pixel value from CSS string (e.g., "20px" -> 20)
    const match = value.match(/(\d+\.?\d*)px/);
    return match ? parseFloat(match[1]) : 0;
  }
}
