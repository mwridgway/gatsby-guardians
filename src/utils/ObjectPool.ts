import Phaser from 'phaser';

/**
 * Generic object pool wrapper for Phaser
 * Prevents GC stutters by reusing objects
 */
export class ObjectPool<T extends Phaser.GameObjects.GameObject> {
  private pool: Phaser.GameObjects.Group;

  constructor(
    scene: Phaser.Scene,
    classType: Function,
    maxSize: number = 50
  ) {
    this.pool = scene.add.group({
      classType: classType as any,
      maxSize: maxSize,
      runChildUpdate: false,
    });
  }

  /**
   * Get an object from the pool
   */
  public get(): T | null {
    const obj = this.pool.get();
    if (obj) {
      obj.setActive(true);
      obj.setVisible(true);
    }
    return obj as T;
  }

  /**
   * Return an object to the pool
   */
  public release(obj: T): void {
    if ('setActive' in obj) (obj as any).setActive(false);
    if ('setVisible' in obj) (obj as any).setVisible(false);
    this.pool.killAndHide(obj);
  }

  /**
   * Get the pool group (for physics collisions)
   */
  public getGroup(): Phaser.GameObjects.Group {
    return this.pool;
  }

  /**
   * Clear all objects from the pool
   */
  public clear(): void {
    this.pool.clear(true, true);
  }
}
