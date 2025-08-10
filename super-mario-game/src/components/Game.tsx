'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '@/engine/GameEngine';
import { GameState } from '@/types/game';

interface GameProps {
  width?: number;
  height?: number;
  className?: string;
}

export const Game: React.FC<GameProps> = ({ 
  width = 800, 
  height = 480,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize game engine
  const initializeGame = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create game engine instance
      const gameEngine = new GameEngine(canvasRef.current);
      gameEngineRef.current = gameEngine;

      // Subscribe to game state changes
      const unsubscribe = gameEngine.getGameState();
      setGameState(unsubscribe);

      // Initialize and start the game
      await gameEngine.init();
      
      setIsLoading(false);
      
      console.log('Game initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      console.error('Failed to initialize game:', err);
    }
  }, []);

  // Handle canvas resize
  const handleResize = useCallback(() => {
    if (gameEngineRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      gameEngineRef.current.resize(rect.width, rect.height);
    }
  }, []);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();

    // Handle window resize
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }
    };
  }, [initializeGame, handleResize]);

  // Handle canvas focus for keyboard input
  const handleCanvasClick = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
  }, []);

  // Restart game
  const handleRestart = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.destroy();
    }
    initializeGame();
  }, [initializeGame]);

  // Handle pause/resume
  const handlePause = useCallback(() => {
    if (gameEngineRef.current) {
      const currentState = gameEngineRef.current.getGameState();
      // The pause toggle is handled by the input system (P or ESC key)
      console.log('Use P or ESC key to pause/resume the game');
    }
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-red-50 border border-red-200 rounded-lg p-8">
        <div className="text-red-600 text-xl font-bold mb-4">Game Error</div>
        <div className="text-red-500 mb-4 text-center">{error}</div>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-900 text-white">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">Super Mario</div>
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        className="border border-gray-300 bg-sky-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ imageRendering: 'pixelated' }}
        tabIndex={0}
      />

      {/* Game UI Overlay */}
      {!isLoading && gameState && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded text-sm font-mono">
          <div className="space-y-1">
            <div>Score: {gameState.score.toLocaleString()}</div>
            <div>Lives: {gameState.lives}</div>
            <div>Coins: {gameState.coins}</div>
            <div>
              Time: {Math.floor(gameState.time / 60)}:
              {(gameState.time % 60).toString().padStart(2, '0')}
            </div>
            <div>World 1-{gameState.level}</div>
            <div className="capitalize">Status: {gameState.gameStatus}</div>
          </div>
        </div>
      )}

      {/* Controls Info */}
      {!isLoading && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">Controls:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Movement:</strong>
              <br />
              A/D or Arrow Keys - Move left/right
              <br />
              W/Space/X - Jump
              <br />
              S/Down Arrow - Crouch
            </div>
            <div>
              <strong>Actions:</strong>
              <br />
              Left Shift/Z - Run
              <br />
              P/ESC - Pause
              <br />
              Click canvas to focus
            </div>
          </div>
          
          {/* Game Control Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handlePause}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
            >
              Pause Info
            </button>
            <button
              onClick={handleRestart}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;