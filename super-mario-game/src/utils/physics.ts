import { Vector2D, Rectangle, PhysicsConstants } from '@/types/game';

export const PHYSICS_CONSTANTS: PhysicsConstants = {
  gravity: 0.5,
  friction: 0.8,
  maxVelocityX: 8,
  maxVelocityY: 15,
  jumpForce: -12,
  acceleration: 0.5,
};

export class PhysicsUtils {
  /**
   * Check if two rectangles are colliding
   */
  static checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Get collision direction between two rectangles
   */
  static getCollisionDirection(
    movingRect: Rectangle,
    staticRect: Rectangle,
    velocity: Vector2D
  ): 'top' | 'bottom' | 'left' | 'right' | null {
    if (!this.checkCollision(movingRect, staticRect)) {
      return null;
    }

    const overlapX = Math.min(
      movingRect.x + movingRect.width - staticRect.x,
      staticRect.x + staticRect.width - movingRect.x
    );
    
    const overlapY = Math.min(
      movingRect.y + movingRect.height - staticRect.y,
      staticRect.y + staticRect.height - movingRect.y
    );

    if (overlapX < overlapY) {
      return velocity.x > 0 ? 'left' : 'right';
    } else {
      return velocity.y > 0 ? 'top' : 'bottom';
    }
  }

  /**
   * Apply gravity to velocity
   */
  static applyGravity(velocity: Vector2D): Vector2D {
    return {
      x: velocity.x,
      y: Math.min(velocity.y + PHYSICS_CONSTANTS.gravity, PHYSICS_CONSTANTS.maxVelocityY)
    };
  }

  /**
   * Apply friction to horizontal velocity
   */
  static applyFriction(velocity: Vector2D): Vector2D {
    return {
      x: velocity.x * PHYSICS_CONSTANTS.friction,
      y: velocity.y
    };
  }

  /**
   * Clamp velocity within max limits
   */
  static clampVelocity(velocity: Vector2D): Vector2D {
    return {
      x: Math.max(
        -PHYSICS_CONSTANTS.maxVelocityX,
        Math.min(PHYSICS_CONSTANTS.maxVelocityX, velocity.x)
      ),
      y: Math.max(
        -PHYSICS_CONSTANTS.maxVelocityY,
        Math.min(PHYSICS_CONSTANTS.maxVelocityY, velocity.y)
      )
    };
  }

  /**
   * Calculate distance between two points
   */
  static distance(point1: Vector2D, point2: Vector2D): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Normalize a vector
   */
  static normalize(vector: Vector2D): Vector2D {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) return { x: 0, y: 0 };
    return {
      x: vector.x / length,
      y: vector.y / length
    };
  }

  /**
   * Check if a point is within bounds
   */
  static isInBounds(
    position: Vector2D,
    size: Vector2D,
    bounds: Rectangle
  ): boolean {
    return (
      position.x >= bounds.x &&
      position.y >= bounds.y &&
      position.x + size.x <= bounds.x + bounds.width &&
      position.y + size.y <= bounds.y + bounds.height
    );
  }

  /**
   * Resolve collision by moving entity out of collision
   */
  static resolveCollision(
    entity: Rectangle,
    obstacle: Rectangle,
    velocity: Vector2D
  ): { position: Vector2D; velocity: Vector2D } {
    const direction = this.getCollisionDirection(entity, obstacle, velocity);
    const newPosition = { x: entity.x, y: entity.y };
    const newVelocity = { ...velocity };

    switch (direction) {
      case 'top':
        newPosition.y = obstacle.y - entity.height;
        newVelocity.y = 0;
        break;
      case 'bottom':
        newPosition.y = obstacle.y + obstacle.height;
        newVelocity.y = 0;
        break;
      case 'left':
        newPosition.x = obstacle.x - entity.width;
        newVelocity.x = 0;
        break;
      case 'right':
        newPosition.x = obstacle.x + obstacle.width;
        newVelocity.x = 0;
        break;
    }

    return { position: newPosition, velocity: newVelocity };
  }
}