import Phaser from 'phaser';
import { BASE_WIDTH, BASE_HEIGHT } from '../game/constants';

/**
 * MobileControls - Virtual joystick and buttons for touch devices
 */
export class MobileControls {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  
  // D-pad elements (all stacked at same position)
  private dpadCenter!: Phaser.GameObjects.Sprite;
  private dpadUp!: Phaser.GameObjects.Sprite;
  private dpadDown!: Phaser.GameObjects.Sprite;
  private dpadLeft!: Phaser.GameObjects.Sprite;
  private dpadRight!: Phaser.GameObjects.Sprite;
  private dpadTouchArea!: Phaser.GameObjects.Arc;
  private dpadPointer: Phaser.Input.Pointer | null = null;
  private dpadBaseX: number = 0;
  private dpadBaseY: number = 0;
  
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
  private readonly BUTTON_SIZE = 50;

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

    this.dpadBaseX = x;
    this.dpadBaseY = y;

    // D-pad sprite frames from row 14, columns 1-5
    // Sequence: middle, up, right, down, left
    const dpadFrames = {
      center: 442,  // Row 14, Col 1 - middle
      up: 443,      // Row 14, Col 2 - up
      right: 444,   // Row 14, Col 3 - right
      down: 445,    // Row 14, Col 4 - down
      left: 446,    // Row 14, Col 5 - left
    };

    const buttonScale = 3.5;

    // All sprites stacked at the SAME position
    // Create all directional sprites (hidden initially)
    this.dpadUp = this.scene.add.sprite(x, y, 'input-prompts', dpadFrames.up);
    this.dpadUp.setScale(buttonScale);
    this.dpadUp.setVisible(false);
    this.container.add(this.dpadUp);

    this.dpadDown = this.scene.add.sprite(x, y, 'input-prompts', dpadFrames.down);
    this.dpadDown.setScale(buttonScale);
    this.dpadDown.setVisible(false);
    this.container.add(this.dpadDown);

    this.dpadLeft = this.scene.add.sprite(x, y, 'input-prompts', dpadFrames.left);
    this.dpadLeft.setScale(buttonScale);
    this.dpadLeft.setVisible(false);
    this.container.add(this.dpadLeft);

    this.dpadRight = this.scene.add.sprite(x, y, 'input-prompts', dpadFrames.right);
    this.dpadRight.setScale(buttonScale);
    this.dpadRight.setVisible(false);
    this.container.add(this.dpadRight);

    // Center sprite (visible when not pressing any direction)
    this.dpadCenter = this.scene.add.sprite(x, y, 'input-prompts', dpadFrames.center);
    this.dpadCenter.setScale(buttonScale);
    this.dpadCenter.setVisible(true);
    this.container.add(this.dpadCenter);

    // Create invisible touch area
    this.dpadTouchArea = this.scene.add.circle(x, y, this.JOYSTICK_SIZE / 2, 0x000000, 0);
    this.dpadTouchArea.setInteractive();
    this.container.add(this.dpadTouchArea);

    // Set up touch events
    this.scene.input.on('pointerdown', this.onDpadDown, this);
    this.scene.input.on('pointermove', this.onDpadMove, this);
    this.scene.input.on('pointerup', this.onDpadUp, this);
  }

  private onDpadDown(pointer: Phaser.Input.Pointer): void {
    const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.dpadBaseX, this.dpadBaseY);
    if (distance <= this.JOYSTICK_SIZE / 2) {
      this.dpadPointer = pointer;
      this.updateDpadVisual(pointer);
    }
  }

  private onDpadMove(pointer: Phaser.Input.Pointer): void {
    if (this.dpadPointer !== pointer) return;
    this.updateDpadVisual(pointer);
  }

  private onDpadUp(pointer: Phaser.Input.Pointer): void {
    if (this.dpadPointer !== pointer) return;

    this.dpadPointer = null;
    this._moveX = 0;
    this._moveY = 0;

    // Show center sprite, hide all directional sprites
    this.dpadCenter.setVisible(true);
    this.dpadUp.setVisible(false);
    this.dpadDown.setVisible(false);
    this.dpadLeft.setVisible(false);
    this.dpadRight.setVisible(false);
  }

  private updateDpadVisual(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.x - this.dpadBaseX;
    const dy = pointer.y - this.dpadBaseY;

    // Determine primary direction
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Hide all sprites first
    this.dpadCenter.setVisible(false);
    this.dpadUp.setVisible(false);
    this.dpadDown.setVisible(false);
    this.dpadLeft.setVisible(false);
    this.dpadRight.setVisible(false);

    // Show appropriate sprite and set movement
    if (absX > absY) {
      // Horizontal movement
      if (dx > 0) {
        this.dpadRight.setVisible(true);
        this._moveX = 1;
        this._moveY = 0;
      } else {
        this.dpadLeft.setVisible(true);
        this._moveX = -1;
        this._moveY = 0;
      }
    } else {
      // Vertical movement
      if (dy > 0) {
        this.dpadDown.setVisible(true);
        this._moveX = 0;
        this._moveY = 1;
      } else {
        this.dpadUp.setVisible(true);
        this._moveX = 0;
        this._moveY = -1;
      }
    }
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

  private createButton(x: number, y: number, label: string, _color: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Use gamepad button frames from the sprite sheet
    // A is row 1 column 5, B is row 1 column 6
    // Row 1 (0-indexed row 0) = 0 * 34 = 0
    // Column 5 (0-indexed 4) = 0 + 4 = 4
    // Column 6 (0-indexed 5) = 0 + 5 = 5
    const buttonFrames = {
      A: 4,  // A button (row 1, col 5)
      B: 5,  // B button (row 1, col 6)
    };

    const frame = label === 'A' ? buttonFrames.A : buttonFrames.B;

    // Create button sprite - clean, no text overlay
    const button = this.scene.add.sprite(0, 0, 'input-prompts', frame);
    button.setScale(4);
    button.setAlpha(0.85);
    button.setInteractive({ useHandCursor: true });

    container.add(button);

    // Set up button events with scale feedback
    button.on('pointerdown', () => {
      button.setScale(3.7);
      button.setAlpha(1);
      if (label === 'A') {
        this._jumpPressed = true;
      } else if (label === 'B') {
        this._attackPressed = true;
      }
    });

    button.on('pointerup', () => {
      button.setScale(4);
      button.setAlpha(0.85);
      if (label === 'A') {
        this._jumpPressed = false;
      } else if (label === 'B') {
        this._attackPressed = false;
      }
    });

    button.on('pointerout', () => {
      button.setScale(4);
      button.setAlpha(0.85);
      if (label === 'A') {
        this._jumpPressed = false;
      } else if (label === 'B') {
        this._attackPressed = false;
      }
    });

    return container;
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
    this.scene.input.off('pointerdown', this.onDpadDown, this);
    this.scene.input.off('pointermove', this.onDpadMove, this);
    this.scene.input.off('pointerup', this.onDpadUp, this);
    this.container.destroy();
  }
}
