import { LevelData, BlockData, EnemyData, CollectibleData, Vector2D } from '@/types/game';

export class LevelLoader {
  /**
   * Load level data from various sources
   */
  public static async loadLevel(levelId: number): Promise<LevelData> {
    // For now, return hardcoded level data
    // In a real implementation, this would load from JSON files or API
    return this.getHardcodedLevel(levelId);
  }

  /**
   * Get hardcoded level data for testing
   */
  private static getHardcodedLevel(levelId: number): LevelData {
    switch (levelId) {
      case 1:
        return this.getLevel1();
      case 2:
        return this.getLevel2();
      default:
        return this.getLevel1();
    }
  }

  private static getLevel1(): LevelData {
    return {
      width: 3200, // Level width in pixels
      height: 480,  // Level height in pixels
      backgroundImage: undefined, // No background image for now
      playerSpawn: { x: 100, y: 320 },
      goalPosition: { x: 3000, y: 320 },
      
      // Ground blocks and platforms
      blocks: [
        // Ground
        ...this.createGroundRow(0, 360, 200), // Starting ground
        ...this.createGroundRow(320, 360, 100), // Gap, then more ground
        ...this.createGroundRow(520, 360, 300), // Long ground section
        
        // Platforms
        { position: { x: 240, y: 280 }, type: 'platform' },
        { position: { x: 256, y: 280 }, type: 'platform' },
        { position: { x: 272, y: 280 }, type: 'platform' },
        
        // Question blocks
        { position: { x: 256, y: 200 }, type: 'question', powerup: 'mushroom' },
        { position: { x: 400, y: 200 }, type: 'question', powerup: 'coin' },
        { position: { x: 600, y: 200 }, type: 'question', powerup: 'coin' },
        
        // Brick blocks
        { position: { x: 240, y: 200 }, type: 'brick', breakable: true },
        { position: { x: 272, y: 200 }, type: 'brick', breakable: true },
        { position: { x: 416, y: 200 }, type: 'brick', breakable: true },
        
        // Pipes
        { position: { x: 800, y: 296 }, type: 'pipe' },
        { position: { x: 800, y: 328 }, type: 'pipe' },
        { position: { x: 816, y: 296 }, type: 'pipe' },
        { position: { x: 816, y: 328 }, type: 'pipe' },
        
        // More ground after pipe
        ...this.createGroundRow(900, 360, 400),
        
        // Elevated platforms
        ...this.createPlatformRow(1200, 280, 3),
        ...this.createPlatformRow(1400, 240, 2),
        
        // Final area
        ...this.createGroundRow(2800, 360, 400),
      ],
      
      // Enemies
      enemies: [
        { position: { x: 350, y: 328 }, type: 'goomba' },
        { position: { x: 450, y: 328 }, type: 'goomba' },
        { position: { x: 650, y: 328 }, type: 'koopa' },
        { position: { x: 950, y: 328 }, type: 'goomba' },
        { position: { x: 1100, y: 328 }, type: 'koopa' },
        { position: { x: 1300, y: 248 }, type: 'goomba' },
        { position: { x: 2900, y: 328 }, type: 'koopa' },
      ],
      
      // Collectibles
      collectibles: [
        { position: { x: 180, y: 320 }, type: 'coin', points: 200 },
        { position: { x: 280, y: 240 }, type: 'coin', points: 200 },
        { position: { x: 480, y: 320 }, type: 'coin', points: 200 },
        { position: { x: 680, y: 320 }, type: 'coin', points: 200 },
        { position: { x: 1000, y: 320 }, type: 'coin', points: 200 },
        { position: { x: 1220, y: 240 }, type: 'coin', points: 200 },
        { position: { x: 1420, y: 200 }, type: 'coin', points: 200 },
        { position: { x: 2850, y: 320 }, type: 'coin', points: 200 },
        { position: { x: 2950, y: 280 }, type: '1up', points: 1000 },
      ]
    };
  }

  private static getLevel2(): LevelData {
    return {
      width: 4000,
      height: 480,
      backgroundImage: undefined,
      playerSpawn: { x: 100, y: 320 },
      goalPosition: { x: 3800, y: 320 },
      
      blocks: [
        // More complex level design with gaps and challenges
        ...this.createGroundRow(0, 360, 150),
        // Big gap
        ...this.createGroundRow(300, 360, 100),
        // Another gap
        ...this.createGroundRow(500, 360, 200),
        
        // Multiple platform levels
        ...this.createPlatformRow(800, 320, 4),
        ...this.createPlatformRow(1000, 280, 3),
        ...this.createPlatformRow(1200, 240, 2),
        
        // Underground section
        ...this.createGroundRow(1500, 360, 600),
        
        // Final challenge area
        ...this.createGroundRow(3500, 360, 500),
      ],
      
      enemies: [
        { position: { x: 350, y: 328 }, type: 'koopa' },
        { position: { x: 550, y: 328 }, type: 'goomba' },
        { position: { x: 750, y: 328 }, type: 'koopa' },
        { position: { x: 820, y: 288 }, type: 'goomba' },
        { position: { x: 1020, y: 248 }, type: 'koopa' },
        { position: { x: 1600, y: 328 }, type: 'goomba' },
        { position: { x: 1800, y: 328 }, type: 'goomba' },
        { position: { x: 2000, y: 328 }, type: 'koopa' },
        { position: { x: 3600, y: 328 }, type: 'koopa' },
        { position: { x: 3750, y: 328 }, type: 'goomba' },
      ],
      
      collectibles: [
        { position: { x: 200, y: 320 }, type: 'coin', points: 200 },
        { position: { x: 400, y: 280 }, type: 'coin', points: 200 },
        { position: { x: 600, y: 320 }, type: 'coin', points: 200 },
        { position: { x: 840, y: 280 }, type: 'coin', points: 200 },
        { position: { x: 1040, y: 240 }, type: 'coin', points: 200 },
        { position: { x: 1240, y: 200 }, type: 'coin', points: 200 },
        { position: { x: 1700, y: 320 }, type: 'mushroom', points: 1000 },
        { position: { x: 1900, y: 320 }, type: 'coin', points: 200 },
        { position: { x: 3700, y: 320 }, type: '1up', points: 1000 },
      ]
    };
  }

  /**
   * Helper to create a row of ground blocks
   */
  private static createGroundRow(startX: number, y: number, width: number): BlockData[] {
    const blocks: BlockData[] = [];
    const blockSize = 32; // Standard block size
    
    for (let x = startX; x < startX + width; x += blockSize) {
      blocks.push({
        position: { x, y },
        type: 'ground'
      });
    }
    
    return blocks;
  }

  /**
   * Helper to create a row of platform blocks
   */
  private static createPlatformRow(startX: number, y: number, count: number): BlockData[] {
    const blocks: BlockData[] = [];
    const blockSize = 32;
    
    for (let i = 0; i < count; i++) {
      blocks.push({
        position: { x: startX + (i * blockSize), y },
        type: 'platform'
      });
    }
    
    return blocks;
  }

  /**
   * Validate level data
   */
  public static validateLevel(levelData: LevelData): boolean {
    if (!levelData.playerSpawn || !levelData.goalPosition) {
      console.error('Level missing player spawn or goal position');
      return false;
    }

    if (levelData.width <= 0 || levelData.height <= 0) {
      console.error('Level dimensions must be positive');
      return false;
    }

    // Check if player spawn is within bounds
    if (
      levelData.playerSpawn.x < 0 || 
      levelData.playerSpawn.x > levelData.width ||
      levelData.playerSpawn.y < 0 || 
      levelData.playerSpawn.y > levelData.height
    ) {
      console.error('Player spawn position is out of bounds');
      return false;
    }

    return true;
  }

  /**
   * Get level preview/metadata
   */
  public static getLevelInfo(levelId: number): {
    id: number;
    name: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: number;
  } {
    switch (levelId) {
      case 1:
        return {
          id: 1,
          name: 'World 1-1',
          difficulty: 'easy',
          estimatedTime: 180 // 3 minutes
        };
      case 2:
        return {
          id: 2,
          name: 'World 1-2',
          difficulty: 'medium',
          estimatedTime: 240 // 4 minutes
        };
      default:
        return {
          id: 1,
          name: 'World 1-1',
          difficulty: 'easy',
          estimatedTime: 180
        };
    }
  }
}