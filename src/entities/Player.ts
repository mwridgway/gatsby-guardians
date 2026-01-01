import Phaser from 'phaser';
import { InputMapper, GameAction } from '../systems/InputMapper';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY, COYOTE_TIME_FRAMES, INPUT_BUFFER_FRAMES } from '../game/constants';

/**
 * Player entity with physics, movement, and game feel enhancements
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  private inputMapper: InputMapper;
  private coyoteFrames: number = 0;
  private jumpBufferFrames: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, inputMapper: InputMapper) {
    // Create a simple colored rectangle as placeholder sprite
    // This will be replaced with actual sprite once assets are loaded
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture('player-placeholder', 16, 16);
    graphics.destroy();

    super(scene, x, y, 'player-placeholder');

    this.inputMapper = inputMapper;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setCollideWorldBounds(true);
      body.setSize(14, 16); // Slightly smaller hitbox
      body.setOffset(1, 0);
    }

    // Set origin for proper rotation
    this.setOrigin(0.5, 0.5);
  }

  update(time: number, delta: number): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Update coyote time
    if (body.onFloor()) {
      this.coyoteFrames = COYOTE_TIME_FRAMES;
    } else if (this.coyoteFrames > 0) {
      this.coyoteFrames--;
    }

    // Check if can jump (on floor or in coyote time)
    const canJump = this.coyoteFrames > 0;

    // Handle jump input buffering
    if (this.inputMapper.isActionJustPressed(GameAction.JUMP)) {
      if (canJump) {
        this.jump();
      } else {
        // Buffer the jump input
        this.jumpBufferFrames = INPUT_BUFFER_FRAMES;
      }
    }

    // Consume buffered jump if we land
    if (this.jumpBufferFrames > 0) {
      if (canJump) {
        this.jump();
        this.jumpBufferFrames = 0;
      } else {
        this.jumpBufferFrames--;
      }
    }

    // Handle horizontal movement
    const axis = this.inputMapper.getAxis();
    if (axis.x !== 0) {
      body.setVelocityX(axis.x * PLAYER_SPEED);

      // Flip sprite based on direction
      if (axis.x < 0) {
        this.setFlipX(true);
      } else if (axis.x > 0) {
        this.setFlipX(false);
      }
    } else {
      // Apply friction when not moving
      body.setVelocityX(body.velocity.x * 0.9);

      // Stop completely if velocity is very low
      if (Math.abs(body.velocity.x) < 1) {
        body.setVelocityX(0);
      }
    }

    // Round coordinates for pixel-perfect rendering
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);

    // Update animations based on state
    this.updateAnimation();
  }

  private jump(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(PLAYER_JUMP_VELOCITY);
    this.coyoteFrames = 0; // Use up coyote time

    // TODO: Play jump sound when audio assets are loaded
    // this.scene.registry.get('audioManager').playSFX('jump');
  }

  private updateAnimation(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // TODO: Replace with actual animations once sprite assets are loaded
    // For now, just change tint based on state
    if (!body.onFloor()) {
      // In air - darker green
      this.setTint(0x00aa00);
    } else if (Math.abs(body.velocity.x) > 1) {
      // Moving - bright green
      this.setTint(0x00ff00);
    } else {
      // Idle - medium green
      this.setTint(0x00cc00);
    }
  }

  /**
   * Called when player takes damage
   */
  public takeDamage(amount: number): void {
    // TODO: Implement health system
    console.log(`Player took ${amount} damage`);

    // Flash red briefly
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
  }

  /**
   * Reset player to spawn position
   */
  public reset(x: number, y: number): void {
    this.setPosition(x, y);
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
    }
    this.clearTint();
    this.coyoteFrames = 0;
    this.jumpBufferFrames = 0;
  }
}
