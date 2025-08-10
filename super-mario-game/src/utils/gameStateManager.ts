import { GameState } from '@/types/game';

export class GameStateManager {
  private gameState: GameState = {
    score: 0,
    lives: 3,
    level: 1,
    powerLevel: 0,
    gameStatus: 'playing',
    time: 300, // 5 minutes in seconds
    coins: 0,
  };

  private listeners: Array<(state: GameState) => void> = [];
  private timeInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startTimer();
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(callback: (state: GameState) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.gameState }));
  }

  /**
   * Get current game state
   */
  public getState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Update score
   */
  public addScore(points: number): void {
    this.gameState.score += points;
    this.notifyListeners();
  }

  /**
   * Add coins and check for extra lives
   */
  public addCoin(): void {
    this.gameState.coins += 1;
    this.addScore(200);
    
    // Extra life every 100 coins
    if (this.gameState.coins >= 100) {
      this.gameState.coins = 0;
      this.addLife();
    }
    
    this.notifyListeners();
  }

  /**
   * Add extra life
   */
  public addLife(): void {
    this.gameState.lives += 1;
    this.addScore(1000);
    this.notifyListeners();
  }

  /**
   * Remove a life
   */
  public loseLife(): void {
    this.gameState.lives = Math.max(0, this.gameState.lives - 1);
    
    if (this.gameState.lives === 0) {
      this.setGameStatus('gameover');
    }
    
    this.notifyListeners();
  }

  /**
   * Set power level
   */
  public setPowerLevel(level: number): void {
    this.gameState.powerLevel = Math.max(0, Math.min(2, level));
    
    // Award points for power-ups
    if (level > this.gameState.powerLevel) {
      this.addScore(1000);
    }
    
    this.notifyListeners();
  }

  /**
   * Power up Mario
   */
  public powerUp(): void {
    if (this.gameState.powerLevel < 2) {
      this.setPowerLevel(this.gameState.powerLevel + 1);
    }
  }

  /**
   * Power down Mario (when hit)
   */
  public powerDown(): void {
    if (this.gameState.powerLevel > 0) {
      this.setPowerLevel(this.gameState.powerLevel - 1);
    } else {
      this.loseLife();
    }
  }

  /**
   * Set game status
   */
  public setGameStatus(status: GameState['gameStatus']): void {
    this.gameState.gameStatus = status;
    
    if (status === 'paused') {
      this.pauseTimer();
    } else if (status === 'playing') {
      this.resumeTimer();
    } else {
      this.stopTimer();
    }
    
    this.notifyListeners();
  }

  /**
   * Complete level
   */
  public completeLevel(): void {
    this.stopTimer();
    
    // Bonus points for remaining time
    const timeBonus = this.gameState.time * 50;
    this.addScore(timeBonus);
    
    this.gameState.level += 1;
    this.gameState.time = 300; // Reset timer for next level
    
    this.setGameStatus('complete');
  }

  /**
   * Start new level
   */
  public startLevel(): void {
    this.gameState.time = 300;
    this.setGameStatus('playing');
    this.startTimer();
  }

  /**
   * Reset game to initial state
   */
  public resetGame(): void {
    this.gameState = {
      score: 0,
      lives: 3,
      level: 1,
      powerLevel: 0,
      gameStatus: 'playing',
      time: 300,
      coins: 0,
    };
    
    this.startTimer();
    this.notifyListeners();
  }

  /**
   * Timer management
   */
  private startTimer(): void {
    this.stopTimer(); // Clear any existing timer
    
    this.timeInterval = setInterval(() => {
      if (this.gameState.gameStatus === 'playing') {
        this.gameState.time = Math.max(0, this.gameState.time - 1);
        
        if (this.gameState.time === 0) {
          this.loseLife();
          
          if (this.gameState.lives > 0) {
            this.gameState.time = 300; // Reset timer if lives remaining
          }
        }
        
        this.notifyListeners();
      }
    }, 1000);
  }

  private pauseTimer(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  private resumeTimer(): void {
    if (!this.timeInterval && this.gameState.gameStatus === 'playing') {
      this.startTimer();
    }
  }

  private stopTimer(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  /**
   * Check if game is active (playing)
   */
  public isGameActive(): boolean {
    return this.gameState.gameStatus === 'playing';
  }

  /**
   * Check if game is paused
   */
  public isGamePaused(): boolean {
    return this.gameState.gameStatus === 'paused';
  }

  /**
   * Check if game is over
   */
  public isGameOver(): boolean {
    return this.gameState.gameStatus === 'gameover';
  }

  /**
   * Toggle pause
   */
  public togglePause(): void {
    if (this.gameState.gameStatus === 'playing') {
      this.setGameStatus('paused');
    } else if (this.gameState.gameStatus === 'paused') {
      this.setGameStatus('playing');
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopTimer();
    this.listeners.length = 0;
  }
}