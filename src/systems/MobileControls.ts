import Phaser from 'phaser';
import { BASE_WIDTH, BASE_HEIGHT } from '../game/constants';

/**
 * MobileControls - Virtual joystick and buttons for touch devices
 */
export class MobileControls {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  
  // Joystick elements
  private joystickBase!: Phaser.GameObjects.Circle;
  private joystickThumb!: Phaser.GameObjects.Circle;
  private joystickPointer: Phaser.Input.Pointer | null = null;
  private joystickStartX: number = 0;
  private joystickStartY: number = 0;
  
  // Button elements
  private jumpButton!: Phaser.GameObjects.Container;
  private attackButton!: Phaser.GameObjects.Container;
  
  // Input state
  private _moveX: number = 0;
  private _moveY: number = 0;
  private _jumpPressed: boolean = false;
  private _attackPressed: boolean = false;
  private _jumpJustPressed: boolean = false;
  private _attackJustPressed: boolean = false;
  
  // Previous state for "just pressed" detection
  private prevJumpPressed: boolean = false;
  private prevAttackPressed: boolean = false;
  
  private readonly JOYSTICK_SIZE = 80;
  private readonly JOYSTICK_THUMB_SIZE = 35;
  private readonly BUTTON_SIZE = 50;
  private readonly DEADZONE = 0.2;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);
    
    // Only create controls on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.createControls();
    } else {
      this.container.setVisible(false);
    }
  }

  private createControls(): void {
    // Create virtual joystick (left side)
    this.createJoystick();
    
    // Create action buttons (right side)
    this.createButtons();
  }

  private createJoystick(): void {
    const x = this.JOYSTICK_SIZE + 20;
    const y = BASE_HEIGHT - this.JOYSTICK_SIZE - 20;
    
    // Base (outer circle)
    this.joystickBase = this.scene.add.circle(x, y, this.JOYSTICK_SIZE / 2, 0x000000, 0.3);
    this.joystickBase.setStrokeStyle(2, 0xffffff, 0.5);
    this.container.add(this.joystickBase);
    
    // Thumb (inner circle)
    this.joystickThumb = this.scene.add.circle(x, y, this.JOYSTICK_THUMB_SIZE / 2, 0xffffff, 0.6);
    this.joystickThumb.setStrokeStyle(2, 0x00ff00, 0.8);
    this.container.add(this.joystickThumb);
    
    // Make joystick interactive
    this.joystickBase.setInteractive();
    
    this.scene.input.on('pointerdown', this.onJoystickDown, this);
    this.scene.input.on('pointermove', this.onJoystickMove, this);
    this.scene.input.on('pointerup', this.onJoystickUp, this);
  }

  private createButtons(): void {
    const baseY = BASE_HEIGHT - this.BUTTON_SIZE - 20;
    
    // Jump button (A button)
    this.jumpButton = this.createButton(
      BASE_WIDTH - this.BUTTON_SIZE - 100,
      baseY,
      'A',
      0x00ff00
    );
    
    // Attack button (B button)
    this.attackButton = this.createButton(
      BASE_WIDTH - this.BUTTON_SIZE - 20,
      baseY - 70,
      'B',
      0xff0000
    );
    
    this.container.add([this.jumpButton, this.attackButton]);
  }

  private createButton(x: number, y: number, label: string, color: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    
    // Button circle
    const circle = this.scene.add.circle(0, 0, this.BUTTON_SIZE / 2, color, 0.4);
    circle.setStrokeStyle(2, 0xffffff, 0.6);
    circle.setInteractive();
    
    // Button label
    const text = this.scene.add.text(0, 0, label, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    
    container.add([circle, text]);
    
    // Set up button events
    circle.on('pointerdown', () => {
      circle.setAlpha(0.8);
      if (label === 'A') {
        this._jumpPressed = true;
      } else if (label === 'B') {
        this._attackPressed = true;
      }
    });
    
    circle.on('pointerup', () => {
      circle.setAlpha(0.4);
      if (label === 'A') {
        this._jumpPressed = false;
      } else if (label === 'B') {
        this._attackPressed = false;
      }
    });
    
    circle.on('pointerout', () => {
      circle.setAlpha(0.4);
      if (label === 'A') {
        this._jumpPressed = false;
      } else if (label === 'B') {
        this._attackPressed = false;
      }
    });
    
    return container;
  }

  private onJoystickDown(pointer: Phaser.Input.Pointer): void {
    const baseX = this.joystickBase.x;
    const baseY = this.joystickBase.y;
    const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, baseX, baseY);
    
    if (distance <= this.JOYSTICK_SIZE / 2) {
      this.joystickPointer = pointer;
      this.joystickStartX = baseX;
      this.joystickStartY = baseY;
    }
  }

  private onJoystickMove(pointer: Phaser.Input.Pointer): void {
    if (this.joystickPointer !== pointer) return;
    
    const baseX = this.joystickStartX;
    const baseY = this.joystickStartY;
    
    const dx = pointer.x - baseX;
    const dy = pointer.y - baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = this.JOYSTICK_SIZE / 2;
    
    if (distance > maxDistance) {
      // Clamp to max distance
      const angle = Math.atan2(dy, dx);
      this.joystickThumb.x = baseX + Math.cos(angle) * maxDistance;
      this.joystickThumb.y = baseY + Math.sin(angle) * maxDistance;
    } else {
      this.joystickThumb.x = pointer.x;
      this.joystickThumb.y = pointer.y;
    }
    
    // Calculate normalized input
    this._moveX = dx / maxDistance;
    this._moveY = dy / maxDistance;
    
    // Apply deadzone
    if (Math.abs(this._moveX) < this.DEADZONE) this._moveX = 0;
    if (Math.abs(this._moveY) < this.DEADZONE) this._moveY = 0;
  }

  private onJoystickUp(pointer: Phaser.Input.Pointer): void {
    if (this.joystickPointer !== pointer) return;
    
    this.joystickPointer = null;
    this.joystickThumb.x = this.joystickStartX;
    this.joystickThumb.y = this.joystickStartY;
    this._moveX = 0;
    this._moveY = 0;
  }

  public update(): void {
    // Update "just pressed" state
    this._jumpJustPressed = this._jumpPressed && !this.prevJumpPressed;
    this._attackJustPressed = this._attackPressed && !this.prevAttackPressed;
    
    this.prevJumpPressed = this._jumpPressed;
    this.prevAttackPressed = this._attackPressed;
  }

  // Public getters for input state
  public get moveX(): number { return this._moveX; }
  public get moveY(): number { return this._moveY; }
  public get jumpPressed(): boolean { return this._jumpPressed; }
  public get jumpJustPressed(): boolean { return this._jumpJustPressed; }
  public get attackPressed(): boolean { return this._attackPressed; }
  public get attackJustPressed(): boolean { return this._attackJustPressed; }

  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  public destroy(): void {
    this.scene.input.off('pointerdown', this.onJoystickDown, this);
    this.scene.input.off('pointermove', this.onJoystickMove, this);
    this.scene.input.off('pointerup', this.onJoystickUp, this);
    this.container.destroy();
  }
}
