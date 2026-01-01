// Global type definitions

// Poki SDK
interface PokiSDK {
  init(): Promise<void>;
  gameLoadingStart(): void;
  gameLoadingFinished(): void;
  commercialBreak(): Promise<void>;
  rewardedBreak(): Promise<boolean>;
}

// CrazyGames SDK
interface CrazyGamesSDK {
  init(): void;
  game: {
    gameplayStart(): void;
    gameplayStop(): void;
    happytime(): void;
  };
  ad: {
    requestAd(type: 'midgame' | 'rewarded', callbacks?: {
      adStarted?: () => void;
      adFinished?: () => void;
      adError?: (error: Error) => void;
    }): void;
  };
}

interface Window {
  PokiSDK?: PokiSDK;
  CrazyGames?: CrazyGamesSDK;
}

// Phaser RexUI Virtual Joystick plugin types
declare module 'phaser3-rex-plugins/plugins/virtualjoystick' {
  export default class VirtualJoystick extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, config?: any);
    force: number;
    forceX: number;
    forceY: number;
    angle: number;
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  }
}
