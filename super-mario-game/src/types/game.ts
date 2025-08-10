// Core game type definitions
export interface Vector2D {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Sprite {
  image: HTMLImageElement | null;
  frameWidth: number;
  frameHeight: number;
  currentFrame: number;
  totalFrames: number;
  animationSpeed: number;
  animationTimer: number;
}

export interface EntityConfig {
  position: Vector2D;
  velocity: Vector2D;
  size: Vector2D;
  sprite?: Sprite;
  type: EntityType;
  health?: number;
  facingRight?: boolean;
}

export type EntityType = 
  | 'player' 
  | 'goomba' 
  | 'koopa' 
  | 'coin' 
  | 'powerup' 
  | 'block' 
  | 'pipe';

export interface GameState {
  score: number;
  lives: number;
  level: number;
  powerLevel: number; // 0 = small, 1 = super, 2 = fire
  gameStatus: 'playing' | 'paused' | 'gameover' | 'complete';
  time: number;
  coins: number;
}

export interface LevelData {
  width: number;
  height: number;
  backgroundImage?: string;
  blocks: BlockData[];
  enemies: EnemyData[];
  collectibles: CollectibleData[];
  playerSpawn: Vector2D;
  goalPosition: Vector2D;
}

export interface BlockData {
  position: Vector2D;
  type: 'ground' | 'brick' | 'question' | 'pipe' | 'platform';
  breakable?: boolean;
  powerup?: string;
}

export interface EnemyData {
  position: Vector2D;
  type: 'goomba' | 'koopa';
  movementRange?: number;
}

export interface CollectibleData {
  position: Vector2D;
  type: 'coin' | 'mushroom' | 'fireflower' | '1up';
  points: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  run: boolean;
  pause: boolean;
}

export interface PhysicsConstants {
  gravity: number;
  friction: number;
  maxVelocityX: number;
  maxVelocityY: number;
  jumpForce: number;
  acceleration: number;
}