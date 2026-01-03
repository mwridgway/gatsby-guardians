import Phaser from 'phaser';

/**
 * FullscreenManager - Handles fullscreen functionality
 */
export class FullscreenManager {
  private scene: Phaser.Scene;
  private button?: Phaser.GameObjects.Container;
  private isFullscreen: boolean = false;
  public isMobile: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isMobile = 'ontouchstart' in window;
    this.createFullscreenButton();
    this.setupFullscreenListeners();
  }

  private createFullscreenButton(): void {
    const buttonScale = 2.5;
    const padding = 10;

    // Position in top-left corner
    const x = padding;
    const y = padding;

    // Fullscreen icon from sprite sheet
    // Row 4, Col 32: (4-1)*34 + (32-1) = 133
    const fullscreenFrame = 133;

    const button = this.scene.add.sprite(x, y, 'input-prompts', fullscreenFrame);
    button.setScale(buttonScale);
    button.setAlpha(0.75);
    button.setOrigin(0, 0);
    button.setScrollFactor(0);
    button.setDepth(9998);
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

    // Click handler
    button.on('pointerdown', () => {
      button.setScale(2.3);
      this.toggleFullscreen();
    });

    button.on('pointerup', () => {
      button.setScale(2.5);
    });

    this.button = this.scene.add.container(0, 0);
    this.button.add(button);
  }

  private setupFullscreenListeners(): void {
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
    document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
    document.addEventListener('MSFullscreenChange', () => this.onFullscreenChange());
  }

  private onFullscreenChange(): void {
    this.isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    
    this.updateButtonIcon();
    console.log('Fullscreen state changed:', this.isFullscreen);
  }

  private updateButtonIcon(): void {
    // Icon doesn't change - using sprite from sheet
  }

  public toggleFullscreen(): void {
    if (!this.isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  public enterFullscreenOnMobile(): void {
    if (this.isMobile && !this.isFullscreen) {
      this.enterFullscreen();
    }
  }

  private enterFullscreen(): void {
    const canvas = this.scene.game.canvas;
    
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if ((canvas as any).webkitRequestFullscreen) {
      (canvas as any).webkitRequestFullscreen();
    } else if ((canvas as any).mozRequestFullScreen) {
      (canvas as any).mozRequestFullScreen();
    } else if ((canvas as any).msRequestFullscreen) {
      (canvas as any).msRequestFullscreen();
    }
    
    // Lock orientation to landscape on mobile
    if (screen.orientation && 'lock' in screen.orientation) {
      (screen.orientation as any).lock('landscape').catch(() => {
        console.log('Orientation lock not supported');
      });
    }
  }

  private exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }

  public setVisible(visible: boolean): void {
    if (this.button) {
      this.button.setVisible(visible);
    }
  }

  public destroy(): void {
    if (this.button) {
      this.button.destroy();
    }
    
    document.removeEventListener('fullscreenchange', () => this.onFullscreenChange());
    document.removeEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
    document.removeEventListener('mozfullscreenchange', () => this.onFullscreenChange());
    document.removeEventListener('MSFullscreenChange', () => this.onFullscreenChange());
  }
}
