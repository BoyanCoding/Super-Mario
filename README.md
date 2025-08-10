# Super Mario Bros - Web Implementation

A pixel-perfect recreation of the classic Super Mario Bros platformer game, built with HTML5 Canvas, JavaScript, and modern web technologies.

![Super Mario Bros](https://img.shields.io/badge/Super%20Mario-Game-red?style=for-the-badge)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Next.js](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)

## 🎮 Game Features

### ✨ Authentic Super Mario Experience
- **Pixel-perfect 8-bit graphics** with authentic Super Mario sprites
- **Smooth character animations** (walking, jumping, directional facing)
- **Professional retro UI** with classic Mario-style HUD
- **Layered parallax backgrounds** (clouds, hills, sky gradients)
- **Enhanced level design** (pipes, question blocks, varied platforms)

### 🎯 Advanced Gameplay Mechanics
- **Variable jump height** - Hold spacebar longer for higher jumps
- **Enhanced physics** - Realistic momentum, acceleration, and gravity
- **Complete power-up system** - Super Mushroom, Fire Flower, Star Power, 1-UP
- **Multiple enemy types** - Goombas and Koopa Troopas with shell mechanics
- **Interactive level elements** - Question blocks, destructible bricks
- **Fireball shooting** - F key when Fire Mario
- **Sound effects** - Authentic retro sounds for all actions

### 🏆 Professional Features
- **Extended 3200px world** with varied challenges and secrets
- **Time countdown system** (400 seconds per level)
- **Lives and scoring system** with bonuses and multipliers
- **Star power invincibility** with rainbow visual effects
- **Koopa shell mechanics** - Stomp to create shells, kick to attack
- **Damage system** - Fire → Super → Small → Game Over progression

## 🚀 Quick Start

### Prerequisites
- **Python 3.x** (for running the simple HTTP server)
- **Node.js 18+** (for the Next.js version)
- **Modern web browser** with HTML5 Canvas support

### 🎯 Option 1: Simple HTML Version (Recommended)

1. **Clone the repository:**
```bash
git clone <your-repository-url>
cd Super-Mario
```

2. **Start the Python HTTP server:**
```bash
cd super-mario-game/public
python -m http.server 8080
```

3. **Open in browser:**
   - Navigate to: **http://localhost:8080/simple-mario.html**
   - Start playing immediately!

### 🔧 Option 2: Next.js Development Version

1. **Clone the repository:**
```bash
git clone <your-repository-url>
cd Super-Mario
```

2. **Setup the Next.js project:**
```bash
cd super-mario-game
npm install --legacy-peer-deps
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open in browser:**
   - Navigate to: **http://localhost:3000**

### 🤖 Option 3: Using Claude Code Agents (Advanced)

If you want to extend or modify the game using AI assistance:

1. **Clone the agents repository:**
```bash
# In the Super-Mario directory
git clone https://github.com/BoyanCoding/agents .claude/agents
```

2. **Setup Claude Code:**
   - Install Claude Code CLI
   - Configure with your API key
   - Use the specialized agents for game development

## 🕹️ Game Controls

| Key | Action |
|-----|--------|
| **← →** | Move Mario left/right |
| **Spacebar** | Jump (hold for higher jumps) |
| **F** | Shoot fireballs (Fire Mario only) |
| **R** | Restart game |
| **D** | Toggle debug mode |

## 🎨 Game Mechanics

### Power-Up System
- **Super Mushroom** 🍄 - Makes Mario grow larger and stronger
- **Fire Flower** 🌸 - Grants fireball shooting ability
- **Super Star** ⭐ - Temporary invincibility with rainbow effect
- **1-UP Mushroom** 👆 - Extra life

### Enemy Types
- **Goomba** - Brown mushroom enemies, stomp to defeat
- **Koopa Troopa** - Turtle enemies with shell mechanics
  - Stomp once to put in shell
  - Stomp again or kick to make shell slide
  - Moving shells destroy other enemies

### Scoring System
- **Coins** - 50 points each
- **Enemy defeats** - 100-400 points
- **Power-up collection** - 1000 points
- **Time bonus** - Remaining time × 50 points
- **1-UP** - Earned every 10 coins or high scores

## 📁 Project Structure

```
Super-Mario/
├── README.md                    # This documentation
├── super-mario-game/           # Main game directory
│   ├── public/
│   │   ├── simple-mario.html   # Standalone HTML game
│   │   └── assets/             # Game assets
│   ├── src/                    # Next.js source code
│   │   ├── components/         # React components
│   │   ├── engine/             # Game engine
│   │   ├── entities/           # Game entities
│   │   ├── types/              # TypeScript definitions
│   │   └── utils/              # Utility functions
│   ├── package.json            # Node.js dependencies
│   └── next.config.js          # Next.js configuration
├── simple-server.js            # Basic Node.js server
└── super-mario.md              # Game design documentation
```

## 🛠️ Technical Details

### Technologies Used
- **HTML5 Canvas** - 2D graphics rendering
- **JavaScript ES6+** - Game logic and physics
- **CSS3** - Styling and animations  
- **Next.js 13** - React framework (advanced version)
- **TypeScript** - Type safety and better development experience
- **Web Audio API** - Retro sound effects

### Performance Optimizations
- **60fps game loop** with `requestAnimationFrame`
- **Collision detection** optimized for performance
- **Sprite rendering** with pixel-perfect scaling
- **Memory management** with object pooling
- **Camera culling** - Only render visible elements

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🎯 Development Workflow

### Adding New Features
1. **Entities** - Add new enemies or items in `/src/entities/`
2. **Levels** - Modify level data in `/src/utils/levelLoader.ts`
3. **Graphics** - Update sprite rendering functions
4. **Audio** - Add sound effects in the `playSound()` function
5. **Physics** - Adjust constants in `/src/utils/physics.ts`

### Using Claude Code Agents
The project includes specialized AI agents for development:

- **`rapid-prototyper`** - Quick feature prototyping
- **`frontend-developer`** - UI and component development  
- **`game-designer`** - Gameplay mechanics and balance
- **`ui-designer`** - Visual design and animations
- **`test-writer-fixer`** - Testing and bug fixes

## 🐛 Troubleshooting

### Common Issues

**Game doesn't load:**
- Check console for JavaScript errors
- Ensure browser supports HTML5 Canvas
- Clear browser cache and refresh

**Jumping doesn't work:**
- Make sure the game canvas has focus (click on it)
- Check if spacebar is being captured by browser
- Verify no browser extensions interfere with key events

**Performance issues:**
- Close other browser tabs
- Disable browser extensions
- Check if hardware acceleration is enabled

**Sound not working:**
- Check browser audio permissions
- Ensure volume is not muted
- Some browsers require user interaction before playing audio

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is for educational purposes. Super Mario Bros is a trademark of Nintendo.

## 🎮 Credits

- **Original Game** - Nintendo (1985)
- **Web Implementation** - Built with Claude Code AI assistance
- **Sprites & Design** - Inspired by original Super Mario Bros
- **Sound Effects** - Web Audio API generated retro sounds

## 📞 Support

If you encounter issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review browser console for error messages
3. Ensure all dependencies are properly installed
4. Verify your browser meets the compatibility requirements

---

**Enjoy playing Super Mario Bros in your browser! 🎮✨**