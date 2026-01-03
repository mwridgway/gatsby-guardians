import Phaser from 'phaser';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick';
import { InputState, digitalizeAxis, INPUT_DEADZONE } from './InputState';

/**
 * Game actions enum for input abstraction
 */
export enum GameAction {
  MOVE_LEFT = 'moveLeft',
  MOVE_RIGHT = 'moveRight',
  MOVE_UP = 'moveUp',
  MOVE_DOWN = 'moveDown',
  JUMP = 'jump',
  ATTACK = 'attack',              // Keep for backward compatibility
  PRIMARY_FIRE = 'primaryFire',
  SECONDARY_FIRE = 'secondaryFire',
  WEAPON_NEXT = 'weaponNext',
  WEAPON_PREV = 'weaponPrev',
  PAUSE = 'pause',
}

/**
 * InputMapper abstracts input from keyboard, gamepad, and touch
 * Priority: Keyboard > Gamepad > Touch (no conflicts)
 */
export class InputMapper {
  private scene: Phaser.Scene;
  private keys: Map<string, Phaser.Input.Keyboard.Key>;
  private previousActions: Set<GameAction>;
  private currentActions: Set<GameAction>;
  private virtualJoystick: VirtualJoystick | null = null;
  private gamepadIndex: number = 0;
  private keysPressed: Set<string> = new Set();
  private mobileJumpPressed: boolean = false;
  private mobileFirePressed: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.keys = new Map();
    this.previousActions = new Set();
    this.currentActions = new Set();

    // Don't setup keyboard in constructor - will be done when scene changes
  }

  private setupKeyboard(): void {
    if (!this.scene.input.keyboard) {
      console.error('InputMapper: Keyboard not available!');
      return;
    }

    console.log('InputMapper: Setting up keyboard...');

    // Use keyboard events instead of polling isDown
    this.scene.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      this.keysPressed.add(event.code);
    });

    this.scene.input.keyboard.on('keyup', (event: KeyboardEvent) => {
      this.keysPressed.delete(event.code);
    });

    console.log('InputMapper: Keyboard setup complete with event listeners');
  }

  private setupVirtualJoystick(): void {
    // Only show virtual joystick on touch devices
    if (!('ontouchstart' in window)) {
      return;
    }

    // Create base and thumb graphics for the joystick
    const base = this.scene.add.circle(0, 0, 50, 0x888888, 0.5);
    const thumb = this.scene.add.circle(0, 0, 25, 0xcccccc, 0.8);

    // Hide initially - will show on first touch in floating mode
    base.setVisible(false);
    thumb.setVisible(false);

    // Create invisible touch zone for left half of screen
    const leftHalfWidth = this.scene.scale.width / 2;
    const touchZone = this.scene.add.zone(
      leftHalfWidth / 2,
      this.scene.scale.height / 2,
      leftHalfWidth,
      this.scene.scale.height
    );
    touchZone.setInteractive();
    touchZone.setScrollFactor(0);
    touchZone.setDepth(9998); // Below joystick but above game

    // Create Rex VirtualJoystick in FLOATING mode
    this.virtualJoystick = new VirtualJoystick(this.scene, {
      x: leftHalfWidth / 2,  // Center of left half initially
      y: this.scene.scale.height / 2,
      radius: 50,
      base: base,
      thumb: thumb,
      dir: '8dir',   // 8-directional for platformer feel
      forceMin: 16,  // Minimum force to register (sensitivity)
      enable: true,
      fixed: false,  // FLOATING MODE - appears where user touches
    });

    // Set scroll factor and depth so it stays in place during camera movement
    base.setScrollFactor(0).setDepth(9999);
    thumb.setScrollFactor(0).setDepth(10000);

    // Handle touch zone interactions - make joystick appear where touched
    let activePointer: Phaser.Input.Pointer | null = null;

    touchZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log('Touch zone touched at', pointer.x, pointer.y);
      activePointer = pointer;

      // Position joystick where touched
      base.setPosition(pointer.x, pointer.y);
      thumb.setPosition(pointer.x, pointer.y);
      base.setVisible(true);
      thumb.setVisible(true);

      // Update virtual joystick position
      (this.virtualJoystick as any).x = pointer.x;
      (this.virtualJoystick as any).y = pointer.y;
      (this.virtualJoystick as any).setPosition(pointer.x, pointer.y);
    });

    touchZone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (activePointer === pointer) {
        console.log('Touch zone released');
        activePointer = null;
        base.setVisible(false);
        thumb.setVisible(false);
      }
    });

    // Create action buttons (jump, fire)
    this.createMobileActionButtons();
  }

  private createMobileActionButtons(): void {
    const baseY = this.scene.scale.height - 60;

    // Jump button (right side, lower)
    const jumpButton = this.scene.add.graphics();
    jumpButton.fillStyle(0x00ff00, 0.6);
    jumpButton.fillCircle(this.scene.scale.width - 80, baseY, 30);
    jumpButton.setInteractive(
      new Phaser.Geom.Circle(this.scene.scale.width - 80, baseY, 30),
      Phaser.Geom.Circle.Contains
    );
    jumpButton.setScrollFactor(0);
    jumpButton.setDepth(9999);

    jumpButton.on('pointerdown', () => {
      console.log('Jump button pressed');
      this.mobileJumpPressed = true;
    });
    jumpButton.on('pointerup', () => {
      console.log('Jump button released');
      this.mobileJumpPressed = false;
    });
    jumpButton.on('pointerout', () => {
      this.mobileJumpPressed = false;
    });

    // Primary fire button (right side, upper)
    const fireButton = this.scene.add.graphics();
    fireButton.fillStyle(0xff0000, 0.6);
    fireButton.fillCircle(this.scene.scale.width - 80, baseY - 80, 30);
    fireButton.setInteractive(
      new Phaser.Geom.Circle(this.scene.scale.width - 80, baseY - 80, 30),
      Phaser.Geom.Circle.Contains
    );
    fireButton.setScrollFactor(0);
    fireButton.setDepth(9999);

    fireButton.on('pointerdown', () => {
      console.log('Fire button pressed');
      this.mobileFirePressed = true;
    });
    fireButton.on('pointerup', () => {
      console.log('Fire button released');
      this.mobileFirePressed = false;
    });
    fireButton.on('pointerout', () => {
      this.mobileFirePressed = false;
    });
  }

  /**
   * Set the current scene (call when scene changes)
   */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
    this.setupKeyboard();
    this.setupVirtualJoystick();
  }

  /**
   * Update input state (call every frame)
   */
  public update(): void {
    // Store previous frame state
    this.previousActions = new Set(this.currentActions);
    this.currentActions.clear();

    // Check keyboard input
    this.updateKeyboardInput();

    // Check gamepad input
    this.updateGamepadInput();

    // Check virtual joystick and mobile buttons
    this.updateVirtualJoystickInput();
    this.updateMobileInput();
  }

  private updateMobileInput(): void {
    if (this.mobileJumpPressed) {
      this.currentActions.add(GameAction.JUMP);
    }
    if (this.mobileFirePressed) {
      this.currentActions.add(GameAction.PRIMARY_FIRE);
    }
  }

  private updateKeyboardInput(): void {
    // Check using event-based key tracking
    const leftDown = this.keysPressed.has('ArrowLeft') || this.keysPressed.has('KeyA');
    const rightDown = this.keysPressed.has('ArrowRight') || this.keysPressed.has('KeyD');
    const upDown = this.keysPressed.has('ArrowUp') || this.keysPressed.has('KeyW');
    const downDown = this.keysPressed.has('ArrowDown') || this.keysPressed.has('KeyS');

    if (leftDown) {
      this.currentActions.add(GameAction.MOVE_LEFT);
    }
    if (rightDown) {
      this.currentActions.add(GameAction.MOVE_RIGHT);
    }
    if (upDown) {
      this.currentActions.add(GameAction.MOVE_UP);
    }
    if (downDown) {
      this.currentActions.add(GameAction.MOVE_DOWN);
    }

    // Jump
    if (this.keysPressed.has('Space') || upDown) {
      this.currentActions.add(GameAction.JUMP);
    }

    // Primary fire
    if (this.keysPressed.has('KeyZ') || this.keysPressed.has('KeyJ')) {
      this.currentActions.add(GameAction.PRIMARY_FIRE);
    }

    // Secondary fire
    if (this.keysPressed.has('KeyX') || this.keysPressed.has('KeyK')) {
      this.currentActions.add(GameAction.SECONDARY_FIRE);
    }

    // Weapon switching
    if (this.keysPressed.has('KeyQ')) {
      this.currentActions.add(GameAction.WEAPON_PREV);
    }
    if (this.keysPressed.has('KeyE')) {
      this.currentActions.add(GameAction.WEAPON_NEXT);
    }

    // Pause
    if (this.keysPressed.has('Escape')) {
      this.currentActions.add(GameAction.PAUSE);
    }

    // Keep legacy ATTACK for backward compatibility
    if (this.keysPressed.has('KeyZ') || this.keysPressed.has('KeyX')) {
      this.currentActions.add(GameAction.ATTACK);
    }
  }

  private updateGamepadInput(): void {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[this.gamepadIndex];

    if (!gamepad) return;

    // Digitalize left stick with 0.2 deadzone
    const axes = gamepad.axes;
    const digitalX = digitalizeAxis(axes[0], INPUT_DEADZONE);
    const digitalY = digitalizeAxis(axes[1], INPUT_DEADZONE);

    // Horizontal movement
    if (digitalX < 0 || gamepad.buttons[14]?.pressed) {
      this.currentActions.add(GameAction.MOVE_LEFT);
    }
    if (digitalX > 0 || gamepad.buttons[15]?.pressed) {
      this.currentActions.add(GameAction.MOVE_RIGHT);
    }

    // Vertical movement
    if (digitalY < 0 || gamepad.buttons[12]?.pressed) {
      this.currentActions.add(GameAction.MOVE_UP);
    }
    if (digitalY > 0 || gamepad.buttons[13]?.pressed) {
      this.currentActions.add(GameAction.MOVE_DOWN);
    }

    // A button (0) for jump
    if (gamepad.buttons[0]?.pressed) {
      this.currentActions.add(GameAction.JUMP);
    }

    // X button (2) for primary fire
    if (gamepad.buttons[2]?.pressed) {
      this.currentActions.add(GameAction.PRIMARY_FIRE);
    }

    // B button (1) for secondary fire
    if (gamepad.buttons[1]?.pressed) {
      this.currentActions.add(GameAction.SECONDARY_FIRE);
    }

    // Shoulder buttons for weapon switching
    if (gamepad.buttons[4]?.pressed) { // LB
      this.currentActions.add(GameAction.WEAPON_PREV);
    }
    if (gamepad.buttons[5]?.pressed) { // RB
      this.currentActions.add(GameAction.WEAPON_NEXT);
    }

    // Start button for pause
    if (gamepad.buttons[9]?.pressed) {
      this.currentActions.add(GameAction.PAUSE);
    }

    // Keep legacy ATTACK for backward compatibility
    if (gamepad.buttons[2]?.pressed) {
      this.currentActions.add(GameAction.ATTACK);
    }
  }

  private updateVirtualJoystickInput(): void {
    if (!this.virtualJoystick) return;

    // Get raw force values
    const forceX = (this.virtualJoystick as any).forceX || 0;
    const forceY = (this.virtualJoystick as any).forceY || 0;

    // Debug logging (remove after testing)
    if (forceX !== 0 || forceY !== 0) {
      console.log('VirtualJoystick force:', forceX, forceY);
    }

    // Digitalize joystick forces to strict -1, 0, 1
    const digitalX = digitalizeAxis(forceX, INPUT_DEADZONE);
    const digitalY = digitalizeAxis(forceY, INPUT_DEADZONE);

    // Map to actions
    if (digitalX < 0) this.currentActions.add(GameAction.MOVE_LEFT);
    if (digitalX > 0) this.currentActions.add(GameAction.MOVE_RIGHT);
    if (digitalY < 0) this.currentActions.add(GameAction.MOVE_UP);
    if (digitalY > 0) this.currentActions.add(GameAction.MOVE_DOWN);
  }

  /**
   * Check if an action is currently active
   */
  public isActionActive(action: GameAction): boolean {
    return this.currentActions.has(action);
  }

  /**
   * Check if an action was just pressed this frame
   */
  public isActionJustPressed(action: GameAction): boolean {
    return this.currentActions.has(action) && !this.previousActions.has(action);
  }

  /**
   * Get movement axis (-1 to 1)
   */
  public getAxis(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    if (this.isActionActive(GameAction.MOVE_LEFT)) x -= 1;
    if (this.isActionActive(GameAction.MOVE_RIGHT)) x += 1;
    if (this.isActionActive(GameAction.MOVE_UP)) y -= 1;
    if (this.isActionActive(GameAction.MOVE_DOWN)) y += 1;

    return { x, y };
  }

  /**
   * Get complete input state as standardized interface
   * This is the NEW recommended API for consuming input
   */
  public getInputState(): InputState {
    return {
      moveX: this.getAxis().x,
      moveY: this.getAxis().y,
      jumpActive: this.isActionActive(GameAction.JUMP),
      jumpJustPressed: this.isActionJustPressed(GameAction.JUMP),
      primaryFire: this.isActionActive(GameAction.PRIMARY_FIRE),
      primaryFireJustPressed: this.isActionJustPressed(GameAction.PRIMARY_FIRE),
      secondaryFire: this.isActionActive(GameAction.SECONDARY_FIRE),
      secondaryFireJustPressed: this.isActionJustPressed(GameAction.SECONDARY_FIRE),
      weaponNext: this.isActionJustPressed(GameAction.WEAPON_NEXT),
      weaponPrevious: this.isActionJustPressed(GameAction.WEAPON_PREV),
      pause: this.isActionActive(GameAction.PAUSE),
      pauseJustPressed: this.isActionJustPressed(GameAction.PAUSE),
    };
  }

  /**
   * Clean up input listeners
   */
  public destroy(): void {
    this.keys.clear();
    this.currentActions.clear();
    this.previousActions.clear();
  }
}
