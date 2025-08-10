import { Entity } from '@/entities/Entity';
import { Player } from '@/entities/Player';
import { Enemy, Goomba, Koopa } from '@/entities/Enemy';
import { InputHandler } from '@/utils/inputHandler';
import { GameStateManager } from '@/utils/gameStateManager';
import { LevelLoader } from '@/utils/levelLoader';
import { PhysicsUtils } from '@/utils/physics';
import { Vector2D, LevelData, BlockData, Rectangle, InputState, GameState } from '@/types/game';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private inputHandler: InputHandler;
  private gameStateManager: GameStateManager;
  
  // Game objects
  private player: Player;
  private entities: Entity[] = [];
  private blocks: Rectangle[] = [];
  private collectibles: Entity[] = [];
  
  // Level data
  private currentLevel: LevelData | null = null;
  private camera: Vector2D = { x: 0, y: 0 };
  
  // Game loop
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  
  // Performance tracking
  private frameCount: number = 0;
  private fps: number = 0;
  private lastFpsUpdate: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    if (!this.ctx) {
      throw new Error('Could not get 2D rendering context');
    }

    // Initialize systems
    this.inputHandler = new InputHandler();
    this.gameStateManager = new GameStateManager();
    
    // Create player
    this.player = new Player({
      position: { x: 100, y: 320 },
      velocity: { x: 0, y: 0 },
      size: { x: 16, y: 16 },
      type: 'player'
    });

    // Setup input handling
    this.inputHandler.subscribe(this.handleInput.bind(this));
    
    // Setup game state management
    this.gameStateManager.subscribe(this.handleGameStateChange.bind(this));

    // Configure canvas
    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Set canvas size
    this.canvas.width = 800;
    this.canvas.height = 480;
    
    // Disable image smoothing for pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    
    // Set default styles
    this.ctx.fillStyle = '#5C94FC'; // Sky blue background
    this.ctx.font = '16px monospace';
  }

  /**
   * Initialize and start the game
   */
  public async init(): Promise<void> {
    try {
      // Load first level
      await this.loadLevel(1);
      
      // Start game loop
      this.start();
      
      console.log('Game initialized successfully');
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }

  /**
   * Load a specific level
   */
  public async loadLevel(levelId: number): Promise<void> {
    try {
      this.currentLevel = await LevelLoader.loadLevel(levelId);
      
      if (!LevelLoader.validateLevel(this.currentLevel)) {
        throw new Error(`Invalid level data for level ${levelId}`);
      }

      // Reset game objects
      this.entities = [];
      this.blocks = [];
      this.collectibles = [];

      // Setup player spawn
      this.player.respawn(this.currentLevel.playerSpawn);

      // Create blocks
      this.createBlocks();
      
      // Create enemies
      this.createEnemies();
      
      // Create collectibles
      this.createCollectibles();

      // Reset camera
      this.camera = { x: 0, y: 0 };

      console.log(`Level ${levelId} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load level ${levelId}:`, error);
    }
  }

  private createBlocks(): void {
    if (!this.currentLevel) return;

    this.blocks = this.currentLevel.blocks.map(blockData => ({
      x: blockData.position.x,
      y: blockData.position.y,
      width: 32, // Standard block size
      height: 32
    }));
  }

  private createEnemies(): void {
    if (!this.currentLevel) return;

    this.currentLevel.enemies.forEach(enemyData => {
      let enemy: Enemy;
      
      switch (enemyData.type) {
        case 'goomba':
          enemy = new Goomba(enemyData.position);
          break;
        case 'koopa':
          enemy = new Koopa(enemyData.position);
          break;
        default:
          return;
      }
      
      this.entities.push(enemy);
    });
  }

  private createCollectibles(): void {
    if (!this.currentLevel) return;

    // For now, collectibles are simple entities
    // In a full implementation, you'd create specific collectible classes
    this.currentLevel.collectibles.forEach(collectibleData => {
      // This would be replaced with proper collectible entities
      console.log(`Creating collectible: ${collectibleData.type} at`, collectibleData.position);
    });
  }

  /**
   * Start the game loop
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
    
    console.log('Game started');
  }

  /**
   * Stop the game loop
   */
  public stop(): void {
    this.isRunning = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    console.log('Game stopped');
  }

  /**
   * Main game loop
   */
  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update FPS counter
    this.updateFPS(currentTime);

    // Only update if game is active
    if (this.gameStateManager.isGameActive()) {
      this.update(deltaTime);
    }
    
    this.render();
    
    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  /**
   * Update game logic
   */
  private update(deltaTime: number): void {
    if (!this.currentLevel) return;

    // Update player
    this.player.update(deltaTime);
    
    // Update entities
    this.entities.forEach(entity => {
      if (entity.active) {
        entity.update(deltaTime);
      }
    });

    // Handle collisions
    this.handleCollisions();
    
    // Update camera
    this.updateCamera();
    
    // Check win/lose conditions
    this.checkGameConditions();

    // Remove inactive entities
    this.cleanupEntities();
  }

  /**
   * Handle all collision detection
   */
  private handleCollisions(): void {
    const playerRect = this.player.getRect();

    // Player vs blocks
    this.blocks.forEach(block => {
      if (PhysicsUtils.checkCollision(playerRect, block)) {
        const resolved = PhysicsUtils.resolveCollision(
          playerRect,
          block,
          this.player.velocity
        );
        
        this.player.setPosition(resolved.position.x, resolved.position.y);
        this.player.setVelocity(resolved.velocity.x, resolved.velocity.y);
        
        // Set onGround if player is standing on block
        if (resolved.velocity.y === 0 && this.player.velocity.y >= 0) {
          this.player.onGround = true;
        }
      }
    });

    // Player vs entities
    this.entities.forEach(entity => {
      if (entity.active && this.player.checkCollision(entity)) {
        this.player.handleCollision(entity);
        entity.handleCollision(this.player);
      }
    });

    // Entities vs blocks
    this.entities.forEach(entity => {
      if (!entity.active) return;
      
      const entityRect = entity.getRect();
      
      this.blocks.forEach(block => {
        if (PhysicsUtils.checkCollision(entityRect, block)) {
          const resolved = PhysicsUtils.resolveCollision(
            entityRect,
            block,
            entity.velocity
          );
          
          entity.setPosition(resolved.position.x, resolved.position.y);
          entity.setVelocity(resolved.velocity.x, resolved.velocity.y);
          
          // Set onGround for entities
          if (resolved.velocity.y === 0 && entity.velocity.y >= 0) {
            entity.onGround = true;
          }
          
          // Handle wall collision for enemies
          if (entity instanceof Enemy && (resolved.velocity.x === 0)) {
            entity.handleWallCollision();
          }
        }
      });
    });
  }

  /**
   * Update camera position
   */
  private updateCamera(): void {
    if (!this.currentLevel) return;

    const playerCenter = this.player.getCenter();
    const cameraWidth = this.canvas.width;
    const cameraHeight = this.canvas.height;

    // Follow player with some offset
    this.camera.x = playerCenter.x - cameraWidth / 2;
    this.camera.y = playerCenter.y - cameraHeight / 2;

    // Clamp camera to level bounds
    this.camera.x = Math.max(0, Math.min(this.currentLevel.width - cameraWidth, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.currentLevel.height - cameraHeight, this.camera.y));
  }

  /**
   * Check win/lose conditions
   */
  private checkGameConditions(): void {
    if (!this.currentLevel) return;

    // Check if player reached goal
    const playerCenter = this.player.getCenter();
    const goalDistance = PhysicsUtils.distance(playerCenter, this.currentLevel.goalPosition);
    
    if (goalDistance < 50) {
      this.gameStateManager.completeLevel();
    }

    // Check if player fell off the world
    if (this.player.position.y > this.currentLevel.height + 100) {
      this.gameStateManager.powerDown();
      this.player.respawn();
    }
  }

  /**
   * Remove inactive entities
   */
  private cleanupEntities(): void {
    this.entities = this.entities.filter(entity => entity.active);
  }

  /**
   * Render the game
   */
  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#5C94FC';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.currentLevel) return;

    // Render blocks
    this.renderBlocks();
    
    // Render entities
    this.entities.forEach(entity => {
      entity.render(this.ctx, this.camera);
    });
    
    // Render player
    this.player.render(this.ctx, this.camera);
    
    // Render UI
    this.renderUI();
    
    // Render debug info
    if (process.env.NODE_ENV === 'development') {
      this.renderDebugInfo();
    }
  }

  private renderBlocks(): void {
    this.ctx.fillStyle = '#8B4513';
    
    this.blocks.forEach(block => {
      const screenX = block.x - this.camera.x;
      const screenY = block.y - this.camera.y;
      
      // Only render visible blocks
      if (screenX > -block.width && screenX < this.canvas.width &&
          screenY > -block.height && screenY < this.canvas.height) {
        this.ctx.fillRect(screenX, screenY, block.width, block.height);
        
        // Add simple border
        this.ctx.strokeStyle = '#654321';
        this.ctx.strokeRect(screenX, screenY, block.width, block.height);
      }
    });
  }

  private renderUI(): void {
    const gameState = this.gameStateManager.getState();
    
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'left';
    
    // Score
    this.ctx.fillText(`Score: ${gameState.score.toLocaleString()}`, 10, 30);
    
    // Lives
    this.ctx.fillText(`Lives: ${gameState.lives}`, 10, 50);
    
    // Coins
    this.ctx.fillText(`Coins: ${gameState.coins}`, 10, 70);
    
    // Time
    const minutes = Math.floor(gameState.time / 60);
    const seconds = gameState.time % 60;
    this.ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, 10, 90);
    
    // Level
    this.ctx.fillText(`World 1-${gameState.level}`, 10, 110);

    // Game status messages
    if (gameState.gameStatus === 'paused') {
      this.renderPauseScreen();
    } else if (gameState.gameStatus === 'gameover') {
      this.renderGameOverScreen();
    } else if (gameState.gameStatus === 'complete') {
      this.renderLevelCompleteScreen();
    }
  }

  private renderPauseScreen(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Pause text
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.font = '32px monospace';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Press P or ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
  }

  private renderGameOverScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'red';
    this.ctx.textAlign = 'center';
    this.ctx.font = '32px monospace';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
  }

  private renderLevelCompleteScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.font = '32px monospace';
    this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2);
  }

  private renderDebugInfo(): void {
    this.ctx.fillStyle = 'yellow';
    this.ctx.textAlign = 'right';
    this.ctx.font = '12px monospace';
    
    const y = this.canvas.height - 60;
    this.ctx.fillText(`FPS: ${this.fps}`, this.canvas.width - 10, y);
    this.ctx.fillText(`Entities: ${this.entities.length}`, this.canvas.width - 10, y + 15);
    this.ctx.fillText(`Player: ${Math.round(this.player.position.x)}, ${Math.round(this.player.position.y)}`, this.canvas.width - 10, y + 30);
    this.ctx.fillText(`Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`, this.canvas.width - 10, y + 45);
  }

  private updateFPS(currentTime: number): void {
    this.frameCount++;
    
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }
  }

  /**
   * Handle input state changes
   */
  private handleInput(inputState: InputState): void {
    // Handle pause
    if (inputState.pause) {
      this.gameStateManager.togglePause();
      return;
    }

    // Only handle game input when playing
    if (this.gameStateManager.isGameActive()) {
      this.player.handleInput(inputState);
    }
  }

  /**
   * Handle game state changes
   */
  private handleGameStateChange(gameState: GameState): void {
    // React to game state changes if needed
    console.log('Game state changed:', gameState.gameStatus);
  }

  /**
   * Resize canvas
   */
  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stop();
    this.inputHandler.destroy();
    this.gameStateManager.destroy();
  }

  /**
   * Get current game state
   */
  public getGameState(): GameState {
    return this.gameStateManager.getState();
  }
}