import Phaser from 'phaser';

/**
 * SceneSwitcher - Development tool for switching between scenes
 *
 * Usage:
 * - Press 1: PromenadeScene (Sea Point Promenade)
 * - Press ESC: Return to MainMenuScene
 */
export class SceneSwitcher {
  private scene: Phaser.Scene;
  private enabled: boolean = false;
  private indicatorText?: Phaser.GameObjects.Text;
  private buttonContainer?: Phaser.GameObjects.Container;

  private sceneMap: Map<number, string> = new Map([
    [1, 'PromenadeScene'],
  ]);

  constructor(scene: Phaser.Scene, enabled: boolean = true) {
    this.scene = scene;
    this.enabled = enabled;

    if (this.enabled) {
      this.setupKeyboardShortcuts();
      this.createButtons();
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


  private createButtons(): void {
    this.buttonContainer = this.scene.add.container(0, 0);
    this.buttonContainer.setScrollFactor(0);
    this.buttonContainer.setDepth(9997);

    const buttonScale = 2.5;
    const buttonSize = 16 * buttonScale;
    const padding = 10;
    const buttonSpacing = buttonSize + 8;

    // Position at top right
    const startX = this.scene.cameras.main.width - buttonSize - padding;
    const startY = padding;

    // Frame calculations
    const keyFrames = {
      one: 51,      // '1' key (row 2, col 18)
      esc: 17,      // ESC key (row 1, col 18)
    };

    // Create scene switch buttons at top right (right to left)
    // Menu button: MainMenuScene (rightmost)
    this.createSceneButton(startX, startY, keyFrames.esc, 'MainMenuScene', 'ESC: Menu');

    // Button 1: PromenadeScene (leftmost)
    this.createSceneButton(startX - buttonSpacing, startY, keyFrames.one, 'PromenadeScene', '1: Promenade');
  }

  private createSceneButton(x: number, y: number, frame: number, sceneName: string, _label: string): void {
    const button = this.scene.add.sprite(x, y, 'input-prompts', frame);
    button.setScale(2.5);
    button.setAlpha(0.75);
    button.setOrigin(0, 0);
    button.setInteractive({ useHandCursor: true });

    // Hover effect
    button.on('pointerover', () => {
      button.setAlpha(1);
      button.setScale(2.7);
    });

    button.on('pointerout', () => {
      button.setAlpha(0.75);
      button.setScale(2.5);
    });

    // Click to switch scene
    button.on('pointerdown', () => {
      button.setScale(2.3);
      this.switchToScene(sceneName);
    });

    button.on('pointerup', () => {
      button.setScale(2.5);
    });

    this.buttonContainer?.add(button);
  }

  private toggleIndicator(): void {
    if (this.buttonContainer) {
      this.buttonContainer.setVisible(!this.buttonContainer.visible);
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
    if (this.buttonContainer) {
      this.buttonContainer.destroy();
    }
  }
}
