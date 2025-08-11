'use client';

import SuperMarioGame from '@/components/SuperMarioGame';

export default function Home() {
  return (
    <>
      <SuperMarioGame />
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          background: #000;
          font-family: 'Press Start 2P', monospace;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          image-rendering: pixelated;
          -webkit-font-smoothing: none;
          font-smoothing: none;
        }
        
        canvas {
          border: 4px solid #333;
          background: #5C94FC;
          box-shadow: 0 0 20px rgba(0,0,0,0.8);
          image-rendering: pixelated;
        }
        
        .game-container {
          position: relative;
          display: inline-block;
        }
        
        .hud {
          position: absolute;
          top: 10px;
          left: 10px;
          color: white;
          font-size: 12px;
          text-shadow: 2px 2px 0px #000;
          z-index: 10;
          line-height: 1.4;
        }
        
        .controls {
          margin-top: 20px;
          text-align: center;
          color: #ccc;
          font-size: 10px;
        }
        
        .title {
          color: #FFD700;
          font-size: 16px;
          text-shadow: 3px 3px 0px #000;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .particle {
          position: absolute;
          pointer-events: none;
          font-size: 12px;
          font-weight: bold;
          z-index: 20;
        }
      `}</style>
      
      <div className="title">SUPER MARIO BROS</div>
      <div className="game-container">
        <canvas id="gameCanvas" width="800" height="480"></canvas>
        <div className="hud" id="gameHUD">
          <div>MARIO</div>
          <div id="scoreDisplay">000000</div>
          <div style={{marginTop: '10px'}}>WORLD</div>
          <div>1-1</div>
          <div style={{marginTop: '10px'}}>TIME</div>
          <div id="timeDisplay">400</div>
          <div style={{marginTop: '10px'}}>x<span id="livesDisplay">3</span></div>
        </div>
      </div>
      <div className="controls">
        <p>ARROW KEYS = MOVE | SPACEBAR = JUMP | F = FIREBALL (Fire Mario) | R = RESTART</p>
      </div>
    </>
  );
}