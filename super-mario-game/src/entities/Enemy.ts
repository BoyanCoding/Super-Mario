import { Entity } from './Entity';
import { Vector2D, EntityConfig } from '@/types/game';

export class Enemy extends Entity {
  protected movementSpeed: number;
  protected movementDirection: number = -1; // -1 for left, 1 for right
  protected patrolDistance: number;
  protected initialPosition: Vector2D;
  protected patrolCenter: Vector2D;

  constructor(config: EntityConfig, movementSpeed: number = 1, patrolDistance: number = 100) {
    super(config);
    this.movementSpeed = movementSpeed;
    this.patrolDistance = patrolDistance;
    this.initialPosition = { ...config.position };
    this.patrolCenter = { ...config.position };
  }

  /**
   * Basic AI movement pattern
   */
  protected updateAI(): void {
    // Simple patrol movement
    this.velocity.x = this.movementDirection * this.movementSpeed;
    
    // Check if we've reached patrol boundaries
    const distanceFromCenter = this.position.x - this.patrolCenter.x;
    
    if (Math.abs(distanceFromCenter) > this.patrolDistance / 2) {
      this.movementDirection *= -1;
      this.facingRight = this.movementDirection > 0;
    }
  }

  /**
   * Handle collision with walls or platforms
   */
  public handleWallCollision(): void {
    this.movementDirection *= -1;
    this.facingRight = this.movementDirection > 0;
  }

  /**
   * Update enemy logic
   */
  public update(deltaTime: number): void {
    if (!this.active) return;

    this.updateAI();
    this.applyPhysics();
    
    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    // Update sprite animation
    this.updateSprite(deltaTime);
    
    // Reset ground state
    this.onGround = false;
  }

  /**
   * Handle collision with other entities
   */
  public handleCollision(other: Entity): void {
    if (!this.active) return;

    switch (other.type) {
      case 'player':
        // Let the player handle the collision logic
        break;
      case 'block':
        // Handle wall collision
        this.handleWallCollision();
        break;
    }
  }

  /**
   * Render the enemy
   */
  public render(ctx: CanvasRenderingContext2D, camera: Vector2D): void {
    if (!this.active) return;

    const screenX = this.position.x - camera.x;
    const screenY = this.position.y - camera.y;

    // Simple colored rectangle for now
    ctx.fillStyle = this.getEnemyColor();
    ctx.fillRect(screenX, screenY, this.size.x, this.size.y);

    // Debug info
    if (process.env.NODE_ENV === 'development') {
      ctx.strokeStyle = 'orange';
      ctx.strokeRect(screenX, screenY, this.size.x, this.size.y);
      
      // Show movement direction
      ctx.fillStyle = 'yellow';
      const arrowX = this.facingRight ? screenX + this.size.x : screenX;
      ctx.fillRect(arrowX - 1, screenY + this.size.y / 2, 2, 1);
    }
  }

  protected getEnemyColor(): string {
    return '#654321'; // Brown color for basic enemy
  }

  /**
   * Reset enemy to initial state
   */
  public reset(): void {
    this.position = { ...this.initialPosition };
    this.velocity = { x: 0, y: 0 };
    this.health = 1;
    this.active = true;
    this.onGround = false;
    this.movementDirection = -1;
    this.facingRight = false;
  }
}

/**
 * Goomba enemy - simple walking enemy
 */
export class Goomba extends Enemy {
  constructor(position: Vector2D) {
    super(
      {
        position,
        velocity: { x: 0, y: 0 },
        size: { x: 16, y: 16 },
        type: 'goomba'
      },
      1, // movement speed
      120 // patrol distance
    );
  }

  protected getEnemyColor(): string {
    return '#8B4513'; // Saddle brown for Goomba
  }
}

/**
 * Koopa Troopa enemy - walks and can be shell-kicked
 */
export class Koopa extends Enemy {
  private isShell: boolean = false;
  private shellKicked: boolean = false;

  constructor(position: Vector2D) {
    super(
      {
        position,
        velocity: { x: 0, y: 0 },
        size: { x: 16, y: 24 },
        type: 'koopa'
      },
      1.5, // slightly faster than Goomba
      100
    );
  }

  /**
   * Handle being stomped - become shell
   */
  public stomp(): void {
    if (!this.isShell) {
      this.isShell = true;
      this.size.y = 16; // Smaller shell size
      this.position.y += 8; // Adjust position
      this.velocity.x = 0;
      this.movementSpeed = 0;
    } else if (!this.shellKicked) {
      // Kick shell
      this.shellKicked = true;
      this.velocity.x = this.facingRight ? 8 : -8;
    }
  }

  public update(deltaTime: number): void {
    if (this.isShell && !this.shellKicked) {
      // Shell just sits there
      this.velocity.x = 0;
    } else if (this.shellKicked) {
      // Shell moves at constant speed
      // Don't call updateAI for kicked shells
      this.applyPhysics();
    } else {
      // Normal Koopa behavior
      super.update(deltaTime);
    }

    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    // Update sprite animation
    this.updateSprite(deltaTime);
    
    // Reset ground state
    this.onGround = false;
  }

  protected getEnemyColor(): string {
    if (this.isShell) {
      return this.shellKicked ? '#FF4444' : '#00AA00'; // Red if kicked, green if not
    }
    return '#228B22'; // Forest green for Koopa
  }

  public reset(): void {
    super.reset();
    this.isShell = false;
    this.shellKicked = false;
    this.size.y = 24; // Reset to full size
  }
}