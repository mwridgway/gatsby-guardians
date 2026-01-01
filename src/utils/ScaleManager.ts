import { BASE_WIDTH, BASE_HEIGHT } from '../game/constants';

/**
 * Manages integer scaling for pixel-perfect rendering
 * Calculates the appropriate scale factor based on window size
 */
export class ScaleManager {
  private game: Phaser.Game;

  constructor(game: Phaser.Game) {
    this.game = game;
    this.setupScaling();
    this.setupResizeListener();
  }

  private setupScaling(): void {
    this.updateScale();
  }

  private setupResizeListener(): void {
    window.addEventListener('resize', () => {
      this.updateScale();
    });
  }

  private updateScale(): void {
    // Calculate integer scale factor
    const scaleX = Math.floor(window.innerWidth / BASE_WIDTH);
    const scaleY = Math.floor(window.innerHeight / BASE_HEIGHT);
    const scale = Math.max(1, Math.min(scaleX, scaleY));

    // Calculate actual display size
    const displayWidth = BASE_WIDTH * scale;
    const displayHeight = BASE_HEIGHT * scale;

    // Resize the game
    this.game.scale.resize(BASE_WIDTH, BASE_HEIGHT);

    // Update canvas size
    const canvas = this.game.canvas;
    if (canvas) {
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
    }
  }

  /**
   * Manually trigger a scale update
   */
  public forceUpdate(): void {
    this.updateScale();
  }
}
