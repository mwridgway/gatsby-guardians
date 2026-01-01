/**
 * AdManager adapts to different web portal SDKs
 * Supports Poki, CrazyGames, and localhost mock mode
 */
export class AdManager {
  private platform: 'poki' | 'crazygames' | 'mock' = 'mock';
  private initialized: boolean = false;

  constructor() {
    this.detectPlatform();
  }

  /**
   * Detect which platform SDK is available
   */
  private detectPlatform(): void {
    if (typeof window === 'undefined') return;

    if (window.PokiSDK) {
      this.platform = 'poki';
      console.log('AdManager: Poki SDK detected');
    } else if (window.CrazyGames) {
      this.platform = 'crazygames';
      console.log('AdManager: CrazyGames SDK detected');
    } else {
      this.platform = 'mock';
      console.log('AdManager: Running in mock mode (localhost)');
    }
  }

  /**
   * Initialize the ad platform SDK
   */
  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      if (this.platform === 'poki') {
        await window.PokiSDK!.init();
        console.log('Poki SDK initialized');
      } else if (this.platform === 'crazygames') {
        window.CrazyGames!.init();
        console.log('CrazyGames SDK initialized');
      } else {
        console.log('Mock ad platform initialized');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize ad platform:', error);
    }
  }

  /**
   * Notify that game loading has started
   */
  public gameLoadingStart(): void {
    if (this.platform === 'poki') {
      window.PokiSDK!.gameLoadingStart();
    } else if (this.platform === 'mock') {
      console.log('[Mock] Game loading started');
    }
  }

  /**
   * Notify that game loading has finished
   */
  public gameLoadingFinished(): void {
    if (this.platform === 'poki') {
      window.PokiSDK!.gameLoadingFinished();
    } else if (this.platform === 'mock') {
      console.log('[Mock] Game loading finished');
    }
  }

  /**
   * Notify that gameplay has started
   */
  public gameplayStart(): void {
    if (this.platform === 'crazygames') {
      window.CrazyGames!.game.gameplayStart();
    } else if (this.platform === 'mock') {
      console.log('[Mock] Gameplay started');
    }
  }

  /**
   * Notify that gameplay has stopped
   */
  public gameplayStop(): void {
    if (this.platform === 'crazygames') {
      window.CrazyGames!.game.gameplayStop();
    } else if (this.platform === 'mock') {
      console.log('[Mock] Gameplay stopped');
    }
  }

  /**
   * Show an interstitial ad (midgame break)
   */
  public async showInterstitial(): Promise<void> {
    console.log('Showing interstitial ad...');

    if (this.platform === 'poki') {
      await window.PokiSDK!.commercialBreak();
    } else if (this.platform === 'crazygames') {
      return new Promise((resolve) => {
        window.CrazyGames!.ad.requestAd('midgame', {
          adFinished: () => resolve(),
          adError: () => resolve(),
        });
      });
    } else {
      // Mock mode - just wait a bit
      console.log('[Mock] Showing interstitial ad (2s)');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('Interstitial ad finished');
  }

  /**
   * Show a rewarded ad (give player a reward after watching)
   */
  public async showRewarded(): Promise<boolean> {
    console.log('Showing rewarded ad...');

    if (this.platform === 'poki') {
      const success = await window.PokiSDK!.rewardedBreak();
      console.log('Rewarded ad finished:', success ? 'granted' : 'skipped');
      return success;
    } else if (this.platform === 'crazygames') {
      return new Promise((resolve) => {
        window.CrazyGames!.ad.requestAd('rewarded', {
          adFinished: () => resolve(true),
          adError: () => resolve(false),
        });
      });
    } else {
      // Mock mode - always grant reward
      console.log('[Mock] Showing rewarded ad (2s) - reward granted');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    }
  }

  /**
   * Notify a happy moment (used by some SDKs for ad timing)
   */
  public happyTime(): void {
    if (this.platform === 'crazygames') {
      window.CrazyGames!.game.happytime();
    } else if (this.platform === 'mock') {
      console.log('[Mock] Happy time!');
    }
  }

  /**
   * Get the current platform
   */
  public getPlatform(): string {
    return this.platform;
  }
}
