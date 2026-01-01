import Phaser from 'phaser';

/**
 * Game actions enum for input abstraction
 */
export enum GameAction {
  MOVE_LEFT = 'moveLeft',
  MOVE_RIGHT = 'moveRight',
  JUMP = 'jump',
  ATTACK = 'attack',
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
  private virtualJoystick: any; // RexVirtualJoystick
  private gamepadIndex: number = 0;
  private keysPressed: Set<string> = new Set();

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

    // Virtual joystick will be initialized by scenes when needed
    // This is a placeholder for the implementation
  }

  /**
   * Set the virtual joystick instance (called from scenes)
   */
  public setVirtualJoystick(joystick: any): void {
    this.virtualJoystick = joystick;
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

    // Check virtual joystick (lowest priority)
    this.updateVirtualJoystickInput();
  }

  private updateKeyboardInput(): void {
    // Check using event-based key tracking
    const leftDown = this.keysPressed.has('ArrowLeft') || this.keysPressed.has('KeyA');
    const rightDown = this.keysPressed.has('ArrowRight') || this.keysPressed.has('KeyD');
    const jumpDown = this.keysPressed.has('Space') || this.keysPressed.has('ArrowUp') || this.keysPressed.has('KeyW');

    if (leftDown) {
      this.currentActions.add(GameAction.MOVE_LEFT);
    }
    if (rightDown) {
      this.currentActions.add(GameAction.MOVE_RIGHT);
    }
    if (jumpDown) {
      this.currentActions.add(GameAction.JUMP);
    }
    if (this.keysPressed.has('KeyZ') || this.keysPressed.has('KeyX')) {
      this.currentActions.add(GameAction.ATTACK);
    }
    if (this.keysPressed.has('Escape')) {
      this.currentActions.add(GameAction.PAUSE);
    }
  }

  private updateGamepadInput(): void {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[this.gamepadIndex];

    if (!gamepad) return;

    // D-pad or left stick
    const axes = gamepad.axes;
    if (axes[0] < -0.3 || gamepad.buttons[14]?.pressed) {
      this.currentActions.add(GameAction.MOVE_LEFT);
    }
    if (axes[0] > 0.3 || gamepad.buttons[15]?.pressed) {
      this.currentActions.add(GameAction.MOVE_RIGHT);
    }

    // A button (index 0) or B button (index 1) for jump
    if (gamepad.buttons[0]?.pressed || gamepad.buttons[12]?.pressed) {
      this.currentActions.add(GameAction.JUMP);
    }

    // X button (index 2) for attack
    if (gamepad.buttons[2]?.pressed) {
      this.currentActions.add(GameAction.ATTACK);
    }

    // Start button for pause
    if (gamepad.buttons[9]?.pressed) {
      this.currentActions.add(GameAction.PAUSE);
    }
  }

  private updateVirtualJoystickInput(): void {
    if (!this.virtualJoystick) return;

    if (this.virtualJoystick.left) {
      this.currentActions.add(GameAction.MOVE_LEFT);
    }
    if (this.virtualJoystick.right) {
      this.currentActions.add(GameAction.MOVE_RIGHT);
    }
    // Virtual joystick up for jump
    if (this.virtualJoystick.up) {
      this.currentActions.add(GameAction.JUMP);
    }
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

    return { x, y };
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
