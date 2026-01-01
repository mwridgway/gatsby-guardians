import Phaser from 'phaser';

/**
 * SceneSwitcher - Development tool for switching between scenes
 * 
 * Usage:
 * - Press 1: GamePlayScene (static platformer)
 * - Press 2: SideScrollerScene (parallax side-scroller)
 * - Press ESC: Return to MainMenuScene
 */
export class SceneSwitcher {
  private scene: Phaser.Scene;
  private enabled: boolean = false;
  private indicatorText?: Phaser.GameObjects.Text;
  
  private sceneMap: Map<number, string> = new Map([
    [1, 'GamePlayScene'],
    [2, 'SideScrollerScene'],
  ]);

  constructor(scene: Phaser.Scene, enabled: boolean = true) {
    this.scene = scene;
    this.enabled = enabled;
    
    if (this.enabled) {
      this.setupKeyboardShortcuts();
      this.createIndicator();
    }
  }

  private setupKeyboardShortcuts(): void {
    // Number keys to switch scenes
    const keyCodeMap: { [key: number]: number } = {
      1: Phaser.Input.Keyboard.KeyCodes.ONE,
      2: Phaser.Input.Keyboard.KeyCodes.TWO,
      3: Phaser.Input.Keyboard.KeyCodes.THREE,
      4: Phaser.Input.Keyboard.KeyCodes.FOUR,
    };

    this.sceneMap.forEach((sceneName, keyNumber) => {
      const keyCode = keyCodeMap[keyNumber];
      if (keyCode) {
        const key = this.scene.input.keyboard?.addKey(keyCode);
        if (key) {
          key.on('down', () => this.switchToScene(sceneName));
        }
      }
    });

    // ESC to return to main menu
    const escKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    if (escKey) {
      escKey.on('down', () => this.switchToScene('MainMenuScene'));
    }

    // Tilde (~) to toggle indicator
    const tildeKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK);
    if (tildeKey) {
      tildeKey.on('down', () => this.toggleIndicator());
    }
  }

  private createIndicator(): void {
    const shortcuts = [
      '--- DEV MODE ---',
      '1: Static Platformer',
      '2: Side-Scroller',
      'ESC: Main Menu',
      '~: Toggle Help',
    ];

    this.indicatorText = this.scene.add.text(
      this.scene.cameras.main.width - 10,
      10,
      shortcuts.join('\n'),
      {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 6, y: 4 },
        align: 'left',
      }
    );
    
    this.indicatorText.setOrigin(1, 0);
    this.indicatorText.setScrollFactor(0);
    this.indicatorText.setDepth(10000);
    this.indicatorText.setAlpha(0.7);
  }

  private toggleIndicator(): void {
    if (this.indicatorText) {
      this.indicatorText.setVisible(!this.indicatorText.visible);
    }
  }

  private switchToScene(sceneName: string): void {
    console.log(`SceneSwitcher: Switching to ${sceneName}`);
    
    // Show transition feedback
    this.showTransitionFeedback(sceneName);
    
    // Delay the scene switch slightly for visual feedback
    this.scene.time.delayedCall(100, () => {
      this.scene.scene.start(sceneName);
    });
  }

  private showTransitionFeedback(sceneName: string): void {
    const feedback = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      `Switching to ${sceneName}...`,
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 6 },
      }
    );
    
    feedback.setOrigin(0.5);
    feedback.setScrollFactor(0);
    feedback.setDepth(10001);
    
    // Fade out
    this.scene.tweens.add({
      targets: feedback,
      alpha: 0,
      duration: 300,
      onComplete: () => feedback.destroy(),
    });
  }

  /**
   * Enable or disable the scene switcher
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (this.indicatorText) {
      this.indicatorText.setVisible(enabled);
    }
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.indicatorText) {
      this.indicatorText.destroy();
    }
  }
}
