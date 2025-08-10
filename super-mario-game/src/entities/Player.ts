import { Entity } from './Entity';
import { Vector2D, InputState, EntityConfig } from '@/types/game';
import { PhysicsUtils, PHYSICS_CONSTANTS } from '@/utils/physics';

export class Player extends Entity {
  private jumpBuffer: number = 0;
  private coyoteTime: number = 0;
  private running: boolean = false;
  private crouching: boolean = false;
  private invulnerable: boolean = false;
  private invulnerabilityTimer: number = 0;
  private initialPosition: Vector2D;
  private powerLevel: number = 0; // 0 = small, 1 = super, 2 = fire

  // Animation states
  private animationState: 'idle' | 'walking' | 'running' | 'jumping' | 'falling' | 'crouching' = 'idle';

  constructor(config: EntityConfig) {
    super({
      ...config,
      type: 'player',
      health: 1
    });
    
    this.initialPosition = { ...config.position };
  }

  /**
   * Update player based on input and game state
   */
  public update(deltaTime: number): void {
    if (!this.active) return;

    // Update timers
    this.updateTimers(deltaTime);
    
    // Apply physics
    this.applyPhysics();
    
    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    // Update animation
    this.updateAnimationState();
    this.updateSprite(deltaTime);
    
    // Reset ground state (will be set by collision detection)
    this.onGround = false;
  }

  /**
   * Handle input for player movement
   */
  public handleInput(inputState: InputState): void {
    if (!this.active) return;

    // Horizontal movement
    this.handleHorizontalMovement(inputState);
    
    // Jumping
    this.handleJumping(inputState);
    
    // Crouching
    this.handleCrouching(inputState);
    
    // Running
    this.running = inputState.run;
  }

  private handleHorizontalMovement(inputState: InputState): void {
    const acceleration = this.running ? 
      PHYSICS_CONSTANTS.acceleration * 1.5 : 
      PHYSICS_CONSTANTS.acceleration;
    
    const maxSpeed = this.running ? 
      PHYSICS_CONSTANTS.maxVelocityX * 1.2 : 
      PHYSICS_CONSTANTS.maxVelocityX * 0.8;

    if (inputState.left && !inputState.right) {
      this.velocity.x = Math.max(this.velocity.x - acceleration, -maxSpeed);
      this.facingRight = false;
    } else if (inputState.right && !inputState.left) {
      this.velocity.x = Math.min(this.velocity.x + acceleration, maxSpeed);
      this.facingRight = true;
    }
  }

  private handleJumping(inputState: InputState): void {
    // Jump buffer - allows jump input slightly before landing
    if (inputState.jump) {
      this.jumpBuffer = 150; // ms
    }

    // Coyote time - allows jumping slightly after leaving ground
    if (this.onGround) {
      this.coyoteTime = 150; // ms
    }

    // Perform jump if conditions are met
    if (this.jumpBuffer > 0 && (this.onGround || this.coyoteTime > 0)) {
      this.velocity.y = PHYSICS_CONSTANTS.jumpForce;
      this.jumpBuffer = 0;
      this.coyoteTime = 0;
      this.onGround = false;
    }

    // Variable jump height (release jump early for lower jump)
    if (!inputState.jump && this.velocity.y < 0) {
      this.velocity.y *= 0.5;
    }
  }

  private handleCrouching(inputState: InputState): void {
    const wasCrouching = this.crouching;
    this.crouching = inputState.down && this.onGround;

    // Adjust hitbox when crouching
    if (this.crouching && !wasCrouching) {
      this.size.y *= 0.5;
      this.position.y += this.size.y;
    } else if (!this.crouching && wasCrouching) {
      this.position.y -= this.size.y;
      this.size.y *= 2;
    }
  }

  private updateTimers(deltaTime: number): void {
    this.jumpBuffer = Math.max(0, this.jumpBuffer - deltaTime);
    this.coyoteTime = Math.max(0, this.coyoteTime - deltaTime);
    
    if (this.invulnerable) {
      this.invulnerabilityTimer -= deltaTime;
      if (this.invulnerabilityTimer <= 0) {
        this.invulnerable = false;
      }
    }
  }

  private updateAnimationState(): void {
    if (!this.onGround && this.velocity.y < 0) {
      this.animationState = 'jumping';
    } else if (!this.onGround && this.velocity.y > 0) {
      this.animationState = 'falling';
    } else if (this.crouching) {
      this.animationState = 'crouching';
    } else if (Math.abs(this.velocity.x) > 0.1) {
      this.animationState = this.running ? 'running' : 'walking';
    } else {
      this.animationState = 'idle';
    }
  }

  /**
   * Handle collision with other entities
   */
  public handleCollision(other: Entity): void {
    if (!this.active || this.invulnerable) return;

    switch (other.type) {
      case 'goomba':
      case 'koopa':
        this.handleEnemyCollision(other);
        break;
      case 'coin':
        // Handle coin collection
        break;
      case 'powerup':
        this.handlePowerupCollision(other);
        break;
    }
  }

  private handleEnemyCollision(enemy: Entity): void {
    const playerCenter = this.getCenter();
    const enemyCenter = enemy.getCenter();

    // Check if player is stomping enemy (player is above and falling)
    if (playerCenter.y < enemyCenter.y && this.velocity.y > 0) {
      // Stomp enemy
      enemy.destroy();
      this.velocity.y = PHYSICS_CONSTANTS.jumpForce * 0.5; // Small bounce
    } else {
      // Player takes damage
      this.takeDamageFromEnemy();
    }
  }

  private handlePowerupCollision(powerup: Entity): void {
    this.powerUp();
    powerup.destroy();
  }

  private takeDamageFromEnemy(): void {
    if (this.powerLevel > 0) {
      this.powerDown();
      this.makeInvulnerable(2000); // 2 seconds
    } else {
      this.destroy();
    }
  }

  /**
   * Power up Mario
   */
  public powerUp(): void {
    if (this.powerLevel < 2) {
      this.powerLevel++;
      
      // Adjust size for Super Mario
      if (this.powerLevel === 1) {
        this.size.y *= 2;
        this.position.y -= this.size.y / 2;
      }
    }
  }

  /**
   * Power down Mario
   */
  public powerDown(): void {
    if (this.powerLevel > 0) {
      this.powerLevel--;
      
      // Adjust size back to small Mario
      if (this.powerLevel === 0) {
        this.size.y /= 2;
        this.position.y += this.size.y / 2;
      }
    }
  }

  /**
   * Make player temporarily invulnerable
   */
  private makeInvulnerable(duration: number): void {
    this.invulnerable = true;
    this.invulnerabilityTimer = duration;
  }

  /**
   * Check if player is invulnerable
   */
  public isInvulnerable(): boolean {
    return this.invulnerable;
  }

  /**
   * Get current power level
   */
  public getPowerLevel(): number {
    return this.powerLevel;
  }

  /**
   * Render the player
   */
  public render(ctx: CanvasRenderingContext2D, camera: Vector2D): void {
    if (!this.active) return;

    const screenX = this.position.x - camera.x;
    const screenY = this.position.y - camera.y;

    // Flashing effect when invulnerable
    if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
      return; // Skip rendering every other frame
    }

    // Simple colored rectangle for now (replace with sprite rendering later)
    ctx.fillStyle = this.getPlayerColor();
    ctx.fillRect(screenX, screenY, this.size.x, this.size.y);

    // Debug info
    if (process.env.NODE_ENV === 'development') {
      ctx.strokeStyle = 'red';
      ctx.strokeRect(screenX, screenY, this.size.x, this.size.y);
      
      // Show facing direction
      ctx.fillStyle = 'blue';
      const arrowX = this.facingRight ? screenX + this.size.x : screenX;
      ctx.fillRect(arrowX - 2, screenY + this.size.y / 2 - 1, 4, 2);
    }
  }

  private getPlayerColor(): string {
    switch (this.powerLevel) {
      case 0: return '#8B4513'; // Brown (small Mario)
      case 1: return '#FF6B6B'; // Red (Super Mario)
      case 2: return '#4ECDC4'; // Teal (Fire Mario)
      default: return '#8B4513';
    }
  }

  /**
   * Reset player to initial state
   */
  public reset(): void {
    this.position = { ...this.initialPosition };
    this.velocity = { x: 0, y: 0 };
    this.health = 1;
    this.active = true;
    this.onGround = false;
    this.powerLevel = 0;
    this.invulnerable = false;
    this.invulnerabilityTimer = 0;
    this.jumpBuffer = 0;
    this.coyoteTime = 0;
    this.running = false;
    this.crouching = false;
    this.animationState = 'idle';
    this.facingRight = true;
  }

  /**
   * Respawn player at checkpoint or start
   */
  public respawn(position?: Vector2D): void {
    this.reset();
    if (position) {
      this.position = { ...position };
      this.initialPosition = { ...position };
    }
  }
}