import Phaser from 'phaser';
import { InputMapper, GameAction } from '../systems/InputMapper';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY, COYOTE_TIME_FRAMES, INPUT_BUFFER_FRAMES } from '../game/constants';
import { WeaponManager } from '../systems/WeaponManager';
import { StatusEffectManager } from '../systems/StatusEffectManager';
import { StatusEffectType } from '../systems/status/StatusEffect';
import { SoggyEffect } from '../systems/status/SoggyEffect';

/**
 * Player entity with physics, movement, and game feel enhancements
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  private inputMapper: InputMapper;
  private weaponManager: WeaponManager;
  private statusEffectManager: StatusEffectManager;
  private coyoteFrames: number = 0;
  private jumpBufferFrames: number = 0;
  private currentSpeed: number = PLAYER_SPEED;

  constructor(scene: Phaser.Scene, x: number, y: number, inputMapper: InputMapper) {
    // Use the Athlone character sprite
    super(scene, x, y, 'character-west');

    this.inputMapper = inputMapper;

    // Get weapon and status systems from registry
    this.weaponManager = scene.registry.get('weaponManager') as WeaponManager;
    this.statusEffectManager = scene.registry.get('statusEffectManager') as StatusEffectManager;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set this player as the owner/target for systems
    if (this.weaponManager) {
      this.weaponManager.setOwner(this);
    }
    if (this.statusEffectManager) {
      this.statusEffectManager.setTarget(this);
    }

    // Set up physics body
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setCollideWorldBounds(true);
      
      // Define hitbox size (feet area)
      const hitWidth = 14;
      const hitHeight = 34; 
      
      body.setSize(hitWidth, hitHeight);
      
      // Calculate offset to center horizontally and align to bottom (feet)
      // The sprite has 8 pixels of space at the bottom, so we offset by -8
      const offsetX = (this.width - hitWidth) / 2;
      const offsetY = this.height - hitHeight - 7;
      
      body.setOffset(offsetX, offsetY);
    }

    // Set origin for proper rotation
    this.setOrigin(0.5, 0.5);
  }

  update(_time: number, _delta: number): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Update systems
    if (this.weaponManager) {
      this.weaponManager.update();
    }
    if (this.statusEffectManager) {
      this.statusEffectManager.update();
    }

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

    // Handle horizontal movement (use currentSpeed which can be modified by status effects)
    const axis = this.inputMapper.getAxis();
    if (axis.x !== 0) {
      body.setVelocityX(axis.x * this.currentSpeed);

      // Flip sprite based on direction
      if (axis.x < 0) {
        this.setFlipX(false); // Moving left - keep west sprite as-is
      } else if (axis.x > 0) {
        this.setFlipX(true); // Moving right - flip west sprite to face right
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

    // Handle weapon input
    this.handleWeaponInput();

    // Update animations based on state
    this.updateAnimation();
  }

  private handleWeaponInput(): void {
    if (!this.weaponManager) return;

    const inputState = this.inputMapper.getInputState();

    // Weapon switching
    if (inputState.weaponNext) {
      this.weaponManager.nextWeapon();
    }
    if (inputState.weaponPrevious) {
      this.weaponManager.previousWeapon();
    }

    // Primary fire
    if (inputState.primaryFireJustPressed || inputState.primaryFire) {
      const facingDirection = {
        x: this.flipX ? -1 : 1,
        y: 0,
      };
      this.weaponManager.fire(facingDirection);
    }
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

    // TODO: Add actual sprite animations when animation assets are available
    // For now, the character sprite displays without tints
  }

  /**
   * Called when player takes damage
   */
  public takeDamage(amount: number): void {
    let finalDamage = amount;

    // Check for Soggy status (2x damage)
    if (this.statusEffectManager) {
      const soggyEffect = this.statusEffectManager.getEffect(StatusEffectType.SOGGY);
      if (soggyEffect) {
        finalDamage *= (soggyEffect as SoggyEffect).getDamageMultiplier();
      }
    }

    console.log(`Player took ${finalDamage} damage (base: ${amount})`);

    // Flash red briefly
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      // Only clear tint if not soggy
      if (!this.statusEffectManager || !this.statusEffectManager.hasEffect(StatusEffectType.SOGGY)) {
        this.clearTint();
      } else {
        this.setTint(0x8888ff); // Restore soggy tint
      }
    });

    // TODO: Reduce health
  }

  /**
   * Apply Soggy status (called by saturation mechanic)
   */
  public applySoggy(duration: number = 300): void {
    if (!this.statusEffectManager) return;
    const soggyEffect = new SoggyEffect(duration);
    this.statusEffectManager.applyEffect(soggyEffect);
  }

  /**
   * Get current speed (can be modified by status effects)
   */
  public getSpeed(): number {
    return this.currentSpeed;
  }

  /**
   * Set current speed (called by status effects)
   */
  public setSpeed(speed: number): void {
    this.currentSpeed = speed;
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
