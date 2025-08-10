import { Vector2D, Rectangle, Sprite, EntityType, EntityConfig } from '@/types/game';
import { PhysicsUtils } from '@/utils/physics';

export abstract class Entity {
  public position: Vector2D;
  public velocity: Vector2D;
  public size: Vector2D;
  public sprite?: Sprite;
  public type: EntityType;
  public health: number;
  public facingRight: boolean;
  public onGround: boolean = false;
  public active: boolean = true;

  constructor(config: EntityConfig) {
    this.position = { ...config.position };
    this.velocity = { ...config.velocity };
    this.size = { ...config.size };
    this.sprite = config.sprite;
    this.type = config.type;
    this.health = config.health || 1;
    this.facingRight = config.facingRight !== false; // Default to true
  }

  /**
   * Get entity as rectangle for collision detection
   */
  public getRect(): Rectangle {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.size.x,
      height: this.size.y
    };
  }

  /**
   * Get entity center point
   */
  public getCenter(): Vector2D {
    return {
      x: this.position.x + this.size.x / 2,
      y: this.position.y + this.size.y / 2
    };
  }

  /**
   * Check collision with another entity
   */
  public checkCollision(other: Entity): boolean {
    return PhysicsUtils.checkCollision(this.getRect(), other.getRect());
  }

  /**
   * Set position
   */
  public setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
  }

  /**
   * Move by offset
   */
  public move(dx: number, dy: number): void {
    this.position.x += dx;
    this.position.y += dy;
  }

  /**
   * Set velocity
   */
  public setVelocity(vx: number, vy: number): void {
    this.velocity.x = vx;
    this.velocity.y = vy;
  }

  /**
   * Add to velocity
   */
  public addVelocity(vx: number, vy: number): void {
    this.velocity.x += vx;
    this.velocity.y += vy;
  }

  /**
   * Apply physics (gravity, friction)
   */
  protected applyPhysics(): void {
    // Apply gravity
    this.velocity = PhysicsUtils.applyGravity(this.velocity);
    
    // Apply friction when on ground
    if (this.onGround) {
      this.velocity = PhysicsUtils.applyFriction(this.velocity);
    }
    
    // Clamp velocity
    this.velocity = PhysicsUtils.clampVelocity(this.velocity);
  }

  /**
   * Update sprite animation
   */
  protected updateSprite(deltaTime: number): void {
    if (!this.sprite) return;

    this.sprite.animationTimer += deltaTime;
    
    if (this.sprite.animationTimer >= this.sprite.animationSpeed) {
      this.sprite.currentFrame = (this.sprite.currentFrame + 1) % this.sprite.totalFrames;
      this.sprite.animationTimer = 0;
    }
  }

  /**
   * Handle collision with another entity
   */
  public abstract handleCollision(other: Entity): void;

  /**
   * Update entity logic
   */
  public abstract update(deltaTime: number): void;

  /**
   * Render entity
   */
  public abstract render(ctx: CanvasRenderingContext2D, camera: Vector2D): void;

  /**
   * Take damage
   */
  public takeDamage(damage: number = 1): boolean {
    this.health -= damage;
    return this.health <= 0;
  }

  /**
   * Heal entity
   */
  public heal(amount: number = 1): void {
    this.health += amount;
  }

  /**
   * Check if entity is alive
   */
  public isAlive(): boolean {
    return this.health > 0 && this.active;
  }

  /**
   * Destroy entity
   */
  public destroy(): void {
    this.active = false;
    this.health = 0;
  }

  /**
   * Reset entity to initial state
   */
  public abstract reset(): void;

  /**
   * Get entity bounds for camera/world boundaries
   */
  public getBounds(): Rectangle {
    return this.getRect();
  }
}