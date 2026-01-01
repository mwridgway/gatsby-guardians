import Phaser from 'phaser';

/**
 * FullscreenManager - Handles fullscreen functionality
 */
export class FullscreenManager {
  private scene: Phaser.Scene;
  private button?: Phaser.GameObjects.Container;
  private isFullscreen: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createFullscreenButton();
    this.setupFullscreenListeners();
  }

  private createFullscreenButton(): void {
    const buttonSize = 40;
    const padding = 10;
    
    // Position in top-left corner
    const x = padding + buttonSize / 2;
    const y = padding + buttonSize / 2;
    
    this.button = this.scene.add.container(x, y);
    this.button.setScrollFactor(0);
    this.button.setDepth(9998);
    
    // Background circle
    const bg = this.scene.add.circle(0, 0, buttonSize / 2, 0x000000, 0.5);
    bg.setStrokeStyle(2, 0xffffff, 0.6);
    bg.setInteractive({ useHandCursor: true });
    
    // Icon (maximize/minimize)
    const icon = this.scene.add.text(0, 0, '⛶', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });
    icon.setOrigin(0.5);
    
    this.button.add([bg, icon]);
    
    // Click handler
    bg.on('pointerdown', () => {
      bg.setAlpha(0.8);
      this.toggleFullscreen();
    });
    
    bg.on('pointerup', () => {
      bg.setAlpha(1);
    });
    
    // Hover effect on desktop
    bg.on('pointerover', () => {
      bg.setStrokeStyle(2, 0x00ff00, 0.8);
    });
    
    bg.on('pointerout', () => {
      bg.setStrokeStyle(2, 0xffffff, 0.6);
    });
    
    // Update icon based on fullscreen state
    this.updateButtonIcon();
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
    if (!this.button) return;
    
    const icon = this.button.getAt(1) as Phaser.GameObjects.Text;
    icon.setText(this.isFullscreen ? '⛶' : '⛶');
    
    // Change color based on state
    const bg = this.button.getAt(0) as Phaser.GameObjects.Circle;
    bg.setFillStyle(this.isFullscreen ? 0x00ff00 : 0x000000, 0.5);
  }

  public toggleFullscreen(): void {
    if (!this.isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
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
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {
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
