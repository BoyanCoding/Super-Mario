# Super Mario Platformer - Game Architecture

## Overview
A clean, extensible Super Mario platformer built with Next.js 13, TypeScript, and HTML5 Canvas. The architecture follows modern React patterns while maintaining efficient game loop performance.

## Core Architecture

### 🎮 Game Engine (`src/engine/GameEngine.ts`)
The central game engine that orchestrates all game systems:
- **60fps game loop** with requestAnimationFrame
- **Entity management** system for players, enemies, collectibles
- **Collision detection** and physics resolution
- **Camera system** that follows the player
- **Level loading** and management
- **Performance monitoring** with FPS counter

### 🏗️ Entity System (`src/entities/`)
Object-oriented entity hierarchy with base classes:

#### `Entity.ts` - Base Entity Class
- Position, velocity, and size properties
- Collision detection helpers
- Abstract methods for update/render/collision handling
- Health and active state management

#### `Player.ts` - Player Entity
- Input-driven movement with acceleration/deceleration
- **Jump mechanics**: Variable height, coyote time, jump buffering
- **Power system**: Small → Super → Fire Mario transformations
- **Animation states**: idle, walking, running, jumping, falling
- Invulnerability frames after taking damage

#### `Enemy.ts` - Enemy Base Class & Variants
- AI-driven patrol movement
- Wall collision detection and direction reversal
- **Goomba**: Simple walking enemy
- **Koopa**: Can become shell when stomped, kickable

### ⚡ Physics System (`src/utils/physics.ts`)
Efficient 2D physics with:
- **Gravity** and **friction** application
- **AABB collision detection**
- **Collision resolution** with proper separation
- **Velocity clamping** and normalization utilities
- Direction-based collision detection (top/bottom/left/right)

### 🎯 Input System (`src/utils/inputHandler.ts`)
Robust input handling:
- **Event-driven** input state management
- **Key mapping** system for customizable controls
- **Window focus/blur** handling to prevent stuck keys
- **Subscription pattern** for input state updates
- Support for multiple key bindings per action

### 🎊 Game State Management (`src/utils/gameStateManager.ts`)
Complete game state with:
- Score, lives, coins, time tracking
- **Power level** management (Small/Super/Fire Mario)
- **Timer system** with pause/resume functionality  
- **Level progression** and completion handling
- **Event subscription** system for UI updates

### 🗺️ Level System (`src/utils/levelLoader.ts`)
Dynamic level loading:
- **Level data structure** with blocks, enemies, collectibles
- **Hardcoded levels** for rapid development
- **Level validation** and error handling
- **Helper functions** for creating ground rows and platforms
- Extensible for JSON/API level loading

## Component Architecture

### 📱 React Integration (`src/components/Game.tsx`)
Clean React wrapper:
- **useRef** for canvas and game engine references
- **useEffect** for lifecycle management
- **Error boundaries** with user-friendly error states
- **Loading states** during game initialization
- **Cleanup** on component unmount

### 🎨 UI Components
- **Real-time game state display** (score, lives, time)
- **Pause/Game Over** overlay screens
- **Control instructions** for player guidance
- **Debug information** in development mode

## Technical Features

### 🏃 Performance Optimizations
- **Entity culling**: Only render visible entities
- **Efficient collision detection** with early exits
- **Memory management** with entity cleanup
- **Canvas optimization** with proper context settings

### 🛠️ Development Experience
- **TypeScript** throughout for type safety
- **Hot reloading** with Next.js
- **Debug overlays** showing collision boxes and entity info
- **Console logging** for game state changes
- **Extensible architecture** for adding new features

### 🎮 Game Features Implemented
- ✅ Player movement with realistic physics
- ✅ Jumping with variable height
- ✅ Enemy AI with patrol patterns
- ✅ Basic collision detection and resolution
- ✅ Level loading and camera following
- ✅ Game state management (score, lives, time)
- ✅ Power-up system framework
- ✅ Pause/resume functionality

## File Structure
```
src/
├── app/
│   ├── page.tsx              # Main page with Game component
│   └── layout.tsx            # App layout
├── components/
│   └── Game.tsx              # React game wrapper component
├── engine/
│   └── GameEngine.ts         # Core game engine and loop
├── entities/
│   ├── Entity.ts             # Base entity class
│   ├── Player.ts             # Player character
│   ├── Enemy.ts              # Enemy entities (Goomba, Koopa)
│   └── index.ts              # Entity exports
├── types/
│   └── game.ts               # TypeScript type definitions
└── utils/
    ├── physics.ts            # Physics utilities
    ├── inputHandler.ts       # Input management
    ├── gameStateManager.ts   # Game state management  
    ├── levelLoader.ts        # Level data loading
    └── index.ts              # Utility exports
```

## Controls
- **A/D or Arrow Keys**: Move left/right
- **W/Space/X**: Jump (variable height)
- **S/Down Arrow**: Crouch
- **Left Shift/Z**: Run (faster movement)
- **P/ESC**: Pause/Resume

## Next Steps
The architecture is designed to easily support:
- 🎨 Sprite animations and graphics
- 🔊 Sound system integration  
- 🏆 Power-ups and collectibles
- 🌍 Multiple worlds and level progression
- 💾 Save system and high scores
- 📱 Mobile touch controls
- 🎯 Advanced enemy AI patterns

## Getting Started
```bash
npm run dev
```
Visit `http://localhost:3000` and click on the canvas to start playing!