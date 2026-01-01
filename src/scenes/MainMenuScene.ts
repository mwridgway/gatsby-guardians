import Phaser from 'phaser';
import { BASE_WIDTH, BASE_HEIGHT } from '../game/constants';
import { InputMapper, GameAction } from '../systems/InputMapper';

/**
 * MainMenuScene - Title screen and main menu
 */
export class MainMenuScene extends Phaser.Scene {
  private inputMapper!: InputMapper;
  private titleText!: Phaser.GameObjects.Text;
  private playButton!: Phaser.GameObjects.Text;
  private creditsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    // Get systems from registry
    this.inputMapper = this.registry.get('inputMapper') as InputMapper;

    // IMPORTANT: Set the scene so InputMapper listens to THIS scene's keyboard
    this.inputMapper.setScene(this);

    // Create title
    this.titleText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 3, 'GATSBY GUARDIANS', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 6,
    });
    this.titleText.setOrigin(0.5);

    // Create play button
    this.playButton = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT / 2, 'PRESS SPACE TO PLAY', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });
    this.playButton.setOrigin(0.5);

    // Make button interactive
    this.playButton.setInteractive({ useHandCursor: true });
    this.playButton.on('pointerover', () => {
      this.playButton.setColor('#00ff00');
    });
    this.playButton.on('pointerout', () => {
      this.playButton.setColor('#ffffff');
    });
    this.playButton.on('pointerdown', () => {
      this.startGame();
    });

    // Add blinking effect to play button
    this.tweens.add({
      targets: this.playButton,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Credits
    this.creditsText = this.add.text(BASE_WIDTH / 2, BASE_HEIGHT - 30, 'A Retro Platformer Game', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#888888',
    });
    this.creditsText.setOrigin(0.5);

    console.log('MainMenuScene: Ready');
  }

  update(): void {
    // Update input
    if (!this.inputMapper) {
      return;
    }

    this.inputMapper.update();

    // Check for keyboard input to start game
    if (this.inputMapper.isActionJustPressed(GameAction.JUMP)) {
      this.startGame();
    }
  }

  private startGame(): void {
    console.log('Starting game...');

    // Stop button tween
    this.tweens.killTweensOf(this.playButton);

    // Transition to gameplay immediately (no fade for now)
    console.log('Transitioning to GamePlayScene...');
    this.scene.start('GamePlayScene');
  }
}
